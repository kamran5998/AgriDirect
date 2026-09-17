"""SQLAlchemy ORM Model for Institutional Buyers and Requirements."""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    SUSPENDED = "suspended"


class RequirementStatus(str, enum.Enum):
    OPEN = "open"
    IN_NEGOTIATION = "in_negotiation"
    FULFILLED = "fulfilled"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name = Column(String(200), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="buyer_profile")
    requirements = relationship("BuyerRequirement", back_populates="buyer", cascade="all, delete-orphan")
    requests = relationship("BuyerRequest", back_populates="buyer", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<BuyerProfile(id={self.id}, business_name='{self.business_name}', status='{self.verification_status}')>"


class BuyerRequirement(Base):
    __tablename__ = "buyers_requirements"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity_required = Column(Numeric(12, 2), nullable=False)
    expected_price = Column(Numeric(10, 2), nullable=False)
    location = Column(String(255), nullable=False)
    status = Column(Enum(RequirementStatus), default=RequirementStatus.OPEN, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    buyer = relationship("BuyerProfile", back_populates="requirements")
    crop = relationship("Crop", back_populates="buyer_requirements")

    def __repr__(self) -> str:
        return f"<BuyerRequirement(id={self.id}, buyer_id={self.buyer_id}, crop_id={self.crop_id}, status='{self.status}')>"
