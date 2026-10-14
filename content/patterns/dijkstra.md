---
id: dijkstra
name: Dijkstra (shortest path, weighted)
group: Graphs
---

## Clues

```clues
Shortest path where edges have weights (no negative weights)
Network delay time
Cheapest or fastest route
Path with minimum effort (the cost is the biggest step)
```

## Idea

Like BFS, but always expand the node with the **smallest distance so far**. A min-heap gives that node in O(log n). Once a node is popped with its smallest distance, that distance is final.

## Template

```python
import heapq

def dijkstra(graph, start):                # graph: node -> [(neighbour, weight)]
    dist = {start: 0}
    heap = [(0, start)]                     # (distance so far, node)
    while heap:
        d, node = heapq.heappop(heap)
        if d > dist.get(node, float("inf")):
            continue                        # an old, longer entry: skip it
        for nxt, w in graph[node]:
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(heap, (nd, nxt))
    return dist

graph = {"A": [("B", 4), ("C", 1)], "C": [("B", 2), ("D", 7)], "B": [("D", 1)], "D": []}
print(dijkstra(graph, "A"))
```

```output
{'A': 0, 'B': 3, 'C': 1, 'D': 4}
```

## Walkthrough: Network Delay Time

1. Build the graph from the edge list.
2. Run Dijkstra from the start node `k`.
3. If some node was never reached, return -1. Otherwise, the answer is the biggest distance (the last node to get the signal).

## Traps

- Negative weights: Dijkstra gives wrong answers. Use Bellman-Ford.
- Forgetting the "skip old entries" check: still correct, but slower.
- With a limit on the number of stops (Cheapest Flights), plain Dijkstra is wrong. Add stops to the state, or use Bellman-Ford with k rounds.
