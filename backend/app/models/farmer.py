"""SQLAlchemy ORM Model for Farmer Profiles and Cultivated Crops."""

from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Date, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    village = Column(String(150), nullable=False)
    preferred_markets = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="farmer_profile")
    crops = relationship("FarmerCrop", back_populates="farmer", cascade="all, delete-orphan")
    listings = relationship("FarmerListing", back_populates="farmer", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<FarmerProfile(id={self.id}, user_id={self.user_id}, village='{self.village}')>"


class FarmerCrop(Base):
    __tablename__ = "farmer_crops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity = Column(Numeric(12, 2), nullable=False)
    unit = Column(String(20), default="Quintal", nullable=False)
    harvest_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    farmer = relationship("FarmerProfile", back_populates="crops")
    crop = relationship("Crop", back_populates="farmer_crops")

    def __repr__(self) -> str:
        return f"<FarmerCrop(id={self.id}, farmer_id={self.farmer_id}, crop_id={self.crop_id}, qty={self.quantity})>"
