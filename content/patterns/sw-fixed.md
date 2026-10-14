---
id: sw-fixed
name: Sliding window (fixed size)
group: Sliding window
---

## Clues

```clues
Subarray or substring of exactly length k
Max, min or average of every window of size k
Is an anagram of p inside s? (window of len(p))
Duplicate within distance k
```

## Idea

Keep a window of k items. To slide it one step: **add** the new item on the right and **remove** the item that just left on the left. Each item is added once and removed once: O(n), not O(n·k).

```text
[2  1  5] 1  3  2    sum 8
 2 [1  5  1] 3  2    sum 8 - 2 + 1 = 7
 2  1 [5  1  3] 2    sum 7 - 1 + 3 = 9   ← best
```

## Template

```python
def max_sum_window(nums, k):
    window = sum(nums[:k])                 # the first window
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]    # add the new item, drop the one that left
        best = max(best, window)
    return best

print(max_sum_window([2, 1, 5, 1, 3, 2], 3))
```

```output
9
```

## Walkthrough: Permutation in String

1. The window size is `len(s1)`. Count the letters of `s1`.
2. Count the letters of the first window of `s2`.
3. Slide: add the new letter, remove the old one. If the counts are equal, return True.

## Traps

- Recomputing `sum(window)` every step: O(n·k).
- Forgetting the case k > len(nums).
- Off by one: the item leaving is `nums[i - k]`.
