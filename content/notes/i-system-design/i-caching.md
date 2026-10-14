---
id: i-caching
title: Caching layers (system design view)
level: advanced
phase: 2
week: 20
tags: [system-design, caching, performance]
estMinutes: 25
---

## What it is

In a large system, caches sit at **many layers**: the browser, the CDN, the API gateway, the app, a shared cache like Redis, and the database's own memory.
Each layer saves a trip to a slower one. The design questions are **what** to cache, **where**, for **how long**, and how to keep it **correct**.
(Patterns like cache-aside and TTL in code: see the backend note "Caching".)

## Real-life example

A train ticket enquiry: the station board shows today's timings (CDN), the clerk remembers the common questions (app cache), and only unusual questions go to the central reservation system (database). Most people never reach the central system.

## Picture

```text
 browser cache ─▶ CDN edge ─▶ API gateway ─▶ app (in-process) ─▶ Redis ─▶ database buffer pool ─▶ disk
   ~0 ms            ~10 ms       ~1 ms          ~0.001 ms          ~1 ms       ~0.1 ms               ~5 ms

 hit rate 90%:  only 1 in 10 requests reaches the database
```

## How it works inside

- **What to cache**: data that is read often, expensive to compute, and changes rarely (product pages, user profiles, rendered feeds, config). Avoid caching data that must always be exact (account balances) unless you design for it.
- **Hit rate** is everything: average latency ≈ hit × cache time + miss × source time; database load falls by the hit rate.
- **Writes**: cache-aside + invalidate on write (most common), write-through (consistent, slower writes), write-back (fast, risky).
- **Consistency**: accept short staleness with TTLs, or invalidate precisely (delete keys on update; publish an event so every app server drops its local copy).
- **Stampede protection**: when a hot key expires, let **one** request reload it (single-flight / a lock) while others wait or get the old value.
- **Sizing**: memory for the hot working set (often 20% of items get 80% of reads). Evict with LRU.
- **Failure**: the system must survive a cold or empty cache (warm it up, or limit traffic to the database).

## Python, step by step

How a hit rate changes latency and database load:

```python
def effective(hit_rate, cache_ms=1, db_ms=20, requests_per_sec=10_000):
    avg_ms = hit_rate * cache_ms + (1 - hit_rate) * db_ms
    db_rps = round((1 - hit_rate) * requests_per_sec)
    return round(avg_ms, 2), db_rps

for hr in (0.0, 0.5, 0.9, 0.99):
    print(f"hit rate {hr:.0%}: avg {effective(hr)[0]} ms, database gets {effective(hr)[1]} rps")
```

```output
hit rate 0%: avg 20.0 ms, database gets 10000 rps
hit rate 50%: avg 10.5 ms, database gets 5000 rps
hit rate 90%: avg 2.9 ms, database gets 1000 rps
hit rate 99%: avg 1.19 ms, database gets 100 rps
```

Cache stampede: 10 requests miss the same hot key at once. Single-flight lets only one load it:

```python
import threading

def run(single_flight):
    cache, db_calls = {}, [0]
    load_lock = threading.Lock()
    all_missed = threading.Barrier(10)

    def load_from_db():
        db_calls[0] += 1
        return "trending products"

    def get(key):
        if key in cache:
            return cache[key]
        all_missed.wait()                       # make all 10 miss at the same moment
        if not single_flight:
            cache[key] = load_from_db()
            return cache[key]
        with load_lock:                         # only one thread loads...
            if key not in cache:                # ...the others find it already loaded
                cache[key] = load_from_db()
            return cache[key]

    threads = [threading.Thread(target=get, args=("home",)) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    return db_calls[0]

print("without single-flight:", run(False), "database calls")
print("with single-flight:", run(True), "database call")
```

```output
without single-flight: 10 database calls
with single-flight: 1 database call
```

## Time and space

See the picture for latencies. Space: the cache needs the **hot** set, not everything. A cache that holds 20% of items can often serve 80%+ of reads.

## Common mistakes

- Caching without measuring the hit rate.
- No invalidation plan: users see stale prices or permissions.
- Per-server in-memory caches that disagree with each other after an update.
- Stampedes on hot keys after a deploy or expiry.
- Caching user-specific data under shared keys.

## Patterns that use it

CDN, read-heavy designs (news feed, URL shortener, product pages), rate limiting (counters in Redis), and LRU cache design.

## Practice

```practice
For a cricket score app during a big match: what would you cache, where, and for how long?
Your DB can take 2,000 rps; traffic is 30,000 rps. What hit rate do you need?
Explain one way to keep 10 app servers' in-memory caches consistent after an update.
```

## Explain it back

```explain
Name the caching layers from the browser to the disk.
Why does the hit rate matter so much? Use the numbers above.
What is a cache stampede, and how does single-flight prevent it?
What data should not be cached (or needs special care)?
```

## Flashcards

```flashcards
Average latency with a cache? :: hit × cache time + miss × source time.
DB load with hit rate h? :: (1 − h) × total requests.
Single-flight? :: Only one request reloads a missing key; others wait for it.
Most common write strategy? :: Cache-aside + invalidate on write.
What to cache? :: Read often, expensive, rarely changing data.
Hot set? :: The small share of items that gets most reads.
```
