---
id: l-sleep
title: Sleep and learning
level: basic
phase: 1
week: 4
tags: [learning, health, habits]
estMinutes: 10
---

## What it is

Sleep is when the brain **stores** what you studied. Cutting sleep to study more usually means remembering less, coding slower and making more mistakes the next day.
Most adults need about **7–9 hours**. A fixed bedtime (the habit on this site says 10:30) protects both learning and your day job.
This is general information, not medical advice.

## Real-life example

You save a document, but the computer copies it to the cloud overnight. Turn the computer off early every night and the backup never finishes. Sleep is that overnight backup for what you learned in the evening.

## Picture

```text
 study 7–9:30 PM ─▶ wind down (no screens, dim light) ─▶ sleep by 10:30 ─▶ memory consolidation ─▶ wake fresh

 late night:  study till 1 AM ─▶ 5 h sleep ─▶ foggy at work ─▶ tired evening ─▶ "minimum day" ─▶ streak at risk
```

## How it works inside

- **Consolidation**: during sleep the brain replays and strengthens the day's learning. Studying something and then sleeping on it helps it stick.
- **Consistency**: going to bed and waking at about the same time, even on weekends, makes sleep deeper and easier.
- **Caffeine** stays in the body for hours (its half-life is often around 5 hours, and varies a lot between people). Evening chai or coffee can make it harder to fall asleep.
- **Screens and bright light** late at night delay sleepiness. Stop 30–60 minutes before bed; read on paper, or plan tomorrow.
- **Short naps** (10–20 minutes, early afternoon) can help; long or late naps make night sleep worse.
- **Exercise** (even 10 minutes, a habit on this site) improves sleep.

## Python, step by step

How much caffeine is still in your body at 11 PM (rough amounts; real values vary by cup and person):

```python
HALF_LIFE_HOURS = 5                    # often quoted; varies a lot between people

def caffeine_left(mg, hours):
    return mg * 0.5 ** (hours / HALF_LIFE_HOURS)

for drink, mg, hour in [("chai", 40, 16), ("filter coffee", 90, 16), ("filter coffee", 90, 20)]:
    left = caffeine_left(mg, 23 - hour)
    print(f"{drink:<13} ({mg} mg) at {hour}:00 -> about {left:.0f} mg left at 23:00")
```

```output
chai          (40 mg) at 16:00 -> about 15 mg left at 23:00
filter coffee (90 mg) at 16:00 -> about 34 mg left at 23:00
filter coffee (90 mg) at 20:00 -> about 59 mg left at 23:00
```

Sleep debt adds up quietly over a week:

```python
target = 7.5
week = {"Mon": 6.5, "Tue": 6.0, "Wed": 7.5, "Thu": 5.5, "Fri": 6.0, "Sat": 8.5, "Sun": 8.0}
debt = sum(max(0, target - hours) for hours in week.values())
print(f"short by {debt:.1f} hours this week; the weekend lie-in got back {sum(max(0, h - target) for h in week.values()):.1f}")
```

```output
short by 6.0 hours this week; the weekend lie-in got back 1.5
```

## Time and space

| Habit | Target |
| --- | --- |
| Sleep | about 7–9 hours |
| Bedtime | fixed (this site's habit: 10:30) |
| Screens off | 30–60 min before bed |
| Last chai/coffee | early afternoon |

## Common mistakes

- "One more problem" at midnight, every night.
- Using the weekend to "catch up" on sleep instead of keeping a steady schedule.
- Strong coffee after 6 PM to push through a study block.
- Phone in bed.

## Patterns that use it

Energy check-ins and minimum days, focus blocks (stop the last block in time), habits on the Today page.

## Practice

```practice
Log your sleep for 7 days in the week dict and compute your debt.
Set a phone alarm for 30 minutes before your bedtime: that is screens-off time.
For one week, keep your last chai or coffee before 3 PM. Note how you sleep.
```

## Explain it back

```explain
Why does sleep matter for learning, not just for energy?
What is caffeine's half-life, and what does it mean for evening tea?
Why keep the same bedtime on weekends?
What is a good wind-down routine?
```

## Flashcards

```flashcards
Sleep's role in learning? :: Consolidates (stores) what you studied.
Adult sleep need? :: About 7–9 hours.
Caffeine half-life (rough)? :: Around 5 hours, varies a lot between people.
Screens off before bed? :: 30–60 minutes.
Good nap? :: 10–20 minutes, early afternoon.
```
