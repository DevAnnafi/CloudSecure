from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models import Finding
from api.schemas.scan import FindingResponse
from typing import List

router = APIRouter(prefix="/findings", tags=["findings"])

@router.get("/{scan_id}", response_model=List[FindingResponse])
def get_findings(scan_id: int, db: Session = Depends(get_db)):
    """Get all findings for a specific scan"""
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    return findings