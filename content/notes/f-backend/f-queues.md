---
id: f-queues
title: Message queues and background jobs
level: core
phase: 3
week: 37
tags: [backend, queues, async, background-jobs, reliability]
estMinutes: 30
---

## What it is

Some work should not happen while the user waits: sending emails, making PDFs, resizing photos, calling slow partners.
The web request puts a **job** (a small message) on a **queue** and returns at once. A separate **worker** takes jobs from the queue and does them.
Queues also smooth out traffic spikes and let services talk without being online at the same moment.

## Real-life example

A busy restaurant. The waiter writes your order on a slip and pins it on the kitchen rail (queue), then serves the next table. Cooks (workers) take slips from the rail one by one. If the kitchen is busy, slips wait on the rail instead of the waiter standing in the kitchen.

## Picture

```text
  web app (producer)                 queue                     worker (consumer)
  POST /orders ──▶ save order ──▶ [job: email 101] [job: sms 102] ──▶ take a job, do it, ack
       │                                                                   │
       └── returns 201 in 50 ms                                  fails? retry with backoff
                                                                 fails 5 times? → dead letter queue
```

## How it works inside

- **Producer** puts messages; **consumer/worker** takes them; the **broker** stores them (RabbitMQ, AWS SQS, Redis with RQ/Celery, Kafka).
- **Acknowledge (ack)**: the worker tells the broker "done" only **after** the work succeeds. If it crashes before acking, the message is delivered again.
- So delivery is usually **at-least-once**: a job can run **twice**. Workers must be **idempotent**: running the same job twice has the same effect as once (keep a record of processed message ids).
- **Retries with exponential backoff**: wait 1 s, 2 s, 4 s, 8 s... between tries, so a struggling service can recover. Add a little random "jitter".
- **Dead letter queue (DLQ)**: after too many failures, park the message for a human to inspect instead of retrying forever.
- **Queue vs stream**: a queue hands each message to one worker and forgets it (jobs). A **stream/log** like Kafka keeps messages in order for a while, and many consumers can read them independently (events, analytics).
- **Outbox pattern**: save "send email for order 101" in the same database transaction as the order, then a background process publishes it. No lost or phantom messages.

## Python, step by step

A worker thread taking jobs from a queue:

```python
import queue
import threading

jobs = queue.Queue()
done = []

def worker():
    while True:
        job = jobs.get()
        if job is None:                   # a "stop" signal
            break
        done.append(f"sent email to {job}")
        jobs.task_done()                  # the "ack"

t = threading.Thread(target=worker)
t.start()
for user in ["ravi", "asha", "john"]:
    jobs.put(user)                        # the web request only puts a job and returns quickly
jobs.join()                               # (demo only) wait until every job is acked
jobs.put(None)
t.join()
print(done)
```

```output
['sent email to ravi', 'sent email to asha', 'sent email to john']
```

Retries with exponential backoff, a dead letter queue, and an idempotent consumer:

```python
def process_with_retries(job, handler, max_attempts=4, base_delay=1.0):
    waits = []
    for attempt in range(1, max_attempts + 1):
        try:
            return handler(job), waits
        except ConnectionError:
            if attempt == max_attempts:
                raise
            waits.append(base_delay * 2 ** (attempt - 1))   # 1, 2, 4 ... (a real worker sleeps this long)

tries = {"count": 0}
def flaky_sms(job):                       # fails twice, then works
    tries["count"] += 1
    if tries["count"] < 3:
        raise ConnectionError("SMS gateway timeout")
    return f"sent {job}"

print(process_with_retries("otp:ravi", flaky_sms))

dead_letters = []
def gateway_down(job):
    raise ConnectionError("down")
try:
    process_with_retries("otp:asha", gateway_down)
except ConnectionError:
    dead_letters.append("otp:asha")       # park it for a human
print(dead_letters)

processed, balance = set(), {"ravi": 0}
def handle_payment(event):                # idempotent: the same event twice changes nothing
    if event["id"] in processed:
        return "duplicate, skipped"
    balance["ravi"] += event["amount"]
    processed.add(event["id"])
    return "applied"

for e in [{"id": "pay-1", "amount": 100}, {"id": "pay-1", "amount": 100}, {"id": "pay-2", "amount": 50}]:
    print(handle_payment(e))
print(balance)
```

```output
('sent otp:ravi', [1.0, 2.0])
['otp:asha']
applied
duplicate, skipped
applied
{'ravi': 150}
```

FastAPI's built-in background tasks (good for small jobs; use a real queue for important ones):

```python
from fastapi import BackgroundTasks, FastAPI
from fastapi.testclient import TestClient

sent = []

def send_receipt(email, order_id):
    sent.append(f"receipt for order {order_id} to {email}")

app = FastAPI()

@app.post("/orders/{order_id}")
def place_order(order_id: int, background: BackgroundTasks):
    background.add_task(send_receipt, "ravi@example.com", order_id)   # runs after the response is sent
    return {"order": order_id, "status": "placed"}

client = TestClient(app)
print(client.post("/orders/101").json())
print(sent)
```

```output
{'order': 101, 'status': 'placed'}
['receipt for order 101 to ravi@example.com']
```

> **Same thing in .NET**: `BackgroundService` / `IHostedService` for workers, `Channel<T>` as an in-process queue, and libraries like Hangfire or MassTransit (with RabbitMQ or Azure Service Bus) for durable queues.

## Time and space

| Approach | User waits for | If the worker crashes |
| --- | --- | --- |
| Do the work in the request | the whole job | the user sees an error |
| In-process background task | nothing | the job is lost |
| Durable queue + worker | nothing | the job is delivered again |

## Common mistakes

- Doing slow work inside the request (timeouts, unhappy users).
- Assuming exactly-once delivery: making workers that double-charge on a retry.
- Retrying forever with no backoff (hammering a service that is already down).
- No dead letter queue, so poison messages block the queue.
- Putting huge payloads in messages: put an id, and let the worker load the data.

## Patterns that use it

System design (notification system, video processing, order pipelines), the serious project (emails, AI calls), and the outbox pattern.

## Practice

```practice
In your billing API, move "send receipt email" into a background task, and make the task idempotent.
Add jitter to the backoff: wait base * 2**attempt plus a random 0–1 second.
Draw the flow for "user uploads a photo, we make a thumbnail" with a queue and a worker.
Run Redis with Docker and try RQ or Celery with one simple job.
```

## Explain it back

```explain
Why put a job on a queue instead of doing it inside the request?
What does at-least-once delivery mean, and why must workers be idempotent?
Explain exponential backoff and a dead letter queue.
How is a queue different from a stream like Kafka?
```

## Flashcards

```flashcards
Why queues? :: Do slow work later, smooth spikes, decouple services.
Ack? :: The worker confirms success; unacked messages are delivered again.
At-least-once means? :: A job may run more than once, so workers must be idempotent.
Exponential backoff? :: Wait 1, 2, 4, 8... seconds between retries (plus jitter).
Dead letter queue? :: Where messages go after too many failures, for inspection.
Outbox pattern? :: Save the message in the same DB transaction as the data; publish it later.
```
