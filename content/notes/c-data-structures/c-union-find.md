---
id: c-union-find
title: Union-find (disjoint set union)
level: core
phase: 3
week: 33
tags: [dsa, union-find, graphs]
estMinutes: 25
---

## What it is

Union-find keeps track of **groups** that merge over time.
It answers two questions fast: "are a and b in the same group?" (`find`) and "join their groups" (`union`).
With two small tricks, each call costs almost O(1).

## Real-life example

Village panchayats merging. Each village starts with its own head. When two villages merge, one head reports to the other. To know if two people are in the same group, each person follows "who is my head?" up to the top leader and compares.

## Picture

```text
 start:   0   1   2   3   4         everyone is their own leader
 union(0,1), union(1,2):            union(3,4):

        0                3          find(2): 2 → 1 → 0  (leader 0)
       / \               |          find(4): 4 → 3      (leader 3)
      1   2              4          different leaders → different groups

 path compression: after find(2), 2 points straight to 0 next time.
```

## How it works inside

- `parent[x]` is x's boss. A leader is its own boss: `parent[x] == x`.
- `find(x)`: follow bosses up to the leader.
- `union(a, b)`: find both leaders; if different, make one leader the boss of the other.
- **Path compression**: while finding, point nodes closer to (or straight at) the leader. Future finds become short.
- **Union by size (or rank)**: attach the **smaller** group under the bigger one, so trees stay flat.
- With both tricks, a sequence of m operations is about O(m × α(n)), where α grows so slowly it is below 5 for any real n. Treat it as O(1).
- Union-find only **joins**. It cannot split groups apart.
- `union` returning False means "already in the same group": in a graph, that edge would make a **cycle**.

## Python, step by step

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))       # everyone leads their own group
        self.size = [1] * n
        self.groups = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path compression (halving)
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                   # already together (this edge would be a cycle)
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra               # smaller group goes under the bigger one
        self.size[ra] += self.size[rb]
        self.groups -= 1
        return True

uf = UnionFind(5)
print(uf.union(0, 1), uf.union(1, 2), uf.union(3, 4), uf.union(2, 0))
print(uf.find(2) == uf.find(0), uf.find(4) == uf.find(0), uf.groups)
```

```output
True True True False
True False 2
```

Number of provinces from a "who knows whom" matrix, and the redundant edge:

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        self.parent[rb] = ra
        return True

def provinces(knows):
    n = len(knows)
    uf = UnionFind(n)
    for i in range(n):
        for j in range(i + 1, n):
            if knows[i][j]:
                uf.union(i, j)
    return len({uf.find(i) for i in range(n)})

def redundant_edge(edges):                 # nodes are 1..n
    uf = UnionFind(len(edges) + 1)
    for a, b in edges:
        if not uf.union(a, b):
            return [a, b]                  # a and b were already connected

print(provinces([[1, 1, 0], [1, 1, 0], [0, 0, 1]]), redundant_edge([[1, 2], [1, 3], [2, 3]]))
```

```output
2 [2, 3]
```

## Time and space

| Operation | Time (with both tricks) |
| --- | --- |
| find | about O(1) amortized (α(n)) |
| union | about O(1) amortized |
| count groups | O(1) if you keep a counter |
| build for n items | O(n) |

Space: O(n).

## Common mistakes

- Comparing `parent[a] == parent[b]` instead of `find(a) == find(b)`.
- Forgetting path compression (slow chains).
- Nodes numbered from 1: make arrays of size n + 1.
- Trying to "un-union". Union-find cannot split groups.

## Patterns that use it

**Union-find** (connected components, redundant connection, accounts merge), **Kruskal's MST**, grouping equal strings (satisfiability of equations).

## Practice

```practice
number-of-provinces
redundant-connection
number-of-operations-to-make-network-connected
satisfiability-of-equality-equations
accounts-merge
most-stones-removed-with-same-row-or-column
```

## Explain it back

```explain
Explain find and union with the merging villages example.
What do path compression and union by size each fix?
Why does union returning False mean a cycle in an undirected graph?
When would you choose union-find over BFS/DFS?
```

## Flashcards

```flashcards
What does find(x) return? :: The leader (root) of x's group.
What does union(a, b) do? :: Joins the two groups by attaching one leader under the other.
Path compression? :: During find, point nodes closer to the leader.
Union by size? :: Attach the smaller group under the bigger one.
Cost per operation? :: Almost O(1) amortized (inverse Ackermann).
union returns False means? :: Already connected: the edge makes a cycle.
```
