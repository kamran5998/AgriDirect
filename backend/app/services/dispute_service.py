"""Dispute and trade arbitration service."""

from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.dispute import Dispute, DisputeStatus
from app.schemas.dispute import DisputeCreate
from app.utils.exceptions import NotFoundException


class DisputeService:
    @staticmethod
    def create_dispute(db: Session, dispute_in: DisputeCreate) -> Dispute:
        dispute = Dispute(
            trade_id=dispute_in.trade_id,
            gate_pass_id=dispute_in.gate_pass_id,
            farmer_id=dispute_in.farmer_id,
            buyer_id=dispute_in.buyer_id,
            reason=dispute_in.reason,
            status=DisputeStatus.OPEN,
            resolution_notes=dispute_in.resolution_notes,
            created_at=datetime.utcnow(),
        )
        db.add(dispute)
        db.commit()
        db.refresh(dispute)
        return dispute

    @staticmethod
    def list_disputes(
        db: Session,
        status: Optional[str] = None,
        limit: int = 50
    ) -> List[Dispute]:
        query = db.query(Dispute)
        if status:
            # Match status case-insensitively or via enum
            status_clean = status.strip().lower()
            if status_clean in ["open", "open"]:
                query = query.filter(Dispute.status == DisputeStatus.OPEN)
            elif status_clean in ["under review", "under_review"]:
                query = query.filter(Dispute.status == DisputeStatus.UNDER_REVIEW)
            elif status_clean in ["resolved", "resolved_farmer_favor", "resolved_buyer_favor", "closed_mutual"]:
                query = query.filter(Dispute.status == DisputeStatus.RESOLVED)
            else:
                query = query.filter(Dispute.status == status)

        return query.order_by(Dispute.created_at.desc()).limit(limit).all()

    @staticmethod
    def resolve_dispute(
        db: Session,
        dispute_id: int,
        resolution_notes: str,
        status_val: DisputeStatus = DisputeStatus.RESOLVED
    ) -> Dispute:
        dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
        if not dispute:
            raise NotFoundException(detail=f"Dispute with ID {dispute_id} not found")

        dispute.status = status_val
        dispute.resolution_notes = resolution_notes
        dispute.resolved_at = datetime.utcnow()

        db.commit()
        db.refresh(dispute)
        return dispute
