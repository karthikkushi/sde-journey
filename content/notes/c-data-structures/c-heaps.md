---
id: c-heaps
title: Heaps (priority queues)
level: core
phase: 2
week: 19
tags: [dsa, heap, priority-queue]
estMinutes: 25
---

## What it is

A heap is a tree, stored in a plain list, where every parent is **smaller than or equal to** its children (a min-heap).
So the smallest item is always at the top, index 0.
Adding an item and removing the smallest both take O(log n). This makes a **priority queue**.

## Real-life example

A hospital emergency room: the most serious patient goes first, not the one who came first. New patients keep arriving.
The heap is the nurse's list that always keeps "who is most serious right now?" on top, without re-sorting everyone each time.

## Picture

```text
 list:   [1, 3, 2, 7, 5, 4]
 index:   0  1  2  3  4  5

 as a tree:            1            children of i: 2i+1 and 2i+2
                     /   \          parent of i:   (i-1) // 2
                    3     2
                   / \   /
                  7   5 4
```

## How it works inside

- The tree is **complete**: filled level by level, left to right. That is why it fits in a list with no gaps, and the parent/child positions are simple formulas.
- **Push**: put the item at the end, then **sift up**: swap with the parent while it is smaller. At most log n swaps (the height).
- **Pop**: swap the root with the last item, remove it, then **sift down** the new root: swap with its smaller child until it fits. At most log n swaps.
- **Heapify** (build from a list) is O(n), not O(n log n), because most nodes are near the bottom and move only a little.
- A heap is **not sorted**. Only the top is guaranteed.
- Python's `heapq` is a min-heap. For a max-heap, push negative numbers (or use `heapq.heappush_max` in Python 3.14+).
- Popping everything one by one gives sorted order: that is **heap sort**, O(n log n).

## Python, step by step

A min-heap written by hand, to see sift up and sift down:

```python
class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        a = self.a
        a.append(x)                                 # put it at the end...
        i = len(a) - 1
        while i > 0 and a[(i - 1) // 2] > a[i]:     # ...then swap up while the parent is bigger
            p = (i - 1) // 2
            a[i], a[p] = a[p], a[i]
            i = p

    def pop(self):
        a = self.a
        a[0], a[-1] = a[-1], a[0]                   # move the smallest to the end
        smallest = a.pop()
        i = 0
        while True:                                 # swap the new root down to its place
            l, r, m = 2 * i + 1, 2 * i + 2, i
            if l < len(a) and a[l] < a[m]:
                m = l
            if r < len(a) and a[r] < a[m]:
                m = r
            if m == i:
                return smallest
            a[i], a[m] = a[m], a[i]
            i = m

h = MinHeap()
for x in [5, 3, 8, 1, 9, 2]:
    h.push(x)
print(h.a[0], [h.pop() for _ in range(6)])
```

```output
1 [1, 2, 3, 5, 8, 9]
```

The same with `heapq` (heapify is O(n)):

```python
import heapq

nums = [5, 3, 8, 1, 9, 2]
heapq.heapify(nums)                                 # O(n): the list is now a heap
print(nums[0])
print([heapq.heappop(nums) for _ in range(len(nums))])   # heap sort
```

```output
1
[1, 2, 3, 5, 8, 9]
```

## Time and space

| Operation | Time |
| --- | --- |
| peek (smallest) | O(1) |
| push | O(log n) |
| pop (smallest) | O(log n) |
| heapify n items | O(n) |
| heap sort | O(n log n) |
| search for any value | O(n) |

Space: O(n), stored in one list.

## Common mistakes

- Thinking the heap list is sorted.
- Using the wrong heap type (min vs max). Write the minus sign carefully.
- Pushing items that cannot be compared when priorities tie (add a counter as a tie-breaker).
- Using a heap when you need "remove any item" quickly. A heap only removes the top fast.

## Patterns that use it

**Top K with heap**, **K-way merge**, **two heaps** (median), **Dijkstra**, **task scheduling** and **meeting rooms**.

## Practice

```practice
kth-largest-element-in-a-stream
last-stone-weight
k-closest-points-to-origin
kth-largest-element-in-an-array
top-k-frequent-words
task-scheduler
merge-k-sorted-lists
find-median-from-data-stream
```

## Explain it back

```explain
Why can a heap live in a list with no pointers?
Walk through what push does when a new smallest item arrives.
Why is heapify O(n) but pushing n items one by one O(n log n)?
```

## Flashcards

```flashcards
Where is the smallest item of a min-heap? :: At index 0 (the root).
Children of index i? Parent? :: Children 2i+1 and 2i+2. Parent (i-1)//2.
Push and pop cost? :: O(log n) each.
heapify cost? :: O(n)
Is a heap list sorted? :: No. Only the top is guaranteed.
Max-heap with heapq? :: Push negatives (or heappush_max in Python 3.14+).
```
