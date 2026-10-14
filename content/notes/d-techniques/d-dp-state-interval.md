---
id: d-dp-state-interval
title: State machine DP and interval DP
level: advanced
phase: 3
week: 31
tags: [dsa, dp, state-machine, interval-dp]
estMinutes: 35
---

## What it is

Two DP shapes that look scary but follow simple rules:
- **State machine DP**: each day you are in one of a few **states** (holding a stock, not holding, cooling down). Keep the best value for each state and update them all every day.
- **Interval DP**: the answer for a range `[i, j]` is built from **smaller ranges inside it**. Fill by range length: short ranges first.

## Real-life example

- State machine: a shopkeeper each day is either "holding stock" or "not holding". From "not holding" he can buy (and becomes holding). From "holding" he can sell (and becomes not holding). He wants the most money at the end.
- Interval: popping balloons in a row where each pop earns (left × this × right). The order matters. Think about which balloon you pop **last** in a range.

## Picture

```text
 stock with at most 2 transactions: 4 states per day

   (start) ──buy1──▶ hold1 ──sell1──▶ free1 ──buy2──▶ hold2 ──sell2──▶ free2

 interval DP fill order (length 1, then 2, then 3...):
   [0,0] [1,1] [2,2] [3,3]
   [0,1] [1,2] [2,3]
   [0,2] [1,3]
   [0,3]                 ← the full answer, built from the smaller ranges
```

## How it works inside

**State machine**
1. Draw the states and the arrows between them (buy, sell, rest, cooldown).
2. Keep one variable per state: the best profit if you **end today** in that state.
3. Each day, compute every state from **yesterday's** values (update them together).
4. Start values: states you cannot be in yet start at minus infinity (you cannot "hold" before buying).

**Interval DP**
1. `dp[i][j]` = answer for the range `i..j`.
2. Split the range: try every `k` between `i` and `j` as "the last action" or "the split point".
3. Fill by **length**: all ranges of length 1, then 2, and so on, so the smaller ranges are ready.
4. Typical cost O(n³) (n² ranges × n split points), so n is small (up to ~500).

## Python, step by step

Best time to buy and sell stock, at most 2 transactions (4 states):

```python
def max_profit_two(prices):
    buy1 = buy2 = float("-inf")       # best profit while holding (after 1st or 2nd buy)
    sell1 = sell2 = 0                 # best profit after 1st or 2nd sale
    for p in prices:
        buy1 = max(buy1, -p)          # buy for the first time today
        sell1 = max(sell1, buy1 + p)  # sell the first one today
        buy2 = max(buy2, sell1 - p)   # buy the second, using the first profit
        sell2 = max(sell2, buy2 + p)  # sell the second
    return sell2

print(max_profit_two([3, 3, 5, 0, 0, 3, 1, 4]), max_profit_two([1, 2, 3, 4, 5]), max_profit_two([7, 6, 4, 3, 1]))
```

```output
6 4 0
```

(Updating in this order is safe here: using today's `buy1` in `sell1` means "buy and sell the same day", which adds 0 profit, so the answer does not change.)

Interval DP 1: longest palindromic subsequence:

```python
def longest_pal_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]          # dp[i][j]: answer for s[i..j]
    for i in range(n):
        dp[i][i] = 1                          # length 1: a palindrome
    for length in range(2, n + 1):            # short ranges first
        for i in range(n - length + 1):
            j = i + length - 1
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2      # both ends join the palindrome inside
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]

print(longest_pal_subseq("bbbab"), longest_pal_subseq("cbbd"))
```

```output
4 2
```

Interval DP 2: burst balloons ("which balloon is popped last in this range?"):

```python
def max_coins(nums):
    a = [1] + nums + [1]                      # padding: the edges count as 1
    n = len(a)
    dp = [[0] * n for _ in range(n)]          # dp[i][j]: best coins popping everything strictly between i and j
    for length in range(2, n):
        for i in range(n - length):
            j = i + length
            for k in range(i + 1, j):         # k is popped LAST, so its neighbours are i and j
                dp[i][j] = max(dp[i][j], dp[i][k] + a[i] * a[k] * a[j] + dp[k][j])
    return dp[0][n - 1]

print(max_coins([3, 1, 5, 8]))
```

```output
167
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| Stock with k transactions (state machine) | O(n × k) | O(k) |
| Stock with cooldown / fee | O(n) | O(1) |
| Longest palindromic subsequence | O(n²) | O(n²) |
| Burst balloons | O(n³) | O(n²) |

## Common mistakes

- Starting "holding" states at 0 instead of minus infinity.
- In interval DP, filling by `i` and `j` in the wrong order (a smaller range is not ready yet). Fill by length.
- Burst balloons: thinking about the **first** balloon to pop. Think about the **last**: then the left and right parts are independent.
- Off-by-one in the padded array.

## Patterns that use it

**DP state machine** (all the stock problems, paint house), **interval DP** (burst balloons, palindromic subsequence, matrix chain multiplication, minimum cost to cut a stick).

## Practice

```practice
best-time-to-buy-and-sell-stock-ii
best-time-to-buy-and-sell-stock-with-cooldown
best-time-to-buy-and-sell-stock-with-transaction-fee
best-time-to-buy-and-sell-stock-iii
best-time-to-buy-and-sell-stock-iv
longest-palindromic-subsequence
burst-balloons
```

## Explain it back

```explain
Draw the state diagram for "buy and sell with cooldown".
Why should holding states start at minus infinity?
Why does interval DP fill by length?
In burst balloons, why is "which balloon is popped last" the right question?
```

## Flashcards

```flashcards
State machine DP idea? :: One variable per state; update all from yesterday's values each day.
Start value of a "holding" state? :: Minus infinity.
Interval DP state? :: dp[i][j] = answer for the range i..j.
Interval DP fill order? :: By length: short ranges first.
Burst balloons key idea? :: Choose the balloon popped LAST in the range.
Usual cost of interval DP? :: O(n³).
```
