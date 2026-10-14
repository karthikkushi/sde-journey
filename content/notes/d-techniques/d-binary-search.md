---
id: d-binary-search
title: Binary search (and search on the answer)
level: core
phase: 2
week: 13
tags: [dsa, binary-search]
estMinutes: 30
---

## What it is

Binary search finds something in O(log n) by **halving** the search range every step.
It does not only work on sorted arrays. It works whenever you can ask a yes/no question that is **false, false, ..., true, true** (monotonic) and you want the first true.
That one idea covers "find in a sorted array", "first bad version", "smallest speed that works" and more.

## Real-life example

Finding which day your phone's battery health started dropping: you check day 50. Fine? Then the problem started after day 50. Check day 75... In about 7 checks you cover 100 days.

## Picture

```text
 ok(x)?   F  F  F  F  T  T  T  T          we want the FIRST T
          lo                   hi
 mid = 3 → F → lo = mid + 1
                   lo          hi
 mid = 5 → T → hi = mid  (mid might be the answer)
                   lo    hi
 mid = 4 → T → hi = mid
                   lo/hi → answer 4
```

## How it works inside

- Keep an **invariant**: "the answer is inside [lo, hi]". Every step must keep it true while making the range smaller.
- Two safe templates. Pick one and always use it the same way:
  - **Closed** `[lo, hi]`, loop `while lo <= hi`, move with `lo = mid + 1` / `hi = mid - 1`. Good for "find this exact value".
  - **Half-open / first true** `[lo, hi)`, loop `while lo < hi`, move with `lo = mid + 1` / `hi = mid`. Good for "first position where a condition becomes true" (lower bound).
- **Search on the answer**: the range is not indexes but possible answers (speeds, capacities, days). Write `ok(x)` and binary search the smallest x where it is true. Check that `ok` is monotonic.
- **Rotated array**: compare `nums[mid]` with `nums[hi]` to know which half is normally sorted.
- **Real numbers**: loop until `hi - lo < tiny`, or a fixed number of times (100 halvings is plenty).
- Each step halves the range: about log₂(n) steps. A million items: about 20 steps.

## Python, step by step

One "first true" helper solves many problems:

```python
def first_true(lo, hi, ok):
    """Smallest x in [lo, hi] with ok(x) True, where ok is False...False, True...True.
    Returns hi + 1 if ok is never True."""
    hi += 1                         # search the half-open range [lo, hi)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid                # mid works: the answer is mid or to its left
        else:
            lo = mid + 1            # mid fails: the answer is to its right
    return lo

nums = [1, 3, 5, 7, 9]
print(first_true(0, len(nums) - 1, lambda i: nums[i] >= 6))      # first index with value >= 6
print(first_true(0, 50, lambda x: x * x > 50) - 1)                # whole square root of 50
bad_from = 37
print(first_true(1, 100, lambda v: v >= bad_from))                # first bad version
print(first_true(0, len(nums) - 1, lambda i: nums[i] >= 100))     # none: returns len(nums)
```

```output
3
7
37
5
```

Minimum of a rotated sorted array:

```python
def find_min_rotated(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1            # the drop (the minimum) is right of mid
        else:
            hi = mid                # mid itself could be the minimum
    return nums[lo]

print(find_min_rotated([4, 5, 6, 7, 0, 1, 2]), find_min_rotated([3, 1, 2]), find_min_rotated([1, 2, 3]))
```

```output
0 1 1
```

Binary search on real numbers:

```python
def cube_root(x, eps=1e-9):
    lo, hi = 0.0, max(1.0, x)
    while hi - lo > eps:
        mid = (lo + hi) / 2
        if mid ** 3 < x:
            lo = mid
        else:
            hi = mid
    return round(lo, 6)

print(cube_root(27), cube_root(2))
```

```output
3.0 1.259921
```

## Time and space

| Use | Time | Space |
| --- | --- | --- |
| Search a sorted array | O(log n) | O(1) |
| Search on the answer | O(log(range) × cost of ok) | O(1) |
| Real-number search to precision ε | O(log(range / ε)) | O(1) |

## Common mistakes

- Mixing templates: `while lo <= hi` with `hi = mid` loops forever.
- `lo = mid` (without + 1) with `mid = (lo + hi) // 2`: infinite loop when `hi = lo + 1`.
- Wrong range for search on the answer (start at 1 if you divide by x).
- A condition that is not monotonic: binary search then gives nonsense, with no error.
- Forgetting the "not found" case (`lo == len(nums)`).

## Patterns that use it

**Binary search on index** (sorted arrays, rotated arrays, peaks), **binary search on the answer** (Koko, ship capacity, split array), and as a helper inside other ideas (LIS in O(n log n), time-based key-value store).

## Practice

```practice
binary-search
search-insert-position
first-bad-version
find-minimum-in-rotated-sorted-array
search-in-rotated-sorted-array
koko-eating-bananas
capacity-to-ship-packages-within-d-days
split-array-largest-sum
```

## Explain it back

```explain
What does "monotonic condition" mean, and why does binary search need it?
Explain the difference between the [lo, hi] and [lo, hi) templates.
How can you binary search when there is no array, like "minimum eating speed"?
```

## Flashcards

```flashcards
Binary search cost? :: O(log n): the range halves each step.
What must be true of ok(x)? :: Monotonic: False...False then True...True.
First-true loop moves? :: ok(mid): hi = mid. else: lo = mid + 1. Loop while lo < hi.
Exact-match loop moves? :: lo = mid + 1 or hi = mid - 1. Loop while lo <= hi.
Rotated array minimum: compare mid with? :: nums[hi]. If nums[mid] > nums[hi], go right.
Search on the answer means? :: Binary search over possible answers with a yes/no check.
```
