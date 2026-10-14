---
id: i-load-balancing
title: Load balancing (system design view)
level: advanced
phase: 2
week: 19
tags: [system-design, load-balancing, availability]
estMinutes: 25
---

## What it is

A **load balancer** (LB) spreads requests across many servers, removes broken ones, and gives clients one stable address.
In a big system there are several layers of balancing: **DNS / global** (which region), **L4/L7 LBs** (which server), and **client-side** balancing between services.
(How DNS and basic algorithms work: see the CS note "DNS and load balancers".)

## Real-life example

Toll booths on the Bengaluru–Mysuru expressway. Signs before the toll plaza send cars to open booths (load balancer); a closed booth gets no cars (health check); FASTag lanes are for some cars only (L7 routing by type).

## Picture

```text
 users ──▶ DNS / GeoDNS ──▶ region: Mumbai            region: Chennai
                              [ L7 load balancer ]     [ L7 load balancer ]
                              /api ─▶ api servers      ...
                              /img ─▶ image servers
                                │
                              [ app1 ] [ app2 ] [ app3 ] ── health checks every 5 s
```

## How it works inside

- **Algorithms**: round robin (simple, even), least connections (uneven request times), weighted (bigger servers get more), and **hash-based** (IP or user id → server; keeps a user on the same server, which helps local caches; use consistent hashing so adding a server moves few users).
- **Health checks** remove failed servers; **connection draining** lets in-flight requests finish before a server is removed (for deploys).
- **L7 features**: TLS termination, routing by path/host/header, rate limiting, retries, request ids, compression.
- **Avoid a single point of failure**: run LBs in pairs or use a managed cloud LB; DNS can point to several LBs.
- **Global load balancing**: GeoDNS or anycast sends users to the nearest healthy region; failover to another region when one is down.
- In interviews, draw the LB early, then say: algorithm, health checks, how it avoids being a single point of failure, and whether sessions are sticky (prefer stateless).

## Python, step by step

Hash-based routing keeps each user on one server, so per-server caches hit more often:

```python
import hashlib
from itertools import cycle

users = [f"u{i}" for i in range(22)] * 5                  # 22 users, 5 requests each = 110 requests

def run(pick):
    caches = {s: set() for s in ("s1", "s2", "s3", "s4")}  # each server's local cache
    hits = 0
    for u in users:
        s = pick(u)
        if u in caches[s]:
            hits += 1
        else:
            caches[s].add(u)                               # miss: load the user's data on this server
    return hits

rotation = cycle(["s1", "s2", "s3", "s4"])
print("round robin hits:", run(lambda u: next(rotation)))
print("hash by user hits:", run(lambda u: "s" + str(int(hashlib.md5(u.encode()).hexdigest(), 16) % 4 + 1)))
```

```output
round robin hits: 66
hash by user hits: 88
```

Draining a server during a deploy:

```python
class Pool:
    def __init__(self, servers):
        self.active = list(servers)
        self.draining = set()

    def start_drain(self, server):            # no NEW requests; finish the current ones
        self.active.remove(server)
        self.draining.add(server)

    def route(self, i):
        return self.active[i % len(self.active)]

pool = Pool(["app1", "app2", "app3"])
pool.start_drain("app2")                      # deploying a new version to app2
print([pool.route(i) for i in range(4)], pool.draining)
```

```output
['app1', 'app3', 'app1', 'app3'] {'app2'}
```

## Time and space

An LB adds well under a millisecond inside a datacenter. Its capacity (connections, TLS handshakes per second) must also be planned; managed cloud LBs scale automatically.

## Common mistakes

- One load balancer with no backup.
- Sticky sessions as a crutch instead of stateless servers.
- Health checks that only test "process is up", not "can reach the database".
- Removing servers without draining (users see errors during deploys).

## Patterns that use it

Every system design answer, consistent hashing, deploys (rolling, blue-green), multi-region availability, and API gateways.

## Practice

```practice
Draw the load balancing layers for a food delivery app serving all of India.
Pick an algorithm for: equal short requests; long video uploads; servers with per-user caches. Explain each.
Describe a rolling deploy of 4 servers behind an LB, step by step, with draining.
```

## Explain it back

```explain
Why does hash-based routing help caches? Why should it use consistent hashing?
What is connection draining, and why does it matter for deploys?
How do you avoid the load balancer being a single point of failure?
```

## Flashcards

```flashcards
Least connections is good when? :: Request times vary a lot.
Hash-based routing benefit? :: The same user hits the same server: better cache hits.
Connection draining? :: Stop new requests to a server, let current ones finish.
L7 LB extras? :: TLS termination, path routing, retries, rate limiting.
Global load balancing? :: GeoDNS/anycast to the nearest healthy region.
LB single point of failure fix? :: Redundant LBs or a managed LB.
```
