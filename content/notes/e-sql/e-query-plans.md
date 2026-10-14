---
id: e-query-plans
title: Query plans (EXPLAIN)
level: core
phase: 2
week: 24
tags: [sql, database, performance, explain]
estMinutes: 25
---

## What it is

Before running a query, the database makes a **plan**: which index to use, which table to read first, how to join.
`EXPLAIN` shows that plan. `EXPLAIN ANALYZE` (PostgreSQL) also runs the query and shows real times and row counts.
Reading plans is how you find out **why** a query is slow.

## Real-life example

Google Maps shows the route before you start driving: "take the ring road, then exit at Silk Board". You can see if it chose a bad road. `EXPLAIN` is the route preview for your query.

## Picture

```text
 PostgreSQL EXPLAIN ANALYZE (shortened, read from the most indented line up)

 Hash Join  (rows=3) (actual time=0.05..0.08)
   Hash Cond: (o.customer_id = c.id)
   ->  Seq Scan on orders o  (rows=6)                     ← reads the whole table
         Filter: (status = 'delivered')
   ->  Hash  (rows=5)
         ->  Seq Scan on customers c  (rows=5)

 After CREATE INDEX on orders(status):
   ->  Index Scan using idx_orders_status on orders o     ← jumps straight to matches
```

## How it works inside

**Common steps you will see**
- **Seq Scan** / **SCAN**: reads every row. Fine for small tables; slow for big ones when you need only a few rows.
- **Index Scan** / **SEARCH ... USING INDEX**: uses an index to jump to matching rows.
- **Index Only Scan** / **COVERING INDEX**: the index has every needed column; the table is not touched.
- **Nested Loop**: for each outer row, look up inner rows (great with an index on the inner side).
- **Hash Join**: build a hash table on one side, probe it with the other (good for big, unsorted inputs).
- **Sort**, **Aggregate**, **Limit**: what they say.

**How the planner chooses**: it **estimates** how many rows each step returns (from table statistics) and picks the cheapest plan. Bad estimates → bad plans. `ANALYZE` (the command) refreshes statistics.

**A checklist for a slow query**
1. Run `EXPLAIN ANALYZE`. Find the step with the biggest time or row count.
2. A **Seq Scan** on a big table with a selective `WHERE`? Add an index on that column.
3. Index not used? Look for a function on the column, a type mismatch, a leading `%` in `LIKE`, or `OR` across columns.
4. Fetch only the columns you need; add `LIMIT` for pages.
5. Joining on columns without indexes? Index the foreign key.

## Python, step by step

SQLite's `EXPLAIN QUERY PLAN` in action:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT)")
db.execute("CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT)")

def steps(sql):
    return [row[3] for row in db.execute("EXPLAIN QUERY PLAN " + sql)]

join = "SELECT c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'delivered'"
print(any(s.startswith("SCAN o") for s in steps(join)))          # orders is scanned
print(any("PRIMARY KEY" in s for s in steps(join)))              # customers found by primary key

db.execute("CREATE INDEX idx_orders_status ON orders (status)")
print(any("INDEX idx_orders_status" in s for s in steps(join)))  # now the status filter uses the index

def seeks(sql):        # SEARCH = jumps into an index; SCAN = reads everything (even a whole index)
    return any(s.startswith("SEARCH") for s in steps(sql))

db.execute("CREATE INDEX idx_name ON customers (name COLLATE NOCASE)")
print(seeks("SELECT id FROM customers WHERE name LIKE 'Ra%'"))   # a prefix: can jump
print(seeks("SELECT id FROM customers WHERE name LIKE '%vi'"))   # a leading %: must scan
```

```output
True
True
True
True
False
```

The PostgreSQL commands (for your own database; not run here):

```sql norun
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;            -- the plan only
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42;    -- runs it: real times and rows
ANALYZE orders;                                                 -- refresh statistics
CREATE INDEX CONCURRENTLY idx_orders_customer ON orders (customer_id);   -- build without blocking writes
```

## Time and space

| Plan step | Rough cost |
| --- | --- |
| Seq Scan | O(n) |
| Index Scan | O(log n + rows found) |
| Nested Loop with index | O(outer × log inner) |
| Hash Join | O(n + m) + memory |
| Sort | O(n log n) (may spill to disk) |

## Common mistakes

- Guessing why a query is slow instead of running `EXPLAIN ANALYZE`.
- Testing on 10 rows: every plan is fast. Test with realistic data sizes.
- Adding indexes that the plan never uses.
- Forgetting that `EXPLAIN ANALYZE` really runs the query (careful with `DELETE`/`UPDATE`: wrap in a transaction and roll back).

## Patterns that use it

Performance work on any backend: slow API endpoints, reports, and the "add an index" step in system design answers.

## Practice

```practice
In Python + SQLite, create 100,000 orders. Print EXPLAIN QUERY PLAN for a filter before and after adding an index.
Write a query that cannot use an index on name (hint: a function or a leading %), then rewrite it so it can.
For the kirana billing API, list the 3 slowest queries you expect and the index for each.
```

## Explain it back

```explain
What is the difference between EXPLAIN and EXPLAIN ANALYZE?
What does a Seq Scan on a big table usually tell you?
Name three reasons an index might not be used.
```

## Flashcards

```flashcards
EXPLAIN shows? :: The plan the database will use.
EXPLAIN ANALYZE shows? :: The plan plus real times and row counts (it runs the query).
Seq Scan means? :: Every row is read.
Index Only Scan / covering index? :: All needed columns are in the index; the table is skipped.
Hash Join? :: Build a hash table on one side, probe with the other.
Why are plans sometimes bad? :: Wrong row estimates from old statistics (run ANALYZE).
```
