---
id: a16-heapq
title: heapq (priority queue)
level: core
phase: 2
week: 19
tags: [python, heap, priority-queue]
estMinutes: 20
---

## What it is

A **heap** always lets you take the **smallest** item quickly.
In Python, a heap is a normal list that the `heapq` functions keep in a special order.
Add an item: O(log n). Take the smallest: O(log n). Look at the smallest: O(1).

## Real-life example

A hospital emergency room. Patients do not go in arrival order. The most urgent patient goes first.
New patients keep arriving, and each time the doctor needs "the most urgent one right now".
Sorting the whole list again for every new patient is wasteful. A heap keeps just enough order to answer "who is most urgent?" fast.

## Picture

The list `[1, 3, 2, 7, 5, 4]` seen as a tree. Each parent is **smaller than or equal to** its children. The children of index `i` are at `2i + 1` and `2i + 2`.

```svg
<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg">
  <path d="M180 34L100 94M180 34L260 94M100 94L60 154M100 94L140 154M260 94L220 154" class="line"/>
  <circle cx="180" cy="34" r="20" class="hi"/><text x="180" y="39" text-anchor="middle">1</text>
  <circle cx="100" cy="94" r="20" class="box"/><text x="100" y="99" text-anchor="middle">3</text>
  <circle cx="260" cy="94" r="20" class="box"/><text x="260" y="99" text-anchor="middle">2</text>
  <circle cx="60" cy="154" r="20" class="box"/><text x="60" y="159" text-anchor="middle">7</text>
  <circle cx="140" cy="154" r="20" class="box"/><text x="140" y="159" text-anchor="middle">5</text>
  <circle cx="220" cy="154" r="20" class="box"/><text x="220" y="159" text-anchor="middle">4</text>
  <text x="10" y="200" class="muted">the same heap as a list:</text>
  <rect x="10" y="208" width="50" height="30" class="hi"/><text x="35" y="228" text-anchor="middle">1</text>
  <rect x="60" y="208" width="50" height="30" class="box"/><text x="85" y="228" text-anchor="middle">3</text>
  <rect x="110" y="208" width="50" height="30" class="box"/><text x="135" y="228" text-anchor="middle">2</text>
  <rect x="160" y="208" width="50" height="30" class="box"/><text x="185" y="228" text-anchor="middle">7</text>
  <rect x="210" y="208" width="50" height="30" class="box"/><text x="235" y="228" text-anchor="middle">5</text>
  <rect x="260" y="208" width="50" height="30" class="box"/><text x="285" y="228" text-anchor="middle">4</text>
</svg>
```

## How it works inside

- **Push**: put the new item at the end of the list, then **swap it upwards** while it is smaller than its parent. The tree has about log₂(n) levels, so at most log n swaps.
- **Pop**: the smallest is at index 0. Move the last item to index 0, then **swap it downwards** with its smaller child until it fits. Again about log n swaps.
- **heapify**: turns any list into a heap in O(n) (faster than pushing items one by one).
- The list is **not fully sorted**. Only `heap[0]` is guaranteed to be the smallest.
- Python's `heapq` is a **min-heap**. For a max-heap, store negative numbers. (Python 3.14 also added `heappush_max` and friends, but LeetCode may run an older Python, so learn the minus trick.)
- With tuples like `(priority, item)`, the heap compares the first item, then the second.

## Python, step by step

```python
import heapq
tokens = []                         # a plain list used as a heap
for t in [7, 3, 9, 1, 5]:
    heapq.heappush(tokens, t)       # O(log n): keeps the smallest at index 0
print(tokens[0])                    # look at the smallest: O(1)
print(heapq.heappop(tokens))        # remove the smallest: O(log n)
print(heapq.heappop(tokens))
print(tokens)                       # the rest: heap order, not sorted order
```

```output
1
1
3
[5, 7, 9]
```

Max-heap with negative numbers:

```python
import heapq
runs = [45, 82, 13, 67]
heap = [-r for r in runs]      # the biggest number becomes the smallest negative
heapq.heapify(heap)            # make it a heap in O(n)
print(-heapq.heappop(heap))    # biggest
print(-heapq.heappop(heap))    # next biggest
```

```output
82
67
```

Priorities with tuples:

```python
import heapq
orders = []
heapq.heappush(orders, (2, "dal"))     # (priority, item): smaller number = more urgent
heapq.heappush(orders, (1, "milk"))
heapq.heappush(orders, (3, "rice"))
while orders:
    priority, item = heapq.heappop(orders)
    print(priority, item)
```

```output
1 milk
2 dal
3 rice
```

Top K with a small heap:

```python
import heapq
scores = [45, 82, 13, 67, 99, 21]
print(heapq.nlargest(3, scores))
print(heapq.nsmallest(2, scores))

k = 3
heap = []                        # keep only the k biggest seen so far
for s in scores:
    heapq.heappush(heap, s)
    if len(heap) > k:
        heapq.heappop(heap)      # drop the smallest of them
print(heap[0])                   # the smallest of the top 3 = the 3rd largest
```

```output
[99, 82, 67]
[13, 21]
67
```

## Time and space

| Operation | Time |
| --- | --- |
| `heappush` | O(log n) |
| `heappop` | O(log n) |
| `heap[0]` (peek) | O(1) |
| `heapify(list)` | O(n) |
| `nlargest(k, a)` / `nsmallest` | O(n log k) |
| keep a heap of size k over n items | O(n log k) time, O(k) space |

## Common mistakes

- Thinking the heap list is sorted. Only index 0 is special.
- Forgetting that `heapq` is a **min**-heap. Negate for max.
- Pushing tuples whose second items cannot be compared (like dicts). If priorities tie, Python compares the second items and crashes. Add a counter: `(priority, count, item)`.
- `heap[0]` on an empty heap raises `IndexError`. Check `if heap:` first.
- Sorting the whole list each time you need the smallest. That is O(n log n) per step instead of O(log n).

## Patterns that use it

- **Top K with heap**: Kth largest, K closest points, top K frequent.
- **K-way merge**: merge K sorted lists.
- **Two heaps**: running median.
- **Dijkstra**: always expand the closest node next.
- **Scheduling**: task scheduler, meeting rooms II.

## Practice

```practice
Push 10 random numbers into a heap and pop them all. Check that they come out sorted.
Use a heap of (priority, item) to simulate an emergency room with 5 patients.
last-stone-weight
relative-ranks
kth-largest-element-in-a-stream
kth-largest-element-in-an-array
k-closest-points-to-origin
top-k-frequent-elements
```

## Explain it back

```explain
Why is a heap faster than sorting again every time a new item arrives?
Where are the children of index i in a heap list?
How do you make a max-heap with heapq?
Why does a heap of size k give you the k-th largest item?
```

## Flashcards

```flashcards
Where is the smallest item in a heapq heap? :: heap[0]
Cost of heappush and heappop? :: O(log n)
Cost of heapify? :: O(n)
How do you get a max-heap from heapq? :: Push negative numbers, negate when popping.
Children of index i? :: 2i + 1 and 2i + 2
Is a heap list sorted? :: No. Only heap[0] is guaranteed smallest.
Kth largest with a heap? :: Keep a min-heap of size k; heap[0] is the answer.
```
