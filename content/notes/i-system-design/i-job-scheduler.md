---
id: i-job-scheduler
title: "System design: distributed job scheduler"
level: advanced
phase: 5
week: 51
tags: [system-design, scheduler, queues, retries]
estMinutes: 40
---

## What it is

Design a service that runs jobs later or on a schedule: "send this reminder at 9 a.m.", "retry this webhook in 5 minutes", "run the settlement report every night".
It must run each job **on time**, **at least once** (and safely if twice), **retry failures with backoff**, and keep working when a worker machine dies.

## Real-life example

A hospital ward's medicine chart. Each patient has doses at set times. Nurses on any shift pick up the next due dose, mark it given, and if a patient refuses, a retry is written for an hour later. If one nurse goes home, the chart still tells the next nurse what is due.

## Picture

```text
 API: schedule(job, run_at) ──► jobs table (run_at, status, attempts)
                                     │  index on (status, run_at)
 workers (many) every second:        ▼
   SELECT due jobs ... FOR UPDATE SKIP LOCKED LIMIT 10
   mark RUNNING with a lease (locked_until = now + 60 s)
   run ──ok──► DONE
       └─fail─► attempts+1, run_at = now + backoff ──► after max attempts: DEAD (dead-letter)
 lease expired (worker died)? another worker picks the job up again
```

## How it works inside

**Requirements**: one-off and recurring (cron) jobs, about 1 second precision, retries with backoff, a dead-letter list, visibility (status, attempts, last error).

**Storage**: a jobs table with `run_at`, `status`, `attempts`, `locked_until`, `last_error`, and an index on (status, run_at). Postgres with `SKIP LOCKED` handles a lot; at very large scale, shard by job id or use time buckets ("all jobs due this minute").

**Leases**: a worker claims a job with a lease time. If it crashes, the lease expires and another worker picks the job up. This is why delivery is **at least once**: job handlers must be **idempotent** (use the job id as an idempotency key downstream).

**Recurring jobs**: store the cron rule; after each run, compute and insert the next run time in the same transaction.

**Retries**: exponential backoff with jitter, a maximum number of attempts, then dead-letter for a human to inspect and replay.

**Hot spots**: many jobs at the same moment (midnight) means a burst; spread them with a little jitter, or partition by time bucket and worker.

## Python, step by step

Claiming due jobs, retrying with backoff, and dead-lettering after too many failures:

```python
jobs = [
    {"id": 1, "run_at": 0, "attempts": 0, "status": "PENDING", "fails_left": 0},
    {"id": 2, "run_at": 0, "attempts": 0, "status": "PENDING", "fails_left": 2},
    {"id": 3, "run_at": 5, "attempts": 0, "status": "PENDING", "fails_left": 9},
]
MAX_ATTEMPTS = 3

def tick(now):
    for job in sorted(jobs, key=lambda j: j["run_at"]):
        if job["status"] != "PENDING" or job["run_at"] > now:
            continue
        job["attempts"] += 1
        if job["fails_left"] > 0:                       # pretend the work failed
            job["fails_left"] -= 1
            if job["attempts"] >= MAX_ATTEMPTS:
                job["status"] = "DEAD"
            else:
                job["run_at"] = now + 2 ** job["attempts"]   # backoff: 2, 4, ...
        else:
            job["status"] = "DONE"

for now in range(0, 20):
    tick(now)
print([(j["id"], j["status"], j["attempts"]) for j in jobs])
```

```output
[(1, 'DONE', 1), (2, 'DONE', 3), (3, 'DEAD', 3)]
```

## Time and space

| Part | Note |
| --- | --- |
| Claim due jobs | index range scan on (status, run_at) + SKIP LOCKED |
| Leases | survive worker crashes; cause at-least-once delivery |
| Dead-letter | keeps failed jobs for inspection and replay |

## Common mistakes

- Assuming each job runs exactly once.
- A single scheduler machine with no failover.
- Retrying forever with no limit or backoff.
- Every job scheduled at exactly midnight.

## Patterns that use it

Postgres SKIP LOCKED queues, retries and backoff, idempotency keys, webhook delivery, notifications.

## Practice

```practice
Draw this design in 30 minutes and explain what happens when a worker dies mid-job
Build the jobs table and a SKIP LOCKED worker with leases in your project
Add cron-style recurring jobs that insert their next run in the same transaction
Machine coding: build a job scheduler with retries and backoff in 90 minutes
```

## Explain it back

```explain
Why does a lease make delivery "at least once"?
Why must job handlers be idempotent?
How do you stop a midnight burst from overloading workers?
```

## Flashcards

```flashcards
What is a lease? :: A time-limited claim on a job; if the worker dies, it expires and another worker takes the job.
Delivery guarantee of a lease-based scheduler? :: At least once, so handlers must be idempotent.
What happens after max attempts? :: The job moves to a dead-letter list for inspection and replay.
How are recurring jobs stored? :: A cron rule; each run inserts the next run in the same transaction.
```
