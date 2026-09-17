"""FastAPI Dependencies for authentication and Role-Based Access Control (RBAC)."""

from typing import List, Optional
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.farmer import FarmerProfile
from app.models.buyer import BuyerProfile
from app.utils.security import decode_access_token
from app.utils.exceptions import CredentialsException, PermissionDeniedException, NotFoundException

# OAuth2 token extractor (supports Authorization: Bearer <token>)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts, validates JWT token from request header, and returns the authenticated User.
    """
    if not token:
        raise CredentialsException(detail="Authentication token is missing")

    payload = decode_access_token(token)
    if payload is None:
        raise CredentialsException(detail="Invalid, malformed, or expired token")

    user_id_str: Optional[str] = payload.get("sub")
    if user_id_str is None:
        raise CredentialsException(detail="Token payload missing subject identifier")

    try:
        user_id = int(user_id_str)
    except ValueError:
        raise CredentialsException(detail="Invalid subject format in token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise CredentialsException(detail="User corresponding to token no longer exists")

    return user


def require_role(allowed_roles: List[UserRole]):
    """
    Higher-order dependency to enforce role-based authorization.
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise PermissionDeniedException(
                detail=f"Action restricted to {', '.join([r.value for r in allowed_roles])} roles only"
            )
        return current_user
    return role_checker


def get_current_farmer(
    current_user: User = Depends(require_role([UserRole.FARMER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
) -> FarmerProfile:
    """
    Dependency returning the FarmerProfile associated with the authenticated farmer.
    """
    profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == current_user.id).first()
    if not profile:
        # If admin without farmer profile, create or reject
        if current_user.role == UserRole.ADMIN:
            raise NotFoundException(detail="Admin does not have an attached farmer profile")
        raise NotFoundException(detail="Farmer profile not found. Please complete onboarding.")
    return profile


def get_current_buyer(
    current_user: User = Depends(require_role([UserRole.BUYER, UserRole.ADMIN])),
    db: Session = Depends(get_db)
) -> BuyerProfile:
    """
    Dependency returning the BuyerProfile associated with the authenticated buyer.
    """
    profile = db.query(BuyerProfile).filter(BuyerProfile.user_id == current_user.id).first()
    if not profile:
        raise NotFoundException(detail="Buyer profile not found. Please register business credentials.")
    return profile


def get_current_admin(
    current_user: User = Depends(require_role([UserRole.ADMIN]))
) -> User:
    """
    Dependency enforcing Administrator privilege.
    """
    return current_user
