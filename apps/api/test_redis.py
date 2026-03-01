"""Test Redis with TLS/SSL since TCP is open but plain redis:// hangs."""
import asyncio
import redis.asyncio as aioredis

HOST = "redis-10744.crce198.eu-central-1-3.ec2.cloud.redislabs.com"
PORT = 10744
PASSWORD = "eFylfbm9jSEASxB9nP5JdJ3i74hInEo0"

async def test():
    # Test 1: rediss:// (TLS) with password in URL
    print("Test 1: rediss:// (TLS) with auth in URL...")
    try:
        url = f"rediss://default:{PASSWORD}@{HOST}:{PORT}"
        client = aioredis.from_url(url, decode_responses=True, socket_connect_timeout=5, socket_timeout=5)
        pong = await asyncio.wait_for(client.ping(), timeout=5)
        print(f"  PING: {pong} ✅")
        budget = await client.get("global:remaining_budget")
        print(f"  Budget: {budget}")
        await client.close()
        return
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")

    # Test 2: redis:// with ssl=True
    print("\nTest 2: redis:// with ssl=True param...")
    try:
        url = f"redis://default:{PASSWORD}@{HOST}:{PORT}"
        client = aioredis.from_url(url, decode_responses=True, socket_connect_timeout=5, socket_timeout=5, ssl=True)
        pong = await asyncio.wait_for(client.ping(), timeout=5)
        print(f"  PING: {pong} ✅")
        await client.close()
        return
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")

    # Test 3: Direct Redis() constructor
    print("\nTest 3: Direct Redis() constructor with SSL...")
    try:
        client = aioredis.Redis(host=HOST, port=PORT, password=PASSWORD, ssl=True, decode_responses=True, socket_connect_timeout=5, socket_timeout=5)
        pong = await asyncio.wait_for(client.ping(), timeout=5)
        print(f"  PING: {pong} ✅")
        await client.close()
        return
    except Exception as e:
        print(f"  FAILED: {type(e).__name__}: {e}")

asyncio.run(test())
