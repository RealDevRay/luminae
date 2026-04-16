import asyncio
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from ..config import get_settings
from ..middleware.budget_guard import budget_protection

router = APIRouter()
settings = get_settings()


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"
    timestamp: datetime
    redis_connected: bool = False
    redis_error: str | None = None
    redis_url_configured: bool = False


@router.get("/health", response_model=HealthResponse)
@router.head("/health", response_model=HealthResponse)
async def health_check():
    redis_ok = False
    redis_err = None
    url_configured = bool(settings.upstash_redis_rest_url)

    try:
        client = await asyncio.wait_for(budget_protection.get_redis(), timeout=5)
        if client:
            redis_ok = True
        else:
            redis_err = "get_redis() returned None"
    except Exception as e:
        redis_err = str(e)

    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        redis_connected=redis_ok,
        redis_error=redis_err,
        redis_url_configured=url_configured,
    )
