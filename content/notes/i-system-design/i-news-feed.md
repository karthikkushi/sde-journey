---
id: i-news-feed
title: Design a news feed (Instagram/Twitter-style)
level: advanced
phase: 3
week: 40
tags: [system-design, interview, fan-out, caching]
estMinutes: 40
---

## What it is

Show each user a feed of recent posts from the people they follow, newest (or best-ranked) first, in under a second.
The core decision is **when** to build each feed: **fan-out on write** (push each new post into followers' feeds) or **fan-out on read** (build the feed when the user opens the app). Real systems use a **hybrid** because of celebrities.

## Real-life example

A school notice system. For a normal class teacher, a notice is copied into each student's diary right away (push). For the principal, whose notice goes to 5,000 students, copying into every diary is too slow, so students check the principal's board when they open their diary (pull). The diary shows both, merged by time.

## Picture

```text
 POST /posts ─▶ post store (by author) ─▶ fan-out workers (queue)
                                          ├─ normal author: push post_id into each follower's feed cache (Redis list)
                                          └─ celebrity (> 10k followers): skip the push

 GET /feed ─▶ read my feed cache (pushed post_ids)
           ─▶ + pull latest posts of the celebrities I follow
           ─▶ merge by time (or rank) ─▶ hydrate post_ids with post/user data (cache) ─▶ return top 20
```

## How it works inside

**Fan-out on write (push)**: when Asha posts, add the post id to each follower's precomputed feed (a capped list in Redis). Reads are very fast (one list read). Cost: a post by someone with a million followers means a million writes, and many go to inactive users.

**Fan-out on read (pull)**: when Ravi opens the app, fetch recent posts from everyone he follows and merge. Writes are cheap; reads are slow for users who follow many accounts.

**Hybrid**: push for normal users; **pull for celebrities** (and for very inactive followers). Merge both at read time. This is how large social apps handle the "celebrity problem".

**Other parts**
- Feed caches store only **post ids** (small); posts and user profiles are fetched separately from their own caches ("hydration").
- **Ranking**: start with reverse-chronological; later score by engagement, recency and relationship (a separate ranking service).
- **Pagination** with a cursor ("posts older than id X"), never offset.
- Media in object storage + CDN; counts (likes) updated asynchronously and cached.
- Estimation drives it: read-heavy (feeds are opened far more often than posts are created).

## Python, step by step

The hybrid: push for normal authors, pull for celebrities, merge at read time:

```python
import heapq

CELEBRITY = 10_000
follows = {"ravi": ["asha", "john", "virat"], "meena": ["virat", "asha"]}
follower_count = {"asha": 2, "john": 1, "virat": 1_000_002}
posts = {                                                    # (time, text), newest first, per author
    "asha": [(105, "asha: dosa pics")],
    "john": [(103, "john: new job!")],
    "virat": [(110, "virat: century!"), (101, "virat: nets practice")],
}
inbox = {user: [] for user in follows}                       # precomputed feeds (the push part)

def publish(author, t, text):                                # fan-out on write
    if follower_count[author] >= CELEBRITY:
        return 0                                             # celebrity: do not push
    pushed = 0
    for user, followees in follows.items():
        if author in followees:
            inbox[user].append((t, text))
            pushed += 1
    return pushed

for author in ("asha", "john"):
    for t, text in posts[author]:
        publish(author, t, text)

def feed(user, k=3):                                         # read: inbox + pulled celebrity posts
    pulled = [posts[a] for a in follows[user] if follower_count[a] >= CELEBRITY]
    pushed = sorted(inbox[user], reverse=True)
    merged = heapq.merge(pushed, *pulled, reverse=True)      # every list is newest-first
    return [text for _, text in list(merged)[:k]]

print(feed("ravi"))
print(feed("meena"))
print("writes needed if virat's post were pushed:", f"{follower_count['virat']:,}")
```

```output
['virat: century!', 'asha: dosa pics', 'john: new job!']
['virat: century!', 'asha: dosa pics', 'virat: nets practice']
writes needed if virat's post were pushed: 1,000,002
```

## Time and space

| Strategy | Cost per post | Cost per feed read |
| --- | --- | --- |
| Push (fan-out on write) | O(followers) writes | O(1) list read |
| Pull (fan-out on read) | O(1) | O(followees) reads + merge |
| Hybrid | O(followers) for normal users only | inbox + a few celebrities |

Feed cache size: e.g. 500 post ids × 8 bytes × 100M users ≈ 400 GB of Redis (only active users need it).

## Common mistakes

- Pure push with celebrities (millions of writes per post).
- Pure pull for everyone (slow feeds for users following thousands).
- Storing full posts in every feed instead of ids.
- Offset pagination (duplicates and gaps as new posts arrive). Use cursors.
- Doing ranking and counting synchronously in the post request.

## Patterns that use it

Queues/streams (fan-out workers), caching (Redis lists, hydration caches), K-way merge (heapq.merge), sharding by user, CDN for media.

## Practice

```practice
Add a "since" cursor to feed(): return posts older than a given time.
Change CELEBRITY to 1 and to 1,000,000 and explain what each extreme becomes.
Design how likes are counted and shown without slowing the feed.
Explain this design in 15 minutes out loud, starting with requirements and estimates.
merge-k-sorted-lists
design-twitter
```

## Explain it back

```explain
Explain fan-out on write vs fan-out on read with the school notice example.
What is the celebrity problem, and how does the hybrid solve it?
Why store post ids in the feed cache instead of full posts?
Why use cursor pagination for feeds?
```

## Flashcards

```flashcards
Fan-out on write? :: Push each new post into followers' precomputed feeds.
Fan-out on read? :: Build the feed when the user opens it.
Celebrity problem? :: Pushing to millions of followers per post is too costly.
Hybrid feed? :: Push for normal users, pull for celebrities, merge at read time.
Feed cache holds? :: Post ids (then hydrate details from caches).
Feed pagination? :: Cursor-based ("older than id X").
```
