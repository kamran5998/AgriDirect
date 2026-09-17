"""Buyer operations router for requirements, tenders, trade proposals, and negotiations."""

from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.buyer import BuyerProfile, VerificationStatus, RequirementStatus
from app.models.trade import RequestStatus
from app.schemas.buyer import (
    BuyerProfileRead,
    BuyerRequirementCreate,
    BuyerRequirementRead,
    BuyerRequestCreate,
    BuyerRequestUpdate,
    BuyerRequestRead,
)
from app.services.buyer_service import BuyerService
from app.utils.dependencies import get_current_buyer, get_current_user

router = APIRouter(prefix="/buyers", tags=["Buyer & Procurement APIs"])


@router.get(
    "",
    response_model=List[BuyerProfileRead],
    summary="Get verified institutional buyers directory"
)
def get_buyers_directory(
    verification_status: Optional[VerificationStatus] = Query(None, description="Filter by accreditation status"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns list of registered institutional agribusinesses, millers, and exporters.
    """
    return BuyerService.get_buyers(db=db, verification_status=verification_status, limit=limit)


@router.get(
    "/requirements",
    response_model=List[BuyerRequirementRead],
    summary="Get active buyer procurement tenders"
)
def get_requirements(
    crop_id: Optional[int] = Query(None, description="Filter by crop ID"),
    status: Optional[RequirementStatus] = Query(None, description="Filter by status (open/fulfilled)"),
    buyer_id: Optional[int] = Query(None, description="Filter by specific buyer"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Returns institutional buy requirements and pricing targets for farmers to review.
    """
    return BuyerService.get_requirements(db=db, crop_id=crop_id, status=status, buyer_id=buyer_id, limit=limit)


@router.post(
    "/requirements",
    response_model=BuyerRequirementRead,
    status_code=status.HTTP_201_CREATED,
    summary="Post a new buyer procurement tender"
)
def create_requirement(
    req_in: BuyerRequirementCreate,
    buyer_profile: BuyerProfile = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """
    Publishes a verified purchase requirement with target volume and price per quintal.
    """
    return BuyerService.create_requirement(db=db, buyer_profile=buyer_profile, req_in=req_in)


@router.post(
    "/requests",
    response_model=BuyerRequestRead,
    status_code=status.HTTP_201_CREATED,
    summary="Send direct purchase offer on a farmer listing"
)
def send_buyer_request(
    request_in: BuyerRequestCreate,
    buyer_profile: BuyerProfile = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """
    Sends a binding trade offer/contract proposal directly on a farmer's lot.
    """
    return BuyerService.create_buyer_request(db=db, buyer_profile=buyer_profile, request_in=request_in)


@router.patch(
    "/requests/{request_id}/status",
    response_model=BuyerRequestRead,
    summary="Update trade proposal status (Accept / Counter / Reject)"
)
def update_request_status(
    request_id: int,
    update_in: BuyerRequestUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the trade negotiation state for an active buyer request.
    """
    return BuyerService.update_request_status(db=db, request_id=request_id, update_in=update_in)
