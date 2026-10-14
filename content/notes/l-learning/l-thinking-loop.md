---
id: l-thinking-loop
title: The thinking loop for practice problems
level: basic
phase: 1
week: 4
tags: [learning, problem-solving, study-skills]
estMinutes: 15
---

## What it is

A fixed loop for every practice problem, so each one teaches you something:
**try alone → stuck? small hint → understand the idea → close everything and re-solve from scratch → explain it back → log it → redo it later.**
The aim is not to "finish" problems. It is to be able to solve the *next* unseen problem.

## Real-life example

Learning a new dish from your mother: you try, it goes wrong, she gives one tip ("more oil before the mustard seeds"), you cook it again yourself, and next week you make it without asking. If she had cooked it for you, you would only have eaten it.

## Picture

```text
       ┌──────────── try alone (20–30 min, aloud, on paper first) ◀──────────────┐
       │ stuck?                                                                   │
       ▼                                                                          │
   smallest hint (pattern name / AI hint level 1) ── still stuck? next hint level │
       ▼                                                                          │
   understand WHY the idea works ─▶ close all tabs ─▶ re-solve from scratch        │
       ▼                                                                          │
   explain it back (3 lines) ─▶ log: alone / hint / saw solution ─▶ redo later ───┘
```

## How it works inside

- **Time-box**: about 20–30 minutes alone. Less, and you skip the useful struggle; much more, and you waste the evening.
- **Hints in steps**: pattern name → key idea → pseudocode → full solution, only as far as needed.
- **Re-solve from scratch**: reading a solution is not solving it. Close it and type it yourself.
- **Explain back**: three lines on the key insight ("Sorted + pair sum → two pointers from both ends").
- **Log honestly** how you solved it, and set the redo date by that: on your own → in 2 weeks; with a hint → in 3 days; after reading the solution → tomorrow.
- **Sunday redo**: the roadmap's Sunday block is for these redos.

## Python, step by step

A problem log that schedules redos by how you solved each problem (dates are examples):

```python
from datetime import date, timedelta

REDO_AFTER = {"alone": 14, "hint": 3, "solution": 1}       # days

log = [
    ("two-sum", "alone", date(2026, 10, 14)),
    ("valid-anagram", "hint", date(2026, 10, 15)),
    ("group-anagrams", "solution", date(2026, 10, 16)),
]

queue = sorted((day + timedelta(days=REDO_AFTER[how]), problem, how) for problem, how, day in log)
for redo, problem, how in queue:
    print(f"{redo:%a %d %b}  redo {problem:<15} (first time: {how})")
```

```output
Sat 17 Oct  redo group-anagrams  (first time: solution)
Sun 18 Oct  redo valid-anagram   (first time: hint)
Wed 28 Oct  redo two-sum         (first time: alone)
```

## Time and space

| Step | Time |
| --- | --- |
| Try alone | 20–30 min |
| Each hint level | a few minutes of reading, then back to trying |
| Re-solve from scratch | 10–20 min |
| Explain back + log | 3 min |

## Common mistakes

- Opening the solution at minute 5.
- Struggling for 2 hours on one problem.
- Reading a solution, nodding, and moving on without re-solving.
- Counting "problems done" instead of "problems I can solve again".
- Using AI to write the code during practice (see the AI tutor note).

## Patterns that use it

Active recall, spaced repetition (redo dates), handling being stuck, AI as a tutor.

## Practice

```practice
Use the full loop on your next 3 problems and log each one honestly.
Add a fourth way to REDO_AFTER, "struggled alone, 60+ min", and decide its gap.
On Sunday, redo every problem in your queue that is due, from a blank page.
```

## Explain it back

```explain
Walk through the thinking loop from memory.
Why re-solve from scratch after reading a solution?
How does the way you solved a problem decide when you redo it?
How long should you try alone before a hint?
```

## Flashcards

```flashcards
Try alone for? :: About 20–30 minutes.
Hint order? :: Pattern name → key idea → pseudocode → full solution.
After reading a solution? :: Close it and re-solve from scratch.
Redo gap if solved alone? :: About 2 weeks.
Redo gap after reading the solution? :: Tomorrow.
```
