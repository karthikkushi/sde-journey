---
id: d-backtracking
title: Recursion and backtracking
level: core
phase: 2
week: 20
tags: [dsa, backtracking, recursion]
estMinutes: 35
---

## What it is

Backtracking builds answers **one choice at a time**. After exploring a choice, it **undoes** it and tries the next one.
It is how you list all subsets, permutations and combinations, or solve puzzles like N-Queens and Sudoku.
**Pruning** (stopping early on paths that cannot work) is what makes it fast enough.

## Real-life example

Packing a tiffin from 4 dishes: you try "dal + rice", then take out the rice and try "dal + roti", then take out the dal... You go back one step and try the next option. That is backtracking.

## Picture

```text
 subsets of [1, 2, 3]: each level decides "which next number?"

                       []
          ┌────────────┼────────────┐
         [1]          [2]          [3]
       ┌──┴──┐         │
    [1,2]  [1,3]     [2,3]
      │
   [1,2,3]

 choose → explore → un-choose, at every edge
```

## How it works inside

The template has three parts:

1. **Done?** If the path is a complete answer, save a **copy** (`path[:]`).
2. **Choices**: loop over the options available from here.
3. For each choice: **choose** (append), **explore** (recurse), **un-choose** (pop).

How the three classics differ:
- **Subsets**: save the path at **every** node; loop `i` from `start`; recurse with `i + 1`.
- **Combinations of size k**: save only when `len(path) == k`.
- **Permutations**: any unused item can come next; keep a `used` list.
- **Combination sum (reuse allowed)**: recurse with `i` (not `i + 1`).
- **Input with duplicates**: sort first, then skip `nums[i] == nums[i - 1]` when `i > start`.

**Pruning**: stop a branch as soon as it cannot work (the sum is already too big; a queen is attacked). In N-Queens, sets of used columns and diagonals make each check O(1).

**Cost**: subsets 2ⁿ, permutations n!, so this only works for small n (about ≤ 20 for subsets, ≤ 10 for permutations).

## Python, step by step

Combinations, and combination sum with pruning:

```python
def combinations(n, k):
    out, path = [], []
    def bt(start):
        if len(path) == k:
            out.append(path[:])               # complete: save a copy
            return
        for x in range(start, n + 1):
            path.append(x)                    # choose
            bt(x + 1)                         # explore (x + 1: no reuse, no reorder)
            path.pop()                        # un-choose
    bt(1)
    return out

def combination_sum(candidates, target):
    candidates.sort()
    out, path = [], []
    def bt(start, remaining):
        if remaining == 0:
            out.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remaining:
                break                         # prune: sorted, so everything after is too big
            path.append(candidates[i])
            bt(i, remaining - candidates[i])  # i, not i + 1: the same number can repeat
            path.pop()
    bt(0, target)
    return out

print(combinations(4, 2))
print(combination_sum([2, 3, 6, 7], 7))
```

```output
[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
[[2, 2, 3], [7]]
```

Subsets when the input has duplicates:

```python
def subsets_with_dup(nums):
    nums.sort()
    out, path = [], []
    def bt(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue                      # the same value at the same level: skip
            path.append(nums[i])
            bt(i + 1)
            path.pop()
    bt(0)
    return out

print(subsets_with_dup([1, 2, 2]))
```

```output
[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]
```

N-Queens with O(1) attack checks:

```python
def solve_n_queens(n):
    boards, cols, diag1, diag2 = [], set(), set(), set()
    queens = []                               # queens[r] = column of the queen in row r
    def bt(r):
        if r == n:
            boards.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue                      # attacked: prune
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            queens.append(c)
            bt(r + 1)
            queens.pop()
            cols.remove(c); diag1.remove(r - c); diag2.remove(r + c)
    bt(0)
    return boards

boards = solve_n_queens(4)
print(len(boards))
print("\n".join(boards[0]))
```

```output
2
.Q..
...Q
Q...
..Q.
```

## Time and space

| Problem | Time | Space (stack + path) |
| --- | --- | --- |
| Subsets | O(n · 2ⁿ) | O(n) |
| Permutations | O(n · n!) | O(n) |
| Combinations C(n, k) | O(k · C(n, k)) | O(k) |
| N-Queens | about O(n!) with pruning | O(n) |

## Common mistakes

- Saving `path` instead of `path[:]` (all saved answers become the same list).
- Forgetting to un-choose (pop, or remove from the sets).
- Using `i + 1` when reuse is allowed, or `i` when it is not.
- Skipping duplicates with `i > 0` instead of `i > start` (that skips valid answers).
- No pruning: correct but too slow.

## Patterns that use it

**Backtracking** (subsets, permutations, combinations, N-Queens, word search, palindrome partitioning, generate parentheses), and the first step of **DP** (recursion before memo).

## Practice

```practice
subsets
combinations
permutations
combination-sum
subsets-ii
combination-sum-ii
palindrome-partitioning
n-queens
```

## Explain it back

```explain
Explain choose, explore, un-choose with the tiffin example.
What is different in the code for subsets, combinations and permutations?
How does sorting help skip duplicate answers?
Why is pruning important? Give an example.
```

## Flashcards

```flashcards
Backtracking template? :: If complete: save a copy. For each choice: choose, recurse, un-choose.
Why path[:]? :: To save a copy; path keeps changing.
Reuse allowed (combination sum)? :: Recurse with i, not i + 1.
Skip duplicates? :: Sort; skip nums[i] == nums[i-1] when i > start.
N-Queens diagonal keys? :: r - c and r + c.
Number of subsets of n items? :: 2^n
```
