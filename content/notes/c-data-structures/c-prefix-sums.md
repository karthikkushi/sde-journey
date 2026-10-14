---
id: c-prefix-sums
title: Prefix sums
level: core
phase: 2
week: 8
tags: [dsa, prefix-sum, arrays]
estMinutes: 20
---

## What it is

A prefix sum array stores the **running total**: `prefix[i]` = sum of the first i items.
After building it once (O(n)), the sum of **any** range is one subtraction: O(1).
The same idea works in reverse (a **difference array**) for many range **updates**.

## Real-life example

A cricket scoreboard shows the total after every over: 4, 4, 10, 11, 15.
"How many runs in overs 2 to 4?" You do not add the overs again. Total after over 4 (11) minus total after over 1 (4) = 7.

## Picture

```text
runs per over:      4    0    6    1    4
prefix:        0    4    4   10   11   15
               ↑                   ↑
           before over 1     after over 4

runs in overs 2..4 = prefix[4] - prefix[1] = 11 - 4 = 7
```

## How it works inside

- Build: `prefix[0] = 0`, then `prefix[i + 1] = prefix[i] + nums[i]`. The list has **n + 1** items; the leading 0 removes special cases.
- Range sum of `nums[i..j]` (both included) = `prefix[j + 1] - prefix[i]`.
- With a **dict of prefix values seen so far**, you can count subarrays with sum k in one pass (see the Prefix sum pattern).
- **Difference array**: to add `x` to every item in `[l..r]`, do `diff[l] += x` and `diff[r + 1] -= x`. After all updates, one running total turns `diff` into the final array. k updates cost O(k + n) instead of O(k × n).
- **2D prefix sums**: `P[r][c]` = sum of the rectangle from (0,0) to (r−1, c−1). Any rectangle sum is four lookups.
- Works for sums (and XOR, counts). It does **not** work for max or min of a range (use a segment tree or a sparse table for that).

## Python, step by step

Build and query:

```python
from itertools import accumulate

runs = [4, 0, 6, 1, 4]                          # runs per over
prefix = [0] + list(accumulate(runs))           # prefix[i] = runs in the first i overs
print(prefix)
print("overs 2 to 4:", prefix[4] - prefix[1])   # runs[1] + runs[2] + runs[3]
```

```output
[0, 4, 4, 10, 11, 15]
overs 2 to 4: 7
```

A difference array for many range updates (seat bookings on flights):

```python
from itertools import accumulate

def apply_bookings(n, bookings):         # each booking: (first, last, seats), 0-based, inclusive
    diff = [0] * (n + 1)
    for first, last, seats in bookings:
        diff[first] += seats             # start adding here
        diff[last + 1] -= seats          # stop adding after last
    return list(accumulate(diff))[:n]    # one running total gives the final counts

print(apply_bookings(5, [(0, 1, 10), (1, 2, 20), (1, 4, 25)]))
```

```output
[10, 55, 45, 25, 25]
```

2D prefix sums: any rectangle in O(1):

```python
def build_2d(grid):
    rows, cols = len(grid), len(grid[0])
    P = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            P[r + 1][c + 1] = grid[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c]
    return P

def box_sum(P, r1, c1, r2, c2):          # sum of grid[r1..r2][c1..c2], inclusive
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]

grid = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
P = build_2d(grid)
print(box_sum(P, 0, 0, 2, 2), box_sum(P, 1, 1, 2, 2))
```

```output
45 28
```

## Time and space

| Operation | Time | Space |
| --- | --- | --- |
| Build 1D prefix | O(n) | O(n) |
| Range sum query | O(1) | |
| k range updates with a difference array | O(k + n) | O(n) |
| Build 2D prefix | O(R × C) | O(R × C) |
| Rectangle sum query | O(1) | |

## Common mistakes

- Off by one: forgetting the leading 0, or using `prefix[j] - prefix[i]` (that leaves out `nums[j]`).
- Building the prefix again inside a loop of queries (O(n) per query).
- Using it for range **max/min**: subtraction does not undo a max.
- In 2D, forgetting to add back `P[r1][c1]` (it was subtracted twice).

## Patterns that use it

**Prefix sum** (subarray sum equals K, pivot index), **prefix + hash map**, **difference array** (car pooling, bookings), **2D prefix** (range sum query 2D).

## Practice

```practice
running-sum-of-1d-array
range-sum-query-immutable
find-pivot-index
product-of-array-except-self
subarray-sum-equals-k
contiguous-array
car-pooling
path-sum-iii
```

## Explain it back

```explain
Explain prefix sums with a cricket scoreboard.
Why does the prefix list start with 0?
How does a difference array make many range updates cheap?
Why can prefix sums not answer "maximum in a range"?
```

## Flashcards

```flashcards
prefix[i] means? :: The sum of the first i items (prefix[0] = 0).
Sum of nums[i..j] inclusive? :: prefix[j + 1] - prefix[i]
Add x to every item in [l..r] cheaply? :: diff[l] += x; diff[r + 1] -= x; then a running total.
Rectangle sum with 2D prefix? :: P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]
Build cost and query cost of prefix sums? :: Build O(n), each query O(1).
Can prefix sums give range max? :: No. Use a segment tree.
```
