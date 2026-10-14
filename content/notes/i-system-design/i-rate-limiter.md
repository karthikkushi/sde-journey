---
id: i-rate-limiter
title: Design a rate limiter
level: advanced
phase: 3
week: 36
tags: [system-design, rate-limiting, redis, api]
estMinutes: 30
---

## What it is

A classic system design question: **limit how many requests each client can make** (per user, per API key, per IP) across a whole fleet of servers.
It protects services from abuse and overload, and enforces plan limits (free: 100 requests/minute; paid: 10,000).
(Algorithms in code and a FastAPI middleware: see the backend note "API rate limiting".)

## Real-life example

A metro station during rush hour: gates let a fixed number of people onto the platform per minute. The rule must hold at every gate together, not separately at each gate, or the platform still overflows.

## Picture

```text
 client ─▶ API gateway / middleware ──check──▶ Redis (shared counters, ~1 ms)
                  │  allowed?                     key: rl:{api_key}:{window}
                  ├── yes ─▶ app servers
                  └── no  ─▶ 429 Too Many Requests  (Retry-After, X-RateLimit-Remaining)

 fixed window: 100 at 0:59 + 100 at 1:00 = 200 in two seconds (edge burst)
 sliding window counter: counts the overlap of the previous window → smooth
```

## How it works inside

**Requirements to clarify**: limit by what key (user, API key, IP)? Which limits (per second/minute/day)? Hard limit or soft (allow small bursts)? Single region or global? What do blocked clients see?

**Algorithm choice**
- **Token bucket**: allows short bursts, steady average; two numbers per key. Common in APIs.
- **Fixed window counter**: `INCR` + `EXPIRE`; simplest, but bursts at window edges.
- **Sliding window log**: exact, but stores every timestamp (memory heavy).
- **Sliding window counter**: estimate = previous window × overlap + current window. Cheap and smooth. A good default answer.

**Distributed design**
- Counters live in a fast shared store (**Redis**), sharded by key. Each request does one round trip.
- **Atomicity**: read-and-increment must be atomic (`INCR`, or a small Lua script for token bucket), or two servers both allow the last slot.
- **Placement**: at the API gateway (protects everything) and/or in services (finer rules).
- **Failure mode**: if Redis is down, **fail open** (allow, protect availability) or **fail closed** (block, protect the backend). Decide and say why.
- **Multi-region**: per-region limits (simple, slightly over the global limit), or periodic syncing.
- **Performance**: keep it under ~1 ms; local in-memory pre-checks can reduce Redis calls for very hot keys.

## Python, step by step

Fixed window vs sliding window counter for a burst at the edge of a minute:

```python
LIMIT = 100                                              # requests per 60 seconds

def fixed_window_allowed(times):
    counts, allowed = {}, 0
    for t in times:
        w = int(t // 60)
        if counts.get(w, 0) < LIMIT:
            counts[w] = counts.get(w, 0) + 1
            allowed += 1
    return allowed

def sliding_counter_allowed(times):
    counts, allowed = {}, 0
    for t in times:
        w = int(t // 60)
        overlap = (60 - t % 60) / 60                     # share of the previous window still "inside"
        estimate = counts.get(w - 1, 0) * overlap + counts.get(w, 0)
        if estimate < LIMIT:
            counts[w] = counts.get(w, 0) + 1
            allowed += 1
    return allowed

burst = [59 + i / 100 for i in range(100)] + [60 + i / 100 for i in range(100)]   # 200 requests in 2 seconds
print("fixed window allowed:", fixed_window_allowed(burst))
print("sliding window counter allowed:", sliding_counter_allowed(burst))
```

```output
fixed window allowed: 200
sliding window counter allowed: 102
```

The Redis version used in production (needs a Redis server, so not run here):

```python norun
import time
import redis

r = redis.Redis()

def allow(api_key, limit=100, window=60):
    now = time.time()
    current = int(now // window)
    pipe = r.pipeline()
    pipe.incr(f"rl:{api_key}:{current}")                  # atomic increment for this window
    pipe.expire(f"rl:{api_key}:{current}", window * 2)
    pipe.get(f"rl:{api_key}:{current - 1}")
    count, _, previous = pipe.execute()
    overlap = (window - now % window) / window
    return (int(previous or 0) * overlap + count) <= limit
```

## Time and space

| Algorithm | Memory per key | Accuracy |
| --- | --- | --- |
| Token bucket | 2 numbers | allows defined bursts |
| Fixed window | 1 counter | edge bursts up to 2× |
| Sliding window log | 1 timestamp per request | exact |
| Sliding window counter | 2 counters | very close, cheap |

At 1 million active keys × ~100 bytes ≈ 100 MB in Redis: fine.

## Common mistakes

- Counting per server instead of globally.
- Non-atomic read-then-write in Redis (two servers both allow).
- No decision on fail-open vs fail-closed.
- Forgetting `Retry-After` and documenting limits for clients.
- Limiting only by IP (many users share mobile carrier IPs).

## Patterns that use it

API gateways, login and OTP protection, AI APIs (tokens per minute), the URL shortener design, and security (brute force).

## Practice

```practice
Design the rate limiter for a public weather API with free and paid plans. Write the requirements, algorithm, storage and failure behaviour.
Change the burst in the example so requests arrive evenly over 2 minutes. How many does each method allow?
Explain why the Redis increment must be atomic, with an example of two servers.
```

## Explain it back

```explain
Which questions would you ask before designing a rate limiter?
Why does the fixed window allow 2x the limit at window edges?
How does the sliding window counter estimate the rate?
Fail open or fail closed when Redis is down: which would you choose for a login endpoint, and why?
```

## Flashcards

```flashcards
Where to keep counters across servers? :: A shared fast store like Redis.
Fixed window weakness? :: Edge bursts (up to 2× the limit).
Sliding window counter formula? :: previous × overlap + current.
Why atomic increments? :: Otherwise two servers can both allow the last slot.
Fail open vs fail closed? :: Allow traffic when the limiter is down vs block it.
Response when limited? :: 429 with Retry-After.
```
