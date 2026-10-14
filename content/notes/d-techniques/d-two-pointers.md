---
id: d-two-pointers
title: Two pointers
level: core
phase: 2
week: 10
tags: [dsa, two-pointers, arrays]
estMinutes: 30
---

## What it is

Two pointers means walking an array (or two arrays) with **two indexes** at once, instead of trying every pair.
Each step moves one pointer and **throws away** options that can never be the answer. So O(n²) pair checks become O(n).
Three shapes: from **both ends** inwards, **same direction** (read/write, slow/fast), and **one pointer per array**.

## Real-life example

Two friends searching a sorted price list for two items that cost exactly ₹100 together. One starts at the cheapest, the other at the costliest. Too expensive? The costly friend moves down. Too cheap? The cheap friend moves up. They never check the same pair twice.

## Picture

```text
 both ends:      [1  3  4  6  8  11]       L →          ← R
 same direction: [0  1  0  3  12]          write ≤ read, both only move right
 two arrays:     [1  2  2  3]  [2  2  4]   i walks A, j walks B (like merging)
```

## How it works inside

- **Why it is correct (both ends, sorted)**: if `a[L] + a[R]` is too small, then `a[L]` with **any** remaining number is too small (all are ≤ `a[R]`). So `a[L]` can be thrown away. The same logic throws away `a[R]` when the sum is too big.
- **Same direction**: `read` looks at every item; `write` marks where the next kept item goes. Used for in-place removal, dedupe, move zeroes, and partitioning.
- **Two arrays**: move the pointer at the smaller value. This is the merge step of merge sort, and also intersection of sorted arrays.
- **Three pointers**: Dutch national flag (sort 0s, 1s, 2s in one pass): `low`, `mid`, `high`.
- **3Sum** = sort, fix one number, then two pointers on the rest. Skip equal values to avoid duplicate triplets.
- **Trapping rain water**: water above a bar depends on the smaller of the tallest bars on the left and right. Move the side with the smaller max: that side's answer is already known.

## Python, step by step

3Sum without duplicates:

```python
def three_sum(nums):
    nums.sort()
    out = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                            # same first number: skip duplicates
        lo, hi = i + 1, len(nums) - 1
        while lo < hi:
            s = nums[i] + nums[lo] + nums[hi]
            if s < 0:
                lo += 1
            elif s > 0:
                hi -= 1
            else:
                out.append([nums[i], nums[lo], nums[hi]])
                lo += 1
                while lo < hi and nums[lo] == nums[lo - 1]:
                    lo += 1                     # skip equal second numbers
    return out

print(three_sum([-1, 0, 1, 2, -1, -4]))
```

```output
[[-1, -1, 2], [-1, 0, 1]]
```

Three pointers: sort 0s, 1s and 2s in one pass:

```python
def sort_colors(a):
    low, mid, high = 0, 0, len(a) - 1    # a[:low] = 0s, a[low:mid] = 1s, a[high+1:] = 2s
    while mid <= high:
        if a[mid] == 0:
            a[low], a[mid] = a[mid], a[low]
            low += 1
            mid += 1
        elif a[mid] == 1:
            mid += 1
        else:
            a[mid], a[high] = a[high], a[mid]   # do not move mid: the swapped-in value is unchecked
            high -= 1
    return a

print(sort_colors([2, 0, 2, 1, 1, 0]))
```

```output
[0, 0, 1, 1, 2, 2]
```

Two arrays, and trapping rain water:

```python
def intersect_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        if a[i] == b[j]:
            out.append(a[i])
            i += 1
            j += 1
        elif a[i] < b[j]:
            i += 1                          # move the pointer at the smaller value
        else:
            j += 1
    return out

def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = water = 0
    while l < r:
        if height[l] < height[r]:           # the left side is the limit
            left_max = max(left_max, height[l])
            water += left_max - height[l]
            l += 1
        else:
            right_max = max(right_max, height[r])
            water += right_max - height[r]
            r -= 1
    return water

print(intersect_sorted([1, 2, 2, 3, 5], [2, 2, 4, 5]), trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))
```

```output
[2, 2, 5] 6
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| Pair sum in a sorted array | O(n) | O(1) |
| 3Sum | O(n²) (after an O(n log n) sort) | O(1) extra |
| Sort colors | O(n) | O(1) |
| Intersection of two sorted arrays | O(a + b) | O(1) extra |
| Trapping rain water | O(n) | O(1) |

## Common mistakes

- Using both-ends pointers on an **unsorted** array.
- Forgetting to skip duplicates in 3Sum (or skipping them in the wrong place).
- In sort colors, moving `mid` after swapping with `high`.
- `while lo <= hi` in pair sum (pairs an item with itself).

## Patterns that use it

**Two pointers (opposite ends)**, **two pointers (same direction)**, **cyclic sort**, merging in **merge sort** and **K-way merge**, and the **sliding window** (a special same-direction case).

## Practice

```practice
valid-palindrome
two-sum-ii-input-array-is-sorted
3sum
container-with-most-water
sort-colors
intersection-of-two-arrays-ii
trapping-rain-water
boats-to-save-people
```

## Explain it back

```explain
Prove why moving the left pointer is safe when the sum is too small.
In sort colors, why do we not move mid after swapping with high?
Explain trapping rain water: why can we decide the side with the smaller maximum?
```

## Flashcards

```flashcards
Why is two pointers O(n)? :: Each step throws away one candidate for good.
Pair sum in a sorted array, sum too small? :: Move the left pointer right.
3Sum outline? :: Sort, fix one number, two pointers on the rest, skip duplicates.
Dutch flag pointers? :: low, mid, high for 0s, 1s, 2s.
Intersection of two sorted arrays? :: Move the pointer at the smaller value; equal → take it.
Trapping water: which side moves? :: The side with the smaller height (its water is decided).
```
