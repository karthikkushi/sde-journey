---
id: d-dp-bitmask
title: Bitmask DP (intro)
level: advanced
phase: 3
week: 36
tags: [dsa, dp, bitmask, bits]
estMinutes: 25
---

## What it is

A **bitmask** stores a small set as the bits of one integer: bit i is 1 if item i is in the set.
**Bitmask DP** uses that integer as part of the DP state: `dp[mask][...]` = the best answer when exactly the items in `mask` are used.
It works only when the number of items is small (about 20 or less), because there are 2ⁿ masks.

## Real-life example

A delivery rider must visit 4 shops once each and come back. With 4 shops, the "set of shops already visited" can be written as 4 bits: `1011` = shops 0, 1 and 3 visited. For each set and each "current shop", remember the cheapest way to get there.

## Picture

```text
 items:        shop3 shop2 shop1 shop0
 mask 0b1011:    1     0     1     1       visited = {0, 1, 3}

 useful bit operations:
   mask & (1 << i)    is item i in the set?
   mask | (1 << i)    add item i
   mask ^ (1 << i)    remove (toggle) item i
   (1 << n) - 1       all n items (0b1111 for n = 4)
```

## How it works inside

- There are 2ⁿ masks: 2²⁰ ≈ 1 million is fine; 2³⁰ is not.
- **Travelling salesman (TSP)**: `dp[mask][last]` = the cheapest route that starts at 0, visits exactly the shops in `mask`, and ends at `last`. Transition: from `dp[mask][last]` go to a new shop `nxt` not in `mask`.
- Process masks in **increasing** order: a mask with one more bit is always a bigger number, so smaller sets are done first.
- Total cost: O(2ⁿ × n²) for TSP. Brute force over all orders would be O(n!).
- Other uses: assigning n tasks to n people, "visit all keys", partitioning into k equal groups (n ≤ 16).

## Python, step by step

Every subset of 3 items, as masks:

```python
items = ["dal", "rice", "roti"]
n = len(items)
for mask in range(1 << n):                       # 0 .. 7
    chosen = [items[i] for i in range(n) if mask & (1 << i)]
    print(format(mask, "03b"), chosen)
```

```output
000 []
001 ['dal']
010 ['rice']
011 ['dal', 'rice']
100 ['roti']
101 ['dal', 'roti']
110 ['rice', 'roti']
111 ['dal', 'rice', 'roti']
```

Travelling salesman with bitmask DP:

```python
def tsp(dist):
    n = len(dist)
    INF = float("inf")
    dp = [[INF] * n for _ in range(1 << n)]       # dp[mask][last]
    dp[1][0] = 0                                  # start at shop 0; visited = {0}
    for mask in range(1 << n):
        for last in range(n):
            if dp[mask][last] == INF:
                continue
            for nxt in range(n):
                if mask & (1 << nxt):
                    continue                      # already visited
                new_mask = mask | (1 << nxt)
                cost = dp[mask][last] + dist[last][nxt]
                if cost < dp[new_mask][nxt]:
                    dp[new_mask][nxt] = cost
    full = (1 << n) - 1
    return min(dp[full][last] + dist[last][0] for last in range(n))   # return home

dist = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]
print(tsp(dist))
```

```output
80
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| List all subsets | O(2ⁿ × n) | O(n) |
| TSP with bitmask DP | O(2ⁿ × n²) | O(2ⁿ × n) |
| TSP by trying every order | O(n!) | |

## Common mistakes

- Using it when n is 30 or more (2ⁿ is too big).
- Operator precedence: write `mask & (1 << i)` with brackets.
- Forgetting the start state (`dp[1][0] = 0`).
- Mixing up "item i is in mask" (`mask >> i & 1`) and "mask has i items" (`bin(mask).count("1")`).

## Patterns that use it

**Bit tricks** + **DP**: TSP-style routes, assignment problems, "shortest path visiting all nodes", partition into k equal subsets.

## Practice

```practice
subsets
counting-bits
shortest-path-visiting-all-nodes
partition-to-k-equal-sum-subsets
```

## Explain it back

```explain
How does an integer represent a set of items?
What does dp[mask][last] mean in the TSP solution?
Why are masks processed in increasing order?
Why is bitmask DP only for small n?
```

## Flashcards

```flashcards
Is item i in mask? :: mask & (1 << i) != 0
Add item i to mask? :: mask | (1 << i)
All n items as a mask? :: (1 << n) - 1
Number of masks for n items? :: 2^n
TSP bitmask DP cost? :: O(2^n × n²)
Max n for bitmask DP? :: About 20.
```
