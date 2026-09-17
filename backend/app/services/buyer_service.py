"""Buyer requirements, verified directory, and trade proposals service."""

from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from app.models.buyer import BuyerProfile, BuyerRequirement, VerificationStatus, RequirementStatus
from app.models.trade import FarmerListing, BuyerRequest, RequestStatus
from app.models.crop import Crop
from app.models.notification import Notification, NotificationType
from app.schemas.buyer import (
    BuyerRequirementCreate,
    BuyerRequestCreate,
    BuyerRequestUpdate,
)
from app.utils.exceptions import NotFoundException, BadRequestException


class BuyerService:
    @staticmethod
    def get_buyers(
        db: Session,
        verification_status: Optional[VerificationStatus] = None,
        limit: int = 50
    ) -> List[BuyerProfile]:
        query = db.query(BuyerProfile)
        if verification_status:
            query = query.filter(BuyerProfile.verification_status == verification_status)
        return query.order_by(BuyerProfile.created_at.desc()).limit(limit).all()

    @staticmethod
    def get_requirements(
        db: Session,
        crop_id: Optional[int] = None,
        status: Optional[RequirementStatus] = None,
        buyer_id: Optional[int] = None,
        limit: int = 50
    ) -> List[BuyerRequirement]:
        query = (
            db.query(BuyerRequirement)
            .options(joinedload(BuyerRequirement.crop), joinedload(BuyerRequirement.buyer))
        )
        if crop_id:
            query = query.filter(BuyerRequirement.crop_id == crop_id)
        if status:
            query = query.filter(BuyerRequirement.status == status)
        if buyer_id:
            query = query.filter(BuyerRequirement.buyer_id == buyer_id)

        return query.order_by(BuyerRequirement.created_at.desc()).limit(limit).all()

    @staticmethod
    def create_requirement(
        db: Session,
        buyer_profile: BuyerProfile,
        req_in: BuyerRequirementCreate
    ) -> BuyerRequirement:
        crop = db.query(Crop).filter(Crop.id == req_in.crop_id).first()
        if not crop:
            raise NotFoundException(detail=f"Crop with ID {req_in.crop_id} not found")

        req = BuyerRequirement(
            buyer_id=buyer_profile.id,
            crop_id=req_in.crop_id,
            quantity_required=req_in.quantity_required,
            expected_price=req_in.expected_price,
            location=req_in.location,
            status=RequirementStatus.OPEN
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    # Buyer Requests on Listings
    @staticmethod
    def create_buyer_request(
        db: Session,
        buyer_profile: BuyerProfile,
        request_in: BuyerRequestCreate
    ) -> BuyerRequest:
        listing = db.query(FarmerListing).filter(FarmerListing.id == request_in.listing_id).first()
        if not listing:
            raise NotFoundException(detail=f"Listing with ID {request_in.listing_id} not found")

        buyer_request = BuyerRequest(
            listing_id=request_in.listing_id,
            buyer_id=buyer_profile.id,
            quantity=request_in.quantity,
            message=request_in.message,
            status=RequestStatus.PENDING
        )
        db.add(buyer_request)
        db.flush()

        # Send in-app notification to the farmer
        if listing.farmer and listing.farmer.user_id:
            notif = Notification(
                user_id=listing.farmer.user_id,
                title="New Direct Purchase Offer Received",
                message=f"{buyer_profile.business_name} sent an offer for {request_in.quantity} Qtl on your listing.",
                type=NotificationType.BUYER_REQUEST,
                is_read=False
            )
            db.add(notif)

        db.commit()
        db.refresh(buyer_request)
        return buyer_request

    @staticmethod
    def update_request_status(
        db: Session,
        request_id: int,
        update_in: BuyerRequestUpdate
    ) -> BuyerRequest:
        req = db.query(BuyerRequest).filter(BuyerRequest.id == request_id).first()
        if not req:
            raise NotFoundException(detail=f"Buyer request with ID {request_id} not found")

        req.status = update_in.status
        if update_in.message:
            req.message = update_in.message

        db.commit()
        db.refresh(req)
        return req
