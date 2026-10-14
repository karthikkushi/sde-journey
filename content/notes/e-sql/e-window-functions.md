---
id: e-window-functions
title: Window functions
level: core
phase: 2
week: 18
tags: [sql, database, window-functions]
estMinutes: 35
---

## What it is

A **window function** computes a value for each row using a group of related rows (the "window"), **without** squashing them into one row like `GROUP BY` does.
Ranking, running totals, "previous day's value" and moving averages are all window functions.
The magic word is `OVER (...)`.

## Real-life example

A cricket scorecard shows each batter's runs **and** their rank in the team on the same line. Each row stays; the rank is computed by looking at the whole team. That extra column is a window function.

## Picture

```text
 SUM(revenue) OVER (ORDER BY day)          ← running total

 day          revenue   running_total
 2026-10-01    1000        1000
 2026-10-05     910        1910      = 1000 + 910
 2026-10-07     280        2190      = 1000 + 910 + 280

 PARTITION BY category = "restart the window for each category"
```

## How it works inside

`function(...) OVER (PARTITION BY a ORDER BY b ROWS BETWEEN ...)`
- **PARTITION BY**: split rows into groups; each group gets its own window (like GROUP BY, but rows are kept).
- **ORDER BY**: the order inside each window (needed for ranks, running totals, LAG/LEAD).
- **Frame** (`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`): which rows around the current row count. Used for moving averages.

**Ranking functions** (ties matter):
- `ROW_NUMBER()`: 1, 2, 3, 4 (ties get different numbers)
- `RANK()`: 1, 1, 3, 4 (ties share; a gap follows)
- `DENSE_RANK()`: 1, 1, 2, 3 (ties share; no gap)

**Offset functions**: `LAG(col)` = previous row's value, `LEAD(col)` = next row's value.

**Aggregates as windows**: `SUM`, `AVG`, `COUNT`, `MIN`, `MAX` with `OVER (...)`.

Window functions run **after** `WHERE` and `GROUP BY`, so you cannot filter on them in `WHERE`. Wrap the query in a CTE and filter outside.

## SQL, step by step

The shop tables, plus a scores table:

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
INSERT INTO customers VALUES (1, 'Ravi', 'Bengaluru'), (2, 'Asha', 'Mysuru'), (3, 'John', 'Bengaluru'), (4, 'Meena', 'Chennai'), (5, 'Kiran', NULL);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, category TEXT, price INTEGER);
INSERT INTO products VALUES (1, 'Rice 5kg', 'grocery', 320), (2, 'Toor dal 1kg', 'grocery', 160), (3, 'Sunflower oil 1L', 'grocery', 150), (4, 'Notebook', 'stationery', 40), (5, 'Pen pack', 'stationery', 60), (6, 'Tea 250g', 'beverages', 120);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, order_date TEXT, status TEXT);
INSERT INTO orders VALUES (101, 1, '2026-10-01', 'delivered'), (102, 2, '2026-10-01', 'delivered'), (103, 1, '2026-10-03', 'cancelled'), (104, 3, '2026-10-05', 'delivered'), (105, 4, '2026-10-06', 'pending'), (106, 1, '2026-10-07', 'delivered');
CREATE TABLE order_items (order_id INTEGER, product_id INTEGER, qty INTEGER);
INSERT INTO order_items VALUES (101, 1, 1), (101, 2, 2), (102, 6, 3), (103, 4, 5), (104, 1, 2), (104, 3, 1), (104, 5, 2), (105, 2, 1), (106, 6, 1), (106, 4, 4);
CREATE TABLE scores (name TEXT, runs INTEGER);
INSERT INTO scores VALUES ('Rohit', 45), ('Virat', 82), ('Gill', 45), ('Rahul', 82), ('Pant', 30);
```

The three ranks side by side:

```sql
SELECT name, runs,
       ROW_NUMBER() OVER (ORDER BY runs DESC, name) AS row_num,
       RANK()       OVER (ORDER BY runs DESC) AS rnk,
       DENSE_RANK() OVER (ORDER BY runs DESC) AS dense
FROM scores
ORDER BY row_num;
```

```output
name | runs | row_num | rnk | dense
Rahul | 82 | 1 | 1 | 1
Virat | 82 | 2 | 1 | 1
Gill | 45 | 3 | 3 | 2
Rohit | 45 | 4 | 3 | 2
Pant | 30 | 5 | 5 | 3
```

Top 1 per group: the costliest product in each category:

```sql
WITH ranked AS (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
  FROM products
)
SELECT category, name, price FROM ranked WHERE rn = 1 ORDER BY category;
```

```output
category | name | price
beverages | Tea 250g | 120
grocery | Rice 5kg | 320
stationery | Pen pack | 60
```

Running total and change from the previous day:

```sql
WITH daily AS (
  SELECT o.order_date AS day, SUM(oi.qty * p.price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.status = 'delivered'
  GROUP BY o.order_date
)
SELECT day, revenue,
       SUM(revenue) OVER (ORDER BY day) AS running_total,
       revenue - LAG(revenue) OVER (ORDER BY day) AS change
FROM daily
ORDER BY day;
```

```output
day | revenue | running_total | change
2026-10-01 | 1000 | 1000 | NULL
2026-10-05 | 910 | 1910 | -90
2026-10-07 | 280 | 2190 | -630
```

A 3-day moving average with a frame:

```sql
CREATE TABLE sales (day INTEGER, amount INTEGER);
INSERT INTO sales VALUES (1, 100), (2, 120), (3, 90), (4, 150), (5, 130), (6, 170), (7, 160);
SELECT day, amount,
       ROUND(AVG(amount) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS avg_3_days
FROM sales
ORDER BY day;
```

```output
day | amount | avg_3_days
1 | 100 | 100.0
2 | 120 | 110.0
3 | 90 | 103.3
4 | 150 | 120.0
5 | 130 | 123.3
6 | 170 | 150.0
7 | 160 | 153.3
```

## Time and space

| Use | Typical cost |
| --- | --- |
| Rank / running total over n rows | O(n log n) (it sorts by the window's ORDER BY) |
| With an index matching PARTITION BY + ORDER BY | can avoid the sort |
| LAG / LEAD | O(n) after sorting |

## Common mistakes

- Filtering a window result in `WHERE` (it is not computed yet). Use a CTE, then filter.
- Using `ROW_NUMBER` when ties should share a rank (use `RANK` or `DENSE_RANK`).
- Forgetting `ORDER BY` inside `OVER` for running totals (you get the total of everything).
- Default frames: with `ORDER BY`, `SUM` uses "from the start to this row" (and includes ties). Write `ROWS BETWEEN ...` when you mean exact rows.

## Patterns that use it

Top N per group, Nth highest, running totals, day-over-day change, moving averages, "consecutive" problems (with `LAG`/`LEAD` or `ROW_NUMBER` differences), and de-duplication (keep `rn = 1`).

## Practice

```practice
department-top-three-salaries
restaurant-growth
consecutive-numbers
last-person-to-fit-in-the-bus
product-price-at-a-given-date
game-play-analysis-iv
```

## Explain it back

```explain
How is a window function different from GROUP BY?
Explain ROW_NUMBER, RANK and DENSE_RANK with tied scores.
Why can you not use a window function in WHERE, and what do you do instead?
What does PARTITION BY do?
```

## Flashcards

```flashcards
Window function keyword? :: OVER (...)
ROW_NUMBER vs RANK vs DENSE_RANK for ties? :: 1,2,3,4 vs 1,1,3,4 vs 1,1,2,3
Previous row's value? :: LAG(col) OVER (ORDER BY ...)
Running total? :: SUM(x) OVER (ORDER BY day)
Top 1 per group? :: ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC), keep rn = 1.
Filter on a window result? :: Put the query in a CTE, filter outside.
```
