---
id: dp-strings
name: DP on strings
group: Dynamic programming
---

## Clues

```clues
Two strings: longest common subsequence, edit distance, interleaving
dp[i][j] = answer for the first i chars of A and the first j chars of B
Palindromic substrings or the longest palindrome
Distinct subsequences
```

## Idea

Make a table with one extra row and column for "empty string". Compare the last characters: if they match, use the diagonal; if not, take the best of skipping one character from either string.

```text
      ""  a  c  e
  ""   0  0  0  0
  a    0  1  1  1
  b    0  1  1  1
  c    0  1  2  2
  d    0  1  2  2
  e    0  1  2  3     LCS("abcde", "ace") = 3
```

## Template

```python
def lcs(a, b):                                       # Longest Common Subsequence
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1      # use this char in both
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])   # skip one char
    return dp[-1][-1]

def edit_distance(a, b):
    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
    for i in range(len(a) + 1):
        dp[i][0] = i                                 # delete everything
    for j in range(len(b) + 1):
        dp[0][j] = j                                 # insert everything
    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:                                    # delete, insert, replace
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[-1][-1]

print(lcs("abcde", "ace"), edit_distance("horse", "ros"))
```

```output
3 3
```

## Walkthrough: Palindromic Substrings

1. Every palindrome has a centre: one character (odd length) or between two characters (even length).
2. For each of the 2n − 1 centres, expand outwards while both sides match. Count each step.
3. O(n²) time and O(1) space. Simpler than a 2D table here.

## Traps

- Index shift: row i means "first i characters", so the character is `a[i - 1]`.
- Forgetting the empty-string row and column.
- Mixing up subsequence (can skip characters) and substring (must be continuous).
