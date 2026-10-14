---
id: e-select-where
title: SQL basics (SELECT, WHERE, ORDER BY)
level: core
phase: 2
week: 7
tags: [sql, database, select]
estMinutes: 30
---

## What it is

**SQL** is the language for asking questions of a database. Data lives in **tables**: rows (records) and columns (fields).
`SELECT` picks columns, `FROM` picks the table, `WHERE` keeps only matching rows, and `ORDER BY` sorts the result.
You describe **what** you want; the database decides **how** to get it.

## Real-life example

A kirana shop's notebook becomes tables: one page for customers, one for products, one for orders.
"Which grocery items cost less than ₹200, cheapest first?" is one SQL query:
`SELECT name, price FROM products WHERE category = 'grocery' AND price < 200 ORDER BY price;`

## Picture

```text
 products                                        result of the query above
 ┌────┬──────────────────┬────────────┬───────┐   ┌──────────────────┬───────┐
 │ id │ name             │ category   │ price │   │ name             │ price │
 ├────┼──────────────────┼────────────┼───────┤   ├──────────────────┼───────┤
 │  1 │ Rice 5kg         │ grocery    │  320  │   │ Sunflower oil 1L │  150  │
 │  2 │ Toor dal 1kg     │ grocery    │  160  │ → │ Toor dal 1kg     │  160  │
 │  3 │ Sunflower oil 1L │ grocery    │  150  │   └──────────────────┴───────┘
 │  4 │ Notebook         │ stationery │   40  │
 │ .. │ ...              │ ...        │  ...  │
```

## How it works inside

**The order SQL runs in** (not the order you write it):
1. `FROM` (and joins): which rows exist
2. `WHERE`: throw away rows that do not match
3. `GROUP BY` / `HAVING` (next notes)
4. `SELECT`: pick and compute the columns
5. `ORDER BY`: sort
6. `LIMIT`: keep the first few

That is why you cannot use a `SELECT` alias inside `WHERE`: `WHERE` runs first.

**Useful pieces**
- Compare: `=`, `<>` (not equal), `<`, `>=`. Combine with `AND`, `OR`, `NOT` (use brackets).
- `IN ('a', 'b')`, `BETWEEN 100 AND 200` (both ends included), `LIKE 'Rice%'` (`%` = any text, `_` = one character).
- **NULL** means "unknown". `x = NULL` is never true. Use `IS NULL` / `IS NOT NULL`.
- `DISTINCT` removes duplicate rows. `AS` gives a column a new name.
- `CASE WHEN ... THEN ... ELSE ... END` is SQL's if/else.

(The examples run on SQLite. They also work on PostgreSQL and SQL Server, with tiny changes for `LIMIT`: SQL Server uses `TOP`.)

## SQL, step by step

Create the shop tables (every SQL note uses this same small shop):

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

Filter and sort:

```sql
SELECT name, price
FROM products
WHERE category = 'grocery' AND price < 200
ORDER BY price;
```

```output
name | price
Sunflower oil 1L | 150
Toor dal 1kg | 160
```

`LIKE`, `BETWEEN` and `OR`:

```sql
SELECT name, price
FROM products
WHERE name LIKE '%dal%' OR price BETWEEN 100 AND 130
ORDER BY name;
```

```output
name | price
Tea 250g | 120
Toor dal 1kg | 160
```

Computed columns, aliases and `LIMIT`:

```sql
SELECT name, price + 10 AS with_delivery
FROM products
ORDER BY price DESC
LIMIT 3;
```

```output
name | with_delivery
Rice 5kg | 330
Toor dal 1kg | 170
Sunflower oil 1L | 160
```

`NULL` needs `IS NULL`:

```sql
SELECT
  (SELECT COUNT(*) FROM customers WHERE city = NULL) AS with_equals,
  (SELECT COUNT(*) FROM customers WHERE city IS NULL) AS with_is_null;
```

```output
with_equals | with_is_null
0 | 1
```

`DISTINCT` and `CASE`:

```sql
SELECT DISTINCT city FROM customers WHERE city IS NOT NULL ORDER BY city;
```

```output
city
Bengaluru
Chennai
Mysuru
```

```sql
SELECT name,
       CASE WHEN price >= 150 THEN 'costly' ELSE 'cheap' END AS band
FROM products
ORDER BY id;
```

```output
name | band
Rice 5kg | costly
Toor dal 1kg | costly
Sunflower oil 1L | costly
Notebook | cheap
Pen pack | cheap
Tea 250g | cheap
```

Text functions:

```sql
SELECT UPPER(name) AS loud, LENGTH(name) AS letters, SUBSTR(name, 1, 3) AS first3
FROM customers
WHERE LENGTH(name) >= 5
ORDER BY name;
```

```output
loud | letters | first3
KIRAN | 5 | Kir
MEENA | 5 | Mee
```

## Time and space

| Query shape | Cost without an index | With an index on the column |
| --- | --- | --- |
| `WHERE col = value` | O(n): scan every row | O(log n) |
| `ORDER BY col` | O(n log n) sort | can read in index order |
| `LIMIT k` after a sort | still sorts (or uses a heap) | stops early |

(Indexes are in their own note.)

## Common mistakes

- `WHERE city = NULL` (always empty). Use `IS NULL`.
- Mixing `AND` and `OR` without brackets: `a OR b AND c` means `a OR (b AND c)`.
- Using a `SELECT` alias in `WHERE`.
- `SELECT *` in real code: fetches columns you do not need. Name the columns.
- Forgetting quotes around text: `WHERE name = Ravi` is wrong; `WHERE name = 'Ravi'`.

## Patterns that use it

Every query. `WHERE` filters before grouping; `HAVING` (next notes) filters after.

## Practice

```practice
Write a query: products in 'stationery' or 'beverages', most expensive first.
Write a query: customers whose city is unknown or 'Bengaluru'.
recyclable-and-low-fat-products
find-customer-referee
big-countries
article-views-i
invalid-tweets
fix-names-in-a-table
find-users-with-valid-e-mails
```

## Explain it back

```explain
In what order does the database run FROM, WHERE, SELECT and ORDER BY?
Why does WHERE city = NULL return nothing?
What do % and _ mean in LIKE?
```

## Flashcards

```flashcards
Order SQL runs in? :: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.
How to check for missing values? :: IS NULL / IS NOT NULL (never = NULL).
LIKE '%dal%'? :: Any text, then dal, then any text.
Is BETWEEN inclusive? :: Yes, both ends.
Remove duplicate rows? :: SELECT DISTINCT
SQL's if/else? :: CASE WHEN ... THEN ... ELSE ... END
```
