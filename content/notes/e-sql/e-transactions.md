---
id: e-transactions
title: Transactions and ACID
level: core
phase: 2
week: 22
tags: [sql, database, transactions, acid]
estMinutes: 30
---

## What it is

A **transaction** groups several changes so they happen **all together or not at all**.
You start it (`BEGIN`), make changes, then `COMMIT` (save them all) or `ROLLBACK` (undo them all).
**ACID** names the four promises a database makes about transactions.

## Real-life example

A UPI transfer of ₹200 from Ravi to Asha is two steps: take ₹200 from Ravi, add ₹200 to Asha. If the power fails between the two steps, money must not vanish or appear from nowhere. Both steps happen, or neither does.

## Picture

```text
 BEGIN
   UPDATE accounts SET balance = balance + 200 WHERE name = 'Asha';   ✓
   UPDATE accounts SET balance = balance - 200 WHERE name = 'Ravi';   ✗ fails (not enough money)
 ROLLBACK  → Asha's +200 is undone too. The database looks as if nothing happened.
```

## How it works inside

**ACID**
- **Atomicity**: all or nothing. The database keeps an **undo log** so it can reverse a half-done transaction.
- **Consistency**: rules (constraints like `balance >= 0`, foreign keys) hold before and after every transaction.
- **Isolation**: transactions running at the same time do not see each other's half-done work (how strictly depends on the **isolation level**; see the CS fundamentals note on isolation levels).
- **Durability**: once `COMMIT` returns, the change survives a crash. The database first writes it to a **write-ahead log (WAL)** on disk.

**In code**
- Most libraries start a transaction for you on the first change; you call `commit()`.
- In Python's `sqlite3`, `with conn:` commits if the block succeeds and rolls back if an error escapes it.
- Keep transactions **short**: they hold locks, and other users may wait.
- In backend code, one HTTP request often = one transaction (the ORM's "session" or "unit of work").

## Python, step by step

A money transfer that is atomic:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE accounts (name TEXT PRIMARY KEY, balance INTEGER CHECK (balance >= 0))")
db.executemany("INSERT INTO accounts VALUES (?, ?)", [("Ravi", 500), ("Asha", 100)])
db.commit()

def transfer(sender, receiver, amount):
    try:
        with db:                                   # one transaction: commit if OK, rollback on error
            db.execute("UPDATE accounts SET balance = balance + ? WHERE name = ?", (amount, receiver))
            db.execute("UPDATE accounts SET balance = balance - ? WHERE name = ?", (amount, sender))
        return "done"
    except sqlite3.IntegrityError as e:
        return f"failed: {e}"

def balances():
    return dict(db.execute("SELECT name, balance FROM accounts ORDER BY name"))

print(transfer("Ravi", "Asha", 200), balances())
print(transfer("Asha", "Ravi", 1000), balances())   # Asha has only 300: the CHECK fails
```

```output
done {'Asha': 300, 'Ravi': 300}
failed: CHECK constraint failed: balance >= 0 {'Asha': 300, 'Ravi': 300}
```

The second transfer added ₹1000 to Ravi first, then failed on Asha. Rollback removed **both** changes: Ravi is still at 300.

The same idea in plain SQL:

```sql
CREATE TABLE stock (item TEXT PRIMARY KEY, qty INTEGER);
INSERT INTO stock VALUES ('rice', 10);
BEGIN;
UPDATE stock SET qty = qty - 3 WHERE item = 'rice';
ROLLBACK;
SELECT item, qty FROM stock;
```

```output
item | qty
rice | 10
```

## Time and space

Transactions add a little cost (writing the log, holding locks). A **long** transaction is the real problem: it blocks others and makes the undo log grow. Do slow work (API calls, emails) **outside** the transaction.

## Common mistakes

- Doing two related updates without a transaction (a crash in between leaves bad data).
- Forgetting to `commit()`: the changes disappear when the connection closes.
- Catching an error inside the transaction and continuing as if nothing happened.
- Calling an external API inside a transaction (slow, and you cannot roll back an email).
- Assuming "isolation" means "no surprises at all": the default level in many databases still allows some anomalies.

## Patterns that use it

Payments and transfers, placing an order (create order + reduce stock together), the "kirana billing API" project, and the **outbox pattern** (save the event in the same transaction as the data, send it later).

## Practice

```practice
In Python + SQLite, write place_order(customer, items) that inserts the order and reduces stock in one transaction. Make it fail when stock is short, and check nothing changed.
Explain what could go wrong if the two UPDATEs of a transfer ran without a transaction.
List 3 actions that should NOT happen inside a database transaction.
```

## Explain it back

```explain
Explain each letter of ACID with the UPI transfer example.
What does ROLLBACK undo, and how does the database remember how to undo it?
Why should transactions be short?
```

## Flashcards

```flashcards
Transaction? :: A group of changes that all happen or none happen.
A in ACID? :: Atomicity: all or nothing.
C in ACID? :: Consistency: rules and constraints always hold.
I in ACID? :: Isolation: concurrent transactions do not see each other's half-done work.
D in ACID? :: Durability: committed changes survive a crash (write-ahead log).
Python sqlite3 auto commit/rollback? :: with conn: ...
```
