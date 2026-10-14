---
id: d-sorting
title: Sorting algorithms and when to use which
level: core
phase: 2
week: 13
tags: [dsa, sorting, divide-and-conquer]
estMinutes: 30
---

## What it is

Sorting puts items in order. In real code you call `sorted()` (Timsort, O(n log n)).
But interviews test whether you know **how** the classic sorts work and **when** each one fits.
Five to know: bubble, insertion, merge, quick and counting sort.

## Real-life example

Arranging answer sheets by roll number:
- **Insertion**: pick each sheet and slide it into place in the pile you are holding (good when the pile is almost in order).
- **Merge**: split the pile with a friend, each sorts half, then you merge the two sorted halves.
- **Counting**: roll numbers are 1 to 60, so put 60 empty trays on a table and drop each sheet in its tray.

## Picture

```text
 merge sort on [38, 27, 43, 3]

 split:     [38, 27]        [43, 3]
            [38] [27]       [43] [3]
 merge:     [27, 38]        [3, 43]
                [3, 27, 38, 43]          ← merging two sorted lists is one O(n) pass
```

## How it works inside

| Sort | Idea | Time | Extra space | Stable? |
| --- | --- | --- | --- | --- |
| Bubble | Swap neighbours until no swaps | O(n²) | O(1) | yes |
| Insertion | Slide each item left into place | O(n²), O(n) if nearly sorted | O(1) | yes |
| Merge | Sort halves, then merge | O(n log n) always | O(n) | yes |
| Quick | Pick a pivot; smaller left, bigger right; recurse | O(n log n) average, O(n²) worst | O(log n) | no |
| Counting | Count each value, then write them out | O(n + k) for values 0..k | O(k) | yes (careful version) |
| Timsort (Python) | Merge sort + insertion sort on natural runs | O(n log n), O(n) on sorted data | O(n) | yes |

- **Stable** means equal items keep their original order. It matters when you sort by one key after another.
- No comparison sort can beat O(n log n) in the worst case. Counting sort does better only because it does not compare; it needs small whole-number keys.
- Quick sort's worst case comes from bad pivots (always the smallest). A random or middle pivot makes it very unlikely.

**When to use which**
- Normal code: `sorted()` / `.sort()`. Always.
- Almost sorted, small data: insertion sort.
- Need guaranteed O(n log n) or stability, or sorting linked lists: merge sort.
- Values are small integers (marks 0–100, ages): counting sort, O(n).
- Only need the k smallest: a heap (O(n log k)), or quickselect (O(n) average).

## Python, step by step

All five on the same marks, checked against `sorted()`:

```python
def bubble_sort(a):
    a = a[:]
    for end in range(len(a) - 1, 0, -1):
        swapped = False
        for i in range(end):
            if a[i] > a[i + 1]:
                a[i], a[i + 1] = a[i + 1], a[i]    # the bigger one bubbles right
                swapped = True
        if not swapped:
            break                                  # no swaps: already sorted
    return a

def insertion_sort(a):
    a = a[:]
    for i in range(1, len(a)):
        x, j = a[i], i - 1
        while j >= 0 and a[j] > x:
            a[j + 1] = a[j]                        # shift bigger items right
            j -= 1
        a[j + 1] = x                               # drop x into the gap
    return a

def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:                    # <= keeps equal items in order (stable)
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]

def quick_sort(a):
    if len(a) <= 1:
        return a
    pivot = a[len(a) // 2]
    smaller = [x for x in a if x < pivot]
    equal = [x for x in a if x == pivot]
    bigger = [x for x in a if x > pivot]
    return quick_sort(smaller) + equal + quick_sort(bigger)

def counting_sort(a, max_value):
    counts = [0] * (max_value + 1)
    for x in a:
        counts[x] += 1                             # how many of each value
    return [v for v, c in enumerate(counts) for _ in range(c)]

marks = [67, 45, 82, 45, 90, 12, 67]
for sort in (bubble_sort, insertion_sort, merge_sort, quick_sort):
    print(sort.__name__, sort(marks))
print("counting_sort", counting_sort(marks, 100))
print(all(f(marks) == sorted(marks) for f in (bubble_sort, insertion_sort, merge_sort, quick_sort)))
```

```output
bubble_sort [12, 45, 45, 67, 67, 82, 90]
insertion_sort [12, 45, 45, 67, 67, 82, 90]
merge_sort [12, 45, 45, 67, 67, 82, 90]
quick_sort [12, 45, 45, 67, 67, 82, 90]
counting_sort [12, 45, 45, 67, 67, 82, 90]
True
```

Why stability matters: sort by name first, then by marks; equal marks keep name order:

```python
students = [("Ravi", 82), ("Asha", 67), ("John", 82), ("Meena", 67)]
by_name = sorted(students)                              # A to Z
by_marks = sorted(by_name, key=lambda s: s[1], reverse=True)
print(by_marks)
```

```output
[('John', 82), ('Ravi', 82), ('Asha', 67), ('Meena', 67)]
```

## Time and space

See the table above. The one line to remember: **comparison sorting is O(n log n) at best**; Python's sort is O(n log n) worst case and O(n) on already sorted input.

## Common mistakes

- Writing your own sort in production code instead of `sorted()`.
- Saying quick sort is O(n log n) without "average".
- Forgetting merge sort's O(n) extra space.
- Using counting sort for large ranges (values up to 10⁹ → a huge count list).
- Sorting when you only need the minimum or top k (O(n) or O(n log k) is enough).

## Patterns that use it

Sorting is the first step of **two pointers** (3Sum), **intervals**, **greedy** (by end time), **binary search**, and **group anagrams** (sorted letters as a key). Merge sort is the model for **divide and conquer** (counting inversions).

## Practice

```practice
sort-colors
sort-an-array
merge-sorted-array
height-checker
sort-list
kth-largest-element-in-an-array
largest-number
```

## Explain it back

```explain
Explain insertion sort and why it is fast on nearly sorted data.
Why is merge sort always O(n log n)? Where does the log n come from?
What makes quick sort's worst case O(n²), and how do you avoid it?
When would counting sort beat Python's sorted()?
```

## Flashcards

```flashcards
Best possible worst case for comparison sorting? :: O(n log n)
Merge sort time and extra space? :: O(n log n) always; O(n) extra space.
Quick sort worst case? :: O(n²) with bad pivots (average O(n log n)).
What is a stable sort? :: Equal items keep their original order.
When is counting sort O(n)? :: When values are small whole numbers (0..k with k not huge).
Python's sort algorithm? :: Timsort: stable, O(n log n), O(n) on sorted input.
```
