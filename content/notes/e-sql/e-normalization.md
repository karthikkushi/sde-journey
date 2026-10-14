---
id: e-normalization
title: Normalization (1NF, 2NF, 3NF)
level: core
phase: 2
week: 23
tags: [sql, database, design, normalization]
estMinutes: 25
---

## What it is

**Normalization** means designing tables so each fact is stored **once**.
When the same fact is copied in many rows, the copies can disagree. Normal forms (1NF, 2NF, 3NF) are rules that remove those copies.
Sometimes you **denormalize** on purpose (copy data) to make reads faster. That is a trade-off, not a mistake.

## Real-life example

A shop's order book where every line writes the customer's full address again: "Ravi, 12 MG Road, Bengaluru, rice 2 kg". When Ravi moves house, you must fix 50 lines. Miss one, and the book now says Ravi lives in two places. Keep the address once, on a customers page, and write only "customer 1" on each order.

## Picture

```text
 BEFORE (one big table: facts repeated)
 order_id | customer | customer_city | product  | price | qty
 101      | Ravi     | Bengaluru     | Rice 5kg | 320   | 1
 101      | Ravi     | Bengaluru     | Dal 1kg  | 160   | 2
 106      | Ravi     | Bengaluru     | Tea 250g | 120   | 1      ← Ravi's city stored 3 times

 AFTER (each fact once)
 customers(id, name, city)   products(id, name, price)
 orders(id, customer_id)     order_items(order_id, product_id, qty)
```

## How it works inside

**Three problems ("anomalies") repeated data causes**
- **Update anomaly**: change a fact in one row but not the others (two cities for Ravi).
- **Insert anomaly**: cannot store a new product until someone orders it (no order row to put it in).
- **Delete anomaly**: deleting the only order of a product also deletes the product's price.

**The normal forms (simple version)**
- **1NF**: each cell holds **one** value (no "rice, dal" lists in a cell), and rows are identified by a key.
- **2NF**: 1NF, and every non-key column depends on the **whole** key. (In `order_items(order_id, product_id, qty, product_price)`, `product_price` depends only on `product_id`: move it to `products`.)
- **3NF**: 2NF, and non-key columns depend **only** on the key, not on other non-key columns. (If `customers` had `pincode` and `city`, and city depends on pincode, split them.)
- A handy summary: "every column depends on the key, the whole key, and nothing but the key."

**When to denormalize**: read-heavy reports, analytics tables, caches, and NoSQL documents often copy data so a page loads in one read. Then you must keep the copies in sync (or accept they may be a little stale).

## SQL, step by step

The repeated table, and an update anomaly:

```sql
CREATE TABLE order_lines (order_id INTEGER, customer TEXT, customer_city TEXT, product TEXT, price INTEGER, qty INTEGER);
INSERT INTO order_lines VALUES
  (101, 'Ravi', 'Bengaluru', 'Rice 5kg', 320, 1),
  (101, 'Ravi', 'Bengaluru', 'Dal 1kg', 160, 2),
  (106, 'Ravi', 'Bengaluru', 'Tea 250g', 120, 1);
UPDATE order_lines SET customer_city = 'Mysuru' WHERE order_id = 106;   -- fixed only one copy
SELECT DISTINCT customer, customer_city FROM order_lines ORDER BY customer_city;
```

```output
customer | customer_city
Ravi | Bengaluru
Ravi | Mysuru
```

The normalized design, and a join to get the same view back:

```sql
CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER);
CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(id));
CREATE TABLE order_items (order_id INTEGER REFERENCES orders(id), product_id INTEGER REFERENCES products(id), qty INTEGER,
                          PRIMARY KEY (order_id, product_id));
INSERT INTO customers VALUES (1, 'Ravi', 'Bengaluru');
INSERT INTO products VALUES (1, 'Rice 5kg', 320), (2, 'Dal 1kg', 160), (3, 'Tea 250g', 120);
INSERT INTO orders VALUES (101, 1), (106, 1);
INSERT INTO order_items VALUES (101, 1, 1), (101, 2, 2), (106, 3, 1);
UPDATE customers SET city = 'Mysuru' WHERE id = 1;                       -- one place to change
SELECT o.id AS order_id, c.name, c.city, p.name AS product, p.price, oi.qty
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = oi.product_id
ORDER BY o.id, p.id;
```

```output
order_id | name | city | product | price | qty
101 | Ravi | Mysuru | Rice 5kg | 320 | 1
101 | Ravi | Mysuru | Dal 1kg | 160 | 2
106 | Ravi | Mysuru | Tea 250g | 120 | 1
```

## Time and space

| Design | Reads | Writes | Storage |
| --- | --- | --- | --- |
| Normalized | need joins | one place to change | small, no copies |
| Denormalized | one table, fast | must update every copy | bigger |

Real systems: normalized for the main database (correctness), denormalized copies for reports, search and caches (speed).

## Common mistakes

- Lists in a cell ("rice,dal"): breaks 1NF and makes queries painful.
- Storing a price on each order line **and** in products without a reason. (Storing the **price at the time of sale** on the order line is correct: it is a different fact.)
- Over-normalizing tiny lookup data into many tables nobody needs.
- Denormalizing early "for speed" before measuring.

## Patterns that use it

Every schema you design: the kirana billing API project, the LLD notes (classes map to tables), and system design discussions about SQL vs NoSQL.

## Practice

```practice
Take this table and normalize it to 3NF: student(roll_no, name, class_teacher, teacher_phone, subject, marks).
Design tables for a library: books, members, loans. Mark the primary and foreign keys.
delete-duplicate-emails
```

## Explain it back

```explain
Explain the update, insert and delete anomalies with the order book example.
State 1NF, 2NF and 3NF in your own words.
When is denormalizing a good idea?
Why is storing the price on an order line sometimes correct?
```

## Flashcards

```flashcards
Goal of normalization? :: Store each fact once, so copies cannot disagree.
1NF? :: One value per cell; rows have a key.
2NF? :: Non-key columns depend on the whole key.
3NF? :: Non-key columns depend only on the key (not on other non-key columns).
Update anomaly? :: Changing a fact in one copy but not the others.
Why denormalize? :: Faster reads (fewer joins), at the cost of keeping copies in sync.
```
