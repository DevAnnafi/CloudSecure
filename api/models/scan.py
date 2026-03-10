from api.core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"))
    status = Column(String, default="pending")
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    overall_score = Column(Float, nullable=True)
    total_findings = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    medium_count = Column(Integer, default=0)
    low_count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    is_baseline = Column(Boolean, default=False)
    baseline_scan_id = Column(Integer, ForeignKey('scans.id'), nullable=True)

    account = relationship("Account", back_populates="scans")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    baseline = relationship("Scan", remote_side=[id], uselist=False)