---
id: union-find
name: Union-find (disjoint set)
group: Graphs
---

## Clues

```clues
Group things that are connected, as edges arrive one by one
Number of connected components
Does this edge make a cycle? (redundant connection)
Accounts merge (same email = same person)
Kruskal's minimum spanning tree
```

## Idea

Every item points to a **parent**. Following parents leads to the group's **leader** (root). `find(x)` gives the leader. `union(a, b)` joins two groups by making one leader point to the other. With **path compression** and **union by size**, each call is almost O(1).

## Template

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))       # everyone leads their own group at first
        self.size = [1] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path compression (halving)
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                    # already together: this edge makes a cycle
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra                # attach the smaller group under the bigger
        self.size[ra] += self.size[rb]
        return True

uf = UnionFind(5)
edges = [(0, 1), (1, 2), (3, 4), (2, 0)]
print([uf.union(a, b) for a, b in edges])
print(len({uf.find(x) for x in range(5)}), "groups")
```

```output
[True, True, True, False]
2 groups
```

## Walkthrough: Redundant Connection

1. Start with every node alone.
2. Add edges one by one with `union`.
3. The first edge whose two ends already have the same leader (`union` returns False) is the redundant one.

## Traps

- Comparing `parent[a] == parent[b]` instead of `find(a) == find(b)`.
- Forgetting path compression: chains get long and slow.
- Node labels starting at 1: make the arrays size n + 1.
