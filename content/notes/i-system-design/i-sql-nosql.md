---
id: i-sql-nosql
title: Databases - SQL vs NoSQL
level: advanced
phase: 2
week: 22
tags: [system-design, database, sql, nosql]
estMinutes: 25
---

## What it is

**SQL (relational)** databases store data in tables with a fixed schema, joins and strong transactions (PostgreSQL, MySQL, SQL Server).
**NoSQL** is a family of other models: **key-value** (Redis, DynamoDB), **document** (MongoDB), **wide-column** (Cassandra), **graph** (Neo4j), **search** (Elasticsearch), **time series**.
Choose by your **data shape** and **access patterns**, not by fashion. "Start with PostgreSQL" is a strong default.

## Real-life example

A kirana shop's ledger with neat columns and cross-references between pages (SQL) vs a pile of order slips where each slip has everything about one order written on it (documents). The ledger is great for exact accounts; the slips are great for "show me this one order quickly", but changing a product's name means fixing every slip.

## Picture

```text
 relational                                   document
 customers(id, name)                          {
 orders(id, customer_id, date)                  "_id": 101, "customer": {"id": 1, "name": "Ravi"},
 order_items(order_id, product_id, qty)         "items": [{"product": "Rice 5kg", "price": 320, "qty": 1},
 products(id, name, price)                                {"product": "Dal 1kg", "price": 160, "qty": 2}]
 → JOIN to build an order                     }   → one read gets the whole order
```

## How it works inside

| Model | Good at | Weak at | Examples |
| --- | --- | --- | --- |
| Relational (SQL) | joins, transactions, flexible queries, correctness | very large write scale needs sharding | PostgreSQL, MySQL |
| Key-value | super-fast get/put by key, caching, sessions | queries by anything but the key | Redis, DynamoDB |
| Document | nested objects read together, flexible fields | joins, cross-document consistency | MongoDB, Firestore |
| Wide-column | huge write volume, time-ordered data per key | ad-hoc queries | Cassandra, ScyllaDB |
| Graph | relationships many hops deep | bulk analytics | Neo4j |
| Search | full-text search, ranking, filters | being the source of truth | Elasticsearch, OpenSearch |

**How to choose (say this in interviews)**
1. What are the main queries? (by id? by user over time? full-text? relationships?)
2. How much data and how many writes per second?
3. Do we need multi-row transactions and strong consistency (money, stock)?
4. How will it scale (read replicas, sharding by which key)?

Many systems use **several**: PostgreSQL as the source of truth, Redis for cache, Elasticsearch for search, a data warehouse for analytics. Keep one **source of truth** per piece of data.

NoSQL is not "no schema": the schema lives in your code. **Model around queries**: in Cassandra or DynamoDB, design one table per query pattern.

## Python, step by step

The same orders as relational rows and as documents:

```python
customers = {1: "Ravi"}
products = {1: ("Rice 5kg", 320), 2: ("Dal 1kg", 160)}
orders = {101: 1}                                     # order_id -> customer_id
order_items = [(101, 1, 1), (101, 2, 2)]              # (order_id, product_id, qty)

def order_relational(order_id):                       # "join" the tables
    items = [(products[p][0], products[p][1], q) for o, p, q in order_items if o == order_id]
    return {"customer": customers[orders[order_id]], "items": items}

order_docs = {101: {"customer": "Ravi", "items": [("Rice 5kg", 320, 1), ("Dal 1kg", 160, 2)]}}

print(order_relational(101) == order_docs[101])       # same answer, different storage

products[1] = ("Basmati rice 5kg", 320)               # rename a product
print(order_relational(101)["items"][0][0], "|", order_docs[101]["items"][0][0])
```

```output
True
Basmati rice 5kg | Rice 5kg
```

The document kept the old name (a copy). Sometimes that is right (an invoice should keep the name at the time of sale); sometimes it is a bug.

## Time and space

| Access | Relational | Document / key-value |
| --- | --- | --- |
| Get one order with items | join (indexed: fast) | one read |
| Rename a product everywhere | one row | every document that copied it |
| Ad-hoc report ("sales by city") | one SQL query | hard; often export to a warehouse |

## Common mistakes

- Picking NoSQL "for scale" with a few thousand users.
- Picking a document database and then needing joins and transactions everywhere.
- Two sources of truth for the same data that slowly disagree.
- Designing NoSQL tables without listing the queries first.

## Patterns that use it

Every system design: URL shortener (key-value), chat (wide-column for messages), news feed (cache + store), ride booking (geo index + SQL), file storage (metadata in SQL, blobs in object storage).

## Practice

```practice
Pick a database for each and explain: user accounts and payments; chat messages for 100 million users; product search with filters; "friends of friends" suggestions.
Model a blog (posts, comments, likes) as SQL tables and as documents. Which queries become easy or hard?
Read the System Design Primer section on SQL vs NoSQL.
```

## Explain it back

```explain
When is a relational database the right choice?
What does "model around your queries" mean for NoSQL?
Why do many companies use more than one database?
What problem does copying data into documents create?
```

## Flashcards

```flashcards
Default choice for most apps? :: A relational database like PostgreSQL.
Key-value store is best for? :: Get/put by key (cache, sessions).
Document store is best for? :: Nested objects read together; flexible fields.
Wide-column store is best for? :: Huge write volume, time-ordered data per key.
Search engine database? :: Elasticsearch/OpenSearch: full-text search, not the source of truth.
First question when choosing? :: What are the main queries?
```
