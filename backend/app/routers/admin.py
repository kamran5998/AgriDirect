"""Admin control router for platform health, user access, and price anomaly interventions."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.buyer import VerificationStatus
from app.models.trade import ListingStatus, RequestStatus
from app.schemas.auth import UserRead
from app.schemas.buyer import BuyerProfileRead
from app.schemas.market import MarketPriceRead
from app.schemas.admin import (
    AdminDashboardStats,
    AdminUserUpdate,
    AdminBuyerVerificationUpdate,
    AdminPriceOverride,
    AdminFarmerDetail,
    AdminBuyerDetail,
    AdminListingDetail,
    AdminBuyerRequestDetail,
    AdminNotificationDetail,
    AdminSystemHealth,
)
from app.services.admin_service import AdminService
from app.utils.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin & System Operations"])


@router.get(
    "/stats",
    response_model=AdminDashboardStats,
    summary="Get platform macro KPI statistics"
)
def get_dashboard_stats(
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns platform-wide totals: farmers, buyers, mandis, listings, and trade volume.
    """
    return AdminService.get_dashboard_stats(db=db)


@router.get(
    "/users",
    response_model=List[UserRead],
    summary="Manage registered platform users"
)
def list_users(
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    search: Optional[str] = Query(None, description="Search by name, phone, or email"),
    limit: int = Query(50, ge=1, le=200),
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns paginated user directory with roles and registration dates.
    """
    return AdminService.list_users(db=db, role=role, search=search, limit=limit)


@router.patch(
    "/users/{user_id}",
    response_model=UserRead,
    summary="Update user profile or role"
)
def update_user(
    user_id: int,
    user_in: AdminUserUpdate,
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Allows admin operators to modify user credentials, roles, or profile states.
    """
    return AdminService.update_user(db=db, user_id=user_id, user_in=user_in)


@router.get(
    "/farmers",
    response_model=List[AdminFarmerDetail],
    summary="List all farmer profiles and inventory"
)
def list_farmers(
    search: Optional[str] = Query(None, description="Search by name, state, district, village"),
    limit: int = Query(50, ge=1, le=200),
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns farmer accounts with landholding metadata, location, and crop inventories.
    """
    return AdminService.list_farmers(db=db, search=search, limit=limit)


@router.get(
    "/buyers",
    response_model=List[AdminBuyerDetail],
    summary="List all institutional buyers"
)
def list_buyers(
    status: Optional[VerificationStatus] = Query(None, description="Filter by verification status"),
    search: Optional[str] = Query(None, description="Search by business name, location, contact"),
    limit: int = Query(50, ge=1, le=200),
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns buyer enterprises, verification states, and active requirements.
    """
    return AdminService.list_buyers(db=db, status=status, search=search, limit=limit)


@router.patch(
    "/buyers/{buyer_id}/verify",
    response_model=BuyerProfileRead,
    summary="Update buyer KYC and verification status"
)
def update_buyer_verification(
    buyer_id: int,
    verif_in: AdminBuyerVerificationUpdate,
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approves or flags institutional buyer profiles following GSTIN & FSSAI document review.
    """
    return AdminService.update_buyer_verification(
        db=db,
        buyer_id=buyer_id,
        status=verif_in.verification_status
    )


@router.get(
    "/listings",
    response_model=List[AdminListingDetail],
    summary="List all farmer lot listings across platform"
)
def list_listings(
    status: Optional[ListingStatus] = Query(None, description="Filter by listing status"),
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    limit: int = Query(50, ge=1, le=200),
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns all direct farmer sale lots with availability dates and prices.
    """
    return AdminService.list_all_listings(db=db, status=status, crop_id=crop_id, limit=limit)


@router.get(
    "/buyer-requests",
    response_model=List[AdminBuyerRequestDetail],
    summary="List all trade proposals and buyer requests"
)
def list_buyer_requests(
    status: Optional[RequestStatus] = Query(None, description="Filter by trade status"),
    limit: int = Query(50, ge=1, le=200),
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns all buyer procurement proposals submitted on farmer lots.
    """
    return AdminService.list_all_buyer_requests(db=db, status=status, limit=limit)


@router.get(
    "/notifications",
    response_model=List[AdminNotificationDetail],
    summary="List platform notification audit stream"
)
def list_notifications(
    limit: int = Query(50, ge=1, le=200),
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns recent system alerts, trade notifications, and price alerts across users.
    """
    return AdminService.list_all_notifications(db=db, limit=limit)


@router.get(
    "/system-health",
    response_model=AdminSystemHealth,
    summary="Get full system telemetry and health status"
)
def get_system_health(
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns database connection status, ML predictive pipeline metrics, and API health.
    """
    return AdminService.get_system_health(db=db)


@router.post(
    "/prices/override",
    response_model=MarketPriceRead,
    status_code=status.HTTP_201_CREATED,
    summary="Override or inject verified APMC price record"
)
def override_market_price(
    override_data: AdminPriceOverride,
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Allows admin operators to correct data anomalies or inject verified EDI feed records.
    """
    return AdminService.override_market_price(db=db, override_data=override_data)

