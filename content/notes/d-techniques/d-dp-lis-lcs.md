---
id: d-dp-lis-lcs
title: LIS, LCS and edit distance
level: core
phase: 3
week: 28
tags: [dsa, dp, strings, binary-search]
estMinutes: 35
---

## What it is

Three classic DP problems you must know:
- **LIS**: the longest **increasing subsequence** of a list (items in order, not necessarily next to each other).
- **LCS**: the longest **common subsequence** of two strings.
- **Edit distance**: the fewest insert, delete or replace steps to turn one word into another.

## Real-life example

- LIS: from a month of daily step counts, the longest run of days (skipping some) where each counted day beat the last.
- LCS: comparing two versions of a document to see what stayed the same (how `git diff` thinks).
- Edit distance: phone autocorrect deciding that "hte" is closest to "the".

## Picture

```text
 LIS with "tails" (smallest possible tail for each length):
 nums: 10  9  2  5  3  7  101  18
 tails after each:
   [10] → [9] → [2] → [2,5] → [2,3] → [2,3,7] → [2,3,7,101] → [2,3,7,18]
 length 4 (tails is NOT the subsequence itself, only its length is right)

 edit distance "horse" → "ros" = 3:  replace h→r, delete r, delete e
```

## How it works inside

**LIS**
- O(n²): `dp[i]` = length of the LIS **ending at** i = 1 + max(`dp[j]`) for `j < i` with `nums[j] < nums[i]`.
- O(n log n): keep `tails[k]` = the smallest tail of any increasing subsequence of length k + 1. For each number, `bisect_left` finds where it goes: replace that tail, or append. The length of `tails` is the answer.

**LCS** (two strings a, b)
- `dp[i][j]` = LCS of `a[:i]` and `b[:j]`. If the last characters match: `dp[i-1][j-1] + 1`; else `max(dp[i-1][j], dp[i][j-1])`.
- To **rebuild** the actual subsequence, walk back from `dp[len(a)][len(b)]`.

**Edit distance**
- `dp[i][j]` = edits to turn `a[:i]` into `b[:j]`. Base: `dp[i][0] = i` (delete all), `dp[0][j] = j` (insert all).
- Match: `dp[i-1][j-1]`. Else 1 + min(delete `dp[i-1][j]`, insert `dp[i][j-1]`, replace `dp[i-1][j-1]`).

## Python, step by step

LIS two ways:

```python
from bisect import bisect_left

def lis_quadratic(nums):
    dp = [1] * len(nums)                  # dp[i]: LIS ending at i
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)

def lis_fast(nums):
    tails = []                            # tails[k]: smallest tail of an increasing run of length k+1
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)               # x extends the longest run
        else:
            tails[i] = x                  # x is a smaller tail for length i+1
    return len(tails)

nums = [10, 9, 2, 5, 3, 7, 101, 18]
print(lis_quadratic(nums), lis_fast(nums), lis_fast([7, 7, 7]))
```

```output
4 4 1
```

LCS with the actual subsequence rebuilt:

```python
def lcs(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    out, i, j = [], len(a), len(b)        # walk back to find which characters were used
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i, j = i - 1, j - 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp[-1][-1], "".join(reversed(out))

print(lcs("abcde", "ace"), lcs("AGGTAB", "GXTXAYB"))
```

```output
(3, 'ace') (4, 'GTAB')
```

Edit distance:

```python
def edit_distance(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        dp[i][0] = i                      # delete everything
    for j in range(len(b) + 1):
        dp[0][j] = j                      # insert everything
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j],      # delete from a
                                   dp[i][j - 1],      # insert into a
                                   dp[i - 1][j - 1])  # replace
    return dp[-1][-1]

print(edit_distance("horse", "ros"), edit_distance("intention", "execution"), edit_distance("hte", "the"))
```

```output
3 5 2
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| LIS (simple) | O(n²) | O(n) |
| LIS (tails + bisect) | O(n log n) | O(n) |
| LCS | O(a × b) | O(a × b), O(b) for length only |
| Edit distance | O(a × b) | O(a × b), O(b) with one row |

## Common mistakes

- Thinking `tails` is the actual increasing subsequence (only its length is right).
- `bisect_right` instead of `bisect_left` for **strictly** increasing.
- Off-by-one: row i means "first i characters", so the character is `a[i - 1]`.
- Forgetting the base row and column in edit distance.

## Patterns that use it

**DP 1D** (LIS and its cousins: longest string chain, number of LIS), **DP on strings** (LCS, edit distance, distinct subsequences, interleaving string), and **binary search** inside DP.

## Practice

```practice
longest-increasing-subsequence
number-of-longest-increasing-subsequence
longest-string-chain
longest-common-subsequence
edit-distance
distinct-subsequences
longest-palindromic-subsequence
```

## Explain it back

```explain
Explain the O(n log n) LIS idea: what does tails[k] hold?
For LCS, what happens when the last characters match, and when they do not?
Name the three edit operations and the dp cell each one comes from.
```

## Flashcards

```flashcards
LIS O(n²) state? :: dp[i] = length of the LIS ending at index i.
LIS O(n log n)? :: Keep tails; bisect_left each number; replace or append.
LCS transition? :: Match: dp[i-1][j-1] + 1. Else max(dp[i-1][j], dp[i][j-1]).
Edit distance base cases? :: dp[i][0] = i, dp[0][j] = j.
Edit distance three moves? :: Delete dp[i-1][j], insert dp[i][j-1], replace dp[i-1][j-1].
Subsequence vs substring? :: Subsequence can skip characters; substring cannot.
```
