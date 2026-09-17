"""Pydantic schemas for Farmer profile, crops portfolio, and lot listings."""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.trade import QualityGrade, ListingStatus
from app.schemas.crop import CropRead


class FarmerProfileBase(BaseModel):
    state: str = Field(..., max_length=100)
    district: str = Field(..., max_length=100)
    village: str = Field(..., max_length=150)
    preferred_markets: Optional[List[int]] = Field(default_factory=list)


class FarmerProfileUpdate(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    preferred_markets: Optional[List[int]] = None


class FarmerProfileRead(FarmerProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Farmer Crop Schemas
class FarmerCropCreate(BaseModel):
    crop_id: int = Field(..., description="ID of crop from master catalog")
    quantity: Decimal = Field(..., gt=0, description="Estimated harvest in quintals")
    unit: str = Field(default="Quintal", max_length=20)
    harvest_date: date = Field(..., description="Expected harvest date (YYYY-MM-DD)")


class FarmerCropRead(BaseModel):
    id: int
    farmer_id: int
    crop_id: int
    quantity: Decimal
    unit: str
    harvest_date: date
    created_at: datetime
    crop: Optional[CropRead] = None

    class Config:
        from_attributes = True


# Farmer Listing Schemas
class FarmerListingCreate(BaseModel):
    crop_id: int
    quantity: Decimal = Field(..., gt=0, description="Lot size in Quintals")
    expected_price: Decimal = Field(..., gt=0, description="Expected price per Quintal in INR")
    quality: QualityGrade = Field(default=QualityGrade.FAQ_STANDARD)
    location: str = Field(..., max_length=255)
    availability_date: date


class FarmerListingRead(BaseModel):
    id: int
    farmer_id: int
    crop_id: int
    quantity: Decimal
    expected_price: Decimal
    quality: QualityGrade
    location: str
    availability_date: date
    status: ListingStatus
    created_at: datetime
    updated_at: datetime
    crop: Optional[CropRead] = None

    class Config:
        from_attributes = True
