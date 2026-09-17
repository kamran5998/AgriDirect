"""Database connection, SQLAlchemy engine, session management, and dependency."""

import logging
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from app.config import settings

logger = logging.getLogger(__name__)

# Configure SQLAlchemy engine with MySQL connection pool optimization
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,      # Automatically verify connection health before query
    pool_recycle=3600,       # Recycle connections every hour to avoid MySQL timeouts
    pool_size=10,            # Base pool size
    max_overflow=20,         # Maximum overflow connections
    echo=settings.DEBUG,     # Echo SQL queries in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields an active database session per request
    and ensures proper closing upon completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
