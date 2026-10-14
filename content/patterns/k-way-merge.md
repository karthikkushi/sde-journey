---
id: k-way-merge
name: K-way merge
group: Heaps
---

## Clues

```clues
Merge K sorted lists or arrays
Kth smallest in a sorted matrix
K pairs with the smallest sums
Smallest range covering a number from each of K lists
```

## Idea

Put the **first** item of each list in a min-heap, with a note of which list it came from. Pop the smallest, add it to the answer, and push the **next** item from the same list. The heap never holds more than K items: O(N log K) for N total items.

## Template

```python
import heapq

def merge_k_sorted(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]   # (value, which list, index)
    heapq.heapify(heap)
    merged = []
    while heap:
        value, i, j = heapq.heappop(heap)          # the smallest front item of all lists
        merged.append(value)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))   # that list's next item
    return merged

print(merge_k_sorted([[1, 4, 7], [2, 5, 8], [3, 6, 9, 10]]))
```

```output
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

## Walkthrough: Merge K Sorted Lists (linked lists)

1. Push `(node.val, i, node)` for the head of each list. The index `i` breaks ties, so Python never compares two nodes.
2. Pop the smallest, attach it to the answer, push its `next` if any.
3. Use a dummy head to keep the code simple.

## Traps

- Pushing nodes without a tie-breaker: `TypeError` when two values are equal.
- Merging lists two at a time in a row: O(N·K). The heap gives O(N log K).
- Empty lists in the input.
