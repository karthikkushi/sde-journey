---
id: f-resilience
title: "Resilience: timeouts, retries, circuit breakers, feature flags"
level: core
phase: 3
week: 37
tags: [backend, resilience, retries, circuit-breaker, feature-flags]
estMinutes: 30
---

## What it is

Every network call can be slow or fail. **Resilience** is how your service stays useful anyway:
**timeouts** (never wait forever), **retries with backoff and jitter** (try again, politely), **circuit breakers** (stop calling a dependency that is down), **health checks**, and **feature flags and canary releases** (turn new code on slowly, turn it off fast).

## Real-life example

You call a restaurant to order. If nobody picks up in 30 seconds you hang up (timeout). You try again after a minute, not every second (backoff). After five failed calls you stop calling for an hour and order from another place (circuit breaker). Calling 500 times in a minute does not help anybody.

## Picture

```text
 circuit breaker states

   CLOSED ── too many failures ──► OPEN ── wait 30 s ──► HALF-OPEN
     ▲      (calls go through)    (fail fast,            (let ONE call try)
     │                             no calls)                │       │
     └──────────── it worked ◄──────────────────────────────┘       │
                   it failed again ──► back to OPEN ◄───────────────┘
```

## How it works inside

- **Timeouts** on every outgoing call: connect timeout plus read timeout. A slow dependency without a timeout ties up your threads until your service falls over too.
- **Retries** only for safe operations (reads, or writes with an idempotency key), only for temporary errors (timeouts, 503, 429), and with **exponential backoff plus random jitter**, so thousands of clients do not retry at the same instant. Cap the attempts.
- **Circuit breaker**: count recent failures; above a threshold, fail fast for a while, then let one test call through.
- **Bulkheads**: separate pools per dependency, so one slow service cannot use every thread.
- **Health checks**: `/health/live` (process is up) and `/health/ready` (can serve: database reachable). Load balancers and Kubernetes use them.
- **Feature flags**: new code ships switched off, then turns on for 1%, 10%, 100% of users. **Canary releases** do the same with a few servers. If errors rise, switch it off without a deploy.

## Python, step by step

Retries with exponential backoff and jitter (a fake sleep keeps the example fast and exact):

```python
import random

random.seed(7)
waits = []

def call_with_retries(fn, attempts=4, base=0.2):
    for attempt in range(attempts):
        try:
            return fn()
        except TimeoutError:
            if attempt == attempts - 1:
                raise
            delay = random.uniform(0, base * 2 ** attempt)   # "full jitter"
            waits.append(round(delay, 3))

calls = {"n": 0}
def flaky():
    calls["n"] += 1
    if calls["n"] < 3:
        raise TimeoutError("slow upstream")
    return "200 OK"

print(call_with_retries(flaky), "after", calls["n"], "calls")
print("waited", waits)
```

```output
200 OK after 3 calls
waited [0.065, 0.06]
```

A small circuit breaker:

```python
class CircuitBreaker:
    def __init__(self, threshold, cooldown):
        self.threshold, self.cooldown = threshold, cooldown
        self.failures, self.opened_at = 0, None

    def call(self, fn, now):
        if self.opened_at is not None:
            if now - self.opened_at < self.cooldown:
                return "fail fast"                    # OPEN: do not even try
            self.opened_at = None                     # HALF-OPEN: one test call
        try:
            result = fn()
            self.failures = 0
            return result
        except ConnectionError:
            self.failures += 1
            if self.failures >= self.threshold:
                self.opened_at = now
            return "error"

def down():
    raise ConnectionError()

breaker = CircuitBreaker(threshold=3, cooldown=30)
print([breaker.call(down, t) for t in (0, 1, 2, 3, 10)])
print(breaker.call(lambda: "ok", 40))
```

```output
['error', 'error', 'error', 'fail fast', 'fail fast']
ok
```

> **Same thing in .NET**: Polly (and `Microsoft.Extensions.Http.Resilience`) gives retries, timeouts and circuit breakers for `HttpClient`; `AddHealthChecks()` maps health endpoints.

## Time and space

| Tool | What it saves |
| --- | --- |
| Timeout | your threads, when a dependency hangs |
| Backoff + jitter | the dependency, from a retry storm |
| Circuit breaker | wasted calls while a dependency is down |
| Feature flag | a deploy, when new code misbehaves |

## Common mistakes

- No timeout on HTTP or database calls.
- Retrying a payment without an idempotency key.
- Retrying immediately in a tight loop with no jitter.
- A readiness check that always says "ready".

## Patterns that use it

Payment calls, webhook delivery, LLM API calls, any service-to-service call. Pair it with idempotency keys and dead-letter queues.

## Practice

```practice
Add connect and read timeouts to every outgoing call in your project
Wrap one external call with retries, backoff and jitter, and prove it in a test
Add live and ready health endpoints, and make ready fail when the database is down
Put one new feature behind a flag and turn it on for 10% of requests
```

## Explain it back

```explain
Why does a missing timeout spread an outage to your own service?
Why add random jitter to backoff?
What does a circuit breaker do while it is open?
```

## Flashcards

```flashcards
When is a retry safe? :: For reads, or writes with an idempotency key, on temporary errors only.
What is jitter? :: A random part of the retry delay, so clients do not retry at the same moment.
What are a circuit breaker's three states? :: Closed (calls go through), open (fail fast), half-open (one test call).
Live vs ready health check? :: Live = the process runs; ready = it can serve (dependencies reachable).
What is a canary release? :: New code goes to a few servers or users first, and widens only if errors stay low.
```
