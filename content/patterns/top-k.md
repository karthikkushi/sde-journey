---
id: top-k
name: Top K with a heap
group: Heaps
---

## Clues

```clues
K largest, K smallest or K closest
K most frequent
Kth largest
A stream of numbers: keep the top K
```

## Idea

Keep a **min-heap of size K**. Push each item. If the heap grows past K, pop the smallest. At the end, the heap holds the K biggest, and `heap[0]` is the Kth largest. O(n log k) time, O(k) space.

## Template

```python
import heapq
from collections import Counter

def k_largest(nums, k):
    heap = []                             # min-heap of the k biggest so far
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)           # drop the smallest of them
    return sorted(heap, reverse=True)

def top_k_frequent(nums, k):
    count = Counter(nums)
    return [x for x, _ in heapq.nlargest(k, count.items(), key=lambda item: item[1])]

print(k_largest([5, 1, 9, 3, 7, 2], 3), top_k_frequent([1, 1, 1, 2, 2, 3], 2))
```

```output
[9, 7, 5] [1, 2]
```

## Walkthrough: K Closest Points to Origin

1. The "distance" is `x*x + y*y` (no need for the square root).
2. Keep a **max**-heap of size k (push negative distances).
3. When it grows past k, pop the farthest. What is left are the k closest.

## Traps

- Using a max-heap for "K largest" and pushing all n items: O(n log n), and more memory.
- Forgetting heapq is a **min**-heap.
- Sorting everything when n is huge and k is small.
