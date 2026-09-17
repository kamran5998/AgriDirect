"""Pydantic schemas for Buyer profile, procurement requirements, and trade requests."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field
from app.models.buyer import VerificationStatus, RequirementStatus
from app.models.trade import RequestStatus
from app.schemas.crop import CropRead


class BuyerProfileBase(BaseModel):
    business_name: str = Field(..., max_length=200)
    location: str = Field(..., max_length=255)


class BuyerProfileRead(BuyerProfileBase):
    id: int
    user_id: int
    verification_status: VerificationStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BuyerProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    location: Optional[str] = None
    verification_status: Optional[VerificationStatus] = None


# Buyer Requirements Schemas
class BuyerRequirementCreate(BaseModel):
    crop_id: int
    quantity_required: Decimal = Field(..., gt=0)
    expected_price: Decimal = Field(..., gt=0)
    location: str = Field(..., max_length=255)


class BuyerRequirementRead(BaseModel):
    id: int
    buyer_id: int
    crop_id: int
    quantity_required: Decimal
    expected_price: Decimal
    location: str
    status: RequirementStatus
    created_at: datetime
    updated_at: datetime
    crop: Optional[CropRead] = None
    buyer: Optional[BuyerProfileRead] = None

    class Config:
        from_attributes = True


# Buyer Requests Schemas
class BuyerRequestCreate(BaseModel):
    listing_id: int
    quantity: Decimal = Field(..., gt=0)
    message: Optional[str] = None


class BuyerRequestUpdate(BaseModel):
    status: RequestStatus
    message: Optional[str] = None


class BuyerRequestRead(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    quantity: Decimal
    message: Optional[str] = None
    status: RequestStatus
    created_at: datetime
    updated_at: datetime
    buyer: Optional[BuyerProfileRead] = None

    class Config:
        from_attributes = True
