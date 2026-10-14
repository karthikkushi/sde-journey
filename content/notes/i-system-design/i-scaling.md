---
id: i-scaling
title: Scalability basics (vertical vs horizontal scaling)
level: advanced
phase: 2
week: 18
tags: [system-design, scaling, architecture]
estMinutes: 25
---

## What it is

**Scalability** is how well a system keeps working as users and data grow.
**Vertical scaling** (scale up) = a bigger machine: more CPU, RAM, faster disk. **Horizontal scaling** (scale out) = more machines sharing the work behind a load balancer.
Scaling out needs **stateless** app servers: any server must be able to handle any request.

## Real-life example

A popular dosa stall. Scale up: give the one cook a bigger tawa and a helper's speed (works until the tawa cannot get bigger). Scale out: open three more counters with three cooks (needs a shared recipe and a shared order board, so any counter can serve any customer).

## Picture

```text
 vertical (scale up)            horizontal (scale out)
 ┌────────────┐                       users
 │  BIG box   │                         │
 │ 64 CPU     │                  [ load balancer ]
 │ 512 GB RAM │                  /      |       \
 └────────────┘              [app1]  [app2]  [app3]     ← stateless, identical
  simple, but a ceiling         \      |       /
  and a single point of failure  [ shared DB / cache ]
```

## How it works inside

- **Vertical**: no code changes, but there is a hardware ceiling, prices grow fast, and one machine is a single point of failure.
- **Horizontal**: almost no ceiling and better availability (one server dies, others continue), but you need a load balancer and **stateless** servers. Sessions, uploads and caches move to shared stores (Redis, object storage, the database).
- **Usually**: scale the stateless app tier horizontally, and scale the database vertically first (then read replicas, caching, and finally sharding).
- **What to measure**: throughput (requests per second), latency (p50/p95/p99), error rate, and **saturation** (CPU, memory, connections). Find the **bottleneck** before adding machines.
- **Headroom**: run at 60–70% of capacity at peak so spikes and one failed server do not take you down.
- **Autoscaling**: add or remove app servers automatically from CPU or request metrics.
- In an interview, say it in order: "start simple (one server + one DB) → add a load balancer and more app servers → cache → read replicas → shard → split into services only when needed."

## Python, step by step

How many servers for a peak load, with headroom?

```python
import math

def servers_needed(peak_rps, per_server_rps, headroom=0.3):
    usable = per_server_rps * (1 - headroom)      # never plan to run servers at 100%
    return math.ceil(peak_rps / usable)

print(servers_needed(3000, 500), servers_needed(300, 500), servers_needed(3000, 500, headroom=0))
```

```output
9 1 6
```

Why servers must be stateless: sessions in each server's memory vs a shared store:

```python
from itertools import cycle

class AppServer:
    def __init__(self, name, sessions=None):
        self.name = name
        self.sessions = sessions if sessions is not None else {}   # its own memory, unless shared

    def login(self, user):
        self.sessions[user] = "logged in"

    def whoami(self, user):
        return self.sessions.get(user, "please log in")

def simulate(servers):
    lb = cycle(servers)                                             # round robin load balancer
    next(lb).login("ravi")
    return [next(lb).whoami("ravi") for _ in range(3)]

print(simulate([AppServer("a"), AppServer("b")]))                  # stateful: random "logouts"
shared = {}                                                         # in real life: Redis
print(simulate([AppServer("a", shared), AppServer("b", shared)]))  # stateless servers
```

```output
['please log in', 'logged in', 'please log in']
['logged in', 'logged in', 'logged in']
```

## Time and space

| Approach | Limit | Failure impact |
| --- | --- | --- |
| Vertical | the biggest machine you can buy | the whole system |
| Horizontal (stateless) | mostly the shared database | one server's share, briefly |

## Common mistakes

- Adding servers when the bottleneck is the database.
- Storing sessions, uploads or caches in one server's memory or disk.
- Designing for a billion users when the requirement is ten thousand (over-engineering).
- No headroom: a spike or one failure overloads the rest.

## Patterns that use it

Load balancing, caching, read replicas, sharding, CDNs, queues: every later system design note builds on this.

## Practice

```practice
Your API handles 400 requests per second per server; peak is 5,000 rps. How many servers with 30% headroom?
List everything in your billing API that would break with 3 app servers (sessions, file uploads, in-memory caches) and the fix for each.
Explain "scale up vs scale out" with your own example in 3 sentences.
```

## Explain it back

```explain
What is the difference between vertical and horizontal scaling? Give one pro and one con of each.
Why must app servers be stateless to scale out?
Why keep 30% headroom?
In what order would you scale a growing web app?
```

## Flashcards

```flashcards
Vertical scaling? :: A bigger machine (scale up).
Horizontal scaling? :: More machines behind a load balancer (scale out).
Requirement for scaling out app servers? :: Stateless servers; state in shared stores.
Common first bottleneck? :: The database.
Why headroom? :: Survive spikes and the loss of a server.
Typical scaling order? :: LB + more app servers → cache → read replicas → sharding.
```
