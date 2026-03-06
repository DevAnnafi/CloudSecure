from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ScanCreate(BaseModel):
    cloud_provider: str
    account_id: str
    account_name: str
    profile: Optional[str] = None

class ScanResponse(BaseModel):
    id: int
    status: str
    started_at: datetime
    completed_at: Optional[datetime]
    overall_score: Optional[float]
    total_findings: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int

    model_config = {"from_attributes": True}

class FindingResponse(BaseModel):
    id: int
    severity: str
    title: str
    resource: str
    description: str
    cloud_provider: str
    account_name: str

    class Config:
        from_attributes = True