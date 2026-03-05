from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from api.core.database import get_db
from api.models import Scan, Finding

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    latest_scan = db.query(Scan).order_by(Scan.started_at.desc()).first()
    total_scans = db.query(func.count(Scan.id)).scalar()
    total_findings = db.query(func.count(Finding.id)).scalar()

    critical = db.query(func.count(Finding.id)).filter(Finding.severity == "CRITICAL").scalar()
    high     = db.query(func.count(Finding.id)).filter(Finding.severity == "HIGH").scalar()
    medium   = db.query(func.count(Finding.id)).filter(Finding.severity == "MEDIUM").scalar()
    low      = db.query(func.count(Finding.id)).filter(Finding.severity == "LOW").scalar()

    recent_scans = db.query(Scan).order_by(Scan.started_at.desc()).limit(5).all()

    return {
        "security_score": latest_scan.overall_score if latest_scan else 100,
        "total_scans": total_scans,
        "total_findings": total_findings,
        "severity": {"critical": critical, "high": high, "medium": medium, "low": low},
        "recent_scans": [
            {
                "id": s.id,
                "status": s.status,
                "score": s.overall_score,
                "started_at": str(s.started_at),
                "critical_count": s.critical_count,
                "high_count": s.high_count,
            }
            for s in recent_scans
        ],
    }