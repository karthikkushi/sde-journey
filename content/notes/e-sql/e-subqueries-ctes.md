---
id: e-subqueries-ctes
title: Subqueries and CTEs
level: core
phase: 2
week: 14
tags: [sql, database, subquery, cte]
estMinutes: 30
---

## What it is

A **subquery** is a query inside another query, in brackets. It can give one value, a list, or a whole table.
A **CTE** (common table expression) gives a subquery a **name** with `WITH name AS (...)`, so long queries read top to bottom like steps.
A **recursive CTE** can walk trees and hierarchies (like an org chart).

## Real-life example

"Which products cost more than the average price?" First you work out the average (a small question). Then you use that number in the big question. The small question is the subquery.

## Picture

```text
 SELECT name FROM products
 WHERE price > ( SELECT AVG(price) FROM products );
                └──────────── inner query ────────────┘
                     runs first, gives one number: 141.67

 WITH totals AS (...),          ← step 1: a named, temporary result
      ranked AS (... totals ...) ← step 2 uses step 1
 SELECT ... FROM ranked;          ← final step
```

## How it works inside

**Where subqueries go**
- In `WHERE` with a **single value**: `price > (SELECT AVG(price) ...)`.
- In `WHERE` with a **list**: `id IN (SELECT customer_id ...)`.
- `EXISTS (SELECT 1 ...)`: true if the subquery returns any row. `NOT EXISTS` for "never".
- In `FROM` as a temporary table (a "derived table").
- In `SELECT` as a value per row.

**Correlated subquery**: the inner query uses a column from the outer row (`WHERE o.customer_id = c.id`). It runs, in principle, once **per outer row**. The database often rewrites it into a join, but on big tables a join or window function can be faster.

**CTE**: `WITH a AS (...), b AS (...) SELECT ...`. Easier to read and test step by step. Same speed as a subquery in most databases.

**Recursive CTE**: an **anchor** part (the start rows) `UNION ALL` a **recursive** part that joins to the CTE itself, until no new rows appear.

**`NOT IN` and NULL trap**: if the subquery list contains a NULL, `x NOT IN (list)` is never true. Prefer `NOT EXISTS`.

## SQL, step by step

The shop tables:

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO customers VALUES (1, 'Ravi', 'Bengaluru'), (2, 'Asha', 'Mysuru'), (3, 'John', 'Bengaluru'), (4, 'Meena', 'Chennai'), (5, 'Kiran', NULL);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price INTEGER);
INSERT INTO products VALUES (1, 'Rice 5kg', 'grocery', 320), (2, 'Toor dal 1kg', 'grocery', 160), (3, 'Sunflower oil 1L', 'grocery', 150), (4, 'Notebook', 'stationery', 40), (5, 'Pen pack', 'stationery', 60), (6, 'Tea 250g', 'beverages', 120);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT);
INSERT INTO orders VALUES (101, 1, '2026-10-01', 'delivered'), (102, 2, '2026-10-01', 'delivered'), (103, 1, '2026-10-03', 'cancelled'), (104, 3, '2026-10-05', 'delivered'), (105, 4, '2026-10-06', 'pending'), (106, 1, '2026-10-07', 'delivered');
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO order_items VALUES (101, 1, 1), (101, 2, 2), (102, 6, 3), (103, 4, 5), (104, 1, 2), (104, 3, 1), (104, 5, 2), (105, 2, 1), (106, 6, 1), (106, 4, 4)
```

A single value: products above the average price:

```sql
SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products)
ORDER BY price DESC;
```

```output
name | price
Rice 5kg | 320
Toor dal 1kg | 160
Sunflower oil 1L | 150
```

A list with `IN`: customers who bought tea:

```sql
SELECT name
FROM customers
WHERE id IN (
  SELECT o.customer_id
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE oi.product_id = 6
)
ORDER BY name;
```

```output
name
Asha
Ravi
```

`NOT EXISTS`: customers who never ordered:

```sql
SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
```

```output
name
Kiran
```

A correlated subquery in `SELECT`: each customer's latest order:

```sql
SELECT c.name,
       (SELECT MAX(o.order_date) FROM orders o WHERE o.customer_id = c.id) AS last_order
FROM customers c
ORDER BY c.id;
```

```output
name | last_order
Ravi | 2026-10-07
Asha | 2026-10-01
John | 2026-10-05
Meena | 2026-10-06
Kiran | NULL
```

A CTE in steps: money spent per customer on delivered orders:

```sql
WITH order_totals AS (
  SELECT o.id, o.customer_id, SUM(oi.qty * p.price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status = 'delivered'
  GROUP BY o.id
)
SELECT c.name, SUM(t.total) AS spent
FROM order_totals t
JOIN customers c ON c.id = t.customer_id
GROUP BY c.id
ORDER BY spent DESC;
```

```output
name | spent
Ravi | 920
John | 910
Asha | 360
```

The second-highest price (a classic interview question):

```sql
SELECT MAX(price) AS second_highest
FROM products
WHERE price < (SELECT MAX(price) FROM products);
```

```output
second_highest
160
```

A recursive CTE: everyone under a manager, with their level:

```sql
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees VALUES (1, 'Lakshmi', NULL), (2, 'Ravi', 1), (3, 'Asha', 1), (4, 'John', 2), (5, 'Meena', 4);
WITH RECURSIVE chain(id, name, level) AS (
  SELECT id, name, 0 FROM employees WHERE manager_id IS NULL      -- anchor: the top boss
  UNION ALL
  SELECT e.id, e.name, chain.level + 1                            -- step: their reports
  FROM employees e
  JOIN chain ON e.manager_id = chain.id
)
SELECT name, level FROM chain ORDER BY level, name;
```

```output
name | level
Lakshmi | 0
Asha | 1
Ravi | 1
John | 2
Meena | 3
```

## Time and space

| Form | Typical cost |
| --- | --- |
| Uncorrelated subquery | runs once |
| Correlated subquery | once per outer row (unless the database rewrites it) |
| `IN (subquery)` / `EXISTS` | often turned into a semi-join; fast with an index |
| CTE | usually the same as writing the subquery inline |

## Common mistakes

- `NOT IN` with a list that may contain NULL (returns nothing). Use `NOT EXISTS`.
- A subquery in `WHERE x = (...)` that returns **more than one** row (an error).
- Very slow correlated subqueries on big tables. Try a join, or a window function.
- Forgetting `RECURSIVE` or the stop condition in a recursive CTE.

## Patterns that use it

"Above average", "never did X" (`NOT EXISTS`), "Nth highest", step-by-step reports with CTEs, and hierarchies (org charts, categories) with recursive CTEs.

## Practice

```practice
second-highest-salary
employees-whose-manager-left-the-company
exchange-seats
movie-rating
investments-in-2016
immediate-food-delivery-ii
game-play-analysis-iv
product-sales-analysis-iii
```

## Explain it back

```explain
What is a correlated subquery, and why can it be slow?
Why is NOT EXISTS safer than NOT IN?
What are the two parts of a recursive CTE?
Why do CTEs make long queries easier to read?
```

## Flashcards

```flashcards
CTE syntax? :: WITH name AS (SELECT ...) SELECT ... FROM name
Correlated subquery? :: An inner query that uses the outer row's columns.
NOT IN trap? :: If the list has a NULL, NOT IN returns nothing. Use NOT EXISTS.
Second highest value? :: MAX(x) WHERE x < (SELECT MAX(x) ...)
Recursive CTE parts? :: Anchor rows UNION ALL a step that joins the CTE to the table.
```
