---
id: g-replication
title: Database replication
level: core
phase: 3
week: 37
tags: [cs, database, replication, distributed-systems]
estMinutes: 30
---

## What it is

**Replication** keeps copies of the same data on several machines.
It gives **availability** (if one machine dies, another has the data), **read scaling** (spread reads over copies) and lower latency (a copy near users).
The hard part: copies can be **out of date** for a moment (replication lag), and failures must be handled carefully.

## Real-life example

A head office keeps the master stock register. Every evening, each branch office gets a photocopy. Branches can answer "how much rice do we have?" quickly, but their copy may be a few hours old. If the head office burns down, a branch's copy becomes the new master, minus the last few hours of changes if they were not copied yet.

## Picture

```text
 leader-follower (primary-replica)

            writes                 copies changes (the replication log)
 app ─────────────▶ [ LEADER ] ─────────────┬──────────────▶ [ follower 1 ]  ← reads
                                            └──────────────▶ [ follower 2 ]  ← reads
 synchronous: the leader waits for a follower's "got it" before saying OK  (safer, slower)
 asynchronous: the leader says OK at once; followers catch up             (faster, may lag)
```

## How it works inside

- **Leader-follower** (most SQL databases): all writes go to the leader, which streams its change log (WAL in PostgreSQL, binlog in MySQL) to followers. Reads can go to followers.
- **Synchronous vs asynchronous**: sync = no data loss if the leader dies, but writes wait for followers. Async = fast writes, but recent changes can be lost on failover. A common middle: one sync follower, the rest async.
- **Replication lag** causes odd bugs: you update your profile, refresh, and see the old one (you read from a follower). Fix with **read-your-writes**: read your own recent changes from the leader.
- **Failover**: when the leader dies, a follower is **promoted**. Dangers: losing un-copied writes, and **split brain** (two nodes both think they are leader). Managed databases handle this for you.
- **Multi-leader**: several leaders accept writes (for example, one per region). Conflicts must be resolved (last-write-wins, merging).
- **Leaderless** (Cassandra, DynamoDB-style): write to W of N replicas, read from R. If **W + R > N**, every read overlaps at least one replica with the latest write.
- Replication is about **copies of all data**; **sharding** (next note) is about **splitting** data. Big systems do both.

## Python, step by step

Replication lag, and read-your-writes:

```python
class Store:
    def __init__(self):
        self.data = {}

leader, follower = Store(), Store()
pending = []                                     # changes not yet copied to the follower

def write(key, value):
    leader.data[key] = value
    pending.append((key, value))                 # asynchronous: copied later

def replicate():
    while pending:
        k, v = pending.pop(0)
        follower.data[k] = v

def read(key, from_leader=False):
    return (leader if from_leader else follower).data.get(key)

write("ravi:city", "Mysuru")
print("read from follower:", read("ravi:city"))                       # lag: not there yet
print("read your own write from leader:", read("ravi:city", from_leader=True))
replicate()
print("after catch-up:", read("ravi:city"))
```

```output
read from follower: None
read your own write from leader: Mysuru
after catch-up: Mysuru
```

Quorums in leaderless replication:

```python
def overlap_guaranteed(n, w, r):
    return w + r > n                 # any R replicas must include one of the W that got the write

for n, w, r in [(3, 2, 2), (3, 1, 1), (5, 3, 3), (5, 1, 5)]:
    print(f"N={n} W={w} R={r}: {overlap_guaranteed(n, w, r)}")
```

```output
N=3 W=2 R=2: True
N=3 W=1 R=1: False
N=5 W=3 R=3: True
N=5 W=1 R=5: True
```

## Time and space

| Choice | Write latency | Risk |
| --- | --- | --- |
| Asynchronous replication | lowest | lag; recent writes lost on failover |
| Synchronous (one follower) | + one round trip | slower if that follower is slow |
| Quorum W + R > N | wait for W (or R) replicas | tunable consistency |

Each replica stores a full copy: N replicas = N × storage.

## Common mistakes

- Reading from a follower right after writing (users see old data).
- Thinking replication is a backup: a bad `DELETE` is replicated to every copy too. Keep real backups (point-in-time recovery).
- Ignoring split brain during failover.
- Sending all reads to the leader "to be safe" and then wondering why it is overloaded.

## Patterns that use it

System design (read replicas, multi-region, CAP trade-offs), high availability, and "how do you avoid data loss?" interview questions.

## Practice

```practice
Draw your billing API with one leader and two read replicas. Which endpoints read from replicas, and which must read from the leader?
Explain why replication is not a backup, with an example.
Pick N, W, R for a store that must be fast to write but can tolerate slightly old reads.
```

## Explain it back

```explain
What are the three main reasons to replicate a database?
What is replication lag, and how does read-your-writes fix the bug it causes?
Compare synchronous and asynchronous replication.
Why does W + R > N give an up-to-date read?
```

## Flashcards

```flashcards
Leader-follower? :: All writes to the leader; followers copy its log and serve reads.
Replication lag? :: Followers are behind the leader for a moment.
Read-your-writes? :: Read your own recent changes from the leader.
Sync vs async replication? :: Sync waits for a follower (safer); async does not (faster, may lose data).
Quorum rule? :: W + R > N means reads overlap the latest write.
Is replication a backup? :: No. Mistakes are copied too.
```
