import redis.asyncio as redis
import asyncio
from typing import Optional
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


class BudgetProtection:
    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def get_redis(self) -> redis.Redis:
        if self._redis is None:
            self._redis = redis.from_url(
                settings.upstash_redis_rest_url,
                password=settings.upstash_redis_rest_token,
                decode_responses=True,
            )
        return self._redis

    def estimate_cost(
        self, model: str, input_text: str, max_tokens: int
    ) -> float:
        input_tokens = len(input_text) // 4
        pricing = MODEL_PRICING.get(model, {"input": 0.001, "output": 0.001})

        input_cost = (input_tokens / 1000) * pricing["input"]
        output_cost = (max_tokens / 1000) * pricing["output"]

        return round(input_cost + output_cost, 4)

    async def check_request_budget(self, estimated_cost: float) -> bool:
        if estimated_cost > settings.max_request_usd:
            return False
        return True

    async def get_remaining_budget(self) -> float:
        try:
            redis_client = await self.get_redis()
            remaining = await redis_client.get("global:remaining_budget")
            if remaining is None:
                await redis_client.set(
                    "global:remaining_budget", str(settings.mistral_budget_usd)
                )
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
            redis_client = await self.get_redis()
            await redis_client.decrbyfloat("global:remaining_budget", amount)
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
            redis_client = await self.get_redis()
            log_key = f"usage:{paper_id}:{endpoint}:{model}"
            await redis_client.hset(log_key, mapping={
                "paper_id": paper_id,
                "endpoint": endpoint,
                "model": model,
                "input_tokens": str(input_tokens),
                "output_tokens": str(output_tokens),
                "estimated_cost": str(estimated_cost),
                "actual_cost": str(actual_cost),
                "timestamp": str(redis_client.time()[0]),
            })
            await redis_client.expire(log_key, 86400 * 7)
            
            from ..utils.supabase_client import supabase
            if supabase:
                try:
                    await asyncio.to_thread(
                        lambda: supabase.table("usage_logs").insert({
                            "paper_id": paper_id,
                            "endpoint": endpoint,
                            "model": model,
                            "input_tokens": input_tokens,
                            "output_tokens": output_tokens,
                            "estimated_cost": estimated_cost,
                            "actual_cost": actual_cost
                        }).execute()
                    )
                except Exception as e:
                    print("Failed saving usage log to supabase", e)

        except Exception:
            pass


budget_protection = BudgetProtection()
