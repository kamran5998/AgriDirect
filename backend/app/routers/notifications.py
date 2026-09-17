"""Notification router for user real-time alert feed and status updates."""

from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.notification import NotificationRead
from app.services.notification_service import NotificationService
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications & Alerts"])


@router.get(
    "",
    response_model=List[NotificationRead],
    summary="Get user notifications feed"
)
def get_notifications(
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns user notification stream including price alerts, buyer proposals, and trade status.
    """
    return NotificationService.get_user_notifications(db=db, user_id=current_user.id, limit=limit)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationRead,
    summary="Mark single notification as read"
)
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Marks a single notification as read.
    """
    return NotificationService.mark_as_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )


@router.post(
    "/read-all",
    summary="Mark all notifications as read"
)
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Batch marks all pending notifications for the authenticated user as read.
    """
    count = NotificationService.mark_all_as_read(db=db, user_id=current_user.id)
    return {"success": True, "marked_count": count}
