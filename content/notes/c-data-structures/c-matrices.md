---
id: c-matrices
title: Matrices (2D grids)
level: core
phase: 3
week: 37
tags: [dsa, matrix, grid, arrays]
estMinutes: 20
---

## What it is

A matrix is a grid of rows and columns. In Python it is a **list of lists**: `grid[r][c]` is row r, column c.
Many problems are grids: game boards, maps of islands, images, seat layouts.
The tricky parts are staying inside the edges and visiting cells in the right order.

## Real-life example

A train's seat chart: coach rows and seat columns. "Row 3, seat 2" is `grid[3][2]`.
Or an Excel sheet. Moving "up, down, left, right" from one cell is how islands and paths are explored.

## Picture

```text
          c=0  c=1  c=2
   r=0  [  1    2    3 ]       grid[1][2] = 6
   r=1  [  4    5   (6)]
   r=2  [  7    8    9 ]

   neighbours of (1,1):  up (0,1)  down (2,1)  left (1,0)  right (1,2)
```

## How it works inside

- `grid` is a list of row lists. `len(grid)` = number of rows, `len(grid[0])` = number of columns.
- Make a grid with a comprehension: `[[0] * cols for _ in range(rows)]`. Never `[[0] * cols] * rows` (all rows would be the same list).
- The 4 directions are pairs `(dr, dc)`: `(-1, 0)` up, `(1, 0)` down, `(0, -1)` left, `(0, 1)` right. Add them to `(r, c)` and **check the bounds**.
- Rotating a square matrix 90° clockwise = **transpose** (swap across the diagonal) + **reverse every row**.
- Spiral order uses four borders (`top`, `bottom`, `left`, `right`) that move inwards.
- A grid of R × C cells is often treated as a **graph** where each cell connects to its neighbours (BFS and DFS).

## Python, step by step

Neighbours inside the grid:

```python
def neighbours(grid, r, c):
    rows, cols = len(grid), len(grid[0])
    for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):    # up, down, left, right
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:             # stay inside the grid
            yield nr, nc

grid = [[0] * 3 for _ in range(3)]
print(list(neighbours(grid, 0, 0)), len(list(neighbours(grid, 1, 1))))
```

```output
[(1, 0), (0, 1)] 4
```

Rotate 90° clockwise, in place:

```python
def rotate(m):
    n = len(m)
    for r in range(n):
        for c in range(r + 1, n):
            m[r][c], m[c][r] = m[c][r], m[r][c]   # transpose: swap across the diagonal
    for row in m:
        row.reverse()                              # then reverse every row
    return m

print(rotate([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
```

```output
[[7, 4, 1], [8, 5, 2], [9, 6, 3]]
```

Spiral order with four moving borders:

```python
def spiral(m):
    out = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):          # left to right along the top
            out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):          # down the right side
            out.append(m[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):  # right to left along the bottom
                out.append(m[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):  # up the left side
                out.append(m[r][left])
            left += 1
    return out

print(spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
print(spiral([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]))
```

```output
[1, 2, 3, 6, 9, 8, 7, 4, 5]
[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]
```

Row and column sums:

```python
grid = [[1, 2, 3], [4, 5, 6]]
row_sums = [sum(row) for row in grid]
col_sums = [sum(col) for col in zip(*grid)]   # zip(*grid) gives the columns
print(row_sums, col_sums)
```

```output
[6, 15] [5, 7, 9]
```

## Time and space

| Operation | Time | Space |
| --- | --- | --- |
| Read `grid[r][c]` | O(1) | |
| Visit every cell | O(R × C) | |
| Rotate n × n in place | O(n²) | O(1) |
| Spiral order | O(R × C) | O(1) extra (besides the answer) |
| BFS/DFS over a grid | O(R × C) | O(R × C) for visited |

## Common mistakes

- `[[0] * cols] * rows`: every row is the same list.
- Mixing up rows and columns: `grid[c][r]` instead of `grid[r][c]`.
- Forgetting the bounds check before reading a neighbour (negative indexes in Python do **not** crash; they silently read from the other end).
- Spiral: forgetting the `if top <= bottom` / `if left <= right` checks, so the middle row is added twice.

## Patterns that use it

**Graph BFS / DFS** on grids (islands, rotting oranges), **DP 2D / grid** (unique paths), **binary search** on a sorted matrix, **prefix sums 2D**.

## Practice

```practice
rotate-image
spiral-matrix
set-matrix-zeroes
search-a-2d-matrix
island-perimeter
valid-sudoku
count-negative-numbers-in-a-sorted-matrix
flood-fill
```

## Explain it back

```explain
Why must you check bounds before reading a neighbour in Python, even though grid[-1] does not crash?
How do transpose and reverse together rotate a matrix?
How does spiral order know when to stop?
```

## Flashcards

```flashcards
Number of rows and columns of grid? :: len(grid) and len(grid[0])
The 4 directions as pairs? :: (-1,0) up, (1,0) down, (0,-1) left, (0,1) right
Rotate n × n clockwise in place? :: Transpose, then reverse every row.
Columns of a grid in Python? :: zip(*grid)
Why is grid[-1][0] dangerous? :: It silently reads the last row instead of failing.
Cost of BFS over an R × C grid? :: O(R × C)
```
