---
id: l-how-to-learn
title: How to learn (so it stays)
level: basic
phase: 1
week: 1
tags: [learning, study-skills]
estMinutes: 15
---

## What it is

Learning is not reading or watching; it is **building memory you can use without looking**. The methods that work feel harder:
**understand** the idea, **pull it back out of your head** (active recall), **come back to it after gaps** (spaced repetition), **use it** on new problems, and **mix topics** later on.
Re-reading and watching videos feel productive but fade within days. This is often called the "illusion of competence".

## Real-life example

Learning to ride a scooter: watching videos teaches nothing you can use. You learn by riding, wobbling, riding again the next day, and later riding in traffic. Coding is the same: you learn by writing code from a blank page, again and again, spread over days.

## Picture

```text
 one topic, the loop this site is built around:
   read the note (20 min) ─▶ close it, explain it back in your words (5 min)
        ─▶ solve by hand, no AI (30 min) ─▶ flashcards (they come back on day 1, 6, 15...)
        ─▶ redo the problem from scratch days later (Sunday redo) ─▶ mix with other topics in mocks

 memory without reviews:  ████▇▅▃▂▁
 memory with reviews:     ████▇█▇█▇██▇███   (each review makes it fade slower)
```

## How it works inside

- **Active recall**: trying to remember (explain-back boxes, flashcards, blank-page coding) strengthens memory far more than re-reading.
- **Spaced repetition**: reviewing just before you forget, with gaps that grow (1 day, 6 days, 2 weeks...).
- **Desirable difficulty**: struggling for a while before a hint makes the lesson stick. Too much struggle (hours) just wastes time.
- **Interleaving**: after learning patterns one by one, mix them, because interviews do not say "this is a sliding window problem".
- **Deliberate practice**: work at the edge of your ability, get feedback (tests, a judge, a mentor), fix, repeat.
- **Sleep and breaks** are part of learning: memory is consolidated during sleep.
- **Small daily beats big weekly**: 90 minutes every day beats 10 hours on Sunday.

## Python, step by step

A toy model of forgetting (the numbers are made up; the shape is the point):

```python
import math

def remembered(days_since_last_review, strength):
    return math.exp(-days_since_last_review / strength)

REVIEWS = {1, 3, 7}                         # review on day 1, day 3 and day 7
strength, last = 2.0, 0
print("day  never reviewed  reviewed on days 1, 3, 7")
for day in [0, 1, 2, 3, 5, 7, 10, 14]:
    if day in REVIEWS:
        strength, last = strength * 2.5, day       # each review makes the memory last longer
    print(f"{day:>3}  {remembered(day, 2.0):>14.0%}  {remembered(day - last, strength):>8.0%}")
```

```output
day  never reviewed  reviewed on days 1, 3, 7
  0            100%      100%
  1             61%      100%
  2             37%       82%
  3             22%      100%
  5              8%       85%
  7              3%      100%
 10              1%       91%
 14              0%       80%
```

## Time and space

| Method | Feels | Works |
| --- | --- | --- |
| Re-reading, watching videos | easy, productive | weak |
| Highlighting | productive | weak |
| Explaining back, flashcards | hard | strong |
| Solving from a blank page | hard | strong |
| Spaced reviews | a bit boring | strong |

## Common mistakes

- Watching a whole course before writing any code.
- Reading the solution after 5 minutes of struggle.
- Never revisiting solved problems.
- Studying 6 hours once a week instead of a little every day.
- Cutting sleep to study more.

## Patterns that use it

Every page of this site: explain-back boxes (active recall), flashcards (spaced repetition), Sunday redo, mixed revision weeks (interleaving), the focus timer.

## Practice

```practice
After your next note, close it and write 5 lines from memory. Then check what you missed.
Pick a problem you solved a week ago and solve it again from a blank page.
Tonight, before sleep, recall the three main ideas you studied today without looking.
```

## Explain it back

```explain
Why does re-reading feel good but work badly?
What is active recall? Give two ways to do it on this site.
Why do reviews with growing gaps work better than reviewing every day?
What is interleaving, and why does it matter for interviews?
```

## Flashcards

```flashcards
Active recall? :: Pulling information out of memory (explain, quiz, blank page) instead of re-reading.
Spaced repetition? :: Reviews with growing gaps, just before you forget.
Illusion of competence? :: Feeling you know it because it looks familiar when you re-read.
Interleaving? :: Mixing topics in practice, after learning them separately.
Better: 10 hours on Sunday or 90 minutes daily? :: 90 minutes daily.
```
