---
id: i-partitioning
title: Partitioning and sharding (system design view)
level: advanced
phase: 2
week: 24
tags: [system-design, partitioning, sharding, scaling]
estMinutes: 25
---

## What it is

Partitioning splits data (or work) into pieces that can live on different machines.
**Horizontal partitioning (sharding)** splits rows (users A–M here, N–Z there). **Vertical partitioning** splits columns or features (profiles in one store, photos in another). **Functional partitioning** gives each service its own database.
The partition key decides the load on each machine, so choosing it well is the main design decision.
(Range vs hash sharding and resharding cost: see the CS note "Sharding".)

## Real-life example

A railway reservation system: each zone (Southern, Western...) handles its own trains (functional/horizontal split). But during a festival, every booking for one popular train hits the same zone's machines: a **hot partition**.

## Picture

```text
 horizontal (sharding)            vertical                        functional
 users 0–999k   → shard 1         users(id, name, email) → DB A   orders service  → orders DB
 users 1M–2M    → shard 2         users(id, photo blobs) → S3      payments service → payments DB

 hot key: "post:virat" gets 1000 likes/s → one partition melts
 salting: "post:virat#0" ... "post:virat#9" → spread over 10 keys; reads sum all 10
```

## How it works inside

- **Pick the partition key from the main query**: chat messages by `conversation_id`, orders by `customer_id`, logs by `(service, day)`.
- **Even spread**: many distinct key values, no single key with most of the traffic.
- **Hot keys** (celebrity accounts, viral posts, flash sales): split one logical key into several physical ones (**salting**), cache the hot data, or give it dedicated capacity. Reads must then gather from all salts.
- **Secondary queries** (by a field that is not the key) need either scatter-gather across partitions or a separate **index table** partitioned by that field (kept in sync).
- **Rebalancing**: plan from day one (consistent hashing, or many small virtual partitions mapped to fewer machines so you move whole partitions).
- **Cross-partition transactions** are slow and complex; design so most operations touch one partition.
- In interviews: name the key, check the spread, mention hot keys and how queries by other fields work.

## Python, step by step

A hot key on one partition, and salting to spread it:

```python
import hashlib
from collections import Counter

def partition(key, n=8):
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % n

likes = ["post:virat"] * 1000 + [f"post:user{i}" for i in range(200)]   # one viral post + 200 normal ones
plain = Counter(partition(k) for k in likes)
print("busiest partition without salting:", max(plain.values()), "of", len(likes), "writes")

salted = Counter(partition(f"{k}#{i % 10}" if k == "post:virat" else k) for i, k in enumerate(likes))
print("busiest partition with 10 salts:", max(salted.values()))

def total_likes(counts_by_key, post):          # reading a salted key: add up every salt
    return sum(counts_by_key.get(f"{post}#{s}", 0) for s in range(10))

counts = Counter(f"post:virat#{i % 10}" for i in range(1000))
print("total likes read back:", total_likes(counts, "post:virat"))
```

```output
busiest partition without salting: 1023 of 1200 writes
busiest partition with 10 salts: 325
total likes read back: 1000
```

## Time and space

| Query | Cost when partitioned by user_id |
| --- | --- |
| One user's data | one partition |
| A salted hot key read | k small reads (k = number of salts) |
| Query by another field | all partitions, or a separate index table |

## Common mistakes

- Partitioning by a key with few values (country, status) or skewed traffic.
- Forgetting how you will query by other fields.
- No plan for hot keys during spikes (cricket finals, sales).
- Cross-partition transactions on the main path.

## Patterns that use it

Chat (by conversation), news feed (by user), ride booking (by city/geo cell), URL shortener (by short code), consistent hashing.

## Practice

```practice
Choose partition keys for: order history, chat messages, IoT sensor readings, likes on posts. Watch for hot keys.
Design how to show "top posts in Bengaluru today" when posts are partitioned by author.
Explain salting and its read cost to a friend.
```

## Explain it back

```explain
What is the difference between horizontal, vertical and functional partitioning?
What makes a good partition key?
How does salting fix a hot key, and what does it cost?
How do you query by a field that is not the partition key?
```

## Flashcards

```flashcards
Horizontal partitioning? :: Splitting rows across machines (sharding).
Vertical partitioning? :: Splitting columns/features into different stores.
Hot partition? :: One key or range gets most of the traffic.
Salting? :: Split one hot key into several (key#0..key#9); reads gather all.
Query by a non-key field? :: Scatter-gather, or a separate index table.
Partition key choice comes from? :: The main access pattern.
```
