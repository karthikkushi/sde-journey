---
id: f-logging
title: Logging and monitoring
level: core
phase: 3
week: 34
tags: [backend, logging, monitoring, observability]
estMinutes: 30
---

## What it is

Once your app is live, you cannot attach a debugger to it. You learn what it is doing from three signals:
**logs** (what happened, line by line), **metrics** (numbers over time: requests per second, error rate, latency), and **traces** (the path of one request through many services).
Together these are called **observability**. **Alerts** wake someone up when the numbers look bad.

## Real-life example

A train journey. The guard's diary is the **log** ("12:05 left Mysuru, 12:40 signal delay"). The dashboard in the control room is **metrics** (trains on time today: 92%). Tracking one passenger's ticket through every station is a **trace**. The alarm when a train is 30 minutes late is an **alert**.

## Picture

```text
 request id req-7f3 travels with the request, so you can find all its log lines:

 [api]      INFO  req-7f3  POST /orders  user=ravi
 [api]      INFO  req-7f3  order 101 saved  ms=12
 [payments] ERROR req-7f3  gateway timeout  ms=3000
 [api]      ERROR req-7f3  checkout failed  status=502

 metrics (one number per minute):   p95 latency ▁▁▂▁▁▇█▇▁▁   error rate ▁▁▁▁▅▇▅▁▁▁
```

## How it works inside

**Logs**
- **Levels**: `DEBUG` (details for developers), `INFO` (normal events), `WARNING` (something odd), `ERROR` (a failure), `CRITICAL`. In production you usually log INFO and above.
- **Structured logs** (JSON) are easy to search: `{"level": "ERROR", "request_id": "req-7f3", "order_id": 101}`.
- A **request id** (correlation id) added to every line lets you follow one request across services.
- Never log passwords, tokens, full card numbers or personal data you do not need.

**Metrics**
- Counters (requests, errors), gauges (queue length, memory), histograms (latency).
- Watch **percentiles**, not averages: p50 (typical), **p95**/p99 (the slow tail). An average of 54 ms can hide 1 in 100 users waiting 2 seconds.
- The "four golden signals": **latency, traffic, errors, saturation**.

**Traces**: each service adds a "span" with timing to the same trace id; a tool (Jaeger, Grafana Tempo, Datadog) draws the timeline. OpenTelemetry is the common standard.

**Alerts**: alert on what users feel (error rate above 2% for 5 minutes, p95 above 1 s), not on every small blip. Too many alerts and people ignore them.

## Python, step by step

Log levels with Python's `logging` module:

```python
import io
import logging

stream = io.StringIO()                        # (in a real app this is the console or a file)
handler = logging.StreamHandler(stream)
handler.setFormatter(logging.Formatter("%(levelname)s %(name)s: %(message)s"))
log = logging.getLogger("shop")
log.addHandler(handler)
log.setLevel(logging.INFO)                    # DEBUG lines are hidden at INFO level

log.debug("cart contents: %s", ["rice"])
log.info("order %s placed", 101)
log.warning("stock low for %s", "dal")
log.error("could not reach the payment gateway")
print(stream.getvalue().strip())
```

```output
INFO shop: order 101 placed
WARNING shop: stock low for dal
ERROR shop: could not reach the payment gateway
```

Structured (JSON) logs with extra fields:

```python
import io
import json
import logging

class JsonFormatter(logging.Formatter):
    def format(self, record):
        data = {"level": record.levelname, "msg": record.getMessage()}
        data.update(getattr(record, "fields", {}))      # our extra fields
        return json.dumps(data)

stream = io.StringIO()
handler = logging.StreamHandler(stream)
handler.setFormatter(JsonFormatter())
log = logging.getLogger("api")
log.addHandler(handler)
log.setLevel(logging.INFO)

log.info("order placed", extra={"fields": {"request_id": "req-7f3", "order_id": 101, "ms": 42}})
print(stream.getvalue().strip())
```

```output
{"level": "INFO", "msg": "order placed", "request_id": "req-7f3", "order_id": 101, "ms": 42}
```

Why percentiles beat averages:

```python
import math

def percentile(values, p):                    # nearest-rank method
    ordered = sorted(values)
    return ordered[math.ceil(p / 100 * len(ordered)) - 1]

latencies_ms = [20] * 80 + [40] * 15 + [300] * 4 + [2000]    # 100 requests
print("average:", sum(latencies_ms) / len(latencies_ms))
print("p50:", percentile(latencies_ms, 50), "p95:", percentile(latencies_ms, 95), "p99:", percentile(latencies_ms, 99), "max:", max(latencies_ms))
```

```output
average: 54.0
p50: 20 p95: 40 p99: 300 max: 2000
```

A request id on every response (FastAPI middleware):

```python
import uuid
from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

app = FastAPI()
seen = []

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:8]   # reuse the caller's id if given
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    seen.append((request.url.path, response.status_code, request_id))       # a log line in real life
    return response

@app.get("/health")
def health():
    return {"ok": True}

client = TestClient(app)
r = client.get("/health", headers={"X-Request-ID": "req-7f3"})
print(r.json(), r.headers["X-Request-ID"], seen)
```

```output
{'ok': True} req-7f3 [('/health', 200, 'req-7f3')]
```

> **Same thing in ASP.NET Core**: `ILogger<T>` with message templates (`_log.LogInformation("Order {OrderId} placed", id)`) gives structured logs; Serilog writes them as JSON; OpenTelemetry .NET adds metrics and traces.

## Time and space

Logging costs a little time per line and a lot of storage over time. Keep DEBUG off in production, sample very noisy logs, and set retention (for example 30 days).

## Common mistakes

- `print()` instead of a logger (no levels, no timestamps, no structure).
- Logging secrets or personal data.
- Watching only the average latency.
- Logging an error without the request id or the useful ids (order id, user id).
- Alerts on everything, so real problems get ignored.

## Patterns that use it

Every deployed project (the serious project needs a dashboard: users, latency, error rate), system design ("how would you monitor this?"), and incident debugging.

## Practice

```practice
Add JSON logging with a request id to your FastAPI project.
Log the time each request takes, then compute p50 and p95 from a day of logs.
Write 3 alerts for your billing API that a user would actually feel.
Find 3 places in your code where an error is caught but not logged.
```

## Explain it back

```explain
What are logs, metrics and traces? Give one example of each.
Why is p95 latency more useful than the average?
Why should every log line carry a request id?
What should never be written to logs?
```

## Flashcards

```flashcards
Three signals of observability? :: Logs, metrics, traces.
Log levels? :: DEBUG, INFO, WARNING, ERROR, CRITICAL.
Why structured (JSON) logs? :: Easy to search and filter by field.
Request (correlation) id? :: An id carried through a request so you can find all its log lines.
Why p95 over average? :: The average hides the slow tail that some users feel.
Four golden signals? :: Latency, traffic, errors, saturation.
```
