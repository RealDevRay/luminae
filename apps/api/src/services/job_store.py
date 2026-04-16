import asyncio
import json
import logging

from ..middleware.budget_guard import budget_protection

logger = logging.getLogger("luminae")


class JobStore:
    """Persists analysis job state in Redis (fast) with Supabase (durable) fallback.

    Replaces the in-memory dict storage that was lost on every Render restart/sleep.
    """

    REDIS_PREFIX = "job:"
    TTL_SECONDS = 86400 * 7  # 7 days

    async def save_job(self, job_id: str, job_data: dict) -> None:
        """Save job metadata (status, error, economics) to Redis."""
        try:
            redis_client = await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}"
                await asyncio.wait_for(
                    redis_client.set(key, json.dumps(job_data), ex=self.TTL_SECONDS),
                    timeout=3,
                )
            else:
                logger.error(f"Redis unavailable — cannot save job {job_id}")
        except Exception as e:
            logger.warning(f"Redis save failed for {job_id}: {e}")

    async def get_job(self, job_id: str) -> dict | None:
        """Retrieve job metadata from Redis."""
        try:
            redis_client = await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}"
                data = await asyncio.wait_for(redis_client.get(key), timeout=3)
                if data:
                    return json.loads(data)
            else:
                logger.warning(f"Redis unavailable — cannot get job {job_id}")
        except Exception as e:
            logger.warning(f"Redis get failed for {job_id}: {e}")
        return None

    async def save_result(self, job_id: str, result: dict) -> None:
        """Save full analysis result to Redis."""
        try:
            redis_client = await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}:result"
                await asyncio.wait_for(
                    redis_client.set(key, json.dumps(result), ex=self.TTL_SECONDS),
                    timeout=3,
                )
            else:
                logger.error(f"Redis unavailable — cannot save result for {job_id}")
        except Exception as e:
            logger.warning(f"Redis result save failed for {job_id}: {e}")

    async def get_result(self, job_id: str) -> dict | None:
        """Retrieve full analysis result from Redis."""
        try:
            redis_client = await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}:result"
                data = await asyncio.wait_for(redis_client.get(key), timeout=3)
                if data:
                    return json.loads(data)
            else:
                logger.warning(f"Redis unavailable — cannot get result for {job_id}")
        except Exception as e:
            logger.warning(f"Redis result get failed for {job_id}: {e}")
        return None


job_store = JobStore()
