---
id: i-replication
title: Replication and high availability (system design view)
level: advanced
phase: 2
week: 23
tags: [system-design, replication, availability]
estMinutes: 25
---

## What it is

Replication keeps copies of data on several machines so the system survives failures and serves more reads.
In system design, the questions are: how many **read replicas**, how to route reads and writes, what happens on **failover**, and how much data you can lose (**RPO**) and for how long you can be down (**RTO**).
(How leader-follower replication and quorums work inside: see the CS note "Database replication".)

## Real-life example

A bank keeps your account in its main branch system (leader) and copies at a backup site in another city. Balance enquiries can be answered from copies; deposits go to the main system. If the main site fails, the backup takes over, ideally within minutes, losing at most a few seconds of transactions.

## Picture

```text
                writes ──▶ [ primary ]  (region A)
 app ──┤                     │  async / sync copy
       └── reads ──▶ [ replica 1 ] [ replica 2 ]   (region A)   [ replica 3 ] (region B, for disaster recovery)

 RPO = how much recent data you may lose     RTO = how long until service is back
```

## How it works inside

- **Read replicas** scale reads: most apps read 10–100× more than they write. Route reads to replicas, writes to the primary.
- **Replication lag** means replicas can be slightly behind. Route **read-your-own-writes** to the primary (for example, for a few seconds after a user updates something), or read critical data (balances, stock) from the primary.
- **Failover**: automatic promotion of a replica when the primary dies. Managed databases (RDS, Cloud SQL, Azure) do this; clients reconnect to a new endpoint.
- **RPO/RTO**: synchronous replication → RPO near zero but slower writes; async → small data loss possible. Multi-region setups improve RTO for disasters.
- **Availability math**: two independent copies at 99.9% each → both down only 0.1% × 0.1% of the time (99.9999%). Correlated failures (same rack, same bug) break this math, so spread copies across zones/regions.
- **Replication is not backup**: also keep point-in-time backups to undo mistakes.

## Python, step by step

A read/write router with read-your-writes:

```python
class Router:
    def __init__(self, primary, replicas, stickiness=5):
        self.primary, self.replicas, self.stickiness = primary, replicas, stickiness
        self.last_write = {}                 # user -> time of their last write
        self.turn = 0

    def for_write(self, user, now):
        self.last_write[user] = now
        return self.primary

    def for_read(self, user, now):
        if now - self.last_write.get(user, -1e9) < self.stickiness:
            return self.primary              # just wrote: read from the primary (no lag)
        self.turn += 1
        return self.replicas[self.turn % len(self.replicas)]

r = Router("primary", ["replica1", "replica2"])
print(r.for_read("ravi", now=0), r.for_read("ravi", now=1))
r.for_write("ravi", now=10)
print(r.for_read("ravi", now=12), r.for_read("asha", now=12), r.for_read("ravi", now=16))
```

```output
replica2 replica1
primary replica2 replica1
```

Availability with independent copies:

```python
def availability(single, copies):
    return 1 - (1 - single) ** copies          # down only if every copy is down at once

for copies in (1, 2, 3):
    a = availability(0.999, copies)
    print(copies, "copy" if copies == 1 else "copies", f"{a:.7%}", "downtime per year (minutes):", round((1 - a) * 365 * 24 * 60, 2))
```

```output
1 copy 99.9000000% downtime per year (minutes): 525.6
2 copies 99.9999000% downtime per year (minutes): 0.53
3 copies 99.9999999% downtime per year (minutes): 0.0
```

## Time and space

| Choice | Write latency | RPO | Cost |
| --- | --- | --- | --- |
| Async replicas, same region | lowest | seconds | +1 machine per replica |
| One sync replica | + a few ms | ~0 | slower writes |
| Cross-region replica | + tens of ms if sync | depends | network + storage |

## Common mistakes

- Sending a user's read to a lagging replica right after their write.
- Counting on independent failures when all copies share one zone.
- No tested failover (the first try is during a real outage).
- Treating replicas as backups.

## Patterns that use it

Read-heavy designs (news feed, URL shortener), payments (strong consistency on the primary), multi-region systems, CAP discussions.

## Practice

```practice
A service gets 9,000 reads/s and 300 writes/s; one replica handles 3,000 reads/s. How many replicas, and what happens if one fails?
Write the RPO and RTO you would choose for: a chat app, a payment ledger, a blog. Explain.
Explain read-your-writes to a friend with the profile-update example.
```

## Explain it back

```explain
Why do read replicas help most web apps?
What are RPO and RTO?
Why does the availability math fail when copies share a zone?
How does the router above avoid stale reads after a write?
```

## Flashcards

```flashcards
Read replicas scale? :: Reads (writes still go to the primary).
RPO? :: How much recent data you can afford to lose.
RTO? :: How long until service is restored.
Read-your-writes? :: Route a user's reads to the primary right after they write.
Two independent 99.9% copies? :: About 99.9999% available together.
Replication vs backup? :: Replication copies mistakes too; backups let you go back in time.
```
