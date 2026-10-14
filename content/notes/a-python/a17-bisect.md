---
id: a17-bisect
title: bisect (binary search, ready-made)
level: core
phase: 2
week: 13
tags: [python, binary-search, bisect, sorted]
estMinutes: 15
---

## What it is

`bisect` does binary search on a **sorted** list for you.
It answers: "**where** would this value go, to keep the list sorted?"
It takes O(log n) time: about 20 steps for a million items.

## Real-life example

A queue of people sorted by height for a class photo. A new student arrives. You do not compare them with everyone. You look at the middle person, decide "taller or shorter?", and halve the search each time.
`bisect` finds the right gap. `insort` also puts the student there.

## Picture

Positions are the **gaps** between items:

```text
 marks:      35    50    50    70    90
 gap:     0     1     2     3     4     5
                ↑           ↑
  bisect_left(50) = 1       bisect_right(50) = 3
  (before all the 50s)      (after all the 50s)
```

## How it works inside

- It keeps a range `lo..hi`, looks at the middle item, and throws away the half that cannot hold the answer. Each step halves the range: O(log n).
- `bisect_left(a, x)` gives the first gap where `x` fits **before** any equal items.
- `bisect_right(a, x)` (also called `bisect`) gives the gap **after** any equal items.
- `bisect_right(a, x) - bisect_left(a, x)` = how many times `x` appears.
- `insort(a, x)` finds the gap in O(log n) and inserts. The insert shifts items: O(n) in total.
- Since Python 3.10 you can pass `key=`, like in `sorted`.
- The list **must** be sorted (by the same key). On an unsorted list, the answer is meaningless, and there is no error.

## Python, step by step

```python
import bisect
marks = [35, 50, 50, 70, 90]          # must be sorted
print(bisect.bisect_left(marks, 50))  # the gap before the 50s
print(bisect.bisect_right(marks, 50)) # the gap after the 50s
print(bisect.bisect_left(marks, 60))  # 60 would go between 50 and 70
```

```output
1
3
3
```

Insert and keep it sorted:

```python
import bisect
queue = [10, 20, 40]
bisect.insort(queue, 30)    # find the gap (O(log n)), then insert (O(n) shift)
print(queue)
```

```output
[10, 20, 30, 40]
```

Count values in a range, and check if a value is there:

```python
import bisect
prices = [15, 40, 60, 120, 250]
count = bisect.bisect_right(prices, 120) - bisect.bisect_left(prices, 40)
print(count)                     # prices from 40 to 120, both included

def contains(sorted_list, x):
    i = bisect.bisect_left(sorted_list, x)
    return i < len(sorted_list) and sorted_list[i] == x

print(contains(prices, 60), contains(prices, 61))
```

```output
3
True False
```

Grade lookup with cut-offs:

```python
import bisect
cutoffs = [35, 60, 75, 90]               # marks needed for each next grade
grades = ["F", "C", "B", "A", "A+"]
for m in [20, 35, 74, 90, 100]:
    print(m, grades[bisect.bisect_right(cutoffs, m)])
```

```output
20 F
35 C
74 B
90 A+
100 A+
```

With `key=` (Python 3.10+):

```python
import bisect
shops = [("A", 3.9), ("B", 4.2), ("C", 4.6)]               # sorted by rating
i = bisect.bisect_left(shops, 4.0, key=lambda s: s[1])     # compare by rating only
print(shops[i:])                                           # rated 4.0 or more
```

```output
[('B', 4.2), ('C', 4.6)]
```

## Time and space

| Operation | Time |
| --- | --- |
| `bisect_left`, `bisect_right` | O(log n) |
| `insort` | O(log n) to find + O(n) to insert |
| check "is x in the sorted list?" | O(log n) |

Space: O(1).

## Common mistakes

- Using bisect on an unsorted list. No error, just wrong answers.
- Mixing up left and right when there are equal items. Draw the gaps.
- Forgetting the bounds check: `bisect_left` can return `len(a)`, so `a[i]` may be out of range.
- Calling `insort` many times on a huge list. Each insert is O(n). Consider a heap or sorting once at the end.

## Patterns that use it

- **Binary search on index**: search insert position, first/last position.
- **Time-based key-value store**: find the latest timestamp ≤ t.
- **Longest increasing subsequence** in O(n log n): keep a list of "smallest tail" values and `bisect_left` into it.

## Practice

```practice
Given sorted exam cut-offs, print the grade for 10 different marks using bisect.
Count how many numbers in a sorted list are less than 50, in O(log n).
search-insert-position
find-smallest-letter-greater-than-target
count-negative-numbers-in-a-sorted-matrix
time-based-key-value-store
longest-increasing-subsequence
```

## Explain it back

```explain
What does bisect_left return, in plain words?
What is the difference between bisect_left and bisect_right when the value already exists?
Why must the list be sorted?
```

## Flashcards

```flashcards
What does bisect_left(a, x) return? :: The first gap where x fits, before any equal items.
bisect_right(a, x)? :: The gap after any items equal to x.
How many times does x appear in sorted a? :: bisect_right(a, x) - bisect_left(a, x)
Cost of bisect? :: O(log n)
Cost of insort? :: O(n), because inserting shifts items.
What happens on an unsorted list? :: No error, just wrong answers.
```
