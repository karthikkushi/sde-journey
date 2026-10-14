---
id: l-focus-breaks
title: Focus sessions and breaks
level: basic
phase: 1
week: 3
tags: [learning, focus, habits]
estMinutes: 10
---

## What it is

Study in **focus blocks** (45 minutes by default on this site) with **real breaks** in between (10 minutes, and a longer 20-minute break after every 3 blocks).
One block of full attention beats two hours of studying with the phone buzzing. Breaks are not lost time: they keep the next block sharp.

## Real-life example

A cricket bowler bowls an over and then rests at fine leg. Nobody expects 30 overs in a row from one bowler. Your attention works the same way: short spells, full effort, then rest.

## Picture

```text
 evening, 45/10 preset:
 19:00 ███████ focus 1 ███████ 19:45 ░ break 10 ░ 19:55 ███████ focus 2 ███████ 20:40 ░ break ░
 20:50 ███████ focus 3 ███████ 21:35   → 2 h 15 min of real focus, done before 10 PM

 good breaks: walk · water · stretch · look out of the window · chat with family
 bad breaks:  reels · news feed · "just one video"  (they drag your mind away)
```

## How it works inside

- **One task per block**: decide it before starting ("Two Sum + its explain-back").
- **Phone in another room** or face down on silent. Notifications off for the block.
- **Distraction notepad**: when a thought pops up ("pay the electricity bill"), write it down and continue. Deal with it in the break.
- **Presets** on the Focus page: 50/10, 45/10 (default), 25/5 for tired days or hard starts.
- **Breaks away from screens** let your eyes and mind recover; looking far away helps eye strain.
- **Same time each day** turns studying into a habit you do not have to argue with.
- The Focus page logs your blocks and shows them on the heatmap.

## Python, step by step

Plan an evening of focus blocks (a long break comes after every 3 blocks):

```python
from datetime import datetime, timedelta

def plan(start, focus, rest, blocks, long_break=20, per_round=3):
    t = datetime.strptime(start, "%H:%M")
    for b in range(1, blocks + 1):
        end = t + timedelta(minutes=focus)
        print(f"{t:%H:%M}-{end:%H:%M}  focus {b}")
        if b < blocks:
            pause = long_break if b % per_round == 0 else rest
            t = end + timedelta(minutes=pause)
            print(f"{end:%H:%M}-{t:%H:%M}  break ({pause} min)")
    print(f"{focus * blocks} minutes of focus, finished at {end:%H:%M}")

plan("19:00", 45, 10, 3)
print()
plan("06:00", 25, 5, 4)
```

```output
19:00-19:45  focus 1
19:45-19:55  break (10 min)
19:55-20:40  focus 2
20:40-20:50  break (10 min)
20:50-21:35  focus 3
135 minutes of focus, finished at 21:35

06:00-06:25  focus 1
06:25-06:30  break (5 min)
06:30-06:55  focus 2
06:55-07:00  break (5 min)
07:00-07:25  focus 3
07:25-07:45  break (20 min)
07:45-08:10  focus 4
100 minutes of focus, finished at 08:10
```

## Time and space

| Preset | Good for |
| --- | --- |
| 25/5 | tired days, hard starts, short mornings |
| 45/10 | normal evenings (default) |
| 50/10 | weekends, deep work on projects |

## Common mistakes

- Phone on the desk "just in case".
- Breaks spent scrolling, which come back as a distracted next block.
- Skipping breaks for hours, then crashing.
- Starting a block without deciding what it is for.

## Patterns that use it

The Focus page, the heatmap, energy check-ins, sleep (a late evening block costs tomorrow's focus).

## Practice

```practice
Tonight, do 2 focus blocks with the phone in another room. Note how many distractions you wrote down.
Change plan() to start at 20:30 with 50/10 and 2 blocks. When do you finish?
Make a list of 5 good break activities you can do at home.
```

## Explain it back

```explain
Why do breaks improve focus instead of wasting time?
What is a distraction notepad for?
Which preset would you pick on a tired day, and why?
Why are reels a bad break?
```

## Flashcards

```flashcards
Default preset on this site? :: 45 minutes focus, 10 minutes break.
Long break? :: 20 minutes after every 3 blocks.
Stray thought during focus? :: Write it on the distraction notepad, continue.
Best place for the phone? :: Another room, on silent.
Good break? :: Walk, water, stretch, look far away; no feeds.
```
