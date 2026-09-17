"""Farmer profile, crop portfolio, and direct lot listings service."""

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.farmer import FarmerProfile, FarmerCrop
from app.models.trade import FarmerListing, ListingStatus
from app.models.crop import Crop
from app.models.user import User
from app.schemas.farmer import (
    FarmerProfileUpdate,
    FarmerCropCreate,
    FarmerListingCreate,
)
from app.utils.exceptions import NotFoundException, BadRequestException


class FarmerService:
    @staticmethod
    def get_profile_by_user_id(db: Session, user_id: int) -> FarmerProfile:
        profile = (
            db.query(FarmerProfile)
            .filter(FarmerProfile.user_id == user_id)
            .first()
        )
        if not profile:
            raise NotFoundException(detail="Farmer profile not found")
        return profile

    @staticmethod
    def update_profile(db: Session, farmer_profile: FarmerProfile, update_data: FarmerProfileUpdate) -> FarmerProfile:
        if update_data.state is not None:
            farmer_profile.state = update_data.state
        if update_data.district is not None:
            farmer_profile.district = update_data.district
        if update_data.village is not None:
            farmer_profile.village = update_data.village
        if update_data.preferred_markets is not None:
            farmer_profile.preferred_markets = update_data.preferred_markets

        db.commit()
        db.refresh(farmer_profile)
        return farmer_profile

    # Farmer Crops Portfolio
    @staticmethod
    def add_farmer_crop(db: Session, farmer_profile: FarmerProfile, crop_in: FarmerCropCreate) -> FarmerCrop:
        # Validate crop exists
        crop = db.query(Crop).filter(Crop.id == crop_in.crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {crop_in.crop_id} not found in catalog")

        farmer_crop = FarmerCrop(
            farmer_id=farmer_profile.id,
            crop_id=crop_in.crop_id,
            quantity=crop_in.quantity,
            unit=crop_in.unit,
            harvest_date=crop_in.harvest_date
        )
        db.add(farmer_crop)
        db.commit()
        db.refresh(farmer_crop)
        return farmer_crop

    @staticmethod
    def get_farmer_crops(db: Session, farmer_profile: FarmerProfile) -> List[FarmerCrop]:
        return (
            db.query(FarmerCrop)
            .options(joinedload(FarmerCrop.crop))
            .filter(FarmerCrop.farmer_id == farmer_profile.id)
            .order_by(FarmerCrop.harvest_date.asc())
            .all()
        )

    # Farmer Listings
    @staticmethod
    def create_listing(db: Session, farmer_profile: FarmerProfile, listing_in: FarmerListingCreate) -> FarmerListing:
        # Validate crop exists
        crop = db.query(Crop).filter(Crop.id == listing_in.crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {listing_in.crop_id} not found in catalog")

        listing = FarmerListing(
            farmer_id=farmer_profile.id,
            crop_id=listing_in.crop_id,
            quantity=listing_in.quantity,
            expected_price=listing_in.expected_price,
            quality=listing_in.quality,
            location=listing_in.location,
            availability_date=listing_in.availability_date,
            status=ListingStatus.ACTIVE
        )
        db.add(listing)
        db.commit()
        db.refresh(listing)
        return listing

    @staticmethod
    def get_farmer_listings(db: Session, farmer_profile: FarmerProfile, status: Optional[ListingStatus] = None) -> List[FarmerListing]:
        query = (
            db.query(FarmerListing)
            .options(joinedload(FarmerListing.crop))
            .filter(FarmerListing.farmer_id == farmer_profile.id)
        )
        if status:
            query = query.filter(FarmerListing.status == status)

        return query.order_by(FarmerListing.created_at.desc()).all()
