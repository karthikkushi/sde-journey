---
id: i-cap
title: CAP theorem (and PACELC)
level: advanced
phase: 2
week: 26
tags: [system-design, distributed-systems, consistency, availability]
estMinutes: 25
---

## What it is

In a system with data on several machines, the network between them can break (a **partition**). When it does, you must choose:
**Consistency (C)**: every read sees the latest write, even if that means refusing requests, or
**Availability (A)**: every request gets an answer, even if it might be stale.
That is the **CAP theorem**. Partition tolerance (P) is not optional in real networks, so the real choice is C or A **during a partition**.

## Real-life example

Two railway booking counters in different cities share one train's seat list, and the phone line between them goes dead.
- CP: both counters stop selling seats until the line works (no double booking, but customers are turned away).
- AP: both keep selling (customers are happy), but the same seat may be sold twice and must be fixed later.

## Picture

```text
          [ replica A ]  ✗ network partition ✗  [ replica B ]
 user 1 writes "Mysuru" to A                     user 2 reads from B

 CP choice: B refuses (or waits) → correct but unavailable
 AP choice: B answers "Bengaluru" (old) → available but stale; reconcile when the network heals

 PACELC: if Partition → choose A or C;  Else (normal times) → choose Latency or Consistency
```

## How it works inside

- **CP systems** (traditional SQL with a single leader, ZooKeeper/etcd, HBase): during a partition, the side without the leader/majority refuses writes (and maybe reads).
- **AP systems** (Cassandra, DynamoDB in default settings, DNS): keep answering on both sides; replicas **converge later** (**eventual consistency**), using conflict rules like last-write-wins, version vectors or CRDTs (merge-friendly data types).
- **PACELC**: even without partitions, synchronous replication (consistency) costs latency; async gives speed with possible staleness.
- Many systems let you **tune per request**: quorum reads/writes (W + R > N) for consistency, or one replica for speed.
- **Choosing**: money, stock, seat bookings, unique usernames → favour consistency. Likes, view counts, feeds, product catalogue → availability with eventual consistency is fine.
- In interviews, say which data needs strong consistency and which can be eventually consistent, and why.

## Python, step by step

Two replicas during a partition: CP refuses, AP accepts and reconciles later (last write wins):

```python
class Replica:
    def __init__(self):
        self.value, self.version = "Bengaluru", 0

class Cluster:
    def __init__(self, mode):
        self.a, self.b, self.mode, self.partitioned = Replica(), Replica(), mode, False

    def write(self, replica, value, version):
        if self.partitioned and self.mode == "CP":
            return "rejected"                        # cannot reach the other side: refuse, stay consistent
        replica.value, replica.version = value, version
        if not self.partitioned:                     # normal times: copy to the other replica at once
            other = self.b if replica is self.a else self.a
            other.value, other.version = value, version
        return "ok"

    def heal(self):                                  # network back: the newest version wins everywhere
        self.partitioned = False
        newest = max(self.a, self.b, key=lambda r: r.version)
        for r in (self.a, self.b):
            r.value, r.version = newest.value, newest.version

for mode in ("CP", "AP"):
    c = Cluster(mode)
    c.partitioned = True
    results = c.write(c.a, "Mysuru", 1), c.write(c.b, "Chennai", 2)
    print(mode, results, "| A sees", c.a.value, "| B sees", c.b.value)
    c.heal()
    print(mode, "after healing, both see", c.a.value, c.b.value)
```

```output
CP ('rejected', 'rejected') | A sees Bengaluru | B sees Bengaluru
CP after healing, both see Bengaluru Bengaluru
AP ('ok', 'ok') | A sees Mysuru | B sees Chennai
AP after healing, both see Chennai Chennai
```

Notice: in AP mode, the "Mysuru" write was silently lost by last-write-wins. That is the price of availability without smarter merging.

## Time and space

| Choice | During a partition | Normal-time cost |
| --- | --- | --- |
| CP | some requests fail or wait | synchronous coordination: more latency |
| AP | always answers, may be stale | fast; needs conflict resolution |

## Common mistakes

- Saying "we choose CA" (you cannot opt out of network partitions in a distributed system).
- Treating CAP as a whole-system label: different data in one system can make different choices.
- Ignoring conflict resolution in AP designs (lost updates).
- Forgetting latency (PACELC) when there is no partition.

## Patterns that use it

Replication and quorums, database choices (SQL vs Cassandra/DynamoDB), shopping carts and likes (AP), payments and bookings (CP), and every "is this strongly or eventually consistent?" interview question.

## Practice

```practice
For each, choose CP or AP and explain: bank balance, Instagram like count, username sign-up, shopping cart, train seat booking.
Change the AP simulation to keep both conflicting values (a "sibling" list) instead of last-write-wins.
Explain PACELC in two sentences.
```

## Explain it back

```explain
State the CAP theorem in your own words with the booking counters example.
Why is "P" not really optional?
What is eventual consistency, and when is it acceptable?
What does PACELC add to CAP?
```

## Flashcards

```flashcards
CAP choice during a partition? :: Consistency (refuse/wait) or Availability (answer, maybe stale).
CP system example? :: A single-leader SQL database, etcd, ZooKeeper.
AP system example? :: Cassandra, DynamoDB (default), DNS.
Eventual consistency? :: Replicas may differ for a while but converge.
PACELC? :: If partition: A or C; else: latency or consistency.
Last-write-wins risk? :: Concurrent writes are silently lost.
```
