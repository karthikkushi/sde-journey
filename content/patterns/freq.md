---
id: freq
name: Frequency counting
group: Arrays and hashing
---

## Clues

```clues
Anagram, or "same letters in any order"
Count how many times each item appears
Most or least frequent item
The item that appears once, or more than n/2 times
Compare two collections and ignore the order
```

## Idea

Walk once and count with a dict (or `Counter`). Then answer the question from the counts. This turns "compare everything with everything" (O(n²)) into one pass (O(n)).

## Template

```python
from collections import Counter

def is_anagram(s, t):
    return Counter(s) == Counter(t)      # same letters, same counts

def first_unique(s):
    count = Counter(s)                   # pass 1: count everything
    for i, ch in enumerate(s):           # pass 2: first char with count 1
        if count[ch] == 1:
            return i
    return -1

print(is_anagram("listen", "silent"), first_unique("leetcode"), first_unique("aabb"))
```

```output
True 0 -1
```

## Walkthrough: Valid Anagram

1. If the lengths differ, they cannot be anagrams.
2. Count the letters of `s`. Count the letters of `t`.
3. Equal counts for every letter means anagram. O(n) time, O(1) space for 26 letters.

## Traps

- Sorting both strings works but is O(n log n). Counting is O(n).
- Forgetting that a `Counter` treats missing keys as 0, so `count[x]` never crashes.
- For "majority element", a count works, but Boyer-Moore voting does it in O(1) space. Know both.
