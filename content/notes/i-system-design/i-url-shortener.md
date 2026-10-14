---
id: i-url-shortener
title: Design a URL shortener
level: advanced
phase: 3
week: 35
tags: [system-design, interview, hashing, caching]
estMinutes: 40
---

## What it is

A service like bit.ly: turn a long URL into a short one (`sho.rt/3ORDSU`) and **redirect** anyone who opens the short link.
It is the most common first system design question because it touches everything: estimation, API, ID generation, database choice, caching and scaling.
It is very **read-heavy**: links are created once and opened many times.

## Real-life example

A college notice board has no space for long Google Form links, so the office writes `sho.rt/fees26`. Hundreds of students open it on the first day. The service must answer each of those clicks in a few milliseconds, even if one server fails.

## Picture

```text
 create:  POST /urls {"long_url": ...} ─▶ API ─▶ ID generator ─▶ base62(id) = "3ORDSU" ─▶ DB (code → long_url)
 open:    GET /3ORDSU ─▶ LB ─▶ API ─▶ Redis cache ──hit──▶ 302 Location: long_url
                                         └─miss─▶ DB ─▶ fill cache ─▶ 302
                                              └─▶ click event ─▶ queue ─▶ analytics (async, never slows the redirect)
```

## How it works inside

**1. Requirements**
- Functional: create a short link (optional custom alias, optional expiry), redirect, basic click counts.
- Non-functional: redirect latency < ~20 ms, very high availability, links never collide, codes not guessable in sequence (optional).

**2. Estimate** (10M daily users, see the Estimation note): ~12 writes/s, ~1,200 reads/s average, ~3,500/s peak; ~1 TB over 5 years. One database can hold it; reads need a cache.

**3. API**
- `POST /urls {long_url, alias?, expires_at?}` → `201 {short_url}`
- `GET /{code}` → `302 Found` with `Location` (302 so every click reaches us for analytics; 301 lets browsers cache the redirect and skip us).

**4. Short code generation** (the key deep dive)
- **Counter + base62**: a unique number (from the database sequence, or ranges handed to each server) encoded with 62 characters `0-9a-zA-Z`. 7 characters give 62⁷ ≈ 3.5 trillion codes. No collisions by design. To avoid guessable sequences, shuffle the number first (multiply by a large odd constant mod 62⁷).
- **Hash of the URL** (first 7 chars of MD5/SHA): same URL gives the same code, but collisions are possible, so check and retry with a salt.
- **Random codes**: check uniqueness (a unique constraint) and retry on conflict.

**5. Data model**: `urls(code PK, long_url, user_id, created_at, expires_at)`. A key-value lookup by `code`: PostgreSQL with an index, or DynamoDB/Cassandra at very large scale (partition by code).

**6. Scale and reliability**
- Cache hot codes in Redis (cache-aside, TTL); popular links hit memory.
- Stateless API servers behind a load balancer; read replicas for the DB.
- Click analytics are sent to a **queue** and counted asynchronously.
- Rate-limit link creation (spam). Check URLs against malware lists. Expired links: lazy check on read + a cleanup job.

## Python, step by step

Base62 encoding of a counter:

```python
import string

ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase   # 62 characters

def encode(n):
    if n == 0:
        return ALPHABET[0]
    out = []
    while n:
        n, r = divmod(n, 62)          # like converting to base 62
        out.append(ALPHABET[r])
    return "".join(reversed(out))

def decode(code):
    n = 0
    for ch in code:
        n = n * 62 + ALPHABET.index(ch)
    return n

for n in [125, 1_000_000, 3_500_000_000, 62**7 - 1]:
    print(n, encode(n), decode(encode(n)) == n)
print(f"7 characters give {62**7:,} codes")
```

```output
125 21 True
1000000 4c92 True
3500000000 3ORDSU True
3521614606207 ZZZZZZZ True
7 characters give 3,521,614,606,208 codes
```

A tiny service with a cache in front of the store:

```python
import hashlib
import string

ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase

def encode(n):                                          # base62, as above
    out = ""
    while True:
        n, r = divmod(n, 62)
        out = ALPHABET[r] + out
        if n == 0:
            return out

class Shortener:
    def __init__(self):
        self.db, self.cache, self.next_id = {}, {}, 3_500_000_000
        self.db_reads = 0

    def create(self, long_url):
        code = encode(self.next_id)
        self.next_id += 1
        self.db[code] = long_url
        return code

    def resolve(self, code):
        if code in self.cache:
            return self.cache[code]                     # hot links never touch the DB
        self.db_reads += 1
        url = self.db.get(code)
        if url:
            self.cache[code] = url
        return url

s = Shortener()
code = s.create("https://forms.example.com/fees-2026-semester-1")
for _ in range(1000):                                   # 1000 students open it
    s.resolve(code)
print(code, "| DB reads for 1000 clicks:", s.db_reads)
print("hash-based code (could collide):", hashlib.md5(b"https://example.com/very/long/url").hexdigest()[:7])
```

```output
3ORDSU | DB reads for 1000 clicks: 1
hash-based code (could collide): 47d13b7
```

## Time and space

| Part | Cost |
| --- | --- |
| Redirect (cache hit) | ~1 ms in Redis + network |
| Redirect (miss) | + one indexed DB lookup |
| Create | one insert + ID generation |
| Storage | ~500 bytes per link (~1 TB for 2 billion links) |

## Common mistakes

- Hash codes without collision handling.
- A single global counter as a bottleneck (hand out ID ranges per server instead).
- 301 when you need click analytics (or 302 when you want browser caching): know the trade-off.
- Writing analytics in the redirect path (slow redirects).
- Forgetting abuse: malware links, spam creation, enumeration of sequential codes.

## Patterns that use it

Base conversion, hashing, cache-aside, queues for analytics, rate limiting, key-value stores; the same shape as Pastebin.

## Practice

```practice
Draw this design from memory in 10 minutes, then explain it aloud as in an interview.
Add custom aliases: what must change in the API and the data model? How do you stop two people taking the same alias?
Make codes non-sequential: multiply the counter by a large odd number mod 62^7 before encoding. Show that it still never collides.
Build it: FastAPI + Postgres + Redis (the Phase 3 project), and measure redirect p95 with and without the cache.
```

## Explain it back

```explain
Why is base62 of a unique counter collision-free?
301 vs 302: what does each mean for analytics and load?
Why is this system read-heavy, and how does the design use that?
How would you hand out IDs from many servers without a single bottleneck?
```

## Flashcards

```flashcards
Codes from 7 base62 characters? :: 62^7 ≈ 3.5 trillion.
Collision-free code generation? :: Unique counter (or ID ranges) + base62.
Hash-based codes need? :: Collision checks and retries.
Redirect status for analytics? :: 302 (every click reaches the server).
Hot links? :: Cache in Redis (cache-aside).
Click counting? :: Asynchronously via a queue, not in the redirect path.
```
