"""AgriDirect Pulse FastAPI Application Entry Point."""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth,
    farmer,
    market,
    crop,
    buyer,
    admin,
    notifications,
    analytics,
    predictions,
    recommendations,
    disputes,
)

# Auto-create tables if running in development mode without Alembic
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    # Log warning if database is not reachable yet during cold startup
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    ### Real-Time Market Intelligence and Direct Market Access for Farmers
    
    Production-ready REST API powering the AgriDirect Pulse agricultural technology platform.
    
    #### Features:
    * **Authentication & RBAC**: JWT Bearer auth with Farmer, Buyer, and Admin role isolation.
    * **Market Intelligence**: Real-time APMC Mandi commodity arrival prices, search, comparison, and historical timeseries.
    * **Farmer Direct Access**: Farm-gate lot listing, crop portfolio tracker, and freight optimization.
    * **Buyer Procurement**: Institutional tenders and direct purchase proposals.
    * **Admin Workbench**: Platform health KPIs, user accreditation, and market price overrides.
    * **Notifications**: Real-time event dispatch for price alerts and contract bids.
    """,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure Cross-Origin Resource Sharing (CORS) for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(farmer.router, prefix=settings.API_V1_STR)
app.include_router(market.router, prefix=settings.API_V1_STR)
app.include_router(crop.router, prefix=settings.API_V1_STR)
app.include_router(buyer.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(disputes.router, prefix=settings.API_V1_STR)


@app.get(
    "/api/health",
    tags=["System Health"],
    summary="Health check endpoint"
)
def health_check():
    """
    Returns server status, version, and database connectivity mode.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": "development" if settings.DEBUG else "production"
    }


@app.get(
    "/",
    tags=["System Health"],
    summary="Root API info"
)
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "redoc": "/redoc",
        "api_v1": settings.API_V1_STR
    }


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Formats Pydantic validation errors into clean API envelopes.
    """
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "Validation Error",
            "details": exc.errors()
        }
    )
