import asyncio
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from ..middleware.budget_guard import budget_protection

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"
    timestamp: datetime
    redis_connected: bool = False


@router.get("/health", response_model=HealthResponse)
@router.head("/health", response_model=HealthResponse)
async def health_check():
    redis_ok = False
    try:
        client = await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
        if client:
            redis_ok = True
    except Exception:
        pass

    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        redis_connected=redis_ok,
    )
