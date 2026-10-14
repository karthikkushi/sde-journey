---
id: d-dp-2d
title: Dynamic programming 2 (2D and grids)
level: core
phase: 3
week: 29
tags: [dsa, dp, grid]
estMinutes: 35
---

## What it is

In 2D DP the state needs **two numbers**: a cell `(r, c)` in a grid, or two positions `(i, j)` in two strings.
`dp[r][c]` is the answer for "reaching cell (r, c)" or "the first i and j characters".
You fill the table row by row, so each cell only uses cells that are already done.

## Real-life example

Walking through a city grid from home (top-left) to office (bottom-right), only going right or down. The number of ways to reach any corner = ways to reach the corner above it + ways to reach the corner to its left.

## Picture

```text
 unique paths with an obstacle (X):

   1   1   1
   1   X   1       dp[r][c] = from above + from the left
   1   1   2       an obstacle cell has 0 ways
```

## How it works inside

- **State**: `dp[r][c]` with a one-sentence meaning ("fewest coins of cost to reach (r, c)").
- **Transition**: look at where you could have come from (above and left; or the diagonal for two strings).
- **Base**: the first row and first column often have only one way in. Obstacles are 0.
- **Order**: rows top to bottom, columns left to right (when you come from above and left).
- **Space**: you usually need only the previous row, so keep **one row** and update it in place: O(cols).
- When moves go in **all 4 directions** (like "longest increasing path"), a fixed order does not work. Use **memoized DFS**: `dfs(r, c)` caches its answer. It works because the "increasing" rule means no cycles.

## Python, step by step

Unique paths with obstacles, keeping just one row:

```python
def paths_with_obstacles(grid):
    cols = len(grid[0])
    dp = [0] * cols
    dp[0] = 1                                   # one way to stand at the start
    for row in grid:
        for c in range(cols):
            if row[c] == 1:
                dp[c] = 0                       # an obstacle: no way through
            elif c > 0:
                dp[c] += dp[c - 1]              # dp[c] (from above) + dp[c-1] (from the left)
    return dp[-1]

print(paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))
```

```output
2
```

Cheapest path, one row:

```python
def min_path_sum(grid):
    cols = len(grid[0])
    dp = [float("inf")] * cols
    dp[0] = 0
    for row in grid:
        dp[0] += row[0]                         # first column: only from above
        for c in range(1, cols):
            dp[c] = min(dp[c], dp[c - 1]) + row[c]   # from above or from the left
    return dp[-1]

print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
```

```output
7
```

Moves in 4 directions: memoized DFS (longest increasing path):

```python
from functools import cache

def longest_increasing_path(m):
    rows, cols = len(m), len(m[0])

    @cache
    def dfs(r, c):                              # longest path starting at (r, c)
        best = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and m[nr][nc] > m[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        return best

    return max(dfs(r, c) for r in range(rows) for c in range(cols))

print(longest_increasing_path([[9, 9, 4], [6, 6, 8], [2, 1, 1]]))
```

```output
4
```

Biggest square of 1s (`dp[r][c]` = side of the square whose bottom-right corner is here):

```python
def maximal_square(matrix):
    rows, cols = len(matrix), len(matrix[0])
    dp = [[0] * (cols + 1) for _ in range(rows + 1)]
    best = 0
    for r in range(1, rows + 1):
        for c in range(1, cols + 1):
            if matrix[r - 1][c - 1] == "1":
                dp[r][c] = 1 + min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1])
                best = max(best, dp[r][c])
    return best * best

print(maximal_square([list("10100"), list("10111"), list("11111"), list("10010")]))
```

```output
4
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| Unique paths / min path sum (R × C) | O(R × C) | O(C) with one row |
| Longest increasing path | O(R × C) | O(R × C) memo |
| Maximal square | O(R × C) | O(R × C) (O(C) possible) |
| Two strings of length a and b | O(a × b) | O(b) with one row |

## Common mistakes

- `[[0] * cols] * rows` (shared rows).
- Mixing up which neighbour is "above" when using one row (`dp[c]` before you overwrite it).
- Forgetting obstacle cells or the first row/column.
- Using a fixed loop order when moves go in all directions (use memoized DFS).

## Patterns that use it

**DP 2D / grid**, **DP on strings** (LCS, edit distance), **memoized DFS on grids**.

## Practice

```practice
unique-paths
unique-paths-ii
minimum-path-sum
triangle
maximal-square
longest-increasing-path-in-a-matrix
longest-common-subsequence
```

## Explain it back

```explain
In unique paths, why is dp[r][c] = dp[r-1][c] + dp[r][c-1]?
How does keeping one row work? Which value is "above" and which is "left"?
Why can longest increasing path use memoized DFS without getting stuck in cycles?
```

## Flashcards

```flashcards
Grid paths transition? :: dp[r][c] = from above + from the left.
One-row trick? :: dp[c] still holds the value from above; dp[c-1] is the new left value.
Moves in 4 directions? :: Memoized DFS, not a fixed loop order.
Maximal square transition? :: 1 + min(above, left, above-left) when the cell is 1.
Time for an R × C grid DP? :: O(R × C)
```
