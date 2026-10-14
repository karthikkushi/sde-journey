---
id: c-mst
title: Minimum spanning tree (MST)
level: advanced
phase: 3
week: 33
tags: [dsa, graphs, mst, greedy, union-find]
estMinutes: 25
---

## What it is

A **spanning tree** connects all nodes of a connected, weighted, undirected graph with no cycles (V − 1 edges).
The **minimum** spanning tree is the one with the smallest total weight.
Two greedy algorithms find it: **Kruskal** (cheapest edges first, with union-find) and **Prim** (grow from one node, with a heap).

## Real-life example

A district must connect 5 villages with water pipes. Each possible pipe has a cost. Every village must be connected (directly or through others), and the total cost must be as small as possible. No pipe should create a loop: a loop means you paid for one pipe too many.

## Picture

```text
 villages 0..4, possible pipes (cost):
   0–2 (1)   1–2 (2)   3–4 (2)   0–1 (4)   1–3 (5)   2–3 (8)   2–4 (10)

 Kruskal: take the cheapest pipe that does not make a loop
   0–2 ✓ (1)   1–2 ✓ (2)   3–4 ✓ (2)   0–1 ✗ loop   1–3 ✓ (5)   → 4 pipes, total 10
```

## How it works inside

- **Kruskal**: sort all edges by weight. Go through them; add an edge if its two ends are in **different** groups (union-find). Stop after V − 1 edges. O(E log E) for the sort.
- **Prim**: start anywhere. Keep a min-heap of edges leaving the tree. Always take the cheapest edge that reaches a **new** node. O(E log V).
- Both are **greedy**, and both are provably correct (the "cut property": the cheapest edge crossing any split of the nodes is safe to take).
- The MST is about **total** cost. It is not the same as shortest paths from one node (that is Dijkstra).
- On a dense graph given as points (like "connect all points"), Prim with a simple array can be O(V²), which beats building all E = V² edges.

## Python, step by step

Kruskal and Prim on the same villages give the same total:

```python
import heapq

edges = [(0, 2, 1), (1, 2, 2), (3, 4, 2), (0, 1, 4), (1, 3, 5), (2, 3, 8), (2, 4, 10)]
n = 5

def kruskal(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    chosen, total = [], 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):   # cheapest first
        ru, rv = find(u), find(v)
        if ru != rv:                                     # different groups: no loop
            parent[ru] = rv
            chosen.append((u, v, w))
            total += w
    return chosen, total

def prim(n, edges, start=0):
    graph = [[] for _ in range(n)]
    for u, v, w in edges:
        graph[u].append((w, v))
        graph[v].append((w, u))
    in_tree, total = {start}, 0
    heap = list(graph[start])                            # edges leaving the tree
    heapq.heapify(heap)
    while heap and len(in_tree) < n:
        w, v = heapq.heappop(heap)                       # the cheapest edge out
        if v in in_tree:
            continue                                     # it leads back inside: skip
        in_tree.add(v)
        total += w
        for edge in graph[v]:
            heapq.heappush(heap, edge)
    return total

print(kruskal(n, edges))
print(prim(n, edges))
```

```output
([(0, 2, 1), (1, 2, 2), (3, 4, 2), (1, 3, 5)], 10)
10
```

## Time and space

| Algorithm | Time | Space |
| --- | --- | --- |
| Kruskal | O(E log E) (sorting) | O(V) for union-find |
| Prim (heap) | O(E log V) | O(V + E) |
| Prim (array, dense graph) | O(V²) | O(V) |

## Common mistakes

- Confusing MST with shortest paths. MST minimises the **total** of chosen edges.
- Forgetting the cycle check in Kruskal.
- Running it on a disconnected graph: there is no spanning tree (you get a "forest").
- Building all V² edges for "connect all points" and then sorting: works, but Prim with an array is simpler and faster.

## Patterns that use it

**Greedy** + **union-find** (Kruskal), **greedy** + **heap** (Prim). Shows up as "connect all points / cities / computers with minimum cost".

## Practice

```practice
min-cost-to-connect-all-points
number-of-operations-to-make-network-connected
redundant-connection
```

## Explain it back

```explain
What is the difference between a minimum spanning tree and a shortest path tree?
Explain Kruskal with the village pipes example.
Why is skipping an edge that joins two nodes of the same group correct?
```

## Flashcards

```flashcards
How many edges does a spanning tree of V nodes have? :: V - 1
Kruskal in one line? :: Sort edges by weight; add each one that joins two different groups (union-find).
Prim in one line? :: Grow from a node, always taking the cheapest edge to a new node (heap).
Kruskal cost? :: O(E log E)
MST vs Dijkstra? :: MST minimises total edge weight; Dijkstra minimises distance from one start.
```
