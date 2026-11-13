---
id: i-flash-sale
title: "System design: flash sale inventory"
level: advanced
phase: 5
week: 46
tags: [system-design, inventory, concurrency, redis]
estMinutes: 40
---

## What it is

Design a flash sale: 1,000 phones at a low price, 10 lakh users tapping "Buy" at 12:00 sharp.
The hard parts: **never oversell** (sell exactly 1,000), **survive the spike**, and be **fair** (no bots taking everything).
Interviewers at e-commerce and quick-commerce companies (Flipkart, Zepto, Blinkit) like this one.

## Real-life example

Tatkal train tickets at 10 a.m. Lakhs of people try at once for a few hundred seats. The system must never sell seat 23 twice, must not crash, and should not let one agent with 50 browser tabs grab every seat.

## Picture

```text
 users ──► CDN (static sale page) ──► waiting room / rate limit per user
                                         │ only a steady trickle passes
                                         ▼
                              Reserve API ── atomic decrement in Redis (DECR stock)
                                 │ success: hold for 10 minutes, create order (pending)
                                 │ stock < 0: undo, "sold out"
                                 ▼
                              queue ──► order service ──► payment
                                 hold expires unpaid → stock goes back
```

## How it works inside

**Requirements**: no overselling, holds expire if unpaid, a fast "sold out" answer, one unit per user, a fair queue.

**The atomic step**: the stock count must be changed in one atomic operation. Options:
- Postgres: `UPDATE stock SET qty = qty - 1 WHERE sku = $1 AND qty > 0` and check that one row changed.
- Postgres row locks: `SELECT ... FOR UPDATE` (simple, slower under heavy contention).
- Redis: `DECR` or a small Lua script (check and decrement together). Very fast; write the result to the database afterwards.

**Holds**: a reservation gets an expiry (10 minutes). A job (or Redis key expiry) returns stock for unpaid holds.

**Spike handling**: serve the sale page from a CDN; put a **waiting room** or token queue in front; rate-limit per user and per IP; pre-warm caches; return "sold out" from cache once stock hits zero, so the database stops getting hit.

**Fairness**: one unit per user (a unique constraint on (sale, user)), captcha or device checks against bots, and a random draw for the queue position if needed.

**Async orders**: after a successful reserve, put an "order requested" message on a queue; workers create the order and start payment.

## Python, step by step

Why a check-then-act is unsafe, and how an atomic decrement fixes it (simulated with threads and a lock):

```python
import threading

def run(buyers, atomic):
    state = {"stock": 5, "sold": 0}
    lock = threading.Lock()
    start = threading.Barrier(buyers)

    def buy():
        start.wait()                                   # everyone taps at 12:00
        if atomic:
            with lock:                                 # check and decrement as ONE step
                if state["stock"] > 0:
                    state["stock"] -= 1
                    state["sold"] += 1
        else:
            if state["stock"] > 0:                     # check ...
                threading.Event().wait(0.001)          # ... a tiny delay, like a network call ...
                state["stock"] -= 1                    # ... then act: others got in between
                state["sold"] += 1

    threads = [threading.Thread(target=buy) for _ in range(buyers)]
    for t in threads: t.start()
    for t in threads: t.join()
    return state["sold"]

print("check-then-act oversold:", run(50, atomic=False) > 5)
print("atomic sold exactly:", run(50, atomic=True))
```

```output
check-then-act oversold: True
atomic sold exactly: 5
```

## Time and space

| Option | Throughput | Notes |
| --- | --- | --- |
| Postgres conditional UPDATE | good | simple, durable |
| SELECT FOR UPDATE | lower under contention | easy to reason about |
| Redis DECR / Lua | very high | then persist orders to the database |

## Common mistakes

- Reading stock, then writing it in two steps.
- Letting every sold-out request reach the database.
- Holds that never expire, so stock is stuck.
- No per-user limit, so bots win.

## Patterns that use it

Ticket booking, coupon redemption, limited-time deals, rate limiting, queues.

## Practice

```practice
Draw this design in 30 minutes, then explain how you prevent overselling three ways
Write the conditional UPDATE and prove with two concurrent sessions that it never oversells
Design hold expiry: what returns stock when a user never pays?
Estimate the requests per second at 12:00 for 10 lakh users and size the waiting room
```

## Explain it back

```explain
Why does check-then-act oversell?
Why answer "sold out" from cache?
How do you stop one user from buying all the stock?
```

## Flashcards

```flashcards
How do you avoid overselling? :: Make check-and-decrement one atomic step (conditional UPDATE, row lock or Redis Lua).
What is a hold? :: A reservation with an expiry; unpaid holds return their stock.
How do you survive the 12:00 spike? :: CDN for the page, a waiting room, per-user rate limits, cached "sold out".
How do you keep it fair? :: One unit per user (unique constraint), bot checks, a queue.
```
