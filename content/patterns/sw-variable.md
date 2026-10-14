---
id: sw-variable
name: Sliding window (variable size)
group: Sliding window
---

## Clues

```clues
Longest or shortest substring / subarray that follows a rule
At most K distinct, or at most K replacements
Without repeating characters
Minimum window that contains all of ...
All numbers positive + sum at least target
```

## Idea

Move `right` forward to **grow** the window. While the window breaks the rule (or, for "shortest", while it is valid), move `left` forward to **shrink** it. Each index moves forward only, so the total is O(n).

## Template

```python
def longest_without_repeat(s):
    last_seen = {}                       # char -> last index
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1     # shrink: jump past the repeated char
        last_seen[ch] = right
        best = max(best, right - left + 1)
    return best

def shortest_with_sum(nums, target):     # all numbers positive
    left = total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x                       # grow
        while total >= target:           # valid: try to shrink
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best

print(longest_without_repeat("abcabcbb"), shortest_with_sum([2, 3, 1, 2, 4, 3], 7))
```

```output
3 2
```

## Walkthrough: Longest Substring Without Repeating Characters

1. `right` walks over the string. Remember the last index of each character.
2. If the current character was seen **inside** the window, move `left` just past that old position.
3. The window `left..right` now has no repeats. Its length is `right - left + 1`. Keep the best.

## Traps

- Negative numbers break the "shrink while sum ≥ target" logic. Use prefix sums.
- Window length is `right - left + 1`, not `right - left`.
- Moving `left` backwards (`last_seen[ch]` can be before `left`; check it).
