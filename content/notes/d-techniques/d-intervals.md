---
id: d-intervals
title: Intervals
level: core
phase: 3
week: 33
tags: [dsa, intervals, sorting, greedy, sweep-line]
estMinutes: 25
---

## What it is

An interval is a range `[start, end]`: a meeting, a booking, a train's stay at a platform.
Interval problems ask about **overlaps**: merge them, insert one, count how many happen at once, or remove the fewest.
Almost always, the first step is to **sort** (by start, or by end).

## Real-life example

A railway station with trains arriving and leaving. "How many platforms do we need?" = the most trains present at the same moment.
Walk through the day: an arrival adds one train, a departure removes one. The highest count is the answer.

## Picture

```text
time:      0    5    10   15   20   25   30
A [0,30]   ├─────────────────────────────┤
B [5,10]        ├────┤
C [15,20]                 ├────┤
events: +A@0 +B@5 -B@10 +C@15 -C@20 -A@30
count:   1    2    1     2     1     0     → max 2 platforms
```

## How it works inside

- Two intervals `[a, b]` and `[c, d]` **overlap** when `a <= d and c <= b` (read the problem: does touching at one point count?).
- **Merge**: sort by start; if the next start ≤ the current end, extend the end with `max`.
- **Insert**: add everything that ends before the new one, merge everything that overlaps it, add the rest.
- **Remove fewest to stop overlaps**: sort by **end**; keep an interval if it starts after the last kept end (greedy, like picking the most meetings).
- **Most at the same time** (meeting rooms, platforms): a **sweep line** over sorted events (+1 at start, −1 at end), or a min-heap of end times.
- **Intersections of two sorted lists**: two pointers; the overlap is `[max(starts), min(ends)]`; move the pointer whose interval ends first.

## Python, step by step

Sweep line for the most meetings at once:

```python
def max_overlap(intervals):
    events = []
    for start, end in intervals:
        events.append((start, 1))          # someone arrives
        events.append((end, -1))           # someone leaves
    events.sort()                          # at the same time, -1 sorts before +1: leave first
    current = best = 0
    for _, change in events:
        current += change
        best = max(best, current)
    return best

print(max_overlap([[0, 30], [5, 10], [15, 20]]), max_overlap([[1, 5], [5, 10]]))
```

```output
2 1
```

Insert a new interval into a sorted, non-overlapping list:

```python
def insert(intervals, new):
    out, i, n = [], 0, len(intervals)
    while i < n and intervals[i][1] < new[0]:     # ends before the new one starts
        out.append(intervals[i])
        i += 1
    start, end = new
    while i < n and intervals[i][0] <= end:      # overlaps: grow the new interval
        start = min(start, intervals[i][0])
        end = max(end, intervals[i][1])
        i += 1
    out.append([start, end])
    return out + intervals[i:]                    # everything after

print(insert([[1, 3], [6, 9]], [2, 5]), insert([[1, 2], [3, 5], [6, 7], [8, 10]], [4, 8]))
```

```output
[[1, 5], [6, 9]] [[1, 2], [3, 10]]
```

Intersections of two sorted lists with two pointers:

```python
def intersections(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        lo = max(a[i][0], b[j][0])
        hi = min(a[i][1], b[j][1])
        if lo <= hi:
            out.append([lo, hi])               # they overlap here
        if a[i][1] < b[j][1]:                  # move the one that ends first
            i += 1
        else:
            j += 1
    return out

print(intersections([[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]))
```

```output
[[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| Merge intervals | O(n log n) (sort) | O(n) |
| Insert into a sorted list | O(n) | O(n) |
| Meeting rooms / platforms | O(n log n) | O(n) |
| Remove fewest overlaps | O(n log n) | O(1) extra |
| Intersections of two sorted lists | O(a + b) | O(a + b) |

## Common mistakes

- Forgetting to sort first.
- Touching intervals: is `[1, 5]` and `[5, 10]` an overlap? Read the problem, then choose `<` or `<=`.
- In merge, writing `end = new_end` instead of `max(end, new_end)` (one interval can contain another).
- Sorting by start when the greedy needs end (remove-fewest, max meetings).

## Patterns that use it

**Intervals** (merge, insert, meeting rooms), **greedy** (sort by end), **heaps** (rooms by earliest end), **sweep line**, **two pointers** (intersections).

## Practice

```practice
merge-intervals
insert-interval
non-overlapping-intervals
meeting-rooms
meeting-rooms-ii
interval-list-intersections
minimum-number-of-arrows-to-burst-balloons
my-calendar-i
```

## Explain it back

```explain
Write the overlap condition for [a, b] and [c, d] and explain it.
Explain the sweep line with the railway platforms example.
Why does "remove the fewest intervals" sort by end time, not start time?
```

## Flashcards

```flashcards
First step in most interval problems? :: Sort (by start, or by end for greedy).
Do [a, b] and [c, d] overlap? :: If a <= d and c <= b.
Merge rule? :: If next start <= current end, current end = max(current end, next end).
Most meetings at the same time? :: Sweep line (+1 start, -1 end) or a heap of end times.
Remove fewest to avoid overlaps? :: Sort by end; keep any interval starting after the last kept end.
```
