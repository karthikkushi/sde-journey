---
id: i-estimation
title: Back-of-the-envelope estimation
level: advanced
phase: 3
week: 43
tags: [system-design, estimation, capacity-planning]
estMinutes: 25
---

## What it is

In system design interviews (and real planning) you estimate **traffic**, **storage** and **bandwidth** with quick, rounded maths.
The goal is the **right order of magnitude** (hundreds vs millions per second), not exact numbers, so you choose the right design.
A few memorised numbers and one formula do most of the work.

## Real-life example

Planning a wedding: "about 500 guests, each eats about 2 plates, so about 1,000 plates; we serve over 3 hours, mostly in one rush hour" is enough to decide how many counters and cooks you need. Nobody needs the exact count to the last guest.

## Picture

```text
 requests per second = daily actions ÷ 86,400        (a day ≈ 100,000 seconds for quick maths)
 peak                ≈ 2–3 × average
 storage per year    = items per day × bytes per item × 365

 powers:  10^3 = thousand (KB)   10^6 = million (MB)   10^9 = billion (GB)   10^12 = trillion (TB)
```

## How it works inside

**Numbers worth remembering**
- 1 day = 86,400 s ≈ 10⁵ s. 1 million requests/day ≈ 12 per second.
- Latency: memory ~100 ns, SSD read ~100 µs, same-datacenter round trip ~0.5 ms, cross-continent ~150 ms.
- One web server: hundreds to a few thousand simple requests/s. One PostgreSQL primary: thousands of simple queries/s. Redis: ~100k ops/s.
- Typical sizes: a tweet-like text ~200–300 bytes; a short URL record ~500 bytes; a photo ~200 KB–2 MB; a minute of HD video ~50–100 MB.

**The method**
1. State assumptions out loud (daily active users, actions per user, read:write ratio, item size, retention).
2. Compute average QPS (queries per second), then peak (× 2 or 3).
3. Compute storage per day, per year, for the retention period (add replication × 3 if relevant).
4. Bandwidth = QPS × size.
5. Use the numbers: "3,500 reads/s → a cache and a few app servers are enough; 900 GB over 5 years → one database is fine for storage."

## Python, step by step

A URL shortener with 10 million daily users:

```python
def per_second(per_day):
    return per_day / 86_400

DAU = 10_000_000
writes_per_day = DAU * 0.1                 # 1 in 10 users shortens a link each day
reads_per_day = writes_per_day * 100       # each link is opened 100 times (read-heavy)

print(f"writes: {per_second(writes_per_day):,.0f}/s on average, peak x3 = {3 * per_second(writes_per_day):,.0f}/s")
print(f"reads:  {per_second(reads_per_day):,.0f}/s on average, peak x3 = {3 * per_second(reads_per_day):,.0f}/s")
bytes_5_years = writes_per_day * 500 * 365 * 5     # 500 bytes per link, kept 5 years
print(f"storage for 5 years: {bytes_5_years / 1e12:.2f} TB")
```

```output
writes: 12/s on average, peak x3 = 35/s
reads:  1,157/s on average, peak x3 = 3,472/s
storage for 5 years: 0.91 TB
```

A chat app with 50 million daily users sending 40 messages each:

```python
messages_per_day = 50_000_000 * 40
print(f"{messages_per_day / 86_400:,.0f} messages/s on average")
print(f"{messages_per_day * 100 * 365 / 1e12:.1f} TB per year at 100 bytes per message (before replication)")
```

```output
23,148 messages/s on average
73.0 TB per year at 100 bytes per message (before replication)
```

So: the URL shortener's storage fits on one database; the chat app needs a store built for heavy writes and partitioning (for example by conversation).

## Time and space

Estimation takes 3–5 minutes of a 45-minute interview. Round aggressively (86,400 → 100,000) and say so; interviewers care about the reasoning and the conclusions you draw.

## Common mistakes

- Spending 15 minutes on exact arithmetic.
- Forgetting peak traffic (×2–3) or replication (×3 storage).
- Mixing bits and bytes, or KB and KiB, in a way that changes the order of magnitude.
- Not using the numbers to make a design decision.

## Patterns that use it

Every classic design (URL shortener, chat, feed, file storage, ride booking) starts with estimation; capacity planning in real jobs; choosing caches, shards and databases.

## Practice

```practice
Estimate QPS and yearly storage for: a photo-sharing app (5M DAU, 2 photos per day each, 500 KB per photo).
Estimate the bandwidth needed to serve 10,000 video streams at 3 Mbps.
Estimate how many app servers a 20,000 rps peak needs if one server handles 800 rps (with headroom).
Memorise the "numbers worth remembering" list; quiz yourself tomorrow.
```

## Explain it back

```explain
Walk through the 5 steps of an estimate.
How do you turn "per day" into "per second" quickly?
Why do you multiply by 2 or 3 for peak?
Give an example of an estimate changing a design decision.
```

## Flashcards

```flashcards
Seconds in a day (quick maths)? :: About 10^5 (86,400).
1 million requests per day per second? :: About 12 per second.
Peak vs average? :: Peak ≈ 2–3 × average.
Storage per year formula? :: items/day × bytes/item × 365 (× replication).
Same-datacenter round trip? :: About 0.5 ms.
Goal of estimation? :: The right order of magnitude to pick a design.
```
