"""
IyaLife API — FastAPI backend
Phase Zero · Python 3.12+
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from .config import settings
from .routers import auth, mothers, orders, referrals, products, metrics, webhooks


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print(f"🌿 IyaLife API starting — {settings.environment} environment")
    yield
    print("IyaLife API shutting down.")


app = FastAPI(
    title="IyaLife API",
    description="The IyaLife platform backend — Phase Zero",
    version="1.0.0",
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
    lifespan=lifespan,
)

# ── Middleware ────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if settings.environment == "production":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["api.iyalife.com"])

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/auth",      tags=["Authentication"])
app.include_router(mothers.router,   prefix="/mothers",   tags=["Mothers"])
app.include_router(orders.router,    prefix="/orders",    tags=["Orders"])
app.include_router(referrals.router, prefix="/referrals", tags=["Referrals"])
app.include_router(products.router,  prefix="/products",  tags=["Products"])
app.include_router(metrics.router,   prefix="/metrics",   tags=["Metrics"])
app.include_router(webhooks.router,  prefix="/webhooks",  tags=["Webhooks"])


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "institution": "IyaLife",
        "phase": "zero",
        "version": "1.0.0",
    }
