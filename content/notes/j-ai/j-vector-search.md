---
id: j-vector-search
title: Vector search with a tiny example
level: core
phase: 2
week: 22
tags: [ai, embeddings, vector-search, heaps]
estMinutes: 25
---

## What it is

**Vector search** finds the stored vectors closest to a query vector: "the 5 chunks most similar to this question".
With a few thousand vectors you can simply compare against all of them. With millions, you use an **approximate** index that checks only the promising parts and is much faster, at the cost of sometimes missing a true neighbour.

## Real-life example

Finding the nearest ATM: you could measure the distance to every ATM in India (exact, slow), or look only at ATMs in your area (fast, and almost always right). Approximate vector indexes do the second thing.

## Picture

```text
 exact (brute force):        query ── compare with ALL n vectors ── keep the top k (heap)

 approximate (clusters, "IVF"):
   build:  group vectors into clusters, each with a centre  ●
   search: query ── nearest centre(s) ── compare only with vectors in those clusters

        cluster A ●  · · ·            cluster B ●  · · ·
                    · ·     query ✕ ─▶ nearest centre is B → only B's points are checked
```

## How it works inside

- **Brute force**: score every vector, keep the best k with a heap. Exact, O(n × d). Fine up to roughly a hundred thousand vectors.
- **IVF (clusters)**: split vectors into clusters (k-means); search only the nearest few clusters. Searching more clusters = more accurate but slower.
- **HNSW (graph)**: each vector links to near neighbours; search walks the graph towards the query. Very fast and accurate; the most common choice.
- **Recall@k**: of the true top-k, how many did the approximate search find? You tune the index for speed vs recall.
- **Where to store**: a vector extension in your existing database (for example `pgvector` for PostgreSQL), a library (FAISS), or a vector database. Start with what you already run.
- **Filters**: real queries often combine meaning with conditions ("only this user's documents"), so store metadata next to each vector.

## Python, step by step

Exact top-k with a heap (2-number vectors so you can picture them):

```python
import heapq
import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.hypot(*a) * math.hypot(*b))

docs = {
    "refund policy":        (0.9, 0.1),
    "cancel a booking":     (0.8, 0.3),
    "change travel date":   (0.6, 0.6),
    "train running status": (0.2, 0.9),
    "platform number":      (0.1, 1.0),
}

def top_k(query, k):
    return heapq.nlargest(k, docs, key=lambda name: cosine(query, docs[name]))

print(top_k((1.0, 0.2), 2))       # a question about getting money back
print(top_k((0.1, 0.9), 2))       # a question about where the train is
```

```output
['refund policy', 'cancel a booking']
['platform number', 'train running status']
```

Approximate search with clusters: far fewer comparisons, but it can miss:

```python
import math

def dist(a, b):
    return math.dist(a, b)

points = {"p1": (1, 1), "p2": (1.5, 2), "p3": (2, 1.2),          # cluster A
          "p4": (8, 8), "p5": (8.5, 9), "p6": (9, 8.2),          # cluster B
          "p7": (4.6, 4.4)}                                       # in between
centres = {"A": (1.5, 1.4), "B": (8.5, 8.4)}
clusters = {"A": [], "B": []}
for name, p in points.items():                                    # build: put each point in its nearest cluster
    nearest = min(centres, key=lambda c: dist(p, centres[c]))
    clusters[nearest].append(name)
print(clusters)

def exact(q):
    return min(points, key=lambda n: dist(q, points[n])), len(points)

def approximate(q):
    c = min(centres, key=lambda c: dist(q, centres[c]))           # search only the nearest cluster
    best = min(clusters[c], key=lambda n: dist(q, points[n]))
    return best, len(centres) + len(clusters[c])

for q in [(1.2, 1.1), (5.8, 5.6)]:
    print(q, "exact:", exact(q), "approx:", approximate(q))
```

```output
{'A': ['p1', 'p2', 'p3', 'p7'], 'B': ['p4', 'p5', 'p6']}
(1.2, 1.1) exact: ('p1', 7) approx: ('p1', 6)
(5.8, 5.6) exact: ('p7', 7) approx: ('p4', 5)
```

The second query was closest to p7, but p7 sits in cluster A while the query's nearest centre is B, so the approximate search missed it. Searching the 2 nearest clusters would fix it, at more cost.

## Time and space

| Method | Search time | Exact? |
| --- | --- | --- |
| Brute force | O(n × d) | yes |
| IVF (search p of c clusters) | about O((c + n·p/c) × d) | approximate |
| HNSW graph | about O(log n × d) | approximate, high recall |
| Memory | n × d floats (+ index links) | |

## Common mistakes

- Reaching for a vector database for 2,000 vectors. Brute force or pgvector is enough.
- Never measuring recall after switching to an approximate index.
- Forgetting metadata filters (one user seeing another user's documents).
- Mixing distance and similarity: smaller distance = closer, larger cosine = closer.

## Patterns that use it

Top-k with heaps, k-means clustering, graph search (HNSW), RAG retrieval, "similar items" features.

## Practice

```practice
k-closest-points-to-origin
kth-largest-element-in-an-array
Change approximate() to search the 2 nearest clusters. Does it find p7 now? How many comparisons?
Write recall_at_k(exact_list, approx_list) and test it on a few queries.
```

## Explain it back

```explain
How does brute-force top-k work, and when is it good enough?
How does a cluster (IVF) index save time, and how can it miss a result?
What does recall@k measure?
Why store metadata next to vectors?
```

## Flashcards

```flashcards
Exact vector search? :: Compare with every vector, keep top k with a heap. O(n·d).
Approximate search trade-off? :: Much faster, may miss some true neighbours.
IVF? :: Cluster the vectors; search only the nearest clusters.
HNSW? :: A graph of near neighbours walked towards the query; fast and accurate.
Recall@k? :: Share of the true top-k that the search returned.
Vectors inside PostgreSQL? :: The pgvector extension.
```
