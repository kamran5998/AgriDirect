"""SQLAlchemy ORM Model for Farmer Direct Lot Listings and Buyer Trade Proposals."""

import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, Enum, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class QualityGrade(str, enum.Enum):
    GRADE_A_PREMIUM = "Grade A Premium"
    FAQ_STANDARD = "FAQ Standard"
    ORGANIC_CERTIFIED = "Organic Certified"
    COMMERCIAL_BULK = "Commercial Bulk"


class ListingStatus(str, enum.Enum):
    ACTIVE = "active"
    IN_NEGOTIATION = "in_negotiation"
    SOLD = "sold"
    WITHDRAWN = "withdrawn"


class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    COUNTER_OFFER = "counter_offer"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class FarmerListing(Base):
    __tablename__ = "farmer_listings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Numeric(12, 2), nullable=False)
    expected_price = Column(Numeric(10, 2), nullable=False)
    quality = Column(Enum(QualityGrade), default=QualityGrade.FAQ_STANDARD, nullable=False)
    location = Column(String(255), nullable=False)
    availability_date = Column(Date, nullable=False, index=True)
    status = Column(Enum(ListingStatus), default=ListingStatus.ACTIVE, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farmer = relationship("FarmerProfile", back_populates="listings")
    crop = relationship("Crop", back_populates="farmer_listings")
    buyer_requests = relationship("BuyerRequest", back_populates="listing", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<FarmerListing(id={self.id}, farmer_id={self.farmer_id}, crop_id={self.crop_id}, status='{self.status}')>"


class BuyerRequest(Base):
    __tablename__ = "buyer_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    listing_id = Column(Integer, ForeignKey("farmer_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Numeric(12, 2), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    listing = relationship("FarmerListing", back_populates="buyer_requests")
    buyer = relationship("BuyerProfile", back_populates="requests")

    def __repr__(self) -> str:
        return f"<BuyerRequest(id={self.id}, listing_id={self.listing_id}, buyer_id={self.buyer_id}, status='{self.status}')>"
