---
id: graph-bfs
name: Graph BFS (shortest path, unweighted)
group: Graphs
---

## Clues

```clues
Shortest path or fewest steps in an unweighted graph or grid
Something spreads over time (rotting oranges, fire)
Multi-source: start from many cells at once
Word ladder (each word is a node)
```

## Idea

BFS explores in rings: first everything 1 step away, then 2 steps, and so on. So the first time you reach a cell, you reached it by the **shortest** path. Mark cells as seen **when you add them** to the queue.

## Template

```python
from collections import deque

def shortest_steps(grid, start, goal):        # 0 = open, 1 = wall
    rows, cols = len(grid), len(grid[0])
    queue = deque([(start, 0)])                # (cell, steps so far)
    seen = {start}
    while queue:
        (r, c), steps = queue.popleft()
        if (r, c) == goal:
            return steps
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 0 and (nr, nc) not in seen:
                seen.add((nr, nc))             # mark when you ADD to the queue
                queue.append(((nr, nc), steps + 1))
    return -1

grid = [[0, 0, 0],
        [1, 1, 0],
        [0, 0, 0]]
print(shortest_steps(grid, (0, 0), (2, 0)))
```

```output
6
```

## Walkthrough: Rotting Oranges

1. Put **every** rotten orange in the queue at the start (multi-source BFS).
2. Each BFS round is one minute. Rot the fresh neighbours and add them to the queue.
3. When the queue is empty, if any fresh orange is left, return -1. Otherwise, return the minutes.

## Traps

- Marking seen when you **pop** instead of when you **push**: the same cell gets added many times.
- Using DFS for shortest path. DFS finds **a** path, not the shortest.
- With weights, BFS is wrong. Use Dijkstra.
