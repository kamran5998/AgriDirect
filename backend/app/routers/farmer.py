"""Farmer operations router for agricultural profiles, crop inventories, and trade lot listings."""

from typing import List, Optional
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.farmer import FarmerProfile
from app.models.trade import ListingStatus
from app.schemas.farmer import (
    FarmerProfileRead,
    FarmerProfileUpdate,
    FarmerCropCreate,
    FarmerCropRead,
    FarmerListingCreate,
    FarmerListingRead,
)
from app.services.farmer_service import FarmerService
from app.utils.dependencies import get_current_farmer

router = APIRouter(prefix="/farmer", tags=["Farmer APIs"])


@router.get(
    "/profile",
    response_model=FarmerProfileRead,
    summary="Get farmer agricultural profile"
)
def get_profile(farmer_profile: FarmerProfile = Depends(get_current_farmer)):
    """
    Returns farmland metadata, location (State, District, Village), and preferred APMC mandis.
    """
    return farmer_profile


@router.put(
    "/profile",
    response_model=FarmerProfileRead,
    summary="Update farmer agricultural profile"
)
def update_profile(
    update_data: FarmerProfileUpdate,
    farmer_profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Updates village, district, state, or preferred benchmark markets.
    """
    return FarmerService.update_profile(db=db, farmer_profile=farmer_profile, update_data=update_data)


# Crop Inventory Portfolio
@router.post(
    "/crops",
    response_model=FarmerCropRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add cultivated crop to portfolio"
)
def add_crop(
    crop_in: FarmerCropCreate,
    farmer_profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Adds standing crop or estimated harvest quantity to farmer portfolio.
    """
    return FarmerService.add_farmer_crop(db=db, farmer_profile=farmer_profile, crop_in=crop_in)


@router.get(
    "/crops",
    response_model=List[FarmerCropRead],
    summary="Get all crops cultivated by the farmer"
)
def get_crops(
    farmer_profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Returns list of crops cultivated with harvest dates and quantities.
    """
    return FarmerService.get_farmer_crops(db=db, farmer_profile=farmer_profile)


# Direct Lot Listings
@router.post(
    "/listings",
    response_model=FarmerListingRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new direct sale lot listing"
)
def create_listing(
    listing_in: FarmerListingCreate,
    farmer_profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Publishes a verified farm-gate direct sale lot available for institutional buyers.
    """
    return FarmerService.create_listing(db=db, farmer_profile=farmer_profile, listing_in=listing_in)


@router.get(
    "/listings",
    response_model=List[FarmerListingRead],
    summary="Get own lot listings"
)
def get_own_listings(
    status: Optional[ListingStatus] = Query(None, description="Filter by listing status"),
    farmer_profile: FarmerProfile = Depends(get_current_farmer),
    db: Session = Depends(get_db)
):
    """
    Fetches all active, in-negotiation, or completed listings posted by the farmer.
    """
    return FarmerService.get_farmer_listings(db=db, farmer_profile=farmer_profile, status=status)
