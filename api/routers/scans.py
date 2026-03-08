import sys 
import os 
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session 
from api.core.database import get_db
from api.models import Scan, Account, Finding
from api.schemas.scan import ScanCreate, ScanResponse
from src.scanners.aws import S3Scanner, IAMScanner, EC2MetaDataScanner
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

      all_findings = []
      if account.cloud_provider == "AWS":
         s3_scanner = S3Scanner(account.profile, account.account_name)
         results = s3_scanner.scan_buckets()
         all_findings.extend(results)
         iam_scanner = IAMScanner(account.profile, account.account_name)
         iam_results = iam_scanner.scan()
         all_findings.extend(iam_results)
         ec2_scanner = EC2MetaDataScanner(account.profile, account.account_name)
         ec2_results = ec2_scanner.scan()
         all_findings.extend(ec2_results)

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
      Account.account_id == scan_data.account_id
   ).first()

   if account is None:
      account = Account(
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

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
   scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
   if scan is None:
      raise HTTPException(status_code=404, detail="Scan not found")
   return scan

@router.delete("/{scan_id}")
def delete_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
   scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
   if scan is None:
      raise HTTPException(status_code=404, detail="Scan not found")
   db.query(Finding).filter(Finding.scan_id == scan_id).delete()
   db.delete(scan)
   db.commit()
   return {"message": f"Scan {scan_id} deleted successfully"}
