---
id: a18-recursion
title: Recursion basics
level: basic
phase: 1
week: 5
tags: [python, recursion, call-stack]
estMinutes: 25
---

## What it is

Recursion is when a function **calls itself** on a **smaller** version of the same problem.
Every recursive function needs a **base case**: the smallest problem, answered directly, where it stops.
Without a base case, it never stops.

## Real-life example

You are in a long cinema queue and want to know your position. You ask the person in front: "What is your position?" They ask the person in front of them, and so on.
The first person in the queue knows the answer: "1". That is the **base case**.
Then each answer comes back: "2", "3", "4"... Each person adds 1 to the answer they got.

## Picture

`factorial(3)` waits for `factorial(2)`, which waits for `factorial(1)`. Then the answers come back up.

```svg
<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a18h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="accent"/></marker></defs>
  <text x="10" y="18" class="muted">call stack (newest on top)</text>
  <rect x="10" y="30" width="200" height="40" rx="6" class="hi"/>
  <text x="22" y="55">factorial(1) → 1</text>
  <rect x="10" y="80" width="200" height="40" rx="6" class="box"/>
  <text x="22" y="105">factorial(2) = 2 × ?</text>
  <rect x="10" y="130" width="200" height="40" rx="6" class="box"/>
  <text x="22" y="155">factorial(3) = 3 × ?</text>
  <rect x="10" y="180" width="200" height="40" rx="6" class="box"/>
  <text x="22" y="205">main program</text>
  <path d="M220 50C250 50 250 100 220 100" class="arrow" marker-end="url(#a18h)"/>
  <text x="258" y="80">gives 1</text>
  <path d="M220 100C250 100 250 150 220 150" class="arrow" marker-end="url(#a18h)"/>
  <text x="258" y="130">gives 2</text>
  <path d="M220 150C250 150 250 200 220 200" class="arrow" marker-end="url(#a18h)"/>
  <text x="258" y="180">gives 6</text>
</svg>
```

## How it works inside

- Each call gets its own **frame** on the **call stack**, with its own copy of the parameters (see Functions).
- A call **pauses** while it waits for the smaller call to return. So the stack grows to the depth of the recursion.
- When the base case returns, frames are removed one by one, and each finishes its own work with the answer it got.
- Python allows about **1,000** frames deep by default. Deeper gives `RecursionError`. (For deep problems, use a loop or your own stack.)
- If one call makes **two** smaller calls (like Fibonacci), the number of calls can explode. Remembering answers you already computed (**memoization**) fixes this. That is the first step towards dynamic programming.

To write any recursive function, answer three questions:
1. What is the **smallest** input, and its answer? (base case)
2. How do I make the problem **smaller**?
3. If I **trust** the smaller answer, how do I build my answer from it?

## Python, step by step

```python
def factorial(n):
    if n == 1:                     # base case: the smallest problem
        return 1
    return n * factorial(n - 1)    # trust the smaller answer, then multiply

print(factorial(5))
```

```output
120
```

Watch the calls go down and come back:

```python
def countdown(n, depth=0):
    print("  " * depth + f"countdown({n})")   # indent to show the depth
    if n == 0:
        print("  " * depth + "liftoff!")
        return
    countdown(n - 1, depth + 1)

countdown(2)
```

```output
countdown(2)
  countdown(1)
    countdown(0)
    liftoff!
```

Sum of a list (first item + sum of the rest):

```python
def total(nums):
    if not nums:                        # an empty list sums to 0
        return 0
    return nums[0] + total(nums[1:])    # (slicing copies, so this is O(n²); fine for learning)

print(total([40, 25, 60]))
```

```output
125
```

Fast power: solve the half problem once, then square it:

```python
def power(x, n):
    if n == 0:
        return 1
    half = power(x, n // 2)
    return half * half if n % 2 == 0 else half * half * x

print(power(2, 10), power(3, 5))
```

```output
1024 243
```

Two calls per step explode. Memoization fixes it:

```python
from functools import lru_cache

calls = 0
def fib(n):
    global calls                 # (a global only to count calls in this demo)
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(20), "calls:", calls)

@lru_cache(maxsize=None)         # remember every answer: each n is computed once
def fib_fast(n):
    if n < 2:
        return n
    return fib_fast(n - 1) + fib_fast(n - 2)

print(fib_fast(80))
```

```output
6765 calls: 21891
23416728348467685
```

## Time and space

| Function | Time | Space (stack) |
| --- | --- | --- |
| `factorial(n)` | O(n) | O(n) frames |
| `power(x, n)` (halving) | O(log n) | O(log n) |
| `fib(n)` naive | O(2ⁿ) | O(n) |
| `fib(n)` with memo | O(n) | O(n) |

Rule of thumb: time ≈ (number of calls) × (work per call). Space ≈ maximum depth.

## Common mistakes

- No base case, or a base case that is never reached:

```python
# WRONG: no base case, so it never stops
def forever(n):
    return forever(n + 1)

forever(0)
```

```output
Traceback (most recent call last):
  File "rec.py", line 5, in <module>
    forever(0)
    ~~~~~~~^^^
  File "rec.py", line 3, in forever
    return forever(n + 1)
  File "rec.py", line 3, in forever
    return forever(n + 1)
  File "rec.py", line 3, in forever
    return forever(n + 1)
  [Previous line repeated 996 more times]
RecursionError: maximum recursion depth exceeded
```

- Forgetting `return` on the recursive call: `factorial(n - 1)` alone throws the answer away.
- Not making the problem smaller (calling with the same `n`).
- Recursing 100,000 deep in Python. Use a loop instead.
- Two recursive calls without memo on big inputs (exponential time).

## Patterns that use it

- **Tree DFS**: almost every tree problem.
- **Backtracking**: subsets, permutations, N-Queens.
- **Divide and conquer**: merge sort, quick sort, fast power.
- **DP**: start with recursion, add memo, then turn it into a table.

## Practice

```practice
Write factorial, sum of a list and power(x, n) recursively. Trace each one in Python Tutor.
Write count_digits(n) recursively: count_digits(4096) is 4.
Write is_palindrome(word) recursively: compare the first and last letters, then the middle.
fibonacci-number
power-of-two
reverse-string
n-th-tribonacci-number
climbing-stairs
powx-n
```

## Explain it back

```explain
Explain recursion with the cinema queue example.
What is a base case, and what happens without one?
Why does naive Fibonacci make so many calls, and how does lru_cache help?
How much stack space does factorial(n) use, and why?
```

## Flashcards

```flashcards
What two parts does every recursive function need? :: A base case and a recursive case that makes the problem smaller.
What is the call stack? :: The pile of paused function calls, newest on top.
Default recursion limit in Python? :: About 1,000 frames.
Space used by recursion depth d? :: O(d)
Time of naive Fibonacci? :: O(2^n)
What does memoization do? :: Remembers answers so each input is solved once.
Three questions to write recursion? :: Smallest case? How to shrink? How to build my answer from the smaller one?
```
