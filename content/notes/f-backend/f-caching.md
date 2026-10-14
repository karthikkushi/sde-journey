---
id: f-caching
title: Caching (and Redis basics)
level: core
phase: 3
week: 36
tags: [backend, caching, redis, performance]
estMinutes: 30
---

## What it is

A **cache** keeps a copy of data somewhere **faster** (memory) so you do not ask the slow source (database, another API) every time.
The hard parts are deciding **how long** a copy stays valid (TTL) and **when to throw it away** (invalidation).
**Redis** is an in-memory key-value store that most backends use as a shared cache.

## Real-life example

The shopkeeper writes today's top 20 prices on a small board at the counter. Most customers read the board (fast). Only for rare items does he open the big register (slow). When a price changes, he must also fix the board, or customers see an old price.

## Picture

```text
 cache-aside (the most common pattern)

   app ──1. get("price:rice")──▶ cache ──hit──▶ return it (fast, ~1 ms)
     │                             │
     │                          miss
     ▼                             
   2. read from the database (slow, ~20 ms)
   3. put it in the cache with a TTL (e.g. 60 s)
   4. return it

 on update: write to the database, then DELETE the cache key
```

## How it works inside

**Where caches live**: browser cache → CDN → app memory (`lru_cache`) → shared cache (Redis) → database's own cache.

**Patterns**
- **Cache-aside** (lazy): read the cache; on a miss, load from the DB and fill the cache. Simple and common.
- **Write-through**: every write goes to the cache and the DB together.
- **Write-back**: write to the cache now, to the DB later (fast, but risky if the cache dies).

**Freshness**
- **TTL**: each entry expires after some seconds. Short TTL = fresher, more DB load.
- **Invalidation**: on an update, delete (or update) the cache key. Deleting is safer than updating (avoids races between two writers).

**When the cache is full**: an **eviction policy** removes something, usually **LRU** (least recently used).

**Problems to know**
- **Stale data**: users see old values until TTL or invalidation.
- **Cache stampede**: a hot key expires and 1,000 requests hit the DB at once. Fixes: a lock so only one request reloads, or refreshing a little early.
- **Cold start**: an empty cache after a restart sends all traffic to the DB.

**Redis** keeps data in RAM, does about 100k operations a second on one node, supports TTLs (`SET key value EX 60`), counters (`INCR`, used for rate limiting), lists, sets and sorted sets (leaderboards).

## Python, step by step

`lru_cache` in one line (a cache inside one process):

```python
from functools import lru_cache

calls = 0

@lru_cache(maxsize=128)
def price_from_db(item):
    global calls
    calls += 1                     # pretend this is a slow database query
    return {"rice": 320, "dal": 160}.get(item)

for item in ["rice", "dal", "rice", "rice", "dal"]:
    price_from_db(item)
print(calls, price_from_db.cache_info())
```

```output
2 CacheInfo(hits=3, misses=2, maxsize=128, currsize=2)
```

Cache-aside with a TTL and invalidation (a fake clock, so we can jump forward in time):

```python
class TTLCache:
    def __init__(self, ttl, clock):
        self.ttl, self.clock, self.data = ttl, clock, {}

    def get(self, key):
        hit = self.data.get(key)
        if hit and hit[1] > self.clock():
            return hit[0]
        self.data.pop(key, None)              # missing or expired
        return None

    def set(self, key, value):
        self.data[key] = (value, self.clock() + self.ttl)

    def delete(self, key):
        self.data.pop(key, None)

now = [0]                                     # seconds; we move it by hand
cache = TTLCache(ttl=60, clock=lambda: now[0])
db = {"rice": 320}
log = []

def get_price(item):                          # cache-aside
    value = cache.get(item)
    if value is not None:
        log.append("hit")
        return value
    log.append("miss")
    value = db[item]                          # the slow source of truth
    cache.set(item, value)
    return value

def update_price(item, price):
    db[item] = price
    cache.delete(item)                        # invalidate, or readers see the old price

get_price("rice")
get_price("rice")
now[0] = 61                                   # a minute later: the entry has expired
get_price("rice")
update_price("rice", 330)
print(get_price("rice"), log)
```

```output
330 ['miss', 'hit', 'miss', 'miss']
```

The same with Redis (needs a running Redis server, so it is not run here):

```python norun
import json
import redis

r = redis.Redis(host="localhost", port=6379)

def get_product(product_id, db):
    key = f"product:{product_id}"
    cached = r.get(key)
    if cached:
        return json.loads(cached)                       # hit
    product = db.load_product(product_id)               # miss: go to the database
    r.set(key, json.dumps(product), ex=60)              # keep for 60 seconds
    return product
```

> **Same thing in ASP.NET Core**: `IMemoryCache` for one server (`cache.GetOrCreate(key, e => { e.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60); ... })`), and `IDistributedCache` with the Redis package for many servers.

## Time and space

| Read from | Rough time |
| --- | --- |
| Process memory (`lru_cache`) | under 1 microsecond |
| Redis on the same network | ~0.5–1 ms |
| Database query (indexed) | ~1–20 ms |
| Another service over the internet | 50–500 ms |

Space: the cache holds copies, so it is limited; eviction (LRU) decides what goes.

## Common mistakes

- Caching without a plan for invalidation ("why does the app show the old price?").
- Caching personal data under a shared key (user A sees user B's cart). Put the user id in the key.
- Very long TTLs on data that changes often.
- Treating the cache as the source of truth (it can be emptied at any time).
- Caching everything: cache **hot, expensive, rarely-changing** data.

## Patterns that use it

System design (caching layers, CDN), the URL shortener project (hot links in Redis), rate limiting (Redis counters), and LeetCode's LRU cache design problem.

## Practice

```practice
Add cache-aside to one endpoint of your billing API and measure the time with and without it.
Install Redis with Docker (docker run -p 6379:6379 redis) and try SET with EX, GET, INCR and TTL in redis-cli.
Design cache keys for: a product page, a user's cart, the top 10 products today.
lru-cache
```

## Explain it back

```explain
Explain cache-aside with the price board example.
Why delete the cache key on update instead of updating it?
What is a cache stampede, and how can you prevent it?
What kind of data should you cache, and what should you not?
```

## Flashcards

```flashcards
Cache-aside steps? :: Read cache; on miss read DB, store in cache with TTL, return.
TTL? :: Time to live: when a cached entry expires.
On update? :: Write the DB, then delete the cache key (invalidate).
Common eviction policy? :: LRU (least recently used).
Cache stampede? :: A hot key expires and many requests hit the DB at once.
Redis set with expiry? :: SET key value EX 60
```
