---
id: l-spaced-repetition
title: Spaced repetition (how the flashcards work)
level: basic
phase: 1
week: 3
tags: [learning, study-skills, flashcards]
estMinutes: 15
---

## What it is

**Spaced repetition** shows you a fact again just before you would forget it. Every time you remember, the next gap gets longer: 1 day, 6 days, about 2 weeks, about 5 weeks...
Ten minutes of flashcards a day keeps hundreds of ideas fresh for the whole 15 months. The flashcards on this site use **SM-2**, the classic method behind apps like Anki.

## Real-life example

Learning a new colleague's name: you repeat it right after the meeting, again the next morning, and once the next week. After that it simply stays. If you forget it once, you start the cycle again.

## Picture

```text
 rate each card:   Again (forgot) · Hard · Good · Easy

 Good every time:  day 0 ─1─▶ ─6─▶ ───15───▶ ──────38──────▶ ... gaps grow by the card's "ease" (×2.5)
 forgot once:      ... ─▶ Again: back to 1 day, and the card's ease drops, so its gaps grow slower
```

## How it works inside

- Each card stores **reps** (correct answers in a row), **interval** (days until next review) and **ease** (how fast the gaps grow, starting at 2.5).
- **Remembered** (Hard, Good, Easy): first gap 1 day, then 6 days, then the previous gap × ease.
- **Forgot** (Again): reps go back to 0 and the card returns tomorrow.
- **Ease** goes up a little for Easy, stays the same for Good, and drops for Hard and Again, but never below 1.3.
- On this site, a note's cards join your queue when you mark the note done, so you only review what you have read.
- Be honest with the grade. Pressing Good when you half-remembered only hides the gap.

## Python, step by step

The same rules the site's flashcards use, written in Python:

```python
QUALITY = {"again": 1, "hard": 3, "good": 4, "easy": 5}

def schedule(card, grade):
    ease, interval, reps = card
    q = QUALITY[grade]
    if q < 3:
        reps, interval = 0, 1                         # forgot: see it again tomorrow
    else:
        interval = 1 if reps == 0 else 6 if reps == 1 else int(interval * ease + 0.5)
        reps += 1
    ease = max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)))
    return round(ease, 2), interval, reps

for answers in (["good"] * 5, ["good", "good", "again", "good", "good", "good"], ["easy"] * 4):
    card, gaps = (2.5, 0, 0), []                       # a new card: ease 2.5, no reviews yet
    for a in answers:
        card = schedule(card, a)
        gaps.append(card[1])
    print(f"{' '.join(answers):<31} gaps {gaps}  ease {card[0]}")
```

```output
good good good good good        gaps [1, 6, 15, 38, 95]  ease 2.5
good good again good good good  gaps [1, 6, 1, 1, 6, 12]  ease 1.96
easy easy easy easy             gaps [1, 6, 16, 45]  ease 2.9
```

One "again" did more than reset the gap: the ease fell from 2.5 to 1.96, so that card will keep coming back more often.

## Time and space

| Daily habit | Time |
| --- | --- |
| Review due cards | 5–15 minutes |
| New cards per day | whatever your finished notes add; keep the daily total under ~20 minutes |
| Missed a few days | do the backlog over 2–3 days, oldest first |

## Common mistakes

- Pressing Good when you did not really remember.
- Skipping reviews for a week, then giving up because of the pile.
- Making cards too big ("explain all of graphs"). One fact or idea per card.
- Only reading the card: say or write the answer before you flip it.

## Patterns that use it

Active recall (each card is a tiny test), the forgetting curve (how to learn), the Cards page on this site.

## Practice

```practice
Run the code with ["good", "hard", "hard", "good"]. What happens to the ease?
Change "again" to keep half the old interval instead of 1 day. Would that be better or worse? Why?
Review your due cards today, answering aloud before you flip each one.
```

## Explain it back

```explain
Why do the gaps get longer each time?
What happens to a card when you press Again?
What is ease, and what changes it?
Why do new cards appear only after you finish a note?
```

## Flashcards

```flashcards
SM-2 first two gaps? :: 1 day, then 6 days.
Gap after that? :: Previous gap × ease (starts at 2.5).
Pressing Again? :: Reps reset; the card comes back tomorrow; ease drops.
Lowest possible ease? :: 1.3.
Good card size? :: One fact or idea per card.
```
