---
id: k-stuck
title: Handling being stuck
level: core
phase: 3
week: 41
tags: [interview, problem-solving, testing]
estMinutes: 20
---

## What it is

Everyone gets stuck: in interviews, in practice, at work. What matters is having **moves** you try in order instead of freezing.
In an interview, being stuck and getting unstuck with a clear process can still be a good signal. Freezing silently is the only bad option.

## Real-life example

Lost in a new city without internet: you do not stand still. You check the street name, ask a shop, walk to a main road you recognise, or take an auto to a landmark. Each move is small, but together they get you home.

## Picture

```text
 stuck on the idea?                         stuck on a bug?
 1. smaller input: solve n = 1, 2, 3 by hand 1. read the error message fully, slowly
 2. brute force first, then improve           2. print values at each step (or a debugger)
 3. draw it (array boxes, tree, graph)         3. trace a tiny input by hand
 4. go through the pattern clues list          4. compare with a brute force on many inputs
 5. what would make it easy? (sorted? a map?)  5. explain the code line by line aloud
 6. say where you are stuck; take the hint     6. take a 5-minute break (practice only)
```

## How it works inside

- **Talk while stuck**: "I see the brute force is O(n²). I think there's a way to avoid the inner loop, maybe with a hash map... let me try."
- **Work examples by hand**: patterns often appear after 3–4 small examples.
- **Change the problem**: what if the array were sorted? What if there were no negatives? Solve the easier version, then adapt.
- **Hints are fine**: interviewers expect to give some. Take the hint, say what it unlocks, and move on.
- **In practice**: give yourself 20–30 minutes, then read a hint (not the full solution), and re-solve the problem from scratch two days later.
- **Stress test**: compare your fast solution with an obviously correct brute force on many small inputs. The first mismatch is a tiny failing test case.

## Python, step by step

A stress test: try every small input, compare the clever solution with a brute force, and print the first input where they differ:

```python
from itertools import product

def brute(nums):                       # slow, obviously correct: try every subarray
    return max(sum(nums[i:j]) for i in range(len(nums)) for j in range(i + 1, len(nums) + 1))

def fast(nums):                        # Kadane, with a bug
    best = cur = 0
    for x in nums:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

def fixed(nums):                       # start from the first element, not 0
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

def first_failure(fn, max_len=4):
    for n in range(1, max_len + 1):
        for nums in product(range(-2, 3), repeat=n):
            if fn(list(nums)) != brute(list(nums)):
                return list(nums), fn(list(nums)), brute(list(nums))
    return "no failures"

print("fast: ", first_failure(fast))
print("fixed:", first_failure(fixed))
```

```output
fast:  ([-2], 0, -2)
fixed: no failures
```

The smallest failing input, `[-2]`, explains the bug at once: with only negative numbers the answer is negative, but `best` started at 0.

## Time and space

| Move | Time it takes | Best for |
| --- | --- | --- |
| Small examples by hand | 2–3 min | finding the idea |
| Brute force first | 5 min | baseline + a checker |
| Stress test | 5 min to write | finding the smallest failing input |
| Ask / take a hint | 30 s | when 5 minutes pass with no progress |

## Common mistakes

- Going silent, hoping the idea arrives.
- Rewriting everything instead of finding the one wrong line.
- Reading the full solution after 5 minutes in practice (you learn little) or never (you waste hours).
- Refusing hints in interviews.
- Debugging by changing random things.

## Patterns that use it

Brute force + optimisation, testing, debugging, explaining aloud.

## Practice

```practice
maximum-subarray
jump-game
For your next problem where you get stuck, write down which moves you tried, in order.
Write a stress test for a binary search you wrote, comparing it with a simple linear search.
```

## Explain it back

```explain
List your moves when stuck on the idea, in order.
List your moves when stuck on a bug.
What is a stress test, and why does it find bugs fast?
How do you use a hint well in an interview?
```

## Flashcards

```flashcards
First move when stuck? :: Work small examples by hand and say what you see.
Stress test? :: Compare a fast solution with a brute force on many small inputs.
Kadane's bug with all-negative input? :: Starting best at 0 instead of the first element.
Practice rule when stuck? :: 20–30 min, then a hint, then re-solve later.
Interviewer gives a hint? :: Take it, say what it unlocks, continue.
```
