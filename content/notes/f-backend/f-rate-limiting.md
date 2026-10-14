---
id: f-rate-limiting
title: API rate limiting
level: core
phase: 3
week: 36
tags: [backend, rate-limiting, api, redis]
estMinutes: 25
---

## What it is

**Rate limiting** caps how many requests a client may make in a time window, for example "100 requests per minute per user".
Extra requests get **`429 Too Many Requests`** with a `Retry-After` header.
It protects your servers from overload, abuse (password guessing, scraping) and one heavy user hurting everyone else.

## Real-life example

A ration shop gives each card holder at most 5 kg of rice per week. The register tracks how much each card took. Come back for more and you are told "next week" (429 + Retry-After). Everyone gets a fair share, and the shop does not run out on day one.

## Picture

```text
 token bucket (capacity 3, refills 1 token per second)

 t=0.0  [●●●]  request → take one → [●●○]  200
 t=0.1  [●●○]  request → [●○○]  200
 t=0.2  [●○○]  request → [○○○]  200
 t=0.3  [○○○]  request → empty  429 Too Many Requests, Retry-After: 1
 t=1.3  [●○○]  (1 token refilled) request → 200
```

## How it works inside

**Algorithms**
- **Fixed window**: count requests per calendar minute. Simple (one counter), but allows bursts at the edges (100 at 0:59 and 100 at 1:00).
- **Sliding window log**: keep timestamps of recent requests; count those in the last 60 s. Exact, but uses memory per request.
- **Sliding window counter**: blend the current and previous window counts. A good, cheap approximation.
- **Token bucket**: a bucket fills at a steady rate up to a capacity; each request takes a token. Allows short bursts, keeps a steady average. Very common.
- **Leaky bucket**: requests leave at a fixed rate, like water from a hole. Smooths traffic.

**Where**
- At an **API gateway** or load balancer (Nginx, cloud gateways), or in your app as middleware.
- With many app servers, the counters must be **shared**: usually **Redis** (`INCR` + `EXPIRE` for fixed windows, or a small Lua script for a token bucket).
- **Key** by user id or API key when logged in; by IP otherwise (careful: many users can share one IP behind a mobile network).

**Good manners**: return 429 with `Retry-After`, and headers like `X-RateLimit-Remaining`. Clients should back off and retry later.

## Python, step by step

A token bucket with a fake clock (so the example is exact):

```python
class TokenBucket:
    def __init__(self, capacity, refill_per_sec, clock):
        self.capacity, self.rate, self.clock = capacity, refill_per_sec, clock
        self.tokens = capacity
        self.last = clock()

    def allow(self):
        now = self.clock()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)   # refill
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False

now = [0.0]
bucket = TokenBucket(capacity=3, refill_per_sec=1, clock=lambda: now[0])
results = []
for t in [0.0, 0.1, 0.2, 0.3, 1.3, 1.4]:
    now[0] = t
    results.append((t, bucket.allow()))
print(results)
```

```output
[(0.0, True), (0.1, True), (0.2, True), (0.3, False), (1.3, True), (1.4, False)]
```

A sliding window log:

```python
from collections import deque

class SlidingWindow:
    def __init__(self, limit, window_sec):
        self.limit, self.window = limit, window_sec
        self.times = deque()

    def allow(self, now):
        while self.times and self.times[0] <= now - self.window:   # forget old requests
            self.times.popleft()
        if len(self.times) < self.limit:
            self.times.append(now)
            return True
        return False

w = SlidingWindow(limit=2, window_sec=10)
print([w.allow(t) for t in [0, 1, 2, 10, 11, 12]])
```

```output
[True, True, False, True, True, False]
```

Rate limiting in FastAPI, returning 429 with Retry-After:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

app = FastAPI()
now = [0.0]                                 # a fake clock for this example
buckets = {}                                # client -> [tokens, last_time]
CAPACITY, RATE = 3, 1.0                     # 3 requests burst, 1 per second after

@app.middleware("http")
async def rate_limit(request: Request, call_next):
    key = request.headers.get("x-api-key", request.client.host)
    tokens, last = buckets.get(key, [CAPACITY, now[0]])
    tokens = min(CAPACITY, tokens + (now[0] - last) * RATE)
    if tokens < 1:
        buckets[key] = [tokens, now[0]]
        return JSONResponse({"detail": "too many requests"}, status_code=429, headers={"Retry-After": "1"})
    buckets[key] = [tokens - 1, now[0]]
    return await call_next(request)

@app.get("/menu")
def menu():
    return {"items": ["dosa", "idli"]}

client = TestClient(app)
codes = [client.get("/menu", headers={"x-api-key": "ravi"}).status_code for _ in range(4)]
print(codes, client.get("/menu", headers={"x-api-key": "asha"}).status_code)   # Asha has her own bucket
r = client.get("/menu", headers={"x-api-key": "ravi"})
print(r.status_code, r.headers["retry-after"])
now[0] = 1.0                                # one second later
print(client.get("/menu", headers={"x-api-key": "ravi"}).status_code)
```

```output
[200, 200, 200, 429] 200
429 1
200
```

> **Same thing in ASP.NET Core** (.NET 7+): `builder.Services.AddRateLimiter(o => o.AddTokenBucketLimiter("api", ...))`, `app.UseRateLimiter()`, and `.RequireRateLimiting("api")` on endpoints.

## Time and space

| Algorithm | Time per request | Memory per client |
| --- | --- | --- |
| Fixed window | O(1) | one counter |
| Sliding window log | O(1) amortized | one timestamp per recent request |
| Token bucket | O(1) | two numbers |

## Common mistakes

- Counting in each server's memory when you run several servers (each allows the full limit).
- Limiting only by IP (blocks whole offices) or only by user (unlimited before login: login brute force).
- No `Retry-After`, so clients retry at once and make it worse.
- Forgetting to rate-limit expensive endpoints (login, OTP, AI calls) more strictly.

## Patterns that use it

The URL shortener project, system design ("design a rate limiter" is a classic), AI APIs (limit tokens per user), and security (login and OTP attempts).

## Practice

```practice
Add the token bucket middleware to your billing API, keyed by the logged-in user.
Implement a fixed-window limiter with Redis INCR and EXPIRE (run Redis in Docker).
Write a client that respects Retry-After and backs off.
Pick limits for: login, OTP send, product list, AI summary endpoint. Explain each choice.
```

## Explain it back

```explain
Explain the token bucket with the ration shop example.
Why does a fixed window allow bursts at the edges?
Why do several servers need a shared store like Redis for rate limits?
What should a 429 response contain?
```

## Flashcards

```flashcards
Status code for rate limited? :: 429 Too Many Requests (with Retry-After).
Token bucket? :: Tokens refill at a steady rate up to a cap; each request takes one.
Fixed window weakness? :: Bursts at window edges.
Sliding window log? :: Keep recent timestamps; count those inside the window.
Many servers? :: Keep counters in a shared store such as Redis.
Rate-limit key? :: User id or API key when known; IP otherwise.
```
