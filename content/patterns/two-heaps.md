---
id: two-heaps
name: Two heaps (running median)
group: Heaps
---

## Clues

```clues
Running median of a stream of numbers
Median of each sliding window
Split numbers into a smaller half and a bigger half
```

## Idea

Keep the **smaller half** in a max-heap (`low`) and the **bigger half** in a min-heap (`high`). Keep the sizes equal, or `low` one bigger. The median is the top of `low`, or the average of both tops.

```text
low (max-heap)     high (min-heap)
   1  3   | 5 |       15
          ↑ top of low = median when sizes differ
```

## Template

```python
import heapq

class MedianFinder:
    def __init__(self):
        self.low = []      # max-heap of the smaller half (stored as negatives)
        self.high = []     # min-heap of the bigger half

    def add(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))    # move low's biggest to high
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))  # keep low >= high in size

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

m = MedianFinder()
out = []
for x in [5, 15, 1, 3]:
    m.add(x)
    out.append(m.median())
print(out)
```

```output
[5, 10.0, 5, 4.0]
```

## Walkthrough: Find Median from Data Stream

1. Each new number goes into `low` first, then `low`'s biggest moves to `high`. This keeps every number in `low` ≤ every number in `high`.
2. If `high` became bigger, move its smallest back to `low`.
3. `add` is O(log n). `median` is O(1).

## Traps

- Forgetting the minus signs for the max-heap.
- Letting the sizes differ by more than one.
- For a sliding window median, you also need to remove old numbers (lazy deletion). Harder: do it after this one.
