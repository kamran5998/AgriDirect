"""Disputes and trade arbitration router."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.dispute import DisputeCreate, DisputeResolve, DisputeResponse
from app.services.dispute_service import DisputeService

router = APIRouter(prefix="/disputes", tags=["Disputes & Arbitration"])


@router.get(
    "",
    response_model=List[DisputeResponse],
    summary="List all trade disputes"
)
def list_disputes(
    status: Optional[str] = Query(None, description="Filter by status (Open/Under Review/Resolved)"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Returns list of all logged trade disputes and arbitration grievances.
    """
    return DisputeService.list_disputes(db=db, status=status, limit=limit)


@router.post(
    "",
    response_model=DisputeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new trade dispute"
)
def create_dispute(
    dispute_in: DisputeCreate,
    db: Session = Depends(get_db)
):
    """
    Submits a new trade grievance ticket under the dispute resolution protocol.
    """
    return DisputeService.create_dispute(db=db, dispute_in=dispute_in)


@router.patch(
    "/{id}/resolve",
    response_model=DisputeResponse,
    summary="Resolve a dispute with arbitration ruling"
)
def resolve_dispute(
    id: int,
    resolve_in: DisputeResolve,
    db: Session = Depends(get_db)
):
    """
    Updates the dispute with resolution notes and marks it as resolved.
    """
    return DisputeService.resolve_dispute(
        db=db,
        dispute_id=id,
        resolution_notes=resolve_in.resolution_notes,
        status_val=resolve_in.status
    )


@router.patch(
    "/{id}",
    response_model=DisputeResponse,
    summary="Update dispute status"
)
def update_dispute(
    id: int,
    resolve_in: DisputeResolve,
    db: Session = Depends(get_db)
):
    """
    Update dispute status and resolution notes.
    """
    return DisputeService.resolve_dispute(
        db=db,
        dispute_id=id,
        resolution_notes=resolve_in.resolution_notes,
        status_val=resolve_in.status
    )
