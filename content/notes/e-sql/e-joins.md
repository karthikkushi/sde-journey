---
id: e-joins
title: SQL joins (all types, with pictures)
level: core
phase: 2
week: 8
tags: [sql, database, joins]
estMinutes: 35
---

## What it is

A **join** combines rows from two tables that belong together, like each order with its customer.
You say how they match with `ON` (usually an id in one table equals an id in the other).
The join type decides what happens to rows that have **no match**.

## Real-life example

The shop has a customers page and an orders page. The orders page only writes a customer number. To print "order 101 was placed by Ravi", you look up customer 1 on the other page. That lookup is a join.

## Picture

```svg
<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(0,0)">
    <circle cx="55" cy="55" r="32" class="box"/><circle cx="95" cy="55" r="32" class="box"/>
    <path d="M75 30A32 32 0 0 1 75 80A32 32 0 0 1 75 30Z" class="accent"/>
    <text x="75" y="105" text-anchor="middle">INNER</text>
    <text x="75" y="120" text-anchor="middle" class="muted">only matches</text>
  </g>
  <g transform="translate(180,0)">
    <circle cx="55" cy="55" r="32" class="accent"/><circle cx="95" cy="55" r="32" class="box"/>
    <path d="M75 30A32 32 0 0 1 75 80A32 32 0 0 1 75 30Z" class="accent"/>
    <text x="75" y="105" text-anchor="middle">LEFT</text>
    <text x="75" y="120" text-anchor="middle" class="muted">all left + matches</text>
  </g>
  <g transform="translate(0,115)">
    <circle cx="55" cy="55" r="32" class="box"/><circle cx="95" cy="55" r="32" class="accent"/>
    <path d="M75 30A32 32 0 0 1 75 80A32 32 0 0 1 75 30Z" class="accent"/>
    <text x="75" y="105" text-anchor="middle">RIGHT</text>
    <text x="75" y="120" text-anchor="middle" class="muted">all right + matches</text>
  </g>
  <g transform="translate(180,115)">
    <circle cx="55" cy="55" r="32" class="accent"/><circle cx="95" cy="55" r="32" class="accent"/>
    <text x="75" y="105" text-anchor="middle">FULL OUTER</text>
    <text x="75" y="120" text-anchor="middle" class="muted">everything</text>
  </g>
</svg>
```

Left circle = the first table (customers), right circle = the second (orders). The middle = rows that match.

## How it works inside

| Join | Keeps |
| --- | --- |
| `INNER JOIN` (or just `JOIN`) | only rows that match on both sides |
| `LEFT JOIN` | every row of the left table; NULLs where the right has no match |
| `RIGHT JOIN` | every row of the right table (same as LEFT with the tables swapped) |
| `FULL OUTER JOIN` | every row of both; NULLs where either side has no match |
| `CROSS JOIN` | every left row with every right row (n × m rows) |
| **self join** | a table joined to itself (employee → their manager) |

- **Anti-join**: "customers with **no** orders" = `LEFT JOIN ... WHERE orders.id IS NULL`.
- **One-to-many** joins repeat the "one" side: a customer with 3 orders appears 3 times. Count carefully.
- A condition on the right table placed in `WHERE` turns a LEFT JOIN back into an INNER JOIN (the NULL rows fail the test). Put such conditions in `ON` instead.
- Inside, the database picks a method: **nested loop** (good with an index), **hash join** (build a hash table of one side), or **merge join** (both sorted).

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

Inner join: each order with its customer's name:

```sql
SELECT o.id AS order_id, c.name, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id;
```

```output
order_id | name | status
101 | Ravi | delivered
102 | Asha | delivered
103 | Ravi | cancelled
104 | John | delivered
105 | Meena | pending
106 | Ravi | delivered
```

Left join keeps customers with no orders (Kiran):

```sql
SELECT c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY c.id;
```

```output
name | orders
Ravi | 3
Asha | 1
John | 1
Meena | 1
Kiran | 0
```

Anti-join: who never ordered?

```sql
SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

```output
name
Kiran
```

Three tables: the bill total of each order:

```sql
SELECT o.id AS order_id, SUM(oi.qty * p.price) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
GROUP BY o.id
ORDER BY o.id;
```

```output
order_id | total
101 | 640
102 | 360
103 | 200
104 | 910
105 | 160
106 | 280
```

Self join: each employee with their manager:

```sql
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, manager_id INTEGER);
INSERT INTO employees VALUES (1, 'Lakshmi', NULL), (2, 'Ravi', 1), (3, 'Asha', 1), (4, 'John', 2);
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id
ORDER BY e.id;
```

```output
employee | manager
Lakshmi | NULL
Ravi | Lakshmi
Asha | Lakshmi
John | Ravi
```

Full outer join: players in either team:

```sql
CREATE TABLE cricket (name TEXT);
CREATE TABLE football (name TEXT);
INSERT INTO cricket VALUES ('Ravi'), ('Asha'), ('John');
INSERT INTO football VALUES ('Asha'), ('Meena');
SELECT c.name AS cricket, f.name AS football
FROM cricket c
FULL OUTER JOIN football f ON f.name = c.name
ORDER BY COALESCE(c.name, f.name);
```

```output
cricket | football
Asha | Asha
John | NULL
NULL | Meena
Ravi | NULL
```

The `WHERE` trap: this filter turns the LEFT JOIN into an INNER JOIN (Kiran and the zero-order customers vanish):

```sql
SELECT c.name, COUNT(o.id) AS delivered
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'delivered'
GROUP BY c.id
ORDER BY c.id;
```

```output
name | delivered
Ravi | 2
Asha | 1
John | 1
```

Move the condition into `ON` to keep everyone:

```sql
SELECT c.name, COUNT(o.id) AS delivered
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'delivered'
GROUP BY c.id
ORDER BY c.id;
```

```output
name | delivered
Ravi | 2
Asha | 1
John | 1
Meena | 0
Kiran | 0
```

## Time and space

| Join method (chosen by the database) | Cost |
| --- | --- |
| Nested loop, index on the inner table | O(n log m) |
| Nested loop, no index | O(n × m): slow |
| Hash join | O(n + m), extra memory for the hash table |
| Merge join (both sorted) | O(n + m) |

Index the columns you join on (usually the foreign key, like `orders.customer_id`).

## Common mistakes

- Forgetting the `ON` condition (you get a cross join: every row with every row).
- Filtering the right table in `WHERE` after a LEFT JOIN (see above).
- Counting `COUNT(*)` after a LEFT JOIN: it counts the NULL row as 1. Use `COUNT(o.id)`.
- Double counting after joining two one-to-many tables at once.
- Ambiguous column names: write `o.id`, `c.id`.

## Patterns that use it

Almost every real query. Anti-joins ("who never..."), self joins (managers, consecutive days), and joins + `GROUP BY` for reports.

## Practice

```practice
Write a query: every product with the total quantity sold (0 if never sold).
replace-employee-id-with-the-unique-identifier
product-sales-analysis-i
customer-who-visited-but-did-not-make-any-transactions
rising-temperature
average-time-of-process-per-machine
employee-bonus
students-and-examinations
confirmation-rate
```

## Explain it back

```explain
Explain INNER, LEFT and FULL OUTER join with the circles picture.
How do you find customers who never placed an order?
Why does a condition in WHERE break a LEFT JOIN, and how do you fix it?
```

## Flashcards

```flashcards
INNER JOIN keeps? :: Only rows that match on both sides.
LEFT JOIN keeps? :: All left rows; NULLs where there is no match.
Rows with no match (anti-join)? :: LEFT JOIN ... WHERE right.id IS NULL
Self join example? :: Employees joined to employees to find each manager.
COUNT after LEFT JOIN? :: COUNT(right.id), not COUNT(*).
Join without ON? :: A cross join: every row with every row.
```
