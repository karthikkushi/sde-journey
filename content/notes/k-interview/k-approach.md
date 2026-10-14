---
id: k-approach
title: How to approach a coding problem
level: core
phase: 2
week: 25
tags: [interview, problem-solving]
estMinutes: 20
---

## What it is

A fixed routine for any coding problem, so you never stare at a blank screen. One popular version is **UMPIRE**:
**U**nderstand → **M**atch a pattern → **P**lan → **I**mplement → **R**eview (dry run) → **E**valuate (time and space).
Interviewers grade the routine as much as the final code: how you clarify, plan, test and explain.

## Real-life example

A good doctor does not prescribe in the first minute. They ask questions (understand), think "this looks like a viral fever" (match), decide tests and medicine (plan), give it (implement), check how you respond (review) and consider side effects (evaluate).

## Picture

```text
 45-minute interview, roughly:
 ├─ 0–5   Understand: restate, ask about input size, duplicates, empty input, output format; 2 examples
 ├─ 5–10  Match + Plan: brute force first (say its Big O), then the better idea; get a nod
 ├─ 10–30 Implement: clean code, good names, talk while you type
 ├─ 30–40 Review: dry run an example, then edge cases; fix bugs calmly
 └─ 40–45 Evaluate: final time and space; questions for them
```

## How it works inside

- **Understand**: say the problem back in your own words. Ask: input size? sorted? negatives? duplicates? what to return if no answer? Write one normal and one tricky example.
- **Match**: look for clues. "Sorted" → binary search or two pointers. "Subarray/substring" → sliding window or prefix sums. "Top k" → heap. "All combinations" → backtracking. "Shortest path, unweighted" → BFS. (See the Patterns page.)
- **Plan**: say the brute force and its complexity first. It proves you can solve it and gives a baseline. Then improve. Agree on the plan before coding.
- **Implement**: small helper functions, clear names, no clever one-liners.
- **Review**: run your code by hand on the example, line by line. Then edge cases (see the edge case checklist).
- **Evaluate**: state time and space, and what you would change for bigger inputs.

## Python, step by step

Two Sum, done the UMPIRE way. Brute force first (said aloud, maybe coded), then the hash map idea:

```python
def two_sum_brute(nums, target):          # O(n²) time, O(1) space: the baseline
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]

def two_sum(nums, target):                # O(n) time, O(n) space: remember what we've seen
    seen = {}                             # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i

for nums, target in [([2, 7, 11, 15], 9), ([3, 2, 4], 6), ([3, 3], 6)]:
    print(nums, target, two_sum_brute(nums, target), two_sum(nums, target))
```

```output
[2, 7, 11, 15] 9 [0, 1] [0, 1]
[3, 2, 4] 6 [1, 2] [1, 2]
[3, 3] 6 [0, 1] [0, 1]
```

The `[3, 3]` case is the one to say out loud: "I check `seen` before adding the current number, so one element is never used twice."

## Time and space

| Step | Time to spend | If you skip it |
| --- | --- | --- |
| Understand | ~5 min | you solve the wrong problem |
| Plan | ~5 min | messy code, rewrites |
| Implement | ~20 min | — |
| Review | ~10 min | bugs the interviewer finds for you |

## Common mistakes

- Coding in the first minute.
- Not asking about edge cases, then being surprised by them.
- Jumping to a clever solution without mentioning brute force.
- Silent coding (see Thinking aloud).
- Saying "done" without a dry run.

## Patterns that use it

Every problem. The Match step uses the Patterns page and its cheat sheet.

## Practice

```practice
two-sum
valid-anagram
best-time-to-buy-and-sell-stock
For the next 3 problems you solve, write the U, M, P lines as comments before any code.
Record yourself solving one easy problem with UMPIRE out loud. Watch it once.
```

## Explain it back

```explain
What do the six letters of UMPIRE stand for?
Why say the brute force first?
Which questions do you ask in the Understand step?
How do you dry run your code?
```

## Flashcards

```flashcards
UMPIRE? :: Understand, Match, Plan, Implement, Review, Evaluate.
First minutes of an interview? :: Restate, ask clarifying questions, write examples.
Why brute force first? :: Shows you can solve it, gives a baseline to improve.
Before saying "done"? :: Dry run an example, then check edge cases.
"Sorted input" clue? :: Binary search or two pointers.
```
