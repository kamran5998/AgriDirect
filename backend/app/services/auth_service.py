"""Authentication, User Registration, Login, and Credential Validation Service."""

from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.user import User, UserRole
from app.models.farmer import FarmerProfile
from app.models.buyer import BuyerProfile, VerificationStatus
from app.schemas.auth import UserRegister, UserLogin, Token, UserRead
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.utils.exceptions import ConflictException, CredentialsException, BadRequestException
from app.config import settings


class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserRegister) -> Tuple[User, str]:
        """
        Registers a new user (Farmer / Buyer / Admin) and initializes corresponding role profile.
        """
        # Check existing phone or email
        existing_user = db.query(User).filter(
            or_(
                User.phone == user_in.phone,
                User.email == user_in.email if user_in.email else False
            )
        ).first()

        if existing_user:
            if existing_user.phone == user_in.phone:
                raise ConflictException(detail="A user with this mobile number is already registered")
            if user_in.email and existing_user.email == user_in.email:
                raise ConflictException(detail="A user with this email address is already registered")

        # Create user record
        db_user = User(
            name=user_in.name,
            email=user_in.email,
            phone=user_in.phone,
            password_hash=get_password_hash(user_in.password),
            role=user_in.role,
            location=user_in.location or (f"{user_in.village}, {user_in.district}, {user_in.state}" if user_in.district else None)
        )
        db.add(db_user)
        db.flush()

        # Initialize role-specific profile
        if user_in.role == UserRole.FARMER:
            farmer_profile = FarmerProfile(
                user_id=db_user.id,
                state=user_in.state or "Madhya Pradesh",
                district=user_in.district or "Sehore",
                village=user_in.village or "Ashta",
                preferred_markets=[]
            )
            db.add(farmer_profile)

        elif user_in.role == UserRole.BUYER:
            buyer_profile = BuyerProfile(
                user_id=db_user.id,
                business_name=user_in.business_name or f"{user_in.name} Agro Exim",
                location=user_in.location or "State Procurement Hub",
                verification_status=VerificationStatus.PENDING
            )
            db.add(buyer_profile)

        db.commit()
        db.refresh(db_user)

        # Generate JWT token
        token = create_access_token(
            subject=db_user.id,
            role=db_user.role.value,
            extra_claims={"name": db_user.name, "phone": db_user.phone}
        )

        return db_user, token

    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> Tuple[User, str]:
        """
        Authenticates user with mobile or email and password.
        """
        identifier = login_data.phone_or_email.strip()
        user = db.query(User).filter(
            or_(
                User.phone == identifier,
                User.email == identifier
            )
        ).first()

        if not user:
            raise CredentialsException(detail="Invalid mobile number/email or password")

        if not verify_password(login_data.password, user.password_hash):
            raise CredentialsException(detail="Invalid mobile number/email or password")

        # Generate access token
        token = create_access_token(
            subject=user.id,
            role=user.role.value,
            extra_claims={"name": user.name, "phone": user.phone}
        )

        return user, token
