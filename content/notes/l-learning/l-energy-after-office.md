---
id: l-energy-after-office
title: Studying after a full working day
level: basic
phase: 1
week: 1
tags: [learning, habits, energy]
estMinutes: 10
---

## What it is

How to keep a 15-month plan going while working full time: match the evening's work to your **energy**, protect the streak with a **minimum day** when you are drained, and use mornings and weekends for the hardest work.
Consistency beats intensity. The plan survives on ordinary tired weekdays, not on heroic Sundays.

## Real-life example

A runner training for a marathon does not run hard every day. Some days are easy jogs, some are rest, a few are long runs. Skipping easy days makes them break down; running hard every day does too. Your study evenings are the same.

## Picture

```text
 Today page energy check-in:
   Fresh     ─▶ full plan: new topic (read + explain back) + 1–2 problems + flashcards
   Tired     ─▶ minimum day (or a lighter plan): one easy problem or a redo, flashcards
   Very low  ─▶ minimum day: 30 min DSA (one easy problem or a redo) · 10 min exercise · sleep on time

 week shape:  weekday evenings = steady practice · weekends = deep work (projects, mocks, new hard topics)
```

## How it works inside

- **Energy check-in first**: decide the plan by how you feel, not by guilt.
- **Minimum day** (on the Today page) keeps the streak alive on bad days. Doing a little keeps the habit; doing nothing breaks it.
- **Hard things when fresh**: new patterns and hard problems in the freshest slot you have (early morning or weekend). Tired evenings are for redos and flashcards.
- **Start small**: "just open the editor for 10 minutes" usually turns into a real session.
- **Transitions**: a short walk, a wash and a snack between office and study reset your head.
- **Commute** (if any): flashcards or listening, not new hard topics.
- **One rest evening a week** with no study prevents burnout. A streak freeze exists for real emergencies.
- **Warning signs**: dreading every session, sleep getting worse, weeks of minimum days. Then cut the plan back for a week and rest; the Shift plan button moves the whole roadmap if needed.

## Python, step by step

Pick tonight's plan from your energy and free time:

```python
PLANS = {
    "fresh": ["new topic: read the note and explain it back", "1-2 problems from this week", "flashcards"],
    "tired": ["one easy problem or one redo", "flashcards"],
    "very low": ["minimum day: 30 min DSA (one easy problem or one redo)", "10 min exercise", "sleep on time"],
}

def tonight(energy, free_minutes):
    if free_minutes < 45 and energy == "fresh":
        energy = "tired"                       # not enough time for a new topic: keep it light
    return PLANS[energy]

for energy, minutes in [("fresh", 120), ("fresh", 30), ("very low", 90)]:
    print(f"{energy}, {minutes} min -> {'; '.join(tonight(energy, minutes))}")
```

```output
fresh, 120 min -> new topic: read the note and explain it back; 1-2 problems from this week; flashcards
fresh, 30 min -> one easy problem or one redo; flashcards
very low, 90 min -> minimum day: 30 min DSA (one easy problem or one redo); 10 min exercise; sleep on time
```

## Time and space

| Slot | Best use |
| --- | --- |
| Weekday evening (fresh) | 2 focus blocks: new topic + problems |
| Weekday evening (tired) | 1 block: redo + flashcards |
| Weekend morning | deep work: hard patterns, projects, mocks |
| Rest evening (1 a week) | nothing; really nothing |

## Common mistakes

- All-or-nothing: skipping the day because a full session is not possible.
- New hard topics at 11 PM after a tiring day.
- No rest days, then a two-week crash.
- Comparing your pace with students who study full time.

## Patterns that use it

Energy check-in and minimum day on the Today page, streak freezes, focus presets (25/5 for tired days), the Shift plan button on the Roadmap.

## Practice

```practice
Check in your energy honestly every day this week, and follow the plan it suggests.
Pick your weekly rest evening now and put it in your calendar.
Write down your best study slot (the time you feel freshest) and protect it for the hardest work.
```

## Explain it back

```explain
Why is a minimum day better than skipping a day?
Which work belongs to fresh evenings, and which to tired ones?
What are the warning signs of burnout, and what do you do then?
Why does consistency beat intensity over 15 months?
```

## Flashcards

```flashcards
Minimum day? :: 30 min DSA (easy problem or redo), 10 min exercise, sleep on time.
Hard new topics when? :: When you are freshest: weekend mornings or fresh evenings.
Tired evening plan? :: One easy problem or a redo, plus flashcards.
Weekly rest? :: One evening with no study.
Burnout signs? :: Dread, worse sleep, weeks of minimum days: cut back and rest.
```
