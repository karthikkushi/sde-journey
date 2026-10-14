---
id: intervals
name: Intervals (merge, insert, meeting rooms)
group: Intervals and greedy
---

## Clues

```clues
Meetings, bookings, time ranges
Merge overlapping ranges
Insert a new range into a sorted list
Minimum number of rooms needed
Remove the fewest ranges so none overlap
```

## Idea

**Sort by start time** first. Then walk once: two intervals overlap when `next.start <= current.end`. For "how many at the same time" questions, a min-heap of end times tells you when a room becomes free.

```text
[1,3] [2,6] [8,10] [15,18]
[1 ─────── 6]       merged, because 2 <= 3
              [8─10] [15─18]
```

## Template

```python
import heapq

def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])         # sort by start
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:               # overlaps the last merged one
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

def min_rooms(meetings):
    meetings.sort()
    ends = []                                    # end times of rooms in use (min-heap)
    for start, end in meetings:
        if ends and ends[0] <= start:
            heapq.heappop(ends)                  # a room got free: reuse it
        heapq.heappush(ends, end)
    return len(ends)

print(merge([[1, 3], [8, 10], [2, 6], [15, 18]]), min_rooms([[0, 30], [5, 10], [15, 20]]))
```

```output
[[1, 6], [8, 10], [15, 18]] 2
```

## Walkthrough: Non-overlapping Intervals

1. Sort by **end** time (this one is greedy).
2. Keep the interval that ends earliest; it leaves the most room.
3. Every interval that starts before the kept end overlaps: count it as removed.

## Traps

- Forgetting to sort.
- Using `<` vs `<=`: does [1,2] overlap [2,3]? Read the problem.
- In merge, taking `end` instead of `max(old_end, end)` (one interval can contain another).
