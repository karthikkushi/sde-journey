---
id: c-arrays-strings
title: Arrays and strings
level: core
phase: 2
week: 7
tags: [dsa, arrays, strings]
estMinutes: 25
---

## What it is

An **array** keeps items side by side in memory, so item `i` can be found in one step.
A Python `list` is a **dynamic array**: it grows when it is full (see Lists).
A **string** is like an array of characters that **cannot be changed**.

## Real-life example

A row of seats in a cinema: A1, A2, A3... If you know the seat number, you walk straight to it. You never check every seat.
But if a new person must sit in A1 and everyone shifts one seat right, the whole row moves. That is why inserting at the front is slow.

## Picture

```svg
<svg viewBox="0 0 360 150" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="18" class="muted">memory addresses (8 bytes per slot)</text>
  <rect x="10" y="30" width="68" height="44" class="box"/><text x="44" y="57" text-anchor="middle">40</text>
  <rect x="78" y="30" width="68" height="44" class="box"/><text x="112" y="57" text-anchor="middle">25</text>
  <rect x="146" y="30" width="68" height="44" class="hi"/><text x="180" y="57" text-anchor="middle">60</text>
  <rect x="214" y="30" width="68" height="44" class="box"/><text x="248" y="57" text-anchor="middle">15</text>
  <rect x="282" y="30" width="68" height="44" class="box"/><text x="316" y="57" text-anchor="middle">90</text>
  <text x="44" y="92" text-anchor="middle" class="muted">1000</text><text x="112" y="92" text-anchor="middle" class="muted">1008</text>
  <text x="180" y="92" text-anchor="middle" class="muted">1016</text><text x="248" y="92" text-anchor="middle" class="muted">1024</text>
  <text x="316" y="92" text-anchor="middle" class="muted">1032</text>
  <text x="10" y="125">a[2] lives at 1000 + 2 × 8 = 1016</text>
  <text x="10" y="143" class="muted">one multiplication, no searching: O(1)</text>
</svg>
```

## How it works inside

- The slots are **contiguous** (next to each other). The address of slot `i` is `start + i × slot_size`. That is why `a[i]` is O(1).
- Side-by-side memory is also **fast for the CPU**: when it reads one slot, the neighbours come into its cache too. Looping over an array is very quick in practice.
- A **static** array has a fixed size (C, Java `int[]`). A **dynamic** array (Python `list`, C# `List<T>`) keeps spare room and grows when needed.
- Inserting or deleting in the **middle** shifts every item after it: O(n). At the **end** it is O(1) (amortized).
- Strings are **immutable** in Python (and in C# and Java). Every "change" builds a new string. To build a long string, collect pieces in a list and `"".join(...)` once.
- Many problems treat a string as an array: index it, use two pointers on it, count its letters in an array of 26.

## Python, step by step

Rotate an array in place with three reversals (O(n) time, O(1) extra space):

```python
def reverse(a, lo, hi):              # reverse a[lo..hi] in place
    while lo < hi:
        a[lo], a[hi] = a[hi], a[lo]
        lo += 1
        hi -= 1

def rotate_right(a, k):              # [1,2,3,4,5], k = 2  ->  [4,5,1,2,3]
    n = len(a)
    k %= n                           # rotating by n changes nothing
    reverse(a, 0, n - 1)             # 5 4 3 2 1
    reverse(a, 0, k - 1)             # 4 5 3 2 1
    reverse(a, k, n - 1)             # 4 5 1 2 3
    return a

print(rotate_right([1, 2, 3, 4, 5], 2), rotate_right([1, 2, 3], 4))
```

```output
[4, 5, 1, 2, 3] [3, 1, 2]
```

Count letters with an array of 26 slots (faster and smaller than a dict for a to z):

```python
def letter_counts(word):
    counts = [0] * 26                        # one slot per letter a..z
    for ch in word:
        counts[ord(ch) - ord("a")] += 1      # 'a' -> slot 0, 'b' -> slot 1, ...
    return counts

c = letter_counts("banana")
print(c[0], c[1], c[13])                     # how many a, b and n
print(letter_counts("listen") == letter_counts("silent"))
```

```output
3 1 2
True
```

A string clean-up and check:

```python
def is_clean_palindrome(s):
    cleaned = [ch.lower() for ch in s if ch.isalnum()]   # keep only letters and digits
    return cleaned == cleaned[::-1]

print(is_clean_palindrome("A man, a plan, a canal: Panama"), is_clean_palindrome("race a car"))
```

```output
True False
```

Build strings with a list and join:

```python
parts = []
for i in range(1, 6):
    parts.append(str(i))         # cheap: no copying of the text so far
print("-".join(parts))           # one final build
```

```output
1-2-3-4-5
```

## Time and space

| Operation | Array / list | String |
| --- | --- | --- |
| Read `a[i]` | O(1) | O(1) |
| Search for a value | O(n) | O(n) |
| Add / remove at the end | O(1) amortized | new string: O(n) |
| Add / remove in the middle | O(n) | new string: O(n) |
| Slice of length k | O(k) | O(k) |
| Reverse | O(n) | O(n) |

## Common mistakes

- Trying to change a string in place:

```python
# WRONG: strings cannot be changed in place
name = "ravi"
name[0] = "R"
```

```output
Traceback (most recent call last):
  File "strings.py", line 3, in <module>
    name[0] = "R"
    ~~~~^^^
TypeError: 'str' object does not support item assignment
```

  Build a new one: `name = "R" + name[1:]`, or work on `list(name)` and join at the end.

- Forgetting `k %= n` when k can be bigger than the length.
- Off by one at the ends (`range(len(a) - 1)` skips the last item).
- Removing items from a list while looping over it. Use a write pointer (two pointers, same direction).

## Patterns that use it

**Two pointers** (both kinds), **sliding window**, **prefix sum**, **frequency counting** with a 26-slot array, **cyclic sort**, and every DP table.

## Practice

```practice
remove-element
merge-sorted-array
remove-duplicates-from-sorted-array
majority-element
longest-common-prefix
is-subsequence
move-zeroes
pascals-triangle
```

## Explain it back

```explain
Why is a[i] O(1) for an array? Use the address formula.
Why is inserting at the front of an array O(n)?
Why should you build a long string with a list and join?
How do three reversals rotate an array?
```

## Flashcards

```flashcards
Address of a[i] in an array? :: start + i × slot size. That is why reading is O(1).
Insert in the middle of an array? :: O(n): items after it shift.
Are Python strings mutable? :: No. Every change builds a new string.
Fast way to build a long string? :: Collect pieces in a list, then "".join(pieces).
Rotate right by k in O(1) space? :: Reverse all, reverse the first k, reverse the rest.
Count letters a..z quickly? :: counts = [0] * 26; counts[ord(ch) - ord("a")] += 1
```
