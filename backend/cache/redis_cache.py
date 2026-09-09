"""
Redis caching for price data
"""
import os
import json
import redis
from typing import Optional, Dict, Any
import asyncio
from functools import wraps

# Redis client
_redis_client = None

def get_redis_client():
    """Get Redis client (singleton)"""
    global _redis_client
    if _redis_client is None:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        try:
            _redis_client = redis.from_url(redis_url, decode_responses=True)
            _redis_client.ping()
            print("✅ Redis connected successfully")
        except Exception as e:
            print(f"⚠️ Redis connection failed: {e}")
            _redis_client = None
    return _redis_client

async def get_cache(key: str) -> Optional[Dict]:
    """Get cached data"""
    client = get_redis_client()
    if not client:
        return None
    
    try:
        data = client.get(key)
        if data:
            return json.loads(data)
    except:
        pass
    return None

async def set_cache(key: str, value: Dict, ttl: int = 21600) -> bool:
    """Set cached data with TTL (default: 6 hours)"""
    client = get_redis_client()
    if not client:
        return False
    
    try:
        client.setex(key, ttl, json.dumps(value))
        return True
    except:
        return False

async def delete_cache(key: str) -> bool:
    """Delete cached data"""
    client = get_redis_client()
    if not client:
        return False
    
    try:
        client.delete(key)
        return True
    except:
        return False

def cache_result(ttl: int = 21600):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_parts = [func.__name__]
            for arg in args:
                if isinstance(arg, str):
                    key_parts.append(arg.lower())
            for k, v in kwargs.items():
                if isinstance(v, str):
                    key_parts.append(f"{k}:{v.lower()}")
            
            cache_key = f"cache:{':'.join(key_parts)}"
            
            # Try cache
            cached = await get_cache(cache_key)
            if cached:
                return cached
            
            # Call function
            result = await func(*args, **kwargs)
            
            # Cache result
            if result and result.get("success"):
                await set_cache(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator