---
id: k-star
title: Behavioural stories with STAR
level: core
phase: 5
week: 44
tags: [interview, behavioural, communication]
estMinutes: 25
---

## What it is

Behavioural questions ("Tell me about a time you disagreed with a teammate") check how you work with people. Answer them with **STAR**:
**S**ituation (short context) → **T**ask (your goal) → **A**ction (what *you* did, the longest part) → **R**esult (what changed, with a number if possible), plus one line of **learning**.
Prepare 6–8 true stories in advance; each can answer several questions.

## Real-life example

"Tell me about a challenge" answered with "We had many problems, it was hard, but we managed" says nothing.
"Our release had a bug that double-charged 2% of users (S). I had to find and fix it before the weekend sale (T). I added logs, found a retry without an idempotency key, fixed it and wrote a test (A). Double charges dropped to zero, and the fix became a team checklist item (R)" is clear, specific and believable.

## Picture

```text
 S  Situation  ~15%   where, when, who; one or two sentences
 T  Task       ~10%   what you had to achieve
 A  Action     ~55%   what YOU did, step by step: decisions, trade-offs, how you worked with people
 R  Result     ~20%   outcome with numbers; what you learned / would do differently

 story bank (6–8 stories) ──▶ conflict · failure/mistake · tight deadline · ambiguity ·
                              helping others · leading without authority · proudest work · feedback
```

## How it works inside

- **Use "I"**, not only "we": the interviewer is hiring you. Mention the team, but be clear about your part.
- **Be specific**: names of tools, numbers, timelines. Vague stories sound made up.
- **Keep it to about 2 minutes** (roughly 250 words), then stop. They will ask follow-ups.
- **Failure stories** are about what you learned and changed. Pick a real one, not "I work too hard".
- **Conflict stories**: show listening, data, respect, and a result both sides could accept.
- **What many companies look for** (Google calls it "Googleyness and leadership"): collaboration, comfort with ambiguity, ownership, learning, doing the right thing for users.
- **Never invent stories.** Follow-up questions find gaps quickly. Small, real stories from college, projects or work are fine.

## Python, step by step

A story bank: check that every common question is covered and that no story is overused or too long to tell:

```python
STORIES = {
    "double-charge bug": {"words": 230, "fits": ["mistake", "deadline", "ownership"]},
    "API migration": {"words": 310, "fits": ["ambiguity", "leading", "proud"]},
    "code review clash": {"words": 190, "fits": ["conflict", "feedback"]},
}
QUESTIONS = ["conflict", "mistake", "deadline", "ambiguity", "helping others", "leading", "feedback", "proud"]

for q in QUESTIONS:
    stories = [name for name, s in STORIES.items() if q in s["fits"]]
    print(f"{q:<15} {', '.join(stories) or 'MISSING: prepare a story'}")

for name, s in STORIES.items():
    minutes = s["words"] / 130                      # about 130 spoken words a minute
    if minutes > 2:
        print(f"'{name}' takes {minutes:.1f} min: cut it down")
```

```output
conflict        code review clash
mistake         double-charge bug
deadline        double-charge bug
ambiguity       API migration
helping others  MISSING: prepare a story
leading         API migration
feedback        code review clash
proud           API migration
'API migration' takes 2.4 min: cut it down
```

## Time and space

| Item | Target |
| --- | --- |
| Stories prepared | 6–8, each covering 2–3 question types |
| Length | about 2 minutes, then pause |
| Practice | say each aloud at least 3 times; record one |

## Common mistakes

- Long situation, tiny action, no result.
- Only "we", so your contribution is unclear.
- No numbers or concrete details.
- Blaming others in conflict stories.
- Memorising a script word for word, so it sounds robotic. Remember the points, not the sentences.
- Made-up stories.

## Patterns that use it

Thinking aloud (clear structure), resume bullets (the same results and numbers), salary talk (calm, specific communication).

## Practice

```practice
Write your first 2 stories in STAR form: one about a mistake, one about a conflict.
Fill the story bank in Python with your own stories and close every MISSING row.
Say each story aloud with a 2-minute timer. Cut until it fits.
Ask a friend to ask 3 follow-up questions on each story ("Why did you choose that?", "What would you do differently?").
```

## Explain it back

```explain
What do the four letters of STAR stand for, and which part should be longest?
Why say "I" instead of only "we"?
What makes a failure story good?
How many stories should you prepare, and why can one story answer several questions?
```

## Flashcards

```flashcards
STAR? :: Situation, Task, Action, Result (+ learning).
Longest part of STAR? :: Action: what you did.
Story length? :: About 2 minutes.
How many stories? :: 6–8 real stories, each covering 2–3 question types.
Good failure story? :: Real mistake, what you did, what you learned and changed.
```
