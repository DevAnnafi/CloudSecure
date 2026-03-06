from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.models import Finding
from api.schemas.scan import FindingResponse
from typing import List
from api.core.auth import get_current_user
from api.models.user import User

router = APIRouter(prefix="/findings", tags=["findings"])

@router.get("/{scan_id}", response_model=List[FindingResponse])
def get_findings(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get all findings for a specific scan"""
    findings = db.query(Finding).filter(Finding.scan_id == scan_id).all()
    return findings