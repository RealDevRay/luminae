import time

from fastapi import Request
from fastapi.responses import JSONResponse


class RateLimiter:
    def __init__(self):
        self._requests: dict[str, list[float]] = {}

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def check_rate_limit(self, request: Request, max_reqs: int, window: int) -> bool:
        client_ip = self._get_client_ip(request)
        current_time = time.time()

        if client_ip not in self._requests:
            self._requests[client_ip] = []

        self._requests[client_ip] = [
            req_time for req_time in self._requests[client_ip] if current_time - req_time < window
        ]

        if len(self._requests[client_ip]) >= max_reqs:
            return False

        self._requests[client_ip].append(current_time)
        return True

    async def get_remaining(self, request: Request, max_reqs: int, window: int) -> int:
        client_ip = self._get_client_ip(request)
        current_time = time.time()

        if client_ip not in self._requests:
            return max_reqs

        recent_requests = [
            req_time for req_time in self._requests[client_ip] if current_time - req_time < window
        ]

        return max(0, max_reqs - len(recent_requests))


rate_limiter = RateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    # Exempt health, status polling, and budget from rate limiting
    path = request.url.path
    if path == "/health" or "/status/" in path or path.endswith("/budget"):
        return await call_next(request)

    # Determine if user is authenticated
    auth_header = request.headers.get("Authorization", "")
    is_authenticated = auth_header.startswith("Bearer ") and len(auth_header) > 10

    if is_authenticated:
        max_reqs = 60
        window = 60
    else:
        max_reqs = 5
        window = 3600  # 1 hour

    if not await rate_limiter.check_rate_limit(request, max_reqs, window):
        # Return JSONResponse directly — do NOT raise HTTPException in middleware
        return JSONResponse(
            status_code=429,
            content={
                "detail": "Rate limit exceeded. "
                + (
                    "Max 60 requests per minute."
                    if is_authenticated
                    else "Guests are limited to 5 requests per hour. Please log in."
                )
            },
        )

    response = await call_next(request)
    remaining = await rate_limiter.get_remaining(request, max_reqs, window)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    return response
