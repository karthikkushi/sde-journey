---
id: e-indexes
title: Indexes (how a B-tree index works)
level: core
phase: 2
week: 21
tags: [sql, database, indexes, b-tree, performance]
estMinutes: 30
---

## What it is

An **index** is an extra, sorted structure that lets the database find rows **without reading the whole table**.
Most indexes are **B-trees** (B+ trees): wide, shallow trees kept in sorted order.
Indexes make reads fast but make writes a little slower, and they use space.

## Real-life example

The index at the back of a textbook. To find "recursion", you do not read all 500 pages. The index is sorted A to Z, so you jump to "R", find "recursion → pages 212, 340", and go straight there.
Every time the book adds a page, the index must be updated too. That is the write cost.

## Picture

```text
 B+ tree index on orders.customer_id (each box is one disk page with many keys)

                       [ 2000 | 4000 ]                    ← root (1 page)
              ┌───────────┼───────────┐
     [ 500 | 1000 | 1500 ] [ ... ]   [ 4500 | ... ]       ← inner pages
        ┌────┼────┐
   [1..499] [500..999] ...                                 ← leaf pages, linked left to right
       │
   customer 42 → row locations (where the full rows are)

 1 million keys, ~100 keys per page → only 3–4 pages to read.
```

## How it works inside

- A **B+ tree** keeps keys sorted. Each node is a **page** (often 4–16 KB) holding **many** keys, so the tree is very shallow: about log₁₀₀(n) levels. A million rows ≈ 3 levels.
- **Lookup** `WHERE customer_id = 42`: walk root → inner → leaf (3–4 page reads), then fetch the matching rows. Without an index: read **every** row (a full table scan).
- **Range** `WHERE price BETWEEN 100 AND 200` and `ORDER BY price`: find the start leaf, then walk the linked leaves in order.
- **Composite index** `(customer_id, order_date)`: sorted by customer first, then date. It helps queries that filter on **the leftmost columns**: `customer_id = 1`, or `customer_id = 1 AND order_date > ...`. It does **not** help `WHERE order_date = ...` alone (the "leftmost prefix" rule).
- **Covering index**: if the index already contains every column the query needs, the database never touches the table.
- **Primary key**: almost always indexed automatically. Foreign keys (like `orders.customer_id`) usually need an index **you** create.
- **Cost of an index**: every `INSERT`/`UPDATE`/`DELETE` must also update it, and it takes disk space. Do not index everything.
- **Indexes are skipped** when the column is wrapped in a function (`WHERE LOWER(name) = ...`), for `LIKE '%text'` (leading `%`), and when a query returns a big part of the table anyway.

## SQL, step by step

Creating indexes (SQLite syntax; PostgreSQL is the same):

```sql
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, amount INTEGER);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_customer_date ON orders (customer_id, order_date);
SELECT name FROM sqlite_master WHERE type = 'index' ORDER BY name;
```

```output
name
idx_orders_customer
idx_orders_customer_date
```

Watch the plan change from a full scan to an index search (Python + SQLite):

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, amount INTEGER)")
db.executemany("INSERT INTO orders (customer_id, amount) VALUES (?, ?)",
               [(i % 5000, i % 997) for i in range(50_000)])      # 50,000 orders

def plan(sql):                                    # how SQLite plans to run the query
    return " / ".join(row[3] for row in db.execute("EXPLAIN QUERY PLAN " + sql))

q = "SELECT SUM(amount) FROM orders WHERE customer_id = 42"
print("before: full scan?", plan(q).startswith("SCAN"))
db.execute("CREATE INDEX idx_customer ON orders (customer_id)")
print("after: uses the index?", "USING INDEX" in plan(q) or "USING COVERING INDEX" in plan(q))
print("answer:", db.execute(q).fetchone()[0])
```

```output
before: full scan? True
after: uses the index? True
answer: 1095
```

A function on the column hides it from the index:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT)")
db.execute("CREATE INDEX idx_name ON customers (name)")

def uses_index(sql):
    details = " ".join(row[3] for row in db.execute("EXPLAIN QUERY PLAN " + sql))
    return "INDEX" in details

print(uses_index("SELECT id FROM customers WHERE name = 'Ravi'"))
print(uses_index("SELECT id FROM customers WHERE LOWER(name) = 'ravi'"))
```

```output
True
False
```

## Time and space

| Operation | No index | B-tree index |
| --- | --- | --- |
| Find rows with `col = x` | O(n) full scan | O(log n) + matching rows |
| Range / `ORDER BY col` | O(n) scan (+ sort) | O(log n + k), already sorted |
| Insert / update / delete | O(1)-ish | + O(log n) per index |
| Extra space | none | roughly the size of the indexed columns |

## Common mistakes

- No index on foreign keys used in joins (slow joins).
- Indexing every column "just in case" (slow writes, wasted space).
- A composite index in the wrong order for your queries (leftmost prefix rule).
- `WHERE LOWER(email) = ...` with an index on `email` (use a functional index or store emails in lower case).
- Assuming an index is used: check with `EXPLAIN` (next notes).

## Patterns that use it

Every fast database query. In system design: "add an index on the lookup column", read replicas, and why "write-heavy tables should have few indexes".

## Practice

```practice
Create a table with 100,000 rows in SQLite (Python). Time a query before and after adding an index.
For the shop schema, list the indexes you would add and why (hint: orders.customer_id, order_items.order_id).
Explain which of these an index on (customer_id, order_date) helps: customer_id = 1; order_date = '2026-10-01'; customer_id = 1 AND order_date > '2026-10-01'.
```

## Explain it back

```explain
Explain a B-tree index with the textbook index example.
Why is a B+ tree so shallow even for millions of rows?
What is the leftmost prefix rule for composite indexes?
Why do indexes make writes slower?
```

## Flashcards

```flashcards
What does an index avoid? :: A full table scan.
Common index structure? :: A B+ tree (wide, shallow, sorted, linked leaves).
Lookup cost with a B-tree? :: O(log n), a few page reads.
Composite index (a, b) helps WHERE b = ? alone? :: No. Leftmost prefix rule: it needs a.
Covering index? :: The index has all the columns the query needs; the table is not read.
Why not index everything? :: Every write must update every index; more space.
```
