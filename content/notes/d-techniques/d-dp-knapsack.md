---
id: d-dp-knapsack
title: Dynamic programming 3 (knapsack)
level: core
phase: 3
week: 30
tags: [dsa, dp, knapsack, subset-sum]
estMinutes: 35
---

## What it is

**Knapsack** problems: you have items, each with a size (weight, cost, value of the number), and a limit (capacity, target sum). For each item you decide: **take it or leave it**.
`dp[c]` = the best (or "possible?", or "how many ways") using capacity c.
Two kinds: **0/1** (each item once) and **unbounded** (items can repeat).

## Real-life example

Packing a bag for a 7 kg airline limit. Items: charger (1 kg, value 1), books (3 kg, value 4), snacks (4 kg, value 5), jacket (5 kg, value 7). Which set gives the most value without going over 7 kg? Books + snacks = 7 kg, value 9.

## Picture

```text
 0/1 knapsack, capacity 7, one row updated item by item (go DOWN through capacities)

 capacity:       0  1  2  3  4  5  6  7
 start:          0  0  0  0  0  0  0  0
 + charger(1,1): 0  1  1  1  1  1  1  1
 + books(3,4):   0  1  1  4  5  5  5  5
 + snacks(4,5):  0  1  1  4  5  6  6  9
 + jacket(5,7):  0  1  1  4  5  7  8  9     → best value 9
```

## How it works inside

- **State**: `dp[c]` = best value (or reachable, or number of ways) with capacity `c` using the items seen so far.
- **Transition** for an item of size `w`: `dp[c] = best(dp[c], dp[c - w] + value)` (leave it, or take it).
- **0/1 vs unbounded is just the loop direction** over `c`:
  - Go **down** (`for c from cap to w`): `dp[c - w]` is still from **before** this item, so it is used at most once.
  - Go **up**: `dp[c - w]` may already include this item, so it can be used again.
- **Counting**: replace `max` with `+`, and start with `dp[0] = 1` (one way to make 0: take nothing).
- **Combinations vs orders**: loop **items outside, amounts inside** to count combinations (1+2 = 2+1 once). Swap the loops to count **ordered** sequences.
- Many problems hide a knapsack: "split into two equal halves" (subset sum to total/2), "+ and − signs to reach a target" (subset sum to (total + target) / 2).

## Python, step by step

0/1 knapsack, as a table and as one row:

```python
def knapsack_table(weights, values, cap):
    n = len(weights)
    dp = [[0] * (cap + 1) for _ in range(n + 1)]   # dp[i][c]: first i items, capacity c
    for i in range(1, n + 1):
        w, v = weights[i - 1], values[i - 1]
        for c in range(cap + 1):
            dp[i][c] = dp[i - 1][c]                  # leave item i
            if w <= c:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)   # take it
    return dp[n][cap]

def knapsack_row(weights, values, cap):
    dp = [0] * (cap + 1)
    for w, v in zip(weights, values):
        for c in range(cap, w - 1, -1):              # DOWN: each item at most once
            dp[c] = max(dp[c], dp[c - w] + v)
    return dp[cap]

w, v = [1, 3, 4, 5], [1, 4, 5, 7]
print(knapsack_table(w, v, 7), knapsack_row(w, v, 7))
```

```output
9 9
```

Combinations vs orders: the same coins, two loop orders:

```python
def count_combinations(coins, amount):     # 1+2 and 2+1 count once
    ways = [1] + [0] * amount
    for c in coins:                         # items outside
        for a in range(c, amount + 1):      # amounts inside, UP (coins repeat)
            ways[a] += ways[a - c]
    return ways[amount]

def count_orders(coins, amount):            # 1+2 and 2+1 count twice
    ways = [1] + [0] * amount
    for a in range(1, amount + 1):          # amounts outside
        for c in coins:                     # items inside
            if c <= a:
                ways[a] += ways[a - c]
    return ways[amount]

print(count_combinations([1, 2, 5], 5), count_orders([1, 2, 5], 5))
```

```output
4 9
```

A hidden knapsack: target sum with + and − signs:

```python
def find_target_sum_ways(nums, target):
    total = sum(nums)
    # P - (total - P) = target  ->  P = (total + target) / 2
    if (total + target) % 2 or abs(target) > total:
        return 0
    goal = (total + target) // 2
    ways = [1] + [0] * goal
    for x in nums:
        for s in range(goal, x - 1, -1):    # DOWN: each number once (0/1)
            ways[s] += ways[s - x]
    return ways[goal]

print(find_target_sum_ways([1, 1, 1, 1, 1], 3))
```

```output
5
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| 0/1 knapsack, n items, capacity C | O(n × C) | O(C) with one row |
| Unbounded knapsack / coin change | O(n × C) | O(C) |
| Subset sum / partition | O(n × total) | O(total) |

Note: O(n × C) depends on the **value** of C. With C up to 10⁹ this does not work.

## Common mistakes

- Looping **up** in 0/1 knapsack: an item gets used many times.
- Swapping the loops when counting combinations (you count orders instead).
- `dp[0] = 0` when counting ways (it must be 1).
- Not spotting the hidden knapsack (partition, target sum, last stone weight II).

## Patterns that use it

**DP knapsack** (partition equal subset sum, target sum, coin change, coin change II, ones and zeroes, perfect squares).

## Practice

```practice
partition-equal-subset-sum
target-sum
coin-change
coin-change-ii
last-stone-weight-ii
ones-and-zeroes
perfect-squares
```

## Explain it back

```explain
Explain "take it or leave it" with the airline bag example.
Why does looping down make each item usable only once?
Why does the loop order decide combinations vs orders?
How does target sum turn into a subset sum problem?
```

## Flashcards

```flashcards
Knapsack transition? :: dp[c] = best(dp[c], dp[c - w] + value)
0/1 knapsack loop direction? :: Capacities DOWN (each item once).
Unbounded knapsack loop direction? :: Capacities UP (items can repeat).
Count combinations, not orders? :: Items in the outer loop, amounts inside.
dp[0] when counting ways? :: 1 (take nothing).
Target sum becomes? :: Subset sum to (total + target) / 2.
```
