---
id: a12-sets
title: Sets
level: basic
phase: 1
week: 4
tags: [python, basics, sets, hashing]
estMinutes: 15
---

## What it is

A set is a bag of **unique** items with **no order**: `{"Ravi", "Asha"}`.
Adding the same item twice keeps only one.
Checking "is it in the set?" is fast (O(1)), because a set uses hashing, like a dict with only keys.

## Real-life example

A wedding guest list. If Ravi's name is written twice, he still gets one seat.
Two families compare lists: who is on **both** lists? Who is only on ours? Sets answer these questions in one line.

## Picture

```svg
<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="130" cy="100" r="80" class="box" fill-opacity="0.6"/>
  <circle cx="230" cy="100" r="80" class="hi" fill-opacity="0.5"/>
  <text x="80" y="18" class="muted">mine</text>
  <text x="250" y="18" class="muted">yours</text>
  <text x="85" y="95">rice</text>
  <text x="85" y="120">dal</text>
  <text x="180" y="95" text-anchor="middle">oil</text>
  <text x="180" y="120" text-anchor="middle">salt</text>
  <text x="250" y="108">sugar</text>
  <text x="180" y="150" text-anchor="middle" class="muted">mine &amp; yours</text>
</svg>
```

## How it works inside

- A set is a hash table that stores only keys (no values). See Dictionaries for how hashing works.
- `x in s`, `s.add(x)`, `s.remove(x)` are O(1) on average.
- Items must be hashable (immutable): numbers, strings, tuples. Not lists.
- A set has **no order** and no indexes. `s[0]` does not work. To print in order, use `sorted(s)`.
- `{}` makes an empty **dict**, not a set. Use `set()`.

## Python, step by step

```python
guests = {"Ravi", "Asha", "Ravi", "Meena"}   # the second Ravi is dropped
print(len(guests))
guests.add("John")
guests.discard("Asha")      # remove if present (no error if missing)
print("Ravi" in guests)     # fast check
print(sorted(guests))       # sets have no order, so sort to print neatly
```

```output
3
True
['John', 'Meena', 'Ravi']
```

Set maths:

```python
mine = {"rice", "dal", "oil", "salt"}
yours = {"oil", "salt", "sugar"}
print(sorted(mine & yours))   # in both
print(sorted(mine | yours))   # in either one
print(sorted(mine - yours))   # only in mine
print(sorted(mine ^ yours))   # in exactly one of them
```

```output
['oil', 'salt']
['dal', 'oil', 'rice', 'salt', 'sugar']
['dal', 'rice']
['dal', 'rice', 'sugar']
```

Find a duplicate in O(n):

```python
def has_duplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:        # seen it before? O(1)
            return True
        seen.add(n)
    return False

print(has_duplicate([3, 1, 4, 1, 5]))
print(len(set([3, 1, 4, 1, 5])) != 5)   # shorter: duplicates shrink the set
```

```output
True
True
```

An empty set:

```python
a = {}
b = set()
print(type(a), type(b))
```

```output
<class 'dict'> <class 'set'>
```

## Time and space

| Operation | Average time |
| --- | --- |
| `x in s`, `s.add(x)`, `s.remove(x)`, `s.discard(x)` | O(1) |
| `set(a_list)` | O(n) |
| `a | b` (union) | O(len(a) + len(b)) |
| `a & b` (intersection) | O(min(len(a), len(b))) |
| `a - b` (difference) | O(len(a)) |

Space: O(n).

## Common mistakes

- Writing `{}` for an empty set. That is a dict. Use `set()`.
- Expecting order. Sets have none. Sort when you print.
- Putting a list inside a set: `{[1, 2]}` fails. Use a tuple: `{(1, 2)}`.
- Using `remove` on a missing item raises `KeyError`. Use `discard` if it may be missing.
- Using a list for "have I seen this?" checks in a loop. That is O(n) per check. A set is O(1).

## Patterns that use it

- **"Seen before"** checks: Contains Duplicate, Happy Number, cycle checks.
- **Visited set** in graph BFS and DFS.
- **Sliding window** with a set of characters in the window.
- **Longest Consecutive Sequence**: put all numbers in a set, then start counting only from numbers whose `n - 1` is missing.

## Practice

```practice
Two shopping lists: print the items on both lists and the items only on the first list.
Remove duplicates from a list of names, then print them in A to Z order.
contains-duplicate
intersection-of-two-arrays
check-if-the-sentence-is-pangram
jewels-and-stones
find-the-difference
longest-consecutive-sequence
```

## Explain it back

```explain
How is a set like a dict? How is it different?
Why is "x in my_set" faster than "x in my_list"?
How would you find items that are in list A but not in list B?
```

## Flashcards

```flashcards
What does a set keep? :: Unique items, with no order.
Cost of x in a_set? :: O(1) on average.
How do you make an empty set? :: set()  (not {}, which is a dict)
Items in both sets a and b? :: a & b
Items in a but not in b? :: a - b
remove vs discard? :: remove raises KeyError if missing; discard does not.
```
