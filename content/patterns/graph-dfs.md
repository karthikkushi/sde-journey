---
id: graph-dfs
name: Graph DFS (islands, components)
group: Graphs
---

## Clues

```clues
Count islands or connected groups
Flood fill
Can I reach X from Y?
Clone a graph
Explore everything connected to a cell or node
```

## Idea

From a start, go as deep as you can, then come back and try the next branch. Mark what you visit so you never visit it twice. Each new unvisited start is a new component (island).

## Template

```python
def count_islands(grid):
    rows, cols = len(grid), len(grid[0])

    def sink(r, c):                          # visit one island, turn it into water
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            sink(r + dr, c + dc)

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                islands += 1                 # a new island: sink all of it
                sink(r, c)
    return islands

def reachable(graph, start):                 # the same idea with your own stack
    seen, stack = {start}, [start]
    while stack:
        node = stack.pop()
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                stack.append(nxt)
    return seen

grid = [list("11000"), list("11000"), list("00100"), list("00011")]
print(count_islands(grid), sorted(reachable({0: [1], 1: [0, 2], 2: [1], 3: []}, 0)))
```

```output
3 [0, 1, 2]
```

## Walkthrough: Number of Islands

1. Scan every cell.
2. When you find land that is not visited, count a new island.
3. DFS from it and mark every connected land cell as visited (here: turn it into water).

## Traps

- Forgetting to mark visited: infinite recursion.
- Deep grids (like 300 × 300 all land) can pass Python's recursion limit. Use your own stack (`reachable` above) if needed.
- Mixing up rows and columns in the bounds check.
