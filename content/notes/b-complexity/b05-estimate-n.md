---
id: b05-estimate-n
title: Guess the Big O from input size
level: core
phase: 1
week: 6
tags: [complexity, big-o, constraints, interview]
estMinutes: 15
---

## What it is

Every LeetCode problem lists **constraints**, like `1 <= nums.length <= 10^5`.
These numbers secretly tell you **how fast** your solution must be.
Python does roughly **10 million (10⁷) simple steps per second**. Your solution should stay well under about 10⁸ steps.

## Real-life example

A kirana shop owner plans the day by the number of customers. For 10 customers, a slow, careful method is fine. For 1,000 customers, the method must be quick, or the queue reaches the road.
Read the input size first, then pick a method that fits.

## Picture

```text
  n up to        →  you can afford           →  typical idea
  ─────────────────────────────────────────────────────────────────
  10             →  O(n!)                    →  try every order
  20             →  O(2ⁿ)                    →  try every subset, bitmask
  500            →  O(n³)                    →  three nested loops, interval DP
  5,000          →  O(n²)                    →  two nested loops, 2D DP
  10⁵ to 10⁶     →  O(n log n) or O(n)       →  sort, heap, two pointers, hash map
  10⁹ or more    →  O(log n) or O(1)         →  binary search on the answer, maths
```

## How it works inside

- Plug n into your Big O and estimate the steps. 10⁵ × 10⁵ = 10¹⁰ steps: about 1,000 seconds in Python. Too slow.
- 10⁵ × log₂(10⁵) ≈ 1.7 million steps: a fraction of a second. Fine.
- LeetCode gives Python a little extra time, but do not count on it. If the math says 10⁹, you need a better idea.
- Constraints also hint at the **pattern**. n ≤ 20 hints at subsets/bitmask. A value up to 10⁹ with "minimum largest..." hints at binary search on the answer.
- In interviews, there are often no constraints. **Ask**: "How big can the input be?" It shows good judgement.

## Python, step by step

Estimate the steps before you code:

```python
import math

def estimate(n):
    return {"n log n": round(n * math.log2(n)), "n^2": n * n}

for n in [1_000, 100_000]:
    print(n, estimate(n))
```

```output
1000 {'n log n': 9966, 'n^2': 1000000}
100000 {'n log n': 1660964, 'n^2': 10000000000}
```

For n = 100,000, O(n²) is 10 billion steps: far too many. O(n log n) is under 2 million: fine.

Measure your own laptop (the time will be different on every computer):

```python
import time
start = time.perf_counter()
total = 0
for i in range(10_000_000):        # 10 million simple steps
    total += i
print(f"10 million steps took {time.perf_counter() - start:.2f} seconds")
```

Three real constraints, three decisions:

| Problem | Constraint | Decision |
| --- | --- | --- |
| Two Sum | n ≤ 10⁴ | O(n²) = 10⁸: too slow in Python. Use a hash map: O(n). |
| Contains Duplicate | n ≤ 10⁵ | Need O(n) (set) or O(n log n) (sort). |
| Subsets | n ≤ 10 | 2¹⁰ × 10 ≈ 10,000 steps. Trying every subset is fine. |

## Time and space

| Steps (rough) | Python time |
| --- | --- |
| 10⁶ | well under a second |
| 10⁷ | about a second |
| 10⁸ | about 10 seconds: too slow |
| 10⁹ and up | minutes or more |

Memory: a list of 10⁶ integers uses tens of MB in Python. 10⁸ items will not fit comfortably.

## Common mistakes

- Ignoring the constraints and coding the first idea.
- Forgetting hidden loops (`in` on a list, slicing) when counting steps.
- Using recursion with depth 10⁵ in Python: it hits the recursion limit even if the Big O is fine.
- Over-optimising for n ≤ 20. A clean O(2ⁿ) is the right answer there.
- Not asking about input size in an interview.

## Patterns that use it

Choosing the pattern itself. This table is your first filter:
- n ≤ 20: **backtracking**, bitmask DP.
- n ≤ 5,000: **2D DP**, double loops.
- n ≤ 10⁵ or 10⁶: **sorting**, **heaps**, **two pointers**, **sliding window**, **hash maps**, **prefix sums**.
- Huge values: **binary search on the answer**, maths.

## Practice

```practice
For 5 problems you solved, read the constraints and write the largest Big O that would pass.
Run the 10 million steps timing code on your laptop. Note your number.
two-sum
contains-duplicate
subsets
longest-consecutive-sequence
product-of-array-except-self
```

## Explain it back

```explain
About how many simple steps per second does Python do?
If n can be 10^5, why is O(n²) not allowed?
What would n ≤ 20 make you think of?
What should you ask in an interview when no constraints are given?
```

## Flashcards

```flashcards
Rough Python speed? :: About 10^7 simple steps per second.
n ≤ 10^5: which Big O? :: O(n log n) or O(n).
n ≤ 5,000: which Big O? :: O(n²) is fine.
n ≤ 20: which idea? :: Try every subset (2^n), bitmask, backtracking.
Huge values (10^9) with a monotonic answer? :: Binary search on the answer.
No constraints in an interview? :: Ask how big the input can be.
```
