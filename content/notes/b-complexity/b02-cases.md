---
id: b02-cases
title: Best, average and worst case
level: basic
phase: 1
week: 6
tags: [complexity, big-o]
estMinutes: 15
---

## What it is

The same code can be fast on one input and slow on another.
**Best case**: the luckiest input. **Worst case**: the unluckiest. **Average case**: what you expect on typical inputs.
In interviews, "the complexity" means the **worst case**, unless someone says "average".

## Real-life example

Looking for your friend in a train with 8 coaches.
- Best case: they are in the first coach you check. 1 step.
- Worst case: they are not on the train at all. You check all 8.
- Average: if they are on the train, about 4 or 5 checks.

## Picture

```text
 coaches:  S1  S2  S3  S4  S5  S6  S7  S8
           ↑                            ↑
      best case: 1 check          worst case: 8 checks
                (friend in S1)    (friend in S8, or not on the train)

 average (friend in a random coach) = (1+2+...+8) / 8 = 4.5 checks
```

## How it works inside

- **Worst case** is a promise: "it will never be slower than this". That is why interviews and system design care about it.
- **Average case** needs an idea of "typical input". Hash maps are O(1) on **average** and O(n) in the worst case (when many keys collide). Everyone says "O(1)" for dict lookups, meaning average.
- **Best case** is rarely useful on its own. Most algorithms have an easy best case.
- Quick sort: average O(n log n), worst O(n²) when the pivot is always the smallest or largest. Merge sort: O(n log n) always.
- Insertion sort: best O(n) on an already sorted list, worst O(n²) on a reversed list. This is why it is good for "almost sorted" data.
- Average case is **not** the same as **amortized**. Amortized is an average over a **sequence of operations** on any input (see the next note).

## Python, step by step

Count the checks of linear search:

```python
def find(items, target):
    steps = 0
    for x in items:
        steps += 1
        if x == target:
            return steps
    return steps                     # not found: we checked everything

coaches = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"]
print("best:", find(coaches, "S1"))
print("worst:", find(coaches, "B1"))
print("average:", sum(find(coaches, c) for c in coaches) / len(coaches))
```

```output
best: 1
worst: 8
average: 4.5
```

Insertion sort: count the swaps on sorted and reversed input:

```python
def insertion_sort_moves(a):
    a = a[:]                          # work on a copy
    moves = 0
    for i in range(1, len(a)):
        j = i
        while j > 0 and a[j - 1] > a[j]:   # move the new item left until it fits
            a[j - 1], a[j] = a[j], a[j - 1]
            moves += 1
            j -= 1
    return moves

print(insertion_sort_moves([1, 2, 3, 4, 5, 6]))   # already sorted: best case
print(insertion_sort_moves([6, 5, 4, 3, 2, 1]))   # reversed: worst case
```

```output
0
15
```

15 is 6 × 5 / 2: every pair is out of order. That is O(n²).

## Time and space

| Algorithm | Best | Average | Worst |
| --- | --- | --- | --- |
| Linear search | O(1) | O(n) | O(n) |
| Binary search | O(1) | O(log n) | O(log n) |
| Insertion sort | O(n) | O(n²) | O(n²) |
| Merge sort | O(n log n) | O(n log n) | O(n log n) |
| Quick sort | O(n log n) | O(n log n) | O(n²) |
| Dict / set lookup | O(1) | O(1) | O(n) |

## Common mistakes

- Quoting the best case as "the" complexity. "Linear search is O(1) if it is the first item" is not useful.
- Saying hash maps are O(n) in an interview without saying "worst case". Say: "O(1) average, O(n) worst case".
- Mixing up average case and amortized cost.
- Forgetting that "worst case" depends on the input shape: sorted input is the worst case for a naive quick sort.

## Patterns that use it

- **Binary search** keeps the worst case at O(log n).
- **Heaps** give O(log n) worst case per operation.
- Interview tip: when you say your complexity, also say which case and why: "O(n) time worst case, because each item enters and leaves the window once."

## Practice

```practice
For linear search, binary search and dict lookup, write best, average and worst case in your own words.
Find an input that makes your Two Sum solution do the most work.
binary-search
search-insert-position
majority-element
contains-duplicate
```

## Explain it back

```explain
Explain best, worst and average case with the train example.
Why do interviews usually ask for the worst case?
Why is a dict lookup called O(1) when its worst case is O(n)?
```

## Flashcards

```flashcards
Which case do interviews mean by default? :: The worst case.
Linear search best and worst case? :: Best O(1), worst O(n).
Dict lookup average and worst? :: O(1) average, O(n) worst.
Insertion sort on already sorted data? :: O(n): its best case.
Quick sort worst case? :: O(n²), when pivots are always the smallest or largest.
Merge sort worst case? :: O(n log n).
```
