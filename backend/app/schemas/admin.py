"""Pydantic schemas for Admin dashboard analytics and controls."""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.user import UserRole
from app.models.buyer import VerificationStatus, RequirementStatus
from app.models.market import MarketStatus
from app.models.trade import QualityGrade, ListingStatus, RequestStatus
from app.schemas.auth import UserRead


class AdminDashboardStats(BaseModel):
    total_farmers: int
    active_farmers: int
    registered_buyers: int
    tracked_markets: int
    crops_tracked: int
    active_listings: int
    open_requirements: int
    total_transactions_volume_mt: Decimal
    api_sync_health_percent: float


class AdminUserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[UserRole] = None
    location: Optional[str] = None


class AdminUserStatusUpdate(BaseModel):
    role: Optional[UserRole] = None
    location: Optional[str] = None


class AdminBuyerVerificationUpdate(BaseModel):
    verification_status: VerificationStatus
    notes: Optional[str] = None


class AdminPriceOverride(BaseModel):
    market_id: int
    crop_id: int
    price: Decimal
    min_price: Decimal
    max_price: Decimal
    reason: str = Field(..., min_length=5)


class AdminFarmerDetail(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str
    email: Optional[str] = None
    state: str
    district: str
    village: str
    total_crops: int
    total_listings: int
    preferred_markets: List[int] = []
    created_at: datetime


class AdminBuyerDetail(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str
    email: Optional[str] = None
    business_name: str
    location: str
    verification_status: VerificationStatus
    total_requirements: int
    total_requests: int
    created_at: datetime


class AdminListingDetail(BaseModel):
    id: int
    farmer_id: int
    farmer_name: str
    farmer_phone: str
    crop_id: int
    crop_name: str
    quantity: Decimal
    expected_price: Decimal
    quality: QualityGrade
    location: str
    availability_date: date
    status: ListingStatus
    created_at: datetime


class AdminBuyerRequestDetail(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    buyer_name: str
    buyer_business_name: str
    crop_name: str
    quantity: Decimal
    message: Optional[str] = None
    status: RequestStatus
    created_at: datetime


class AdminNotificationDetail(BaseModel):
    id: int
    user_id: int
    user_name: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime


class AdminSystemHealth(BaseModel):
    status: str
    database_connected: bool
    database_type: str
    pool_size: int
    active_connections: int
    sync_health_percent: float
    ml_models_active: bool
    ml_r2_score: float
    ml_mae_inr: float
    market_feeds_count: int
    last_sync_timestamp: datetime
    server_time: datetime

