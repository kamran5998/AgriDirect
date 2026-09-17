"""SQLAlchemy ORM Model for Trade Disputes and Arbitration Grievances."""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class DisputeStatus(str, enum.Enum):
    OPEN = "Open"
    UNDER_REVIEW = "Under Review"
    RESOLVED = "Resolved"


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trade_id = Column(Integer, nullable=True, index=True)
    gate_pass_id = Column(String(50), nullable=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    reason = Column(String(255), nullable=False)
    status = Column(Enum(DisputeStatus), default=DisputeStatus.OPEN, nullable=False, index=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    farmer = relationship("FarmerProfile", foreign_keys=[farmer_id])
    buyer = relationship("BuyerProfile", foreign_keys=[buyer_id])

    def __repr__(self) -> str:
        return f"<Dispute(id={self.id}, trade_id={self.trade_id}, reason='{self.reason}', status='{self.status}')>"
