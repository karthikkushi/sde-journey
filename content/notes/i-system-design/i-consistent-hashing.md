---
id: i-consistent-hashing
title: Consistent hashing
level: advanced
phase: 2
week: 25
tags: [system-design, hashing, sharding, caching]
estMinutes: 25
---

## What it is

**Consistent hashing** decides which server owns each key so that adding or removing a server moves **only a small share** of the keys (about 1/N), instead of almost all of them (as `hash(key) % N` does).
Servers and keys are placed on a **ring** of hash values; each key belongs to the next server clockwise.
**Virtual nodes** (many points per server) keep the load even.

## Real-life example

Delivery boys around a circular market road. Each shop is served by the next delivery boy walking clockwise. When a new boy joins, he only takes over the shops just before him; everyone else keeps their usual shops. If one boy leaves, only his shops move to the next boy.

## Picture

```text
                 0
           D ●       ● A            keys go clockwise to the next server
        k3 ·             · k1       k1 → A, k2 → B, k3 → D
       C ●                 ● B
                · k2
              2^128

 add server E between A and B: only keys between A and E move (to E)
 virtual nodes: A#0, A#1, ... A#99 spread A's share around the ring
```

## How it works inside

- Hash each server (or each of its virtual nodes) to a point on the ring. Hash each key the same way.
- Owner = the first server point **clockwise** from the key's point (binary search on the sorted points).
- **Adding** a server takes keys only from its clockwise neighbours: about 1/(N+1) of all keys move. **Removing** one hands its keys to the next server.
- With one point per server, the arcs are uneven (some servers get far more keys). **Virtual nodes** (100–200 per server) average this out; stronger servers can get more vnodes.
- **Replication**: store each key on the next R distinct servers clockwise (Cassandra, DynamoDB style).
- Used by: distributed caches (memcached clients), Cassandra and DynamoDB partitioning, load balancers keeping users on the same server, CDNs.

## Python, step by step

A ring with virtual nodes: balance, and keys moved when adding a server:

```python
import bisect
import hashlib
from collections import Counter

def h(text):
    return int(hashlib.md5(text.encode()).hexdigest(), 16)

class Ring:
    def __init__(self, vnodes):
        self.vnodes, self.points = vnodes, []        # sorted (hash, server) points

    def add(self, server):
        for v in range(self.vnodes):
            bisect.insort(self.points, (h(f"{server}#{v}"), server))

    def remove(self, server):
        self.points = [p for p in self.points if p[1] != server]

    def owner(self, key):
        i = bisect.bisect(self.points, (h(key),)) % len(self.points)   # next point clockwise (wraps around)
        return self.points[i][1]

keys = [f"key{i}" for i in range(10_000)]
for vnodes in (1, 100):
    ring = Ring(vnodes)
    for server in "ABCD":
        ring.add(server)
    load = sorted(Counter(ring.owner(k) for k in keys).values())
    before = {k: ring.owner(k) for k in keys}
    ring.add("E")
    moved = sum(before[k] != ring.owner(k) for k in keys)
    ring.remove("E")
    restored = all(before[k] == ring.owner(k) for k in keys)
    print(f"vnodes={vnodes}: keys per server {load}, moved when adding E: {moved}, back after removing E: {restored}")
```

```output
vnodes=1: keys per server [143, 302, 4032, 5523], moved when adding E: 1741, back after removing E: True
vnodes=100: keys per server [2447, 2490, 2509, 2554], moved when adding E: 1873, back after removing E: True
```

With `hash % N`, going from 4 to 5 servers moves about 80% of keys (see the Sharding note). Here only about 1/5 move.

## Time and space

| Operation | Cost |
| --- | --- |
| Find a key's owner | O(log(N × vnodes)) binary search |
| Add / remove a server | O(vnodes × log) to update the ring + moving ~1/N of the data |
| Memory | N × vnodes points |

## Common mistakes

- Using Python's built-in `hash()` (it changes between runs). Use a stable hash (md5, xxhash, murmur).
- One point per server (uneven load).
- Forgetting that the data still has to be **copied** when ownership moves.
- Ignoring replicas: losing one server should not lose data.

## Patterns that use it

Sharding, distributed caches, load balancing with cache locality, Cassandra/DynamoDB, CDN request routing.

## Practice

```practice
Add a "weight" so a bigger server gets twice as many virtual nodes. Check its share of keys.
Make owners(key, r=3) return the next 3 distinct servers clockwise (replication).
Explain why adding a server only moves keys from its neighbours.
```

## Explain it back

```explain
Why does hash % N move most keys when N changes?
How does a key find its server on the ring?
What problem do virtual nodes solve?
How does the ring help with replication?
```

## Flashcards

```flashcards
Consistent hashing benefit? :: Adding/removing a server moves only ~1/N of keys.
Key owner on the ring? :: The first server point clockwise.
Virtual nodes? :: Many ring points per server for an even load.
Lookup cost? :: O(log points) with binary search.
Replication on a ring? :: Store on the next R distinct servers clockwise.
Hash to use? :: A stable one (md5/murmur), not Python's hash().
```
