---
id: g-dns-lb
title: DNS and load balancers
level: core
phase: 3
week: 34
tags: [cs, networking, dns, load-balancing]
estMinutes: 30
---

## What it is

**DNS** turns names like `shop.example.com` into IP addresses, through a chain of servers, with caching at every step.
A **load balancer** sits in front of several copies of your app and spreads incoming requests across the healthy ones.
Together they decide **which machine** answers each user.

## Real-life example

DNS is the phone directory enquiry service: you ask for "Sharma Stores" and get a number. You save it in your phone (cache) so you do not ask again for a while.
A load balancer is the manager at a big restaurant's entrance who sends each family to a free waiter, and skips the waiter who is on break (failed health check).

## Picture

```text
 DNS lookup for shop.example.com (first time, nothing cached)
 you ─▶ resolver (your ISP / 8.8.8.8 / 1.1.1.1)
          ├─▶ root server:        "ask the .com servers"
          ├─▶ .com server:        "ask example.com's name servers"
          └─▶ example.com's NS:   "shop.example.com = 203.0.113.10, TTL 300"
 the resolver and your computer cache the answer for 300 s

 load balancer at 203.0.113.10
   users ─▶ [ LB ] ─┬─▶ app1  ✓ healthy
                    ├─▶ app2  ✗ failed health check: skipped
                    └─▶ app3  ✓ healthy
```

## How it works inside

**DNS records**

| Type | Meaning |
| --- | --- |
| A / AAAA | name → IPv4 / IPv6 address |
| CNAME | name → another name (an alias) |
| MX | mail servers for the domain |
| TXT | text (domain verification, email security) |
| NS | which servers are in charge of the domain |

- Every answer has a **TTL** (seconds to cache). Low TTL = changes spread fast but more lookups; high TTL = fewer lookups, slow changes.
- DNS can do simple load spreading (several A records, or geo-DNS: answer with the nearest region).

**Load balancers**
- **Layer 4** (TCP): forwards connections by IP and port. Very fast, no knowledge of HTTP.
- **Layer 7** (HTTP): reads paths, headers and cookies: route `/api` to one group and `/images` to another, terminate TLS, add headers.
- **Algorithms**: round robin, weighted round robin (bigger servers get more), least connections (send to the least busy), IP hash or consistent hashing (the same user tends to reach the same server).
- **Health checks**: the LB calls `/health` regularly and stops sending traffic to failing servers.
- **Sticky sessions** keep a user on one server. Better: make servers **stateless** (sessions in Redis or a JWT), so any server can answer.
- The LB itself must not be a single point of failure: run two (active-passive) or use a managed cloud LB.

## Python, step by step

Round robin that skips unhealthy servers, and least connections:

```python
from itertools import cycle

servers = ["app1", "app2", "app3"]
healthy = {"app1": True, "app2": False, "app3": True}     # app2 failed its health check
rotation = cycle(servers)

def pick_round_robin():
    for _ in range(len(servers)):
        s = next(rotation)
        if healthy[s]:
            return s
    raise RuntimeError("no healthy servers")

print([pick_round_robin() for _ in range(5)])

active = {"app1": 12, "app2": 5, "app3": 6}               # open connections right now
picks = []
for _ in range(5):
    s = min(active, key=active.get)                        # the least busy server
    active[s] += 1
    picks.append(s)
print(picks, active)
```

```output
['app1', 'app3', 'app1', 'app3', 'app1']
['app2', 'app2', 'app3', 'app2', 'app3'] {'app1': 12, 'app2': 8, 'app3': 8}
```

A tiny DNS cache with TTL (a fake clock):

```python
records = {"shop.example.com": ("203.0.113.10", 300)}      # name -> (IP, TTL seconds)
cache = {}                                                  # name -> (IP, expires_at)

def resolve(name, now):
    if name in cache and cache[name][1] > now:
        return cache[name][0], "from cache"
    ip, ttl = records[name]                                 # the slow walk: root -> .com -> name server
    cache[name] = (ip, now + ttl)
    return ip, "asked the name servers"

print(resolve("shop.example.com", now=0))
print(resolve("shop.example.com", now=200))
records["shop.example.com"] = ("203.0.113.99", 300)         # the site moved to a new server
print(resolve("shop.example.com", now=250))                 # still the OLD address: cached
print(resolve("shop.example.com", now=301))                 # TTL over: new address
```

```output
('203.0.113.10', 'asked the name servers')
('203.0.113.10', 'from cache')
('203.0.113.10', 'from cache')
('203.0.113.99', 'asked the name servers')
```

## Time and space

| Step | Rough time |
| --- | --- |
| DNS answer from cache | ~0–1 ms |
| Full DNS lookup | ~20–100+ ms |
| Extra hop through a load balancer | ~0.1–1 ms |

## Common mistakes

- Changing DNS with a long TTL and expecting everyone to switch at once.
- Storing sessions in one server's memory behind a load balancer (users get "logged out" randomly).
- No health checks: the LB keeps sending users to a dead server.
- One load balancer and no backup.

## Patterns that use it

System design (every answer has DNS → load balancer → app servers), consistent hashing, deploys (rolling releases behind an LB), and debugging ("is it DNS?").

## Practice

```practice
Run: dig example.com (or nslookup example.com). Find the A record and its TTL.
Add weighted round robin to the example (app1 gets 2 requests for every 1 to app3).
Draw your billing API behind a load balancer with 3 app servers and one database. Where do sessions live?
```

## Explain it back

```explain
Walk through a DNS lookup from your laptop to the answer.
What does TTL control, and what is the trade-off?
What is the difference between a layer 4 and a layer 7 load balancer?
Why are stateless app servers easier to load balance?
```

## Flashcards

```flashcards
A record? :: Name → IPv4 address.
CNAME? :: Name → another name (alias).
DNS TTL? :: How long answers may be cached.
Least connections? :: Send the request to the server with the fewest open connections.
Health check? :: The LB calls an endpoint and stops routing to failing servers.
Why stateless servers? :: Any server can handle any request; no sticky sessions needed.
```
