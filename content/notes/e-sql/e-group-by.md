---
id: e-group-by
title: GROUP BY and HAVING
level: core
phase: 2
week: 10
tags: [sql, database, aggregates]
estMinutes: 30
---

## What it is

`GROUP BY` puts rows into **groups** that share a value, then **aggregate functions** turn each group into one row: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.
`WHERE` filters rows **before** grouping. `HAVING` filters groups **after** grouping.
This is how every report ("sales per day", "orders per customer") is made.

## Real-life example

At the end of the day, the shopkeeper sorts the bills into piles by date and adds up each pile. Each pile = a group. The total on top of each pile = `SUM`. "Only show days above ₹500" = `HAVING`.

## Picture

```text
 products                      GROUP BY category           one row per group
 Rice 5kg       grocery  320   ┌ grocery:    320,160,150 ┐   grocery     3  210.0
 Toor dal 1kg   grocery  160   │                         │   stationery  2   50.0
 Sunflower oil  grocery  150   ├ stationery: 40, 60      ┤ → beverages   1  120.0
 Notebook       stat.     40   │                         │   (COUNT, AVG)
 Pen pack       stat.     60   └ beverages:  120         ┘
 Tea 250g       bev.     120
```

## How it works inside

- Order of steps: `FROM` → `WHERE` → **`GROUP BY`** → aggregates → **`HAVING`** → `SELECT` → `ORDER BY`.
- After grouping, each output row is **one group**. So `SELECT` may only use the grouped columns and aggregates. (Some databases allow other columns, but the value is then an arbitrary row's value. Do not rely on it.)
- `COUNT(*)` counts rows. `COUNT(col)` counts rows where `col` is not NULL. `COUNT(DISTINCT col)` counts different values.
- `AVG`, `SUM`, `MIN`, `MAX` ignore NULLs.
- **Conditional aggregation**: `SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)` counts only some rows inside each group. This turns rows into columns (a "pivot").
- Inside, the database groups by **sorting** or with a **hash table** (like a Python dict of lists).

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

Count and average per category:

```sql
SELECT category, COUNT(*) AS items, ROUND(AVG(price), 1) AS avg_price
FROM products
GROUP BY category
ORDER BY category;
```

```output
category | items | avg_price
beverages | 1 | 120.0
grocery | 3 | 210.0
stationery | 2 | 50.0
```

Three kinds of `COUNT`:

```sql
SELECT COUNT(*) AS all_rows, COUNT(city) AS with_city, COUNT(DISTINCT city) AS cities
FROM customers;
```

```output
all_rows | with_city | cities
5 | 4 | 3
```

Revenue per day, delivered orders only (`WHERE` before grouping):

```sql
SELECT o.order_date, SUM(oi.qty * p.price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status = 'delivered'
GROUP BY o.order_date
ORDER BY o.order_date;
```

```output
order_date | revenue
2026-10-01 | 1000
2026-10-05 | 910
2026-10-07 | 280
```

`HAVING`: customers with more than one delivered order:

```sql
SELECT customer_id, COUNT(*) AS delivered
FROM orders
WHERE status = 'delivered'
GROUP BY customer_id
HAVING COUNT(*) > 1;
```

```output
customer_id | delivered
1 | 2
```

Conditional aggregation: one row with several counts:

```sql
SELECT COUNT(*) AS total,
       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
       ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 1) AS delivered_pct
FROM orders;
```

```output
total | delivered | cancelled | delivered_pct
6 | 4 | 1 | 66.7
```

## Time and space

| Step | Cost |
| --- | --- |
| Group by sorting | O(n log n) |
| Group by hashing | O(n), memory for one entry per group |
| Aggregates (SUM, COUNT...) | O(n) total |

## Common mistakes

- Using `WHERE` with an aggregate (`WHERE COUNT(*) > 1`). Aggregates belong in `HAVING`.
- Selecting a column that is not grouped or aggregated.
- `100 * a / b` with whole numbers gives a whole-number division in many databases. Use `100.0`.
- `COUNT(*)` when you meant to skip NULLs (`COUNT(col)`).
- Forgetting that `AVG` ignores NULLs (the average of known values only).

## Patterns that use it

Reports and dashboards, "top N per group" (with window functions, next notes), "percentage of...", "users active in the last 30 days", and finding duplicates (`GROUP BY email HAVING COUNT(*) > 1`).

## Practice

```practice
Find duplicate customer names with GROUP BY and HAVING.
not-boring-movies
average-selling-price
project-employees-i
percentage-of-users-attended-a-contest
queries-quality-and-percentage
monthly-transactions-i
classes-with-at-least-5-students
customers-who-bought-all-products
```

## Explain it back

```explain
What is the difference between WHERE and HAVING?
Why can SELECT only use grouped columns and aggregates?
Explain COUNT(*), COUNT(col) and COUNT(DISTINCT col).
How does conditional aggregation count only some rows?
```

## Flashcards

```flashcards
WHERE vs HAVING? :: WHERE filters rows before grouping; HAVING filters groups after.
COUNT(*) vs COUNT(col)? :: COUNT(*) counts rows; COUNT(col) skips NULLs.
Do SUM and AVG count NULLs? :: No, they ignore them.
Find duplicates? :: GROUP BY col HAVING COUNT(*) > 1
Count only delivered orders inside a group? :: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)
Avoid whole-number division? :: Multiply by 100.0, not 100.
```
