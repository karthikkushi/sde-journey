---
id: dp-knapsack
name: DP knapsack
group: Dynamic programming
---

## Clues

```clues
Pick a subset to reach an exact target sum
Each item: take it or leave it
Split into two halves with equal sums
Count the ways to make an amount (coin change II)
A capacity or budget limit
```

## Idea

`dp[s]` = can we make sum s (or: how many ways, or the best value). For each item, update the sums it can help reach.
- **0/1** (each item once): loop the sums **downwards**, so an item is not used twice.
- **Unbounded** (reuse allowed): loop the sums **upwards**.

## Template

```python
def can_partition(nums):                     # 0/1: each number at most once
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    can = [True] + [False] * target          # can[s] = some subset sums to s
    for x in nums:
        for s in range(target, x - 1, -1):   # DOWN: each number used once
            can[s] = can[s] or can[s - x]
    return can[target]

def count_ways(coins, amount):               # unbounded: coins can repeat
    ways = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):       # UP: a coin can be reused
            ways[a] += ways[a - c]
    return ways[amount]

print(can_partition([1, 5, 11, 5]), can_partition([1, 2, 3, 5]), count_ways([1, 2, 5], 5))
```

```output
True False 4
```

## Walkthrough: Target Sum

1. Some numbers get `+`, the rest `-`. If P is the plus-group sum: `P - (total - P) = target`, so `P = (total + target) / 2`.
2. If that is not a whole number, or is negative, the answer is 0.
3. Now count subsets that sum to P: a 0/1 knapsack counting ways (loop sums downwards).

## Traps

- Looping upwards in 0/1 knapsack: items get reused.
- In coin change II, putting the coins loop inside the amounts loop counts **orders** (permutations), not combinations.
- Forgetting `dp[0] = 1` (one way to make 0: take nothing).
