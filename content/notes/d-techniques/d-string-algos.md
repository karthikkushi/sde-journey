---
id: d-string-algos
title: String algorithms (KMP and rolling hash)
level: advanced
phase: 3
week: 39
tags: [dsa, strings, kmp, hashing]
estMinutes: 30
---

## What it is

Finding a pattern of length m inside a text of length n the simple way can take O(n × m).
**KMP** does it in O(n + m) by never re-reading text it has already matched.
**Rolling hash** (Rabin-Karp) turns each window of the text into a number that can be updated in O(1) as the window slides.

## Real-life example

Searching for "ababc" in a long chat log. When you have matched "abab" and then see a mismatch, you do not go back to the start: you already know the last "ab" could be the start of a new match. KMP writes that knowledge down in a small table before searching.

## Picture

```text
 prefix function (lps) for pattern "aabaaab"
 index:   0  1  2  3  4  5  6
 char:    a  a  b  a  a  a  b
 lps:     0  1  0  1  2  2  3

 lps[i] = length of the longest proper prefix of pattern[:i+1]
          that is also a suffix of it.   e.g. "aabaaab" → "aab" is both → 3
```

## How it works inside

**KMP**
1. Build `lps` for the pattern: for each position, how long is the longest part that is both a prefix and a suffix (not the whole thing)?
2. Search: walk the text once. On a match, move forward in the pattern. On a mismatch, jump the pattern position back to `lps[j - 1]` instead of 0. The text pointer never moves back.
3. O(n + m) time, O(m) space.

**Rolling hash**
- Treat a window as a number in base B (like digits), mod a big prime: `h = (c0·B^(k-1) + c1·B^(k-2) + ... + c(k-1)) mod P`.
- Slide: remove the left character's part, multiply by B, add the new character. O(1) per step.
- Equal hashes **probably** mean equal strings. To be safe, compare the actual strings when hashes match (or use two different hashes).

**In practice**: Python's `in` and `str.find` are already fast and well optimised. In interviews, KMP/rolling hash come up in "repeated substring", "longest happy prefix", "repeated DNA sequences" and "shortest palindrome" style problems.

## Python, step by step

KMP prefix function and search:

```python
def prefix_function(p):
    lps = [0] * len(p)
    k = 0                                   # length of the current prefix-suffix match
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]                  # fall back to a shorter prefix
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    return lps

def kmp_search(text, p):
    lps, j, found = prefix_function(p), 0, []
    for i, ch in enumerate(text):
        while j and ch != p[j]:
            j = lps[j - 1]                  # the text pointer i never goes back
        if ch == p[j]:
            j += 1
        if j == len(p):                     # full match ending at i
            found.append(i - len(p) + 1)
            j = lps[j - 1]
    return found

print(prefix_function("aabaaab"))
print(kmp_search("abababcab", "abab"), kmp_search("aaaa", "aa"))
```

```output
[0, 1, 0, 1, 2, 2, 3]
[0, 2] [0, 1, 2]
```

Rolling hash: find 10-letter DNA pieces that appear more than once:

```python
def repeated_dna(s, k=10):
    if len(s) < k:
        return []
    B, P = 4, 2**61 - 1
    code = {"A": 0, "C": 1, "G": 2, "T": 3}
    top = pow(B, k - 1, P)                  # weight of the leftmost letter
    h = 0
    for ch in s[:k]:
        h = (h * B + code[ch]) % P          # hash of the first window
    seen, repeated = {h: 0}, set()
    for i in range(k, len(s)):
        h = ((h - code[s[i - k]] * top) * B + code[s[i]]) % P   # slide by one letter
        start = i - k + 1
        if h in seen and s[seen[h]:seen[h] + k] == s[start:start + k]:   # confirm the match
            repeated.add(s[start:start + k])
        seen.setdefault(h, start)
    return sorted(repeated)

print(repeated_dna("AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT"))
```

```output
['AAAAACCCCC', 'CCCCCAAAAA']
```

## Time and space

| Method | Time | Space |
| --- | --- | --- |
| Naive search | O(n × m) worst | O(1) |
| KMP | O(n + m) | O(m) |
| Rolling hash search | O(n + m) expected | O(1) per window (plus a set if collecting) |
| Python `in` / `find` | fast in practice | |

## Common mistakes

- Resetting the pattern position to 0 on a mismatch (that is the naive method).
- Forgetting `j = lps[j - 1]` after a full match, so overlapping matches are missed.
- Trusting a hash match without checking the strings.
- Negative numbers in the rolling update: Python's `%` fixes it, but in C#/Java add P before `%`.

## Patterns that use it

String matching (find the first occurrence), **repeated substring pattern** (use `lps`), **longest happy prefix** (`lps[-1]`), **repeated DNA sequences** (rolling hash or a set of slices), and **sliding window** with a hash.

## Practice

```practice
find-the-index-of-the-first-occurrence-in-a-string
repeated-substring-pattern
longest-happy-prefix
repeated-dna-sequences
```

## Explain it back

```explain
What does lps[i] mean, in your own words?
Why does KMP never move the text pointer backwards?
How does a rolling hash update in O(1) when the window slides?
Why must you double-check a hash match?
```

## Flashcards

```flashcards
KMP time? :: O(n + m)
lps[i]? :: Longest proper prefix of pattern[:i+1] that is also its suffix.
On mismatch, KMP jumps to? :: j = lps[j - 1]
Longest happy prefix answer? :: lps[-1] (as a length).
Rolling hash slide? :: Remove the left letter's part, multiply by B, add the new letter, mod P.
Hashes equal means strings equal? :: Probably. Confirm by comparing the strings.
```
