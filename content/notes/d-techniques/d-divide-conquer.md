---
id: d-divide-conquer
title: Divide and conquer
level: core
phase: 2
week: 18
tags: [dsa, divide-and-conquer, recursion]
estMinutes: 25
---

## What it is

Divide and conquer has three steps: **divide** the problem into smaller parts, **solve** each part (usually by recursion), and **combine** the answers.
Merge sort, quick sort, binary search and fast power all work this way.
The combine step is where the clever part usually is.

## Real-life example

Counting votes in an election: each booth counts its own votes (solve), district officers add up their booths (combine), and the state adds up the districts.
No single person counts every vote, and many people work at the same time.

## Picture

```text
 count inversions in [2, 4, 1, 3, 5]   (pairs where a bigger number comes before a smaller one)

          [2, 4, 1, 3, 5]
          /             \
     [2, 4]           [1, 3, 5]        solve each half
     0 inside         0 inside
          \             /
   merge: when 1 (right) is placed before 2 and 4 (left), it jumps over 2 left items → +2
          when 3 is placed before 4, it jumps over 1 left item               → +1
   total = 0 + 0 + 3 = 3
```

## How it works inside

- **Divide**: usually split in half (by index, or by a pivot).
- **Base case**: a size you can answer directly (0 or 1 item).
- **Combine**: merge two sorted lists, add two counts, pick the better of two answers...
- **Cost**: a rough rule (the "master theorem"):
  - Two halves + O(n) combine → `T(n) = 2T(n/2) + n` → **O(n log n)** (merge sort).
  - One half + O(1) work → `T(n) = T(n/2) + 1` → **O(log n)** (binary search, fast power).
  - Two halves + O(1) work → **O(n)** (sum of a tree's values).
- The recursion tree has about log n levels. If each level does O(n) work in total, you get O(n log n).
- Divide and conquer helps when the parts are **independent**. When the same small parts repeat many times, add memoization: that is **dynamic programming**.

## Python, step by step

Count inversions while merge-sorting (O(n log n) instead of checking all pairs):

```python
def sort_and_count(a):
    if len(a) <= 1:
        return a, 0
    mid = len(a) // 2
    left, inv_left = sort_and_count(a[:mid])
    right, inv_right = sort_and_count(a[mid:])
    merged, i, j, cross = [], 0, 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i])
            i += 1
        else:
            merged.append(right[j])
            cross += len(left) - i          # right[j] is smaller than every remaining left item
            j += 1
    merged += left[i:] + right[j:]
    return merged, inv_left + inv_right + cross

print(sort_and_count([2, 4, 1, 3, 5]))
print(sort_and_count([5, 4, 3, 2, 1])[1])   # fully reversed: every pair, 5*4/2
```

```output
([1, 2, 3, 4, 5], 3)
10
```

Build a balanced BST from a sorted list (the middle becomes the root):

```python
class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def to_bst(nums):
    if not nums:
        return None
    mid = len(nums) // 2
    return Node(nums[mid], to_bst(nums[:mid]), to_bst(nums[mid + 1:]))   # divide, solve, combine

def preorder(n):
    return [n.val] + preorder(n.left) + preorder(n.right) if n else []

print(preorder(to_bst([-10, -3, 0, 5, 9])))
```

```output
[0, -3, -10, 9, 5]
```

Maximum subarray by divide and conquer (the best is in the left half, the right half, or crosses the middle):

```python
def max_sub(a, lo, hi):
    if lo == hi:
        return a[lo]
    mid = (lo + hi) // 2
    best_left_end = float("-inf")
    total = 0
    for i in range(mid, lo - 1, -1):         # best sum ending at mid
        total += a[i]
        best_left_end = max(best_left_end, total)
    best_right_start = float("-inf")
    total = 0
    for i in range(mid + 1, hi + 1):         # best sum starting at mid + 1
        total += a[i]
        best_right_start = max(best_right_start, total)
    cross = best_left_end + best_right_start
    return max(max_sub(a, lo, mid), max_sub(a, mid + 1, hi), cross)

nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(max_sub(nums, 0, len(nums) - 1))
```

```output
6
```

## Time and space

| Problem | Recurrence | Time |
| --- | --- | --- |
| Merge sort / count inversions | 2T(n/2) + n | O(n log n) |
| Binary search / fast power | T(n/2) + 1 | O(log n) |
| Max subarray (D&C) | 2T(n/2) + n | O(n log n) (Kadane is O(n)) |
| Sorted list → BST | 2T(n/2) + slicing | O(n log n) with slices, O(n) with indexes |

## Common mistakes

- Missing or wrong base case (infinite recursion).
- Slicing in every call when indexes would do (extra copies).
- Forgetting the "crossing" case (max subarray, closest pair).
- Using divide and conquer where subproblems overlap a lot: add memo (DP).

## Patterns that use it

**Merge sort** and **quick sort**, **binary search**, **fast power**, **tree DFS** (each subtree is a smaller problem), building trees from traversals, counting inversions and reverse pairs.

## Practice

```practice
sort-an-array
convert-sorted-array-to-binary-search-tree
construct-binary-tree-from-preorder-and-inorder-traversal
powx-n
maximum-subarray
reverse-pairs
```

## Explain it back

```explain
Name the three steps of divide and conquer, using the election example.
Why does merge sort take O(n log n)? Think about the levels of the recursion tree.
How does merging also count inversions?
When should divide and conquer become dynamic programming?
```

## Flashcards

```flashcards
Three steps? :: Divide, solve the parts (recursively), combine.
2T(n/2) + O(n) gives? :: O(n log n)
T(n/2) + O(1) gives? :: O(log n)
Count inversions trick? :: While merging, a right item placed before k left items adds k.
D&C with repeating subproblems? :: Add memoization: it becomes dynamic programming.
```
