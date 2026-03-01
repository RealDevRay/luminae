import time
from fastapi import Request
from fastapi.responses import JSONResponse
from typing import Optional

MAX_REQUESTS_PER_MINUTE = 10
REQUEST_WINDOW = 60


class RateLimiter:
    def __init__(self):
        self._requests: dict[str, list[float]] = {}

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def check_rate_limit(self, request: Request) -> bool:
        client_ip = self._get_client_ip(request)
        current_time = time.time()

        if client_ip not in self._requests:
            self._requests[client_ip] = []

        self._requests[client_ip] = [
            req_time
            for req_time in self._requests[client_ip]
            if current_time - req_time < REQUEST_WINDOW
        ]

        if len(self._requests[client_ip]) >= MAX_REQUESTS_PER_MINUTE:
            return False

        self._requests[client_ip].append(current_time)
        return True

    async def get_remaining(self, request: Request) -> int:
        client_ip = self._get_client_ip(request)
        current_time = time.time()

        if client_ip not in self._requests:
            return MAX_REQUESTS_PER_MINUTE

        recent_requests = [
            req_time
            for req_time in self._requests[client_ip]
            if current_time - req_time < REQUEST_WINDOW
        ]

        return max(0, MAX_REQUESTS_PER_MINUTE - len(recent_requests))


rate_limiter = RateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/health":
        return await call_next(request)

    if not await rate_limiter.check_rate_limit(request):
        # Return JSONResponse directly — do NOT raise HTTPException in middleware
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Max 10 requests per minute."},
        )

    response = await call_next(request)
    remaining = await rate_limiter.get_remaining(request)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response
