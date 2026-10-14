---
id: dp-1d
name: DP 1D
group: Dynamic programming
---

## Clues

```clues
Count the ways to reach step n
Best total with a choice at each step (rob this house or skip it)
The answer for i depends on i - 1, i - 2, ...
Decode ways, word break, coin change
```

## Idea

Define `dp[i]` in **one clear sentence** ("the best money robbing houses 0..i"). Find how `dp[i]` comes from smaller ones. Fill from small to big. Often only the last one or two values are needed, so space can drop to O(1).

Steps: 1) recursion, 2) add memo, 3) turn it into a table, 4) shrink the table.

## Template

```python
def rob(houses):                       # House Robber
    take, skip = 0, 0                  # best total if we robbed / skipped the previous house
    for money in houses:
        take, skip = skip + money, max(take, skip)
    return max(take, skip)

def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount          # dp[a] = fewest coins to make amount a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != INF else -1

print(rob([2, 7, 9, 3, 1]), coin_change([1, 2, 5], 11), coin_change([2], 3))
```

```output
12 3 -1
```

## Walkthrough: Climbing Stairs

1. Sentence: `dp[i]` = number of ways to reach step i.
2. The last move was 1 step (from i − 1) or 2 steps (from i − 2): `dp[i] = dp[i-1] + dp[i-2]`.
3. Base: `dp[0] = 1`, `dp[1] = 1`.
4. Only two values are needed: keep two variables. O(n) time, O(1) space.

## Traps

- No clear sentence for `dp[i]`. If you cannot say it, you cannot build it.
- Wrong base cases (off by one at 0 or 1).
- Starting with a table before the recursion is clear. Recursion first.
