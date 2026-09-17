"""SQLAlchemy ORM Model for Crops master catalog."""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class CropCategory(str, enum.Enum):
    GRAINS = "Grains"
    PULSES = "Pulses"
    OILSEEDS = "Oilseeds"
    VEGETABLES = "Vegetables"
    FRUITS = "Fruits"
    CASH_CROPS = "Cash Crops"


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(Enum(CropCategory), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    farmer_crops = relationship("FarmerCrop", back_populates="crop")
    market_prices = relationship("MarketPrice", back_populates="crop")
    buyer_requirements = relationship("BuyerRequirement", back_populates="crop")
    farmer_listings = relationship("FarmerListing", back_populates="crop")
    price_predictions = relationship("PricePrediction", back_populates="crop")

    def __repr__(self) -> str:
        return f"<Crop(id={self.id}, name='{self.name}', category='{self.category}')>"
