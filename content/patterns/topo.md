---
id: topo
name: Topological sort
group: Graphs
---

## Clues

```clues
Tasks with prerequisites or dependencies
Course schedule: can I finish? In which order?
Build order of packages
Is there a cycle in a directed graph?
Alien dictionary (letter order)
```

## Idea

**Kahn's algorithm**: count how many prerequisites each node still waits for (its **in-degree**). Start with nodes that wait for nothing. Each time you "finish" a node, lower the count of the nodes that depended on it. If you cannot finish every node, there is a cycle.

## Template

```python
from collections import deque

def course_order(n, prereqs):              # each pair: [course, needs]
    graph = {i: [] for i in range(n)}
    indegree = [0] * n                      # how many courses each one still waits for
    for course, needs in prereqs:
        graph[needs].append(course)
        indegree[course] += 1
    queue = deque(i for i in range(n) if indegree[i] == 0)
    order = []
    while queue:
        c = queue.popleft()
        order.append(c)
        for nxt in graph[c]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    return order if len(order) == n else []   # fewer than n: a cycle

print(course_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]]), course_order(2, [[0, 1], [1, 0]]))
```

```output
[0, 1, 2, 3] []
```

## Walkthrough: Course Schedule

1. Build the graph: an edge from `needs` to `course`.
2. Run Kahn's algorithm and count how many courses you could take.
3. If that count equals `n`, every course can be finished. Otherwise, a cycle blocks some.

## Traps

- Edge direction backwards (course → needs instead of needs → course).
- Forgetting nodes with no edges at all (build `graph` for every node).
- On an undirected graph, in-degree does not work. Use union-find or DFS with a parent.
