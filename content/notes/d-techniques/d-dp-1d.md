---
id: d-dp-1d
title: Dynamic programming 1 (1D)
level: core
phase: 3
week: 27
tags: [dsa, dp, recursion, memoization]
estMinutes: 40
---

## What it is

**Dynamic programming (DP)** = recursion that **remembers** answers, so each small problem is solved only once.
It works when (1) the same small problems repeat (**overlapping subproblems**) and (2) the best answer is built from best answers of smaller problems (**optimal substructure**).
"1D" means the state is one number: `dp[i]` = the answer for the first i items (or for step i).

## Real-life example

Counting the ways to climb 10 stairs taking 1 or 2 steps. To reach stair 10, your last move came from stair 9 or stair 8. So ways(10) = ways(9) + ways(8).
Without remembering, you would recount ways(8) again and again. With a notebook of answers, you count each stair once.

## Picture

```text
 plain recursion for ways(5): the same calls repeat

                    w5
              w4          w3
           w3    w2     w2   w1
         w2  w1 w1 w0  w1 w0
        w1 w0
  15 calls for n = 5; about 2ⁿ in general

 table (each computed once, left to right):
   i:     0  1  2  3  4  5
   dp:    1  1  2  3  5  8
```

## How it works inside

**The 4-step method (use it every time)**
1. **Recursion**: write `f(i)` in plain words, then as code calling smaller `f`s. Get the base cases right.
2. **Memo**: add `@cache` (or a dict). Now each `f(i)` runs once: O(n) for 1D.
3. **Table**: fill `dp[0..n]` from small to big with the same rule. No recursion limit.
4. **Shrink**: if `dp[i]` only needs the last one or two values, keep just those: O(1) space.

**Define the state in one sentence.** "`dp[i]` = the most money robbing houses 0..i." If you cannot say it, you cannot build it.

**Find the transition** by looking at the **last choice**: rob house i or skip it; the last step was 1 or 2; the last part of the string is one digit or two digits.

**Order**: fill so that every value you need is already computed.

## Python, step by step

The 4 steps on climbing stairs:

```python
from functools import cache

def ways_recursive(n):                 # step 1: correct but O(2^n)
    if n <= 1:
        return 1
    return ways_recursive(n - 1) + ways_recursive(n - 2)

@cache                                 # step 2: memo, O(n)
def ways_memo(n):
    if n <= 1:
        return 1
    return ways_memo(n - 1) + ways_memo(n - 2)

def ways_table(n):                     # step 3: table, no recursion
    dp = [1] * (n + 1)                 # dp[0] = dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

def ways_small(n):                     # step 4: only the last two values
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b

print(ways_recursive(10), ways_memo(10), ways_table(10), ways_small(10), ways_memo(80))
```

```output
89 89 89 89 37889062373143906
```

House robber: `dp[i]` = best money from houses 0..i:

```python
def rob(houses):
    if not houses:
        return 0
    dp = [0] * len(houses)
    dp[0] = houses[0]
    for i in range(1, len(houses)):
        skip = dp[i - 1]                                   # do not rob house i
        take = houses[i] + (dp[i - 2] if i >= 2 else 0)    # rob it: skip the neighbour
        dp[i] = max(skip, take)
    return dp[-1]

print(rob([2, 7, 9, 3, 1]), rob([5, 1, 1, 5]))
```

```output
12 10
```

Decode ways and word break (the last choice is "how long is the last piece?"):

```python
def num_decodings(s):
    dp = [1] + [0] * len(s)                    # dp[i] = ways to decode the first i characters
    for i in range(1, len(s) + 1):
        if s[i - 1] != "0":
            dp[i] += dp[i - 1]                 # last piece: one digit (1..9)
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            dp[i] += dp[i - 2]                 # last piece: two digits (10..26)
    return dp[-1]

def word_break(s, words):
    words = set(words)
    ok = [True] + [False] * len(s)             # ok[i] = s[:i] can be split into words
    for i in range(1, len(s) + 1):
        ok[i] = any(ok[j] and s[j:i] in words for j in range(i))
    return ok[-1]

print(num_decodings("226"), num_decodings("06"), num_decodings("11106"))
print(word_break("leetcode", ["leet", "code"]), word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]))
```

```output
3 0 2
True False
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| Climbing stairs / Fibonacci | O(n) | O(1) after shrinking |
| House robber | O(n) | O(1) after shrinking |
| Decode ways | O(n) | O(n) (O(1) possible) |
| Word break | O(n²) substring checks | O(n) |
| Coin change (amount A, k coins) | O(A × k) | O(A) |

## Common mistakes

- Starting with a table before the recursion is clear.
- No one-sentence meaning for `dp[i]`.
- Wrong base cases (`dp[0]`: is the empty prefix 1 way, or 0?).
- Filling in the wrong order (needing `dp[i + 1]` before it exists).
- Forgetting that `@cache` on a recursion of depth 10⁴ can still hit Python's recursion limit. Use the table.

## Patterns that use it

**DP 1D** (climbing stairs, house robber, decode ways, word break, coin change, LIS), and it is the base for **2D DP**, **knapsack**, **state machine** DP.

## Practice

```practice
climbing-stairs
min-cost-climbing-stairs
house-robber
house-robber-ii
decode-ways
coin-change
word-break
longest-increasing-subsequence
```

## Explain it back

```explain
What two properties must a problem have for DP to help?
Walk through the 4 steps (recursion, memo, table, shrink) on climbing stairs.
For house robber, say dp[i] in one sentence and explain the transition.
Why is "the last choice" a good way to find the transition?
```

## Flashcards

```flashcards
DP in one line? :: Recursion that remembers answers so each subproblem is solved once.
Two signs a problem needs DP? :: Overlapping subproblems and optimal substructure.
The 4 steps? :: Recursion, memo, table, shrink space.
How do you find the transition? :: Look at the last choice (take/skip, 1 or 2 steps, last piece).
House robber transition? :: dp[i] = max(dp[i-1], houses[i] + dp[i-2])
Decode ways transition? :: dp[i] += dp[i-1] if one digit is valid; += dp[i-2] if two digits are 10..26.
```
