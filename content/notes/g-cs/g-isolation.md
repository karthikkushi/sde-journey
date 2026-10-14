---
id: g-isolation
title: Isolation levels and concurrent transactions
level: core
phase: 3
week: 36
tags: [cs, database, transactions, isolation, mvcc]
estMinutes: 30
---

## What it is

When many transactions run at the same time, they can see each other's changes in surprising ways (**read anomalies**).
**Isolation levels** say how much a database protects you: from *Read Uncommitted* (little) to *Serializable* (as if transactions ran one at a time).
Stronger isolation is safer but slower (more waiting or more retries).

## Real-life example

Two cashiers sell from the same stock register. If each reads "10 bags of rice", sells some, and writes their own new total, one sale disappears (a **lost update**). A strict rule like "only one cashier may hold the register at a time" fixes it, but customers wait longer.

## Picture

```text
 anomaly               what goes wrong                                  stopped from level...
 dirty read            you read another transaction's UNCOMMITTED data   Read Committed
 non-repeatable read   you read a row twice and get different values      Repeatable Read
 phantom read          you run a query twice and get new rows             Serializable (and many RR impls)
 lost update           two read-modify-writes, one overwrites the other   locks / atomic updates / versions
 write skew            two transactions each check a rule, both write,    Serializable
                       together they break the rule (both doctors go off-call)
```

## How it works inside

**The four standard levels** (weakest to strongest): Read Uncommitted, **Read Committed** (PostgreSQL's and SQL Server's default), **Repeatable Read** (MySQL InnoDB's default), **Serializable**.

**How databases implement them**
- **Locks**: readers and writers take shared/exclusive locks on rows; others wait. Simple, but can block and deadlock.
- **MVCC** (multi-version concurrency control, used by PostgreSQL, MySQL, Oracle): writers create **new versions** of rows; each transaction reads a consistent **snapshot**. Readers never block writers.
- **Serializable** is done with strict locking or by detecting dangerous patterns and aborting one transaction (PostgreSQL's SSI). Your code must then **retry**.

**Practical tools for the lost update**
- An **atomic update**: `UPDATE stock SET qty = qty - 3 WHERE ...` (the database does read+write as one step).
- **Pessimistic locking**: `SELECT ... FOR UPDATE` locks the row until your transaction ends.
- **Optimistic locking**: a `version` column; update only `WHERE version = :seen`; if 0 rows changed, someone else won: re-read and retry. Great when conflicts are rare (web apps).

## Python, step by step

A lost update, then two fixes (SQLite, one connection playing two cashiers):

```python
import sqlite3

db = sqlite3.connect(":memory:", isolation_level=None)
db.execute("CREATE TABLE stock (item TEXT PRIMARY KEY, qty INTEGER, version INTEGER)")
db.execute("INSERT INTO stock VALUES ('rice', 10, 1)")

def read():
    return db.execute("SELECT qty, version FROM stock WHERE item = 'rice'").fetchone()

# The problem: both cashiers read 10, then each writes their own result
qty_a, _ = read()
qty_b, _ = read()
db.execute("UPDATE stock SET qty = ? WHERE item = 'rice'", (qty_a - 3,))    # A sold 3
db.execute("UPDATE stock SET qty = ? WHERE item = 'rice'", (qty_b - 4,))    # B sold 4, overwrote A
print("lost update: qty =", read()[0], "(should be 3)")

# Fix 1: let the database do read-and-write in one step
db.execute("UPDATE stock SET qty = 10, version = 1")
db.execute("UPDATE stock SET qty = qty - 3 WHERE item = 'rice'")
db.execute("UPDATE stock SET qty = qty - 4 WHERE item = 'rice'")
print("atomic updates: qty =", read()[0])

# Fix 2: optimistic locking with a version number
db.execute("UPDATE stock SET qty = 10, version = 1")

def sell(n, seen_qty, seen_version):
    cur = db.execute(
        "UPDATE stock SET qty = ?, version = version + 1 WHERE item = 'rice' AND version = ?",
        (seen_qty - n, seen_version),
    )
    return cur.rowcount == 1                  # 0 rows: someone changed it after we read

a, b = read(), read()
print("A:", sell(3, *a), "B:", sell(4, *b))   # B's version is old: rejected
b = read()                                    # B re-reads and retries
print("B retry:", sell(4, *b), "qty =", read()[0])
```

```output
lost update: qty = 6 (should be 3)
atomic updates: qty = 3
A: True B: False
B retry: True qty = 3
```

PostgreSQL commands for the other tools (not run here):

```sql norun
BEGIN ISOLATION LEVEL SERIALIZABLE;                  -- strongest; be ready to retry on error 40001
SELECT qty FROM stock WHERE item = 'rice' FOR UPDATE; -- pessimistic: lock the row until COMMIT
UPDATE stock SET qty = qty - 3 WHERE item = 'rice';
COMMIT;
```

## Time and space

| Approach | Cost |
| --- | --- |
| Read Committed + atomic updates | cheap; fine for most web apps |
| SELECT ... FOR UPDATE | other writers to that row wait |
| Optimistic locking | no waiting; retries on conflict |
| Serializable | most correct; more aborts and retries under load |

MVCC keeps old row versions until no transaction needs them (PostgreSQL's VACUUM cleans them up).

## Common mistakes

- Read-modify-write in application code without a lock, version or atomic update.
- Assuming the default level is Serializable (it rarely is).
- Using Serializable without retry logic.
- Holding row locks while calling slow external services.

## Patterns that use it

Stock and booking systems (no overselling), payments, the kirana billing API ("reduce stock in one transaction"), and system design questions like "two users book the last seat".

## Practice

```practice
Rewrite the billing API's "reduce stock" code three ways: atomic UPDATE, SELECT ... FOR UPDATE, and a version column. When would you use each?
Explain write skew with the two doctors example, and why Repeatable Read does not stop it.
In PostgreSQL (Docker), open two psql sessions and reproduce a non-repeatable read at Read Committed.
```

## Explain it back

```explain
Explain a lost update with the two cashiers example.
What is a dirty read, and which level prevents it?
How does MVCC let readers avoid blocking writers?
When is optimistic locking better than SELECT ... FOR UPDATE?
```

## Flashcards

```flashcards
Four isolation levels? :: Read Uncommitted, Read Committed, Repeatable Read, Serializable.
Dirty read? :: Reading another transaction's uncommitted data.
Non-repeatable read? :: The same row read twice gives different values.
Phantom read? :: The same query returns new rows the second time.
MVCC? :: Writers make new row versions; readers see a consistent snapshot.
Optimistic locking? :: Update WHERE version = seen; 0 rows means retry.
```
