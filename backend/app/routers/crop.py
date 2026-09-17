"""Crop master catalog router."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.crop import Crop, CropCategory
from app.schemas.crop import CropRead, CropCreate
from app.utils.dependencies import get_current_admin
from app.utils.exceptions import NotFoundException

router = APIRouter(prefix="/crops", tags=["Crops Catalog"])


@router.get(
    "",
    response_model=List[CropRead],
    summary="Get all crops in catalog"
)
def get_crops(
    category: Optional[CropCategory] = Query(None, description="Filter by crop category"),
    search: Optional[str] = Query(None, description="Search crop name"),
    db: Session = Depends(get_db)
):
    """
    Returns list of all registered crops with their categories and standard specifications.
    """
    query = db.query(Crop)
    if category:
        query = query.filter(Crop.category == category)
    if search:
        query = query.filter(Crop.name.ilike(f"%{search}%"))
    return query.order_by(Crop.category.asc(), Crop.name.asc()).all()


@router.get(
    "/{crop_id}",
    response_model=CropRead,
    summary="Get single crop details"
)
def get_crop_by_id(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise NotFoundException(detail=f"Crop with ID {crop_id} not found")
    return crop


@router.post(
    "",
    response_model=CropRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create new crop commodity (Admin only)"
)
def create_crop(
    crop_in: CropCreate,
    admin_user=Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    crop = Crop(
        name=crop_in.name,
        category=crop_in.category,
        description=crop_in.description
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop
