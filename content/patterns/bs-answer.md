---
id: bs-answer
name: Binary search on the answer
group: Binary search
---

## Clues

```clues
Minimum speed / capacity / days such that something is possible
Minimize the maximum, or maximize the minimum
The answer is a number in a known range
"Is X enough?" is easy to check
If X works, every bigger X also works
```

## Idea

You do not search the array. You search the **possible answers**. Write `ok(x)`: "is x enough?". Because `ok` is false, false, ..., true, true (monotonic), binary search finds the first true. Total: O(log(range) × cost of ok).

```text
speed:   1   2   3   4   5   6 ... 11
ok?      F   F   F   T   T   T ...  T     → answer 4
```

## Template

```python
import math

def min_eating_speed(piles, hours):            # Koko Eating Bananas
    def can_finish(speed):                      # is this speed enough?
        return sum(math.ceil(p / speed) for p in piles) <= hours

    lo, hi = 1, max(piles)                      # the answer is in here
    while lo < hi:
        mid = (lo + hi) // 2
        if can_finish(mid):
            hi = mid                            # works: try smaller
        else:
            lo = mid + 1                        # too slow: go bigger
    return lo

print(min_eating_speed([3, 6, 7, 11], 8))
```

```output
4
```

## Walkthrough: Capacity to Ship Packages Within D Days

1. The smallest possible capacity is the heaviest package. The biggest useful one is the total weight.
2. `ok(cap)`: fill ships in order; start a new day when the next package does not fit. Is days ≤ D?
3. Binary search the smallest `cap` where `ok` is true.

## Traps

- Wrong bounds (for example `lo = 0`, which causes division by zero).
- `ok` that is not monotonic. Check: if x works, must x + 1 also work?
- Writing `ok` slowly (O(n²)). It runs log(range) times.
