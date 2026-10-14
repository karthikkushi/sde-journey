---
id: mono-queue
name: Monotonic queue
group: Stacks and queues
---

## Clues

```clues
Max or min of every sliding window
Sliding window maximum
Shortest subarray with sum at least K (advanced)
```

## Idea

A `deque` of indexes whose values go **down** from front to back. The front is always the max of the window. New items push out smaller ones from the back (they can never be the max again). Old items fall off the front when they leave the window.

## Template

```python
from collections import deque

def window_max(nums, k):
    dq = deque()                            # indexes; values decrease front to back
    result = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()                        # smaller items can never be the max again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()                    # the front has left the window
        if i >= k - 1:
            result.append(nums[dq[0]])      # the front is the max of this window
    return result

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))
```

```output
[3, 3, 5, 5, 6, 7]
```

## Walkthrough: Sliding Window Maximum

1. For each new index, pop smaller values from the back.
2. Append the new index.
3. If the front index is outside the window, pop it from the front.
4. Once the first full window is reached, the front value is the answer for this window.

## Traps

- Storing values instead of indexes: you then cannot tell when an item left the window.
- Checking the window edge with the wrong sign (`i - k` vs `i - k + 1`).
- Using a list with `pop(0)`: O(n) per pop. Use `deque`.
