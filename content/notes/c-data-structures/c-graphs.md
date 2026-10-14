---
id: c-graphs
title: Graphs
level: core
phase: 2
week: 22
tags: [dsa, graphs, bfs, dfs, shortest-path]
estMinutes: 40
---

## What it is

A graph is a set of **nodes** (vertices) joined by **edges**. Edges can be one-way (**directed**) or two-way (**undirected**), and can have a **weight** (a cost).
Trees, grids, road maps, friend lists and course prerequisites are all graphs.
Most graph problems are "walk the graph" problems: BFS or DFS, plus a `visited` set.

## Real-life example

The Namma Metro map. Stations are nodes, tracks are edges. "Fewest stops from Majestic to Whitefield?" is BFS. "Cheapest route when tracks have different fares?" is Dijkstra. "Can every station reach every other?" is connected components.

## Picture

```svg
<svg viewBox="0 0 360 170" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 40L150 40M60 40L60 120M150 40L150 120M150 40L220 80M270 40L320 120" class="line"/>
  <circle cx="60" cy="40" r="17" class="hi"/><text x="60" y="45" text-anchor="middle">0</text>
  <circle cx="150" cy="40" r="17" class="box"/><text x="150" y="45" text-anchor="middle">1</text>
  <circle cx="60" cy="120" r="17" class="box"/><text x="60" y="125" text-anchor="middle">2</text>
  <circle cx="150" cy="120" r="17" class="box"/><text x="150" y="125" text-anchor="middle">3</text>
  <circle cx="220" cy="80" r="17" class="box"/><text x="220" y="85" text-anchor="middle">6</text>
  <circle cx="270" cy="40" r="17" class="box"/><text x="270" y="45" text-anchor="middle">4</text>
  <circle cx="320" cy="120" r="17" class="box"/><text x="320" y="125" text-anchor="middle">5</text>
  <text x="10" y="160" class="muted">adjacency list: 0:[1,2] 1:[0,3,6] 2:[0] 3:[1] 6:[1] 4:[5] 5:[4] → 2 components</text>
</svg>
```

## How it works inside

**Ways to store a graph**
- **Adjacency list** (most common): `graph[u] = [neighbours]`. Space O(V + E).
- **Adjacency matrix**: `m[u][v] = 1` if connected. O(V²) space; fast "is there an edge?".
- **Edge list**: `[(u, v, w), ...]`. Good for sorting edges (Kruskal) or Bellman-Ford.

**Walking it**
- **BFS** (queue): visits in rings, so in an unweighted graph the first time you reach a node is by the fewest edges.
- **DFS** (stack or recursion): goes deep first. Good for "explore everything connected", cycles, components.
- Always keep a `visited` set. Graphs can have loops; trees cannot.

**Common jobs**
- **Connected components**: start a BFS/DFS from every unvisited node; each start is a new component.
- **Cycle detection**: undirected → a visited neighbour that is not your parent; directed → reaching a node that is still "on the current path" (grey).
- **Topological sort**: order a DAG (directed, no cycles) so every edge goes forward (see the Topological sort pattern).
- **Shortest paths**: unweighted → BFS; non-negative weights → **Dijkstra** (heap); negative weights → **Bellman-Ford** (relax every edge V − 1 times; one more improving round means a negative cycle).

## Python, step by step

Build, BFS distances, DFS order and components:

```python
from collections import deque

def build(n, edges):                       # undirected adjacency list
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    return graph

def bfs_distances(graph, start):
    dist = {start: 0}
    queue = deque([start])
    while queue:
        u = queue.popleft()
        for v in graph[u]:
            if v not in dist:              # first visit = shortest (unweighted)
                dist[v] = dist[u] + 1
                queue.append(v)
    return dist

def dfs_order(graph, start, seen=None):
    seen = seen if seen is not None else set()
    seen.add(start)
    order = [start]
    for v in graph[start]:
        if v not in seen:
            order += dfs_order(graph, v, seen)
    return order

def count_components(n, graph):
    seen, count = set(), 0
    for u in range(n):
        if u not in seen:
            count += 1                     # a new component starts here
            dfs_order(graph, u, seen)
    return count

g = build(7, [(0, 1), (0, 2), (1, 3), (1, 6), (4, 5)])
print(bfs_distances(g, 0))
print(dfs_order(g, 0), count_components(7, g))
```

```output
{0: 0, 1: 1, 2: 1, 3: 2, 6: 2}
[0, 1, 3, 6, 2] 2
```

Cycle detection, undirected and directed:

```python
def has_cycle_undirected(n, edges):
    graph = [[] for _ in range(n)]
    for a, b in edges:
        graph[a].append(b)
        graph[b].append(a)
    seen = set()

    def dfs(u, parent):
        seen.add(u)
        for v in graph[u]:
            if v == parent:
                continue                   # the edge we came in on is not a cycle
            if v in seen or dfs(v, u):
                return True
        return False

    return any(u not in seen and dfs(u, -1) for u in range(n))

def has_cycle_directed(graph):             # graph: node -> list of nodes
    WHITE, GREY, BLACK = 0, 1, 2           # unseen / on the current path / finished
    color = {u: WHITE for u in graph}

    def dfs(u):
        color[u] = GREY
        for v in graph[u]:
            if color[v] == GREY:           # back to the current path: a cycle
                return True
            if color[v] == WHITE and dfs(v):
                return True
        color[u] = BLACK
        return False

    return any(color[u] == WHITE and dfs(u) for u in graph)

print(has_cycle_undirected(4, [(0, 1), (1, 2), (2, 3)]), has_cycle_undirected(3, [(0, 1), (1, 2), (2, 0)]))
print(has_cycle_directed({"a": ["b"], "b": ["c"], "c": []}), has_cycle_directed({"a": ["b"], "b": ["c"], "c": ["a"]}))
```

```output
False True
False True
```

Bellman-Ford (works with negative weights, and finds negative cycles):

```python
def bellman_ford(n, edges, src):           # edges: (u, v, weight)
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    for _ in range(n - 1):                 # a shortest path uses at most n - 1 edges
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
    for u, v, w in edges:                  # still improving? then a negative cycle exists
        if dist[u] + w < dist[v]:
            return None
    return dist

print(bellman_ford(4, [(0, 1, 4), (0, 2, 5), (2, 1, -3), (1, 3, 2)], 0))
print(bellman_ford(3, [(0, 1, 1), (1, 2, -2), (2, 1, 1)], 0))
```

```output
[0, 2, 5, 4]
None
```

## Time and space

| Algorithm | Time | Space |
| --- | --- | --- |
| BFS / DFS | O(V + E) | O(V) |
| Connected components | O(V + E) | O(V) |
| Topological sort | O(V + E) | O(V) |
| Dijkstra (heap) | O((V + E) log V) | O(V) |
| Bellman-Ford | O(V × E) | O(V) |
| Adjacency list / matrix storage | O(V + E) / O(V²) | |

## Common mistakes

- No `visited` set: infinite loops.
- Building only one direction for an undirected graph.
- Forgetting nodes with no edges (count them as their own component).
- BFS for weighted shortest paths (wrong) or Dijkstra with negative weights (wrong).
- Deep recursion on big graphs (10⁵ nodes in a line). Use an explicit stack.

## Patterns that use it

**Graph BFS**, **graph DFS**, **topological sort**, **union-find**, **Dijkstra**, **MST**. Grids are graphs too (each cell connects to 4 neighbours).

## Practice

```practice
find-if-path-exists-in-graph
number-of-provinces
clone-graph
course-schedule
graph-valid-tree
network-delay-time
cheapest-flights-within-k-stops
word-ladder
```

## Explain it back

```explain
Why does BFS give shortest paths in an unweighted graph, but not with weights?
How do you count connected components?
Why does the undirected cycle check skip the parent?
What does the extra round in Bellman-Ford detect?
```

## Flashcards

```flashcards
Best default graph storage? :: An adjacency list: graph[u] = neighbours. O(V + E) space.
BFS/DFS cost? :: O(V + E)
Shortest path, unweighted? :: BFS.
Shortest path, non-negative weights? :: Dijkstra with a heap.
Shortest path, negative weights? :: Bellman-Ford (V - 1 rounds of relaxing every edge).
Directed cycle check? :: DFS with colours; reaching a grey node means a cycle.
```
