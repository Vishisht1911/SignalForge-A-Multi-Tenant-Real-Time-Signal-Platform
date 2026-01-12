import redis
import json
from ..config import settings
from app.services.redis_client import redis_client
from typing import Optional

def get_redis():
    return redis.from_url(settings.REDIS_URL)

def get_cached_signal(tenant_id: int, symbol: str, timeframe: str) -> Optional[dict]:
    r = get_redis()
    key = f"signal:latest:{tenant_id}:{symbol}:{timeframe}"
    cached = r.get(key)
    return json.loads(cached) if cached else None

def cache_signal(tenant_id: int, symbol: str, timeframe: str, signal: dict):
    r = get_redis()
    key = f"signal:latest:{tenant_id}:{symbol}:{timeframe}"
    r.set(key, json.dumps(signal))

def invalidate_signal_cache(tenant_id: int, symbol: str, timeframe: str):
    r = get_redis()
    key = f"signal:latest:{tenant_id}:{symbol}:{timeframe}"
    r.delete(key)


def get_cached_signal(tenant_id, symbol, timeframe):
    key = f"signal:{tenant_id}:{symbol}:{timeframe}"
    return redis_client.get(key)