import asyncio
import json
import logging
from collections import OrderedDict

from ..middleware.budget_guard import budget_protection

logger = logging.getLogger("luminae")


class _MemoryCache:
    """Simple bounded LRU cache so in-memory fallback doesn't leak."""

    def __init__(self, max_size: int = 200):
        self._store: OrderedDict[str, str] = OrderedDict()
        self._max = max_size

    def set(self, key: str, value: str) -> None:
        if key in self._store:
            self._store.move_to_end(key)
        self._store[key] = value
        while len(self._store) > self._max:
            self._store.popitem(last=False)

    def get(self, key: str) -> str | None:
        val = self._store.get(key)
        if val is not None:
            self._store.move_to_end(key)
        return val


class JobStore:
    """Persists analysis job state in Redis (fast) with in-memory fallback.

    If Redis is unavailable jobs are kept in a bounded in-memory cache so
    the analysis flow still works (results survive until the process restarts).
    """

    REDIS_PREFIX = "job:"
    TTL_SECONDS = 86400 * 7  # 7 days

    def __init__(self) -> None:
        self._mem = _MemoryCache(max_size=200)

    async def _get_redis(self):
        """Return Redis client or None (never raises)."""
        try:
            return await asyncio.wait_for(budget_protection.get_redis(), timeout=3)
        except Exception:
            return None

    async def save_job(self, job_id: str, job_data: dict) -> None:
        """Save job metadata to Redis, falling back to memory."""
        payload = json.dumps(job_data)
        saved_to_redis = False
        try:
            redis_client = await self._get_redis()
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}"
                await asyncio.wait_for(
                    redis_client.set(key, payload, ex=self.TTL_SECONDS),
                    timeout=3,
                )
                saved_to_redis = True
        except Exception as e:
            logger.warning(f"Redis save failed for {job_id}: {e}")

        if not saved_to_redis:
            logger.warning(f"Using in-memory fallback for job {job_id}")
            self._mem.set(f"{self.REDIS_PREFIX}{job_id}", payload)

    async def get_job(self, job_id: str) -> dict | None:
        """Retrieve job metadata from Redis, falling back to memory."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}"
                data = await asyncio.wait_for(redis_client.get(key), timeout=3)
                if data:
                    return json.loads(data)
        except Exception as e:
            logger.warning(f"Redis get failed for {job_id}: {e}")

        # In-memory fallback
        mem_data = self._mem.get(f"{self.REDIS_PREFIX}{job_id}")
        if mem_data:
            return json.loads(mem_data)

        return None

    async def save_result(self, job_id: str, result: dict) -> None:
        """Save full analysis result to Redis, falling back to memory."""
        payload = json.dumps(result)
        saved_to_redis = False
        try:
            redis_client = await self._get_redis()
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}:result"
                await asyncio.wait_for(
                    redis_client.set(key, payload, ex=self.TTL_SECONDS),
                    timeout=3,
                )
                saved_to_redis = True
        except Exception as e:
            logger.warning(f"Redis result save failed for {job_id}: {e}")

        if not saved_to_redis:
            logger.warning(f"Using in-memory fallback for result {job_id}")
            self._mem.set(f"{self.REDIS_PREFIX}{job_id}:result", payload)

    async def get_result(self, job_id: str) -> dict | None:
        """Retrieve full analysis result from Redis, falling back to memory."""
        try:
            redis_client = await self._get_redis()
            if redis_client:
                key = f"{self.REDIS_PREFIX}{job_id}:result"
                data = await asyncio.wait_for(redis_client.get(key), timeout=3)
                if data:
                    return json.loads(data)
        except Exception as e:
            logger.warning(f"Redis result get failed for {job_id}: {e}")

        # In-memory fallback
        mem_data = self._mem.get(f"{self.REDIS_PREFIX}{job_id}:result")
        if mem_data:
            return json.loads(mem_data)

        return None


job_store = JobStore()
