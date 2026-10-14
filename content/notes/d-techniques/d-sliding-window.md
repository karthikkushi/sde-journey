---
id: d-sliding-window
title: Sliding window
level: core
phase: 2
week: 11
tags: [dsa, sliding-window, strings, arrays]
estMinutes: 30
---

## What it is

A sliding window is a **range** `[left, right]` that moves along an array or string.
You **grow** it by moving `right` and **shrink** it by moving `left`, keeping a little summary (a sum, or letter counts) up to date instead of recounting.
Both ends only move forward, so the whole scan is O(n).

## Real-life example

Watching a train pass through a window: you always see a stretch of coaches. As the train moves, one coach appears on the right and one leaves on the left. You do not need to look at the whole train again.

## Picture

```text
 string:  a  b  c  a  b  c  b  b
          L     R                 window "abc" (no repeats)
             L     R              "a" repeated → move L past the old "a"
```

## How it works inside

- **Fixed size k**: add `nums[right]`, remove `nums[right - k]`. One update per step.
- **Variable size**: move `right` every step. Then, **while the window is invalid** (or, for "shortest", while it is valid), move `left`.
- Keep the summary in O(1) per step: a running sum, a dict of counts, a count of "how many requirements are met".
- **Exactly K** is hard to slide directly. Use the trick **exactly(K) = at_most(K) − at_most(K − 1)**, because "at most" windows slide nicely.
- **Minimum window substring**: keep `need` counts and a number `have` of letters fully satisfied. Grow until `have == len(need)`, then shrink to make it as short as possible.
- **When it breaks**: the window needs a monotonic rule ("adding makes it worse, removing makes it better"). With negative numbers, a bigger window can have a smaller sum, so use prefix sums instead.

## Python, step by step

Count subarrays with exactly K distinct numbers using "at most":

```python
from collections import defaultdict

def at_most(nums, k):
    count = defaultdict(int)
    left = total = 0
    for right, x in enumerate(nums):
        count[x] += 1
        while len(count) > k:               # too many distinct: shrink
            count[nums[left]] -= 1
            if count[nums[left]] == 0:
                del count[nums[left]]
            left += 1
        total += right - left + 1           # every window ending at right is valid
    return total

def exactly(nums, k):
    return at_most(nums, k) - at_most(nums, k - 1)

print(exactly([1, 2, 1, 2, 3], 2))
```

```output
7
```

Minimum window that contains every letter of t:

```python
from collections import Counter

def min_window(s, t):
    need = Counter(t)
    have, required = 0, len(need)       # how many letters have enough copies
    window = Counter()
    best = (float("inf"), 0, 0)
    left = 0
    for right, ch in enumerate(s):
        window[ch] += 1
        if ch in need and window[ch] == need[ch]:
            have += 1
        while have == required:          # valid: try to shrink
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right)
            out = s[left]
            window[out] -= 1
            if out in need and window[out] < need[out]:
                have -= 1
            left += 1
    return "" if best[0] == float("inf") else s[best[1]:best[2] + 1]

print(min_window("ADOBECODEBANC", "ABC"))
```

```output
BANC
```

Longest part you can make all one letter with k changes:

```python
def character_replacement(s, k):
    count = {}
    left = best = top = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        top = max(top, count[ch])             # most frequent letter in the window
        while (right - left + 1) - top > k:   # letters to change > k: shrink
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best

print(character_replacement("AABABBA", 1))
```

```output
4
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| Fixed window sum / average | O(n) | O(1) |
| Longest / shortest variable window | O(n) | O(alphabet) |
| Exactly K (two at-most passes) | O(n) | O(K) |
| Minimum window substring | O(len(s) + len(t)) | O(alphabet) |

## Common mistakes

- Using a window when numbers can be negative and the rule depends on the sum.
- Window length `right - left` (missing the + 1).
- Updating the answer before shrinking (for "longest") or after shrinking (for "shortest"). Think about when the window is valid.
- Trying to count "exactly K" directly.
- Rebuilding the counts for every window (that is O(n·k) again).

## Patterns that use it

**Sliding window (fixed)**, **sliding window (variable)**, **monotonic queue** (window max), and string problems with letter counts (anagrams, permutations).

## Practice

```practice
maximum-average-subarray-i
longest-substring-without-repeating-characters
longest-repeating-character-replacement
permutation-in-string
minimum-size-subarray-sum
fruit-into-baskets
minimum-window-substring
subarrays-with-k-different-integers
```

## Explain it back

```explain
Why do both pointers only ever move forward, and why does that make it O(n)?
Why does exactly(K) = at_most(K) - at_most(K - 1) work?
Why does the sliding window fail with negative numbers?
```

## Flashcards

```flashcards
Fixed window update? :: Add the new item, remove the item k steps back.
Variable window loop? :: Move right every step; while invalid, move left.
Exactly K distinct? :: at_most(K) - at_most(K - 1)
Window length? :: right - left + 1
Number of windows ending at right (at-most counting)? :: right - left + 1
Negatives with "sum at least target"? :: Window breaks. Use prefix sums.
```
