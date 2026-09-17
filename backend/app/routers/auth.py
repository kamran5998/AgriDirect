"""Authentication router for registration, login, profile inspection, and session logout."""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, Token, UserRead
from app.services.auth_service import AuthService
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])


@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new Farmer, Buyer, or Admin"
)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new account on AgriDirect Pulse and returns JWT authentication credentials.
    Automatically boots role-specific profile records.
    """
    user, token = AuthService.register_user(db=db, user_in=user_in)
    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserRead.from_orm(user)
    )


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate and obtain JWT access token"
)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates registered user via mobile phone or email with bcrypt verification.
    """
    user, token = AuthService.authenticate_user(db=db, login_data=login_data)
    return Token(
        access_token=token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserRead.from_orm(user)
    )


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current authenticated user profile"
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns current active user details extracted from bearer token.
    """
    return current_user


@router.post(
    "/logout",
    summary="Logout session"
)
def logout(current_user: User = Depends(get_current_user)):
    """
    Stateless JWT logout confirmation endpoint.
    Client clears stored token from local storage.
    """
    return {"success": True, "message": "Successfully logged out of AgriDirect Pulse"}
