---
id: greedy
name: Greedy
group: Intervals and greedy
---

## Clues

```clues
Take the best choice now and never look back
Jump game: how far can I reach?
Gas station
Pick the most non-overlapping activities (sort by end time)
Pair or assign items after sorting
```

## Idea

At each step, make the choice that looks best **right now**, and never undo it. It is fast and simple, but only correct when you can argue "a best choice now never hurts later". If you cannot argue that, it is probably DP.

## Template

```python
def can_jump(nums):                   # Jump Game
    farthest = 0
    for i, step in enumerate(nums):
        if i > farthest:
            return False              # we cannot even reach index i
        farthest = max(farthest, i + step)
    return True

def max_meetings(meetings):           # most meetings with no overlap
    meetings.sort(key=lambda m: m[1])           # earliest END first
    count, free_at = 0, float("-inf")
    for start, end in meetings:
        if start >= free_at:
            count += 1
            free_at = end
    return count

print(can_jump([2, 3, 1, 1, 4]), can_jump([3, 2, 1, 0, 4]), max_meetings([[1, 3], [2, 4], [3, 5], [6, 7]]))
```

```output
True False 3
```

## Walkthrough: Gas Station

1. If total gas < total cost, no start works.
2. Otherwise, walk once with a running tank. If the tank goes below 0 at station i, no start from the current start up to i can work: start again at i + 1 with an empty tank.
3. The last start you set is the answer.

## Traps

- Using greedy where it fails (for example, coin change with coins [1, 3, 4] and amount 6: greedy takes 4+1+1, but 3+3 is better). Test small cases.
- Sorting by the wrong key (start instead of end).
- Not being able to explain **why** the greedy choice is safe. In interviews, explain it.
