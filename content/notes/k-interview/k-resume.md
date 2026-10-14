---
id: k-resume
title: A one-page resume that gets interviews
level: core
phase: 4
week: 36
tags: [career, resume, communication]
estMinutes: 20
---

## What it is

A **one-page** summary of what you can do, written as **evidence**: short bullets that show impact with numbers.
Recruiters skim a resume in under a minute, and many companies first pass it through software (an ATS) that reads plain text. Clear, simple and honest beats fancy.

## Real-life example

A restaurant menu does not list every ingredient and cooking step. It names the dish, one line on what makes it special, and the price. Your resume does the same: what you built, what was special, and the measurable result.

## Picture

```text
 ┌──────────────────────────────────────────────────────────┐
 │ Name · email · phone · GitHub · LinkedIn · city            │  no photo, age or full address
 │ Skills: Python, C#, SQL, FastAPI, ASP.NET Core, Docker...  │  only what you can be quizzed on
 │ Experience                                                 │  newest first
 │  • Action verb + what you did + how (tech) + result (number)
 │ Projects                                                   │  link + what + numbers (users, latency)
 │ Education · achievements (contests, open source)           │
 └──────────────────────────────────────────────────────────┘
   one page · plain layout · standard headings · PDF · file name: Firstname-Lastname-Resume.pdf
```

## How it works inside

- **Bullet formula**: *Did X* using *Y*, which led to *Z*. "Built a FastAPI service for order tracking with Redis caching, cutting p95 latency from 800 ms to 120 ms."
- **Numbers**: users, requests per second, time saved, money saved, bugs reduced, test coverage. Estimates are fine if honest ("about 30%").
- **Strong verbs**: built, designed, reduced, automated, migrated, led, fixed, improved.
- **Tailor**: mirror the job description's words for skills you really have (ATS keyword matching).
- **Switching stacks** (for example .NET to Python backend): lead with backend skills that transfer (APIs, SQL, testing, deployments), then show the new stack through projects.
- **Projects matter** for career changers: one deployed project with real users beats five tutorials.
- **Honesty**: every line is fair game in an interview. Remove anything you cannot explain in depth.
- **Privacy**: never include sensitive IDs; a city is enough for location.

## Python, step by step

A small bullet checker: does each bullet start with an action verb, contain a number, and stay short?

```python
import re

VERBS = {"built", "designed", "reduced", "automated", "migrated", "led", "fixed", "improved", "added", "wrote"}

def check(bullet):
    problems = []
    words = bullet.split()
    if words[0].lower() not in VERBS:
        problems.append("start with an action verb")
    if not re.search(r"\d", bullet):
        problems.append("add a number")
    if len(words) > 30:
        problems.append(f"too long ({len(words)} words)")
    if "responsible for" in bullet.lower():
        problems.append("say what you did, not your duty")
    return problems or ["ok"]

bullets = [
    "Built a FastAPI order-tracking service with Redis caching, cutting p95 latency from 800 ms to 120 ms.",
    "Responsible for writing unit tests for the payments module.",
    "Automated the weekly report with Python and SQL, saving the team about 4 hours a week.",
    "Worked on many features.",
]
for b in bullets:
    print(f"{b[:45]:<46} {'; '.join(check(b))}")
```

```output
Built a FastAPI order-tracking service with R  ok
Responsible for writing unit tests for the pa  start with an action verb; add a number; say what you did, not your duty
Automated the weekly report with Python and S  ok
Worked on many features.                       start with an action verb; add a number
```

## Time and space

| Part | Space on the page |
| --- | --- |
| Header + skills | ~15% |
| Experience | ~45% (3–5 bullets per role) |
| Projects | ~30% (2–3 projects, 2–3 bullets each) |
| Education, extras | ~10% |

## Common mistakes

- Two or three pages for a few years of experience.
- Duty lists ("responsible for") instead of results.
- Listing every technology ever touched.
- Fancy templates with columns and icons that ATS software cannot read.
- Typos, inconsistent dates and formatting.
- Claiming skills you cannot discuss in depth.

## Patterns that use it

STAR stories (the same results, told aloud), project work (numbers come from real projects), honest self-review.

## Practice

```practice
Rewrite 3 of your current bullets with the formula: did X using Y, leading to Z.
Run your bullets through check() and fix every problem.
Pick one job posting and tailor your skills line to it, honestly.
Ask two people to read your resume for 30 seconds and say what they remember.
```

## Explain it back

```explain
What is the bullet formula?
Why do numbers matter so much?
What should a career switcher put first?
Why keep the layout plain?
```

## Flashcards

```flashcards
Resume length (under ~10 years of experience)? :: One page.
Bullet formula? :: Did X using Y, leading to Z (with a number).
ATS-friendly? :: Plain layout, standard headings, text-based PDF.
Skills section rule? :: Only skills you can be interviewed on.
Career switcher tip? :: Lead with transferable skills; prove the new stack with projects.
```
