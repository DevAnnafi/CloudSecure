import sys 
import os 
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session 
from api.core.database import get_db
from api.models import Scan, Account, Finding
from api.schemas.scan import ScanCreate, ScanResponse
from src.core.report import ReportGenerator
from datetime import datetime, timezone
from typing import List
from api.core.auth import get_current_user
from api.models.user import User

sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))

router = APIRouter(prefix="/scans", tags=["scans"])

def run_scan_task(scan_id: int, db: Session):
    try:
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        account = scan.account
        scan.status = "running"
        db.commit()

        print(f"=== STARTING SCAN {scan_id} ===")
        print(f"Account: {account.account_name}")
        print(f"Cloud Provider: {account.cloud_provider}")

        all_findings = []
        
        # ============= AWS SCANNING =============
        if account.cloud_provider == "AWS":
            print("Getting AWS credentials...")
            access_key, secret_key, region = account.get_aws_credentials()
            
            print(f"Access Key: {access_key[:10]}..." if access_key else "Access Key: None")
            print(f"Region: {region}")
            
            if not access_key or not secret_key:
                raise Exception("AWS credentials not configured for this account")
            
            print("Initializing S3 Scanner...")
            from src.scanners.aws.s3_checker import S3Scanner
            s3_scanner = S3Scanner(
                access_key=access_key,
                secret_key=secret_key,
                region=region,
                account_name=account.account_name
            )
            print("Running S3 scan...")
            results = s3_scanner.scan_buckets()
            print(f"S3 Scanner found {len(results)} findings")
            for r in results:
                print(f"  - {r['severity']}: {r['title']}")
            all_findings.extend(results)
            
            print("Initializing IAM Scanner...")
            from src.scanners.aws.iam_enum import IAMScanner
            iam_scanner = IAMScanner(
                access_key=access_key,
                secret_key=secret_key,
                region=region,
                account_name=account.account_name
            )
            print("Running IAM scan...")
            iam_results = iam_scanner.scan()
            print(f"IAM Scanner found {len(iam_results)} findings")
            for r in iam_results:
                print(f"  - {r['severity']}: {r['title']}")
            all_findings.extend(iam_results)
            
            print("Initializing Metadata Scanner...")
            from src.scanners.aws.metadata import EC2MetaDataScanner
            metadata_scanner = EC2MetaDataScanner(
                access_key=access_key,
                secret_key=secret_key,
                region=region,
                account_name=account.account_name
            )
            print("Running Metadata scan...")
            metadata_results = metadata_scanner.scan()
            print(f"Metadata Scanner found {len(metadata_results)} findings")
            for r in metadata_results:
                print(f"  - {r['severity']}: {r['title']}")
            all_findings.extend(metadata_results)

        print(f"\n=== TOTAL FINDINGS: {len(all_findings)} ===\n")

        # Store findings
        for finding_data in all_findings:
            finding = Finding(
                scan_id=scan.id,
                severity=finding_data["severity"],
                title=finding_data["title"],
                resource=finding_data["resource"],
                description=finding_data["description"],
                cloud_provider=finding_data["cloud_provider"],
                account_id_value=finding_data["account_id"],
                account_name=finding_data["account_name"],
                resource_id=finding_data.get("resource_id")  # May not exist in all findings
            )
            db.add(finding)   

        from src.core.report import ReportGenerator
        report = ReportGenerator(all_findings, account.cloud_provider)
        report_dict = report.to_dict()

        scan.overall_score = report_dict["posture"]["overall_score"]
        scan.total_findings = len(all_findings)
        scan.critical_count = len([f for f in all_findings if f["severity"] == "critical"])
        scan.high_count = len([f for f in all_findings if f["severity"] == "high"])
        scan.medium_count = len([f for f in all_findings if f["severity"] == "medium"])
        scan.low_count = len([f for f in all_findings if f["severity"] == "low"])
        scan.status = "completed"
        scan.completed_at = datetime.now(timezone.utc)
        
        print(f"Scan completed: Score={scan.overall_score}, Findings={scan.total_findings}")
        
        db.commit()
        
    except Exception as e:
        print(f"❌ SCAN TASK FAILED: {e}")
        import traceback
        traceback.print_exc()
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan:
            scan.status = "failed"
            db.commit()
        
        # ============= AZURE SCANNING =============
        elif account.cloud_provider == "Azure":
            tenant_id, client_id, client_secret, subscription_id = account.get_azure_credentials()
            
            if not all([tenant_id, client_id, client_secret, subscription_id]):
                raise Exception("Azure credentials not configured for this account")
            
            storage_scanner = AzureStorageScanner(tenant_id, client_id, client_secret, subscription_id)
            all_findings.extend(storage_scanner.scan())
        
        # ============= GCP SCANNING =============
        elif account.cloud_provider == "GCP":
            project_id, service_account_json = account.get_gcp_credentials()
            
            if not service_account_json:
                raise Exception("GCP credentials not configured for this account")
            
            storage_scanner = GCPStorageScanner(service_account_json, project_id)
            all_findings.extend(storage_scanner.scan())

        # Store findings (same as before)
        for finding_data in all_findings:
            finding = Finding(
                scan_id=scan.id,
                severity=finding_data["severity"],
                title=finding_data["title"],
                resource=finding_data["resource"],
                description=finding_data["description"],
                cloud_provider=finding_data["cloud_provider"],
                account_id_value=finding_data["account_id"],
                account_name=finding_data["account_name"]
            )
            db.add(finding)   

        report = ReportGenerator(all_findings, account.cloud_provider)
        report_dict = report.to_dict()

        scan.overall_score = report_dict["posture"]["overall_score"]
        scan.total_findings = len(all_findings)
        scan.critical_count = len([f for f in all_findings if f["severity"] == "critical"])
        scan.high_count = len([f for f in all_findings if f["severity"] == "high"])
        scan.medium_count = len([f for f in all_findings if f["severity"] == "medium"])
        scan.low_count = len([f for f in all_findings if f["severity"] == "low"])
        scan.status = "completed"
        scan.completed_at = datetime.now(timezone.utc)
        db.commit()
        
    except Exception as e:
        print("Scan task failed:", e)
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if scan:
            scan.status = "failed"
            db.commit()

@router.post("/", response_model=ScanResponse)    
def create_scan(scan_data: ScanCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
   account = db.query(Account).filter(
      Account.cloud_provider == scan_data.cloud_provider,
      Account.account_id == scan_data.account_id,
      Account.user_id == current_user.id
   ).first()

   if account is None:
      account = Account(
         user_id=current_user.id, 
         cloud_provider=scan_data.cloud_provider,
         account_id=scan_data.account_id,
         account_name=scan_data.account_name,
         profile=scan_data.profile
      )
      db.add(account)
      db.commit()
      db.refresh(account)

   scan = Scan(account_id=account.id, user_id=current_user.id)
   db.add(scan)
   db.commit()
   db.refresh(scan)

   background_tasks.add_task(run_scan_task, scan.id, db)

   return scan

@router.get("/", response_model=List[ScanResponse])
def list_scans(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
   scans = db.query(Scan).filter(Scan.user_id == current_user.id).order_by(Scan.started_at.desc()).offset(skip).limit(limit).all()
   return scans

@router.get("/baseline")
def get_baseline(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current baseline scan for an account"""
    
    # Get baseline scan for this account (verify user owns a scan for this account)
    baseline = db.query(Scan).filter(
        Scan.account_id == account_id,
        Scan.user_id == current_user.id,
        Scan.is_baseline == True
    ).first()
    
    if not baseline:
        return {"baseline": None}
    
    return {
        "baseline": {
            "id": baseline.id,
            "score": baseline.overall_score,
            "total_findings": baseline.total_findings,
            "critical_count": baseline.critical_count,
            "high_count": baseline.high_count,
            "medium_count": baseline.medium_count,
            "low_count": baseline.low_count,
            "completed_at": baseline.completed_at.isoformat() if baseline.completed_at else None
        }
    }

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
   scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
   if scan is None:
      raise HTTPException(status_code=404, detail="Scan not found")
   return scan

@router.get("/{scan_id}/drift")
def get_drift(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compare a scan to the baseline to detect drift"""
    
    # Get the current scan and verify ownership
    scan = db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Get baseline scan for this account
    baseline = db.query(Scan).filter(
        Scan.account_id == scan.account_id,
        Scan.user_id == current_user.id,
        Scan.is_baseline == True
    ).first()
    
    if not baseline:
        raise HTTPException(status_code=404, detail="No baseline set for this account")
    
    # Calculate drift
    score_drift = scan.overall_score - baseline.overall_score if scan.overall_score and baseline.overall_score else 0
    total_drift = scan.total_findings - baseline.total_findings
    critical_drift = scan.critical_count - baseline.critical_count
    high_drift = scan.high_count - baseline.high_count
    medium_drift = scan.medium_count - baseline.medium_count
    low_drift = scan.low_count - baseline.low_count
    
    # Get new findings (in current scan but not in baseline)
    current_finding_ids = {f.resource_id for f in scan.findings}
    baseline_finding_ids = {f.resource_id for f in baseline.findings}
    
    new_findings_ids = current_finding_ids - baseline_finding_ids
    resolved_findings_ids = baseline_finding_ids - current_finding_ids
    
    new_findings = [f for f in scan.findings if f.resource_id in new_findings_ids]
    resolved_findings = [f for f in baseline.findings if f.resource_id in resolved_findings_ids]
    
    return {
        "scan_id": scan_id,
        "baseline_id": baseline.id,
        "drift": {
            "score": {
                "current": scan.overall_score,
                "baseline": baseline.overall_score,
                "change": score_drift,
                "percentage": (score_drift / baseline.overall_score * 100) if baseline.overall_score else 0
            },
            "findings": {
                "total": {"current": scan.total_findings, "baseline": baseline.total_findings, "change": total_drift},
                "critical": {"current": scan.critical_count, "baseline": baseline.critical_count, "change": critical_drift},
                "high": {"current": scan.high_count, "baseline": baseline.high_count, "change": high_drift},
                "medium": {"current": scan.medium_count, "baseline": baseline.medium_count, "change": medium_drift},
                "low": {"current": scan.low_count, "baseline": baseline.low_count, "change": low_drift}
            },
            "new_findings": len(new_findings),
            "resolved_findings": len(resolved_findings),
            "new_findings_list": [
                {
                    "id": f.id,
                    "title": f.title,
                    "severity": f.severity,
                    "resource_id": f.resource_id
                } for f in new_findings[:10]
            ],
            "resolved_findings_list": [
                {
                    "id": f.id,
                    "title": f.title,
                    "severity": f.severity,
                    "resource_id": f.resource_id
                } for f in resolved_findings[:10]
            ]
        },
        "trend": "improving" if score_drift > 0 else "declining" if score_drift < 0 else "stable"
    }

@router.put("/{scan_id}/set-baseline")
def set_baseline(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a scan as the baseline for drift detection"""
    
    # Get the scan and verify ownership
    scan = db.query(Scan).filter(
        Scan.id == scan_id,
        Scan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Check if scan is completed
    if scan.status != "completed":
        raise HTTPException(status_code=400, detail="Can only set completed scans as baseline")
    
    # Unset any existing baseline for this account
    db.query(Scan).filter(
        Scan.account_id == scan.account_id,
        Scan.is_baseline == True
    ).update({"is_baseline": False})
    
    # Set this scan as baseline
    scan.is_baseline = True
    db.commit()
    db.refresh(scan)
    
    return {
        "message": "Baseline set successfully",
        "scan_id": scan_id,
        "score": scan.overall_score
    }

@router.delete("/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
   scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
   if scan is None:
      raise HTTPException(status_code=404, detail="Scan not found")
   db.query(Finding).filter(Finding.scan_id == scan_id).delete()
   db.delete(scan)
   db.commit()
   return {"message": f"Scan {scan_id} deleted successfully"}

