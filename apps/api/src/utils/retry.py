import asyncio
import random
import logging
from typing import Any, Callable

logger = logging.getLogger("luminae.retry")


async def retry_with_backoff(
    fn: Callable[..., Any],
    *args,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    retryable_exceptions: tuple = (Exception,),
    **kwargs,
) -> Any:
    """
    Retry an async function with exponential backoff and jitter.

    Args:
        fn: The async function to call.
        max_retries: Maximum number of retry attempts.
        base_delay: Initial delay in seconds.
        max_delay: Maximum delay cap in seconds.
        retryable_exceptions: Tuple of exception types that trigger a retry.
    """
    last_exception = None

    for attempt in range(max_retries + 1):
        try:
            return await fn(*args, **kwargs)
        except retryable_exceptions as e:
            last_exception = e
            if attempt == max_retries:
                break

            # Exponential backoff with full jitter
            delay = min(base_delay * (2 ** attempt), max_delay)
            jitter = random.uniform(0, delay)
            logger.warning(
                f"[Retry] Attempt {attempt + 1}/{max_retries} failed: {e}. "
                f"Retrying in {jitter:.1f}s..."
            )
            await asyncio.sleep(jitter)

    raise last_exception
