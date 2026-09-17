"""SQLAlchemy ORM Model for APMC Mandis and Market Prices."""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Numeric, DateTime, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class MarketStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CLOSED = "closed"


class DemandLevel(str, enum.Enum):
    LOW = "Low"
    MODERATE = "Moderate"
    HIGH = "High"
    SURGE = "Surge"


class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(150), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    status = Column(Enum(MarketStatus), default=MarketStatus.ACTIVE, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('name', 'district', 'state', name='uq_market_name_district_state'),
    )

    # Relationships
    prices = relationship("MarketPrice", back_populates="market", cascade="all, delete-orphan")
    predictions = relationship("PricePrediction", back_populates="market", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Market(id={self.id}, name='{self.name}', district='{self.district}', state='{self.state}')>"


class MarketPrice(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    market_id = Column(Integer, ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False, index=True)
    price = Column(Numeric(10, 2), nullable=False)  # Modal price in ₹ / Quintal
    min_price = Column(Numeric(10, 2), nullable=False)
    max_price = Column(Numeric(10, 2), nullable=False)
    demand_level = Column(Enum(DemandLevel), default=DemandLevel.MODERATE, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ingested_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    source = Column(String(100), default="SIMULATED_MOCK_PROVIDER", nullable=False)
    is_mock = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint('market_id', 'crop_id', 'recorded_at', name='uq_market_crop_recorded_at'),
    )

    # Relationships
    market = relationship("Market", back_populates="prices")
    crop = relationship("Crop", back_populates="market_prices")

    def __repr__(self) -> str:
        return f"<MarketPrice(id={self.id}, market_id={self.market_id}, crop_id={self.crop_id}, price={self.price}, is_mock={self.is_mock})>"
