---
id: e-postgres-production
title: "Postgres in production: upserts, JSONB, job queues, pooling"
level: core
phase: 3
week: 36
tags: [sql, postgres, upsert, jsonb, connection-pooling]
estMinutes: 30
---

## What it is

Five Postgres tools that real backends use every day:
**upserts** (`INSERT ... ON CONFLICT`), **JSONB** columns, **partial indexes**, **`FOR UPDATE SKIP LOCKED`** job queues, and **connection pooling** (PgBouncer).
Plus one habit: **expand and contract** migrations, so you change the schema without downtime.

## Real-life example

A kirana shop's stock register. When a delivery arrives, the owner either adds a new line for a new product or increases the count on the existing line: that is an upsert. Three helpers packing orders each take the next unclaimed order slip and skip slips someone else already holds: that is `SKIP LOCKED`.

## Picture

```text
 jobs table                 worker A                  worker B
 ┌────┬─────────┐
 │ 1  │ pending │◄── SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1   (A locks 1)
 │ 2  │ pending │◄──────────────────────────────────── same query (skips 1, takes 2)
 │ 3  │ pending │
 └────┴─────────┘          no two workers ever get the same job
```

## How it works inside

- **Upsert**: `INSERT INTO stock(sku, qty) VALUES ('atta', 5) ON CONFLICT (sku) DO UPDATE SET qty = stock.qty + EXCLUDED.qty;` needs a unique index on `sku`. One statement, no race between "check" and "insert".
- **JSONB**: stores JSON in a binary form you can index (`GIN` index) and query (`data->>'city'`). Good for flexible attributes; keep core fields in real columns.
- **Partial index**: `CREATE INDEX ON jobs(created_at) WHERE status = 'pending';` is small and fast because it only covers the rows you query.
- **SKIP LOCKED queue**: each worker runs `SELECT ... FOR UPDATE SKIP LOCKED LIMIT 1` inside a transaction, does the work, marks it done and commits. A crash rolls back, so the job becomes available again.
- **Pooling**: each Postgres connection is a process using memory. Hundreds of app instances × 20 connections each overloads it. PgBouncer keeps a small pool of real connections and shares them.
- **Expand and contract**: to rename a column, (1) add the new column, (2) write to both, (3) backfill, (4) read from the new one, (5) drop the old one later. Every step is safe while old code still runs.

## Python, step by step

SQLite uses the same upsert syntax as Postgres, so we can run it here:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE stock (sku TEXT PRIMARY KEY, qty INTEGER NOT NULL)")

def receive(sku, qty):
    db.execute("""INSERT INTO stock (sku, qty) VALUES (?, ?)
                  ON CONFLICT (sku) DO UPDATE SET qty = stock.qty + excluded.qty""", (sku, qty))

receive("atta", 5)
receive("dal", 3)
receive("atta", 2)              # existing row: add to it
print(db.execute("SELECT sku, qty FROM stock ORDER BY sku").fetchall())
```

```output
[('atta', 7), ('dal', 3)]
```

The job-queue query in Postgres (needs a real Postgres server, so it does not run here):

```sql norun
BEGIN;
SELECT id, payload FROM jobs
WHERE status = 'pending'
ORDER BY created_at
FOR UPDATE SKIP LOCKED
LIMIT 1;
-- do the work in the app, then:
UPDATE jobs SET status = 'done' WHERE id = $1;
COMMIT;
```

The same idea simulated in Python: two workers never take the same job.

```python
jobs = {1: "pending", 2: "pending", 3: "pending"}
locked = set()

def claim(worker):
    for job_id, status in sorted(jobs.items()):
        if status == "pending" and job_id not in locked:   # SKIP LOCKED
            locked.add(job_id)
            return f"{worker} took job {job_id}"
    return f"{worker} found nothing"

print(claim("A"))
print(claim("B"))
print(claim("C"))
print(claim("D"))
```

```output
A took job 1
B took job 2
C took job 3
D found nothing
```

> **Same thing in .NET**: EF Core supports raw SQL for `SKIP LOCKED`, Npgsql pools connections by default, and EF Core migrations should follow expand and contract too.

## Time and space

| Tool | Why it is fast |
| --- | --- |
| Upsert | one round trip, one index lookup |
| Partial index | indexes only the rows you query |
| SKIP LOCKED | workers never wait on each other's rows |
| PgBouncer | a few real connections shared by many clients |

## Common mistakes

- "SELECT, then INSERT if missing": two requests race and one fails or duplicates.
- Putting everything in JSONB, then needing joins and constraints on it.
- Renaming a column in one migration while old app servers still use the old name.
- Opening a new connection per request without a pool.

## Patterns that use it

Background jobs, outbox tables, inventory counts, flash-sale stock, webhook delivery queues.

## Practice

```practice
Turn one "select then insert" in your project into a single upsert
Build a jobs table with a SKIP LOCKED worker and run two workers at once
Add a partial index for your most common status filter and compare EXPLAIN output
Plan a column rename as five expand-and-contract steps
```

## Explain it back

```explain
Why is an upsert safer than select-then-insert?
What happens to a SKIP LOCKED job when the worker crashes mid-way?
Why does Postgres need a connection pool?
```

## Flashcards

```flashcards
What does ON CONFLICT DO UPDATE need? :: A unique index or constraint on the conflict column.
What does SKIP LOCKED do? :: Skips rows another transaction has locked, so workers never take the same job.
What is a partial index? :: An index with a WHERE clause, covering only the rows you query.
Why PgBouncer? :: Postgres connections are heavy; a pool shares a few among many clients.
What is expand and contract? :: Add new, write both, backfill, switch reads, drop old: schema changes with no downtime.
```
