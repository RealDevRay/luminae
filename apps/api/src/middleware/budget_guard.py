import asyncio
import contextvars

import redis.asyncio as redis

from ..config import get_settings

settings = get_settings()

MODEL_PRICING = {
    "mistral-ocr-latest": {"input": 0.001, "output": 0.001},
    "ministral-3b-2512": {"input": 0.0001, "output": 0.0001},
    "ministral-8b-2512": {"input": 0.0002, "output": 0.0002},
    "magistral-medium-latest": {"input": 0.002, "output": 0.006},
    "mistral-large-latest": {"input": 0.002, "output": 0.006},
}

CIRCUIT_BREAKER_THRESHOLD = settings.circuit_breaker_threshold
DEMO_MODE_BUDGET_THRESHOLD = 2.00


# Context variables to track tokens and cost per-request
current_job_tokens = contextvars.ContextVar("current_job_tokens", default=0)
current_job_cost = contextvars.ContextVar("current_job_cost", default=0.0)


class BudgetProtection:
    def __init__(self):
        self._redis: redis.Redis | None = None

    async def get_redis(self) -> redis.Redis:
        if self._redis is None:
            try:
                url = settings.upstash_redis_rest_url
                token = settings.upstash_redis_rest_token

                # Embed password into URL if not already present
                if token and "@" not in url:
                    # Convert redis://host:port → redis://default:PASSWORD@host:port
                    url = url.replace("redis://", f"redis://default:{token}@", 1)
                    url = url.replace("rediss://", f"rediss://default:{token}@", 1)

                use_ssl = url.startswith("rediss://")
                self._redis = redis.from_url(
                    url,
                    decode_responses=True,
                    socket_connect_timeout=3,
                    socket_timeout=3,
                    ssl=use_ssl,
                )
            except Exception:
                return None
        return self._redis

    def estimate_cost(self, model: str, input_text: str, max_tokens: int) -> float:
        input_tokens = len(input_text) // 4
        pricing = MODEL_PRICING.get(model, {"input": 0.001, "output": 0.001})

        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (max_tokens / 1000) * pricing["output"]

        return round(input_cost + output_cost, 4)

    def calculate_actual_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        pricing = MODEL_PRICING.get(model, {"input": 0.001, "output": 0.001})
        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (output_tokens / 1000) * pricing["output"]
        return round(input_cost + output_cost, 4)

    async def check_request_budget(self, estimated_cost: float) -> bool:
        if estimated_cost > settings.max_request_usd:
            return False
        return True

    async def get_remaining_budget(self) -> float:
        try:
            redis_client = await asyncio.wait_for(self.get_redis(), timeout=3)
            if redis_client is None:
                return settings.mistral_budget_usd
            remaining = await asyncio.wait_for(
                redis_client.get("global:remaining_budget"), timeout=3
            )
            if remaining is None:
                await redis_client.set("global:remaining_budget", str(settings.mistral_budget_usd))
                return settings.mistral_budget_usd
            return float(remaining)
        except Exception:
            return settings.mistral_budget_usd

    async def check_global_budget(self) -> bool:
        remaining = await self.get_remaining_budget()
        if remaining < DEMO_MODE_BUDGET_THRESHOLD:
            return False
        return True

    async def deduct_budget(self, amount: float) -> None:
        try:
            redis_client = await asyncio.wait_for(self.get_redis(), timeout=3)
            if redis_client:
                await asyncio.wait_for(
                    redis_client.decrbyfloat("global:remaining_budget", amount),
                    timeout=3,
                )
        except Exception:
            pass

    async def log_usage(
        self,
        paper_id: str,
        endpoint: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        estimated_cost: float,
        actual_cost: float,
    ) -> None:
        try:
            redis_client = await asyncio.wait_for(self.get_redis(), timeout=3)
            if redis_client is None:
                return
            log_key = f"usage:{paper_id}:{endpoint}:{model}"
            await redis_client.hset(
                log_key,
                mapping={
                    "paper_id": paper_id,
                    "endpoint": endpoint,
                    "model": model,
                    "input_tokens": str(input_tokens),
                    "output_tokens": str(output_tokens),
                    "estimated_cost": str(estimated_cost),
                    "actual_cost": str(actual_cost),
                },
            )
            await redis_client.expire(log_key, 86400 * 7)

            from ..utils.supabase_client import supabase

            if supabase:
                try:
                    await asyncio.to_thread(
                        lambda: (
                            supabase.table("usage_logs")
                            .insert(
                                {
                                    "paper_id": paper_id,
                                    "endpoint": endpoint,
                                    "model": model,
                                    "input_tokens": input_tokens,
                                    "output_tokens": output_tokens,
                                    "estimated_cost": estimated_cost,
                                    "actual_cost": actual_cost,
                                }
                            )
                            .execute()
                        )
                    )
                except Exception as e:
                    print("Failed saving usage log to supabase", e)

        except Exception:
            pass


budget_protection = BudgetProtection()
