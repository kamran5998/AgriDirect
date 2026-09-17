"""SQLAlchemy ORM Model for Machine Learning Price Predictions."""

from datetime import datetime, date
from sqlalchemy import Column, Integer, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class PricePrediction(Base):
    __tablename__ = "price_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="RESTRICT"), nullable=False, index=True)
    market_id = Column(Integer, ForeignKey("markets.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_price = Column(Numeric(10, 2), nullable=False)
    prediction_date = Column(Date, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    crop = relationship("Crop", back_populates="price_predictions")
    market = relationship("Market", back_populates="predictions")

    def __repr__(self) -> str:
        return f"<PricePrediction(id={self.id}, crop_id={self.crop_id}, market_id={self.market_id}, pred={self.predicted_price}, date={self.prediction_date})>"
