---
id: dp-2d
name: DP 2D / grid
group: Dynamic programming
---

## Clues

```clues
Grid paths: count them, or find the cheapest, moving right or down
Two indexes (row and column, or i and j) describe the state
Longest increasing path in a matrix
Maximal square of 1s
```

## Idea

`dp[r][c]` = the answer for reaching cell (r, c). Each cell comes from its neighbours above and to the left, so fill row by row. One row of memory is often enough.

```text
unique paths, 3 x 4 grid:
 1  1  1  1
 1  2  3  4
 1  3  6 10      dp[r][c] = from above + from the left
```

## Template

```python
def unique_paths(rows, cols):
    dp = [[1] * cols for _ in range(rows)]          # first row and column: 1 way
    for r in range(1, rows):
        for c in range(1, cols):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]  # from above + from the left
    return dp[-1][-1]

def min_path_sum(grid):
    rows, cols = len(grid), len(grid[0])
    dp = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            if r == 0 and c == 0:
                dp[r][c] = grid[0][0]
            elif r == 0:
                dp[r][c] = dp[r][c - 1] + grid[r][c]
            elif c == 0:
                dp[r][c] = dp[r - 1][c] + grid[r][c]
            else:
                dp[r][c] = min(dp[r - 1][c], dp[r][c - 1]) + grid[r][c]
    return dp[-1][-1]

print(unique_paths(3, 7), min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))
```

```output
28 7
```

## Walkthrough: Maximal Square

1. `dp[r][c]` = side of the biggest all-1 square whose **bottom-right corner** is (r, c).
2. If the cell is 1: `dp[r][c] = 1 + min(above, left, above-left)`.
3. The answer is the biggest `dp` value, squared.

## Traps

- Building the grid with `[[0] * cols] * rows` (shared rows).
- Forgetting the first row and column.
- Mixing up `rows` and `cols`.
