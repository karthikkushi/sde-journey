---
id: g-sharding
title: Sharding (partitioning) data
level: core
phase: 3
week: 38
tags: [cs, database, sharding, partitioning, distributed-systems]
estMinutes: 30
---

## What it is

When one database machine cannot hold all the data or handle all the writes, you **split** the data across several machines. Each piece is a **shard** (or partition).
A **shard key** decides where each row lives (for example, by user id).
Sharding scales writes and storage, but makes cross-shard queries, joins and resharding much harder.

## Real-life example

A big school keeps attendance registers by class section: section A's register, section B's, and so on. Each teacher only handles one register (spreading the work). But "list every student born in March across the school" now means opening every register.

## Picture

```text
 range sharding (by month)          hash sharding (hash(user_id) % 4)
 shard 1: Jan–Mar                   shard 0: user7, user12, ...
 shard 2: Apr–Jun                   shard 1: user3, user9, ...
 shard 3: Jul–Sep                   shard 2: ...
 shard 4: Oct–Dec  ← ALL of today's writes land here (a hot spot)

 adding a 5th shard:
   hash % N      → most keys change shard (795 of 1000 in the example below)
   consistent hashing → only about 1/5 move (184 of 1000)
```

## How it works inside

- **Range sharding**: key ranges per shard (A–F, G–M...). Range queries are easy, but new or popular ranges become **hot spots** (time-ordered keys always hit the last shard).
- **Hash sharding**: `hash(key) % N`. Spreads keys evenly, but range queries must ask every shard, and changing N moves almost everything.
- **Consistent hashing**: shards (and their "virtual nodes") sit on a ring; a key belongs to the next shard clockwise. Adding a shard moves only about 1/N of the keys. (Details in the system design note on consistent hashing.)
- **Directory-based**: a lookup table says which shard holds which key. Flexible, but the table must be fast and highly available.
- **Choosing a shard key**: the one most queries filter by (user_id, tenant_id), with many distinct values, spread evenly. A bad key (country, date) creates hot spots.
- **Costs**: cross-shard queries ("scatter-gather"), cross-shard transactions (hard; avoid or use sagas), unique constraints across shards, rebalancing data when shards grow.
- **Before sharding**: try indexes, caching, read replicas and a bigger machine. Many companies run large systems on one well-tuned primary.

## Python, step by step

How many keys move when going from 4 to 5 shards?

```python
import bisect
import hashlib
from collections import Counter

def h(key):
    return int(hashlib.md5(key.encode()).hexdigest(), 16)   # a stable hash (Python's hash() changes per run)

keys = [f"user{i}" for i in range(1, 1001)]

moved = sum(h(k) % 4 != h(k) % 5 for k in keys)
print("hash % N, 4 -> 5 shards: moved", moved, "of 1000 keys")

def ring(nodes, vnodes=100):                                 # each shard appears 100 times on the ring
    return sorted((h(f"{n}#{v}"), n) for n in nodes for v in range(vnodes))

def owner(points, key):
    i = bisect.bisect([p[0] for p in points], h(key)) % len(points)   # next point clockwise
    return points[i][1]

r4, r5 = ring("ABCD"), ring("ABCDE")
print("consistent hashing, 4 -> 5 shards: moved", sum(owner(r4, k) != owner(r5, k) for k in keys), "of 1000 keys")
print(sorted(Counter(owner(r4, k) for k in keys).items()))
```

```output
hash % N, 4 -> 5 shards: moved 795 of 1000 keys
consistent hashing, 4 -> 5 shards: moved 184 of 1000 keys
[('A', 242), ('B', 259), ('C', 282), ('D', 217)]
```

A hot spot with range sharding by date:

```python
def range_shard(order_date):           # one shard per month
    return order_date[:7]

todays_orders = ["2026-10-14"] * 5
print({range_shard(d) for d in todays_orders})    # every write today goes to one shard
```

```output
{'2026-10'}
```

## Time and space

| Query | Single database | Sharded by user_id |
| --- | --- | --- |
| One user's orders | index lookup | one shard: fast |
| All orders yesterday | index range scan | every shard (scatter-gather) |
| Join across users | normal join | expensive cross-shard work |
| Add capacity | bigger machine | add shards + move data |

## Common mistakes

- Sharding too early (complexity for no gain).
- A shard key with few values or skew (country, "is_premium"): uneven shards.
- `hash % N` without planning for resharding.
- Needing transactions across shards for everyday operations.

## Patterns that use it

System design (URL shortener, chat, feeds at scale), consistent hashing, and database choices (Cassandra and DynamoDB shard automatically by partition key).

## Practice

```practice
Choose a shard key for: a chat app's messages, an e-commerce orders table, a multi-tenant SaaS. Explain each choice.
Change vnodes in the example from 100 to 10. What happens to the balance of keys per shard?
List 3 things you would try before sharding a slow database.
```

## Explain it back

```explain
What is a shard key, and what makes a good one?
Why does hash % N move most keys when N changes?
What is a hot spot, and how does range sharding cause one?
Why are cross-shard queries and transactions hard?
```

## Flashcards

```flashcards
Sharding? :: Splitting data across machines by a shard key.
Range sharding risk? :: Hot spots (for example, the newest dates).
Hash sharding weakness? :: Range queries hit every shard; hash % N reshuffles on resize.
Consistent hashing benefit? :: Adding a shard moves only about 1/N of the keys.
Good shard key? :: Used by most queries, many distinct values, evenly spread.
Try before sharding? :: Indexes, caching, read replicas, a bigger machine.
```
