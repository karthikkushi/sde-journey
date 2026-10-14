---
id: bs-index
name: Binary search (on index)
group: Binary search
---

## Clues

```clues
Sorted array: find a value or where it would go
First or last position of x
Rotated sorted array
The problem asks for O(log n)
Find a peak
```

## Idea

Keep a range `lo..hi` where the answer must be. Look at the middle. Throw away the half that cannot contain the answer. Each step halves the range: O(log n).

## Template

```python
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1                 # the answer is on the right
        else:
            hi = mid - 1                 # the answer is on the left
    return -1

def first_at_least(nums, target):        # first index with nums[i] >= target
    lo, hi = 0, len(nums)                # hi = len(nums) means "none"
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

nums = [1, 3, 5, 7, 9, 11]
print(binary_search(nums, 7), binary_search(nums, 4), first_at_least(nums, 4))
```

```output
3 -1 2
```

## Walkthrough: Search in Rotated Sorted Array

1. At any `mid`, at least one half (`lo..mid` or `mid..hi`) is normally sorted.
2. Check which half is sorted by comparing `nums[lo]` with `nums[mid]`.
3. If the target lies inside the sorted half's range, search there. Otherwise, search the other half.

## Traps

- Mixing the two styles: `lo <= hi` with `hi = mid - 1`, or `lo < hi` with `hi = mid`. Pick one per problem.
- Infinite loops when `lo = mid` (no + 1) and `mid` rounds down.
- Forgetting that the array must be sorted (or have some order you can use).
