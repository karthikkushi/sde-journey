---
id: k-notice-period
title: "Notice period: plan it before you apply"
level: basic
phase: 3
week: 34
tags: [career, notice-period, job-search]
estMinutes: 15
---

## What it is

Your **notice period** is how long you must keep working after you resign, written in your employment contract. In Indian IT it is often 30, 60 or 90 days.
Recruiters filter on it: many roles want someone who can join in 30 days, and LinkedIn is adding notice-period filters for Indian recruiters.
Plan it before you apply, so it never surprises you or the company at offer time.

## Real-life example

Booking a train ticket 90 days ahead only works if you know your travel date. Applying for jobs without knowing your notice period is like booking without a date: the offer may expire before you can join.

## Picture

```text
 apply ──► interviews ──► written offer ──► resign ──► notice period ──► join
          (4–8 weeks)                     (only now)  (30 / 60 / 90 days)

 total: roughly 2–3 months of interviews + your notice period
```

## How it works inside

1. **Read your contract.** Find the notice length, whether the company can **buy out** (shorten it by paying), whether unused **leave** can be adjusted against it, and what happens during probation.
2. **State it honestly** on every profile (Naukri, LinkedIn, Instahyre) and in the first recruiter call. Hiding it wastes everyone's time.
3. **Ask early** whether the new company will buy out the remaining notice or can wait.
4. **Resign only after a written offer** (the offer letter, not a call or a chat).
5. **Count backwards**: if offers usually arrive 6–8 weeks after your first application and your notice is 90 days, you join about 5 months after you start applying. Plan the target wave with that in mind.
6. **During notice**: finish handovers well. Your manager is a future reference, and the industry is small.

This is general information, not legal advice. Your contract and your HR team have the final word.

## Python, step by step

When would you join? Count from the offer date.

```python
from datetime import date, timedelta

def join_date(offer, notice_days, buyout_days=0, leave_days=0):
    # Resign the day after the written offer; buyout and leave can shorten the notice.
    resign = offer + timedelta(days=1)
    serve = max(0, notice_days - buyout_days - leave_days)
    return resign + timedelta(days=serve)

offer = date(2027, 8, 20)
print(join_date(offer, 90))
print(join_date(offer, 90, buyout_days=30))
print(join_date(offer, 60, leave_days=10))
```

```output
2027-11-19
2027-10-20
2027-10-10
```

## Time and space

| Notice | Typical join after offer |
| --- | --- |
| 30 days | about 1 month |
| 60 days | about 2 months |
| 90 days | about 3 months, unless bought out |

## Common mistakes

- Resigning after a verbal "you are selected", then the offer is changed or withdrawn.
- Saying "immediate joiner" when you are not.
- Forgetting the festive season (late October to November), when hiring slows.
- Leaving a messy handover.

## Patterns that use it

Plan your application waves around it: a practice wave first, then a target wave where all processes start within about 2 weeks, so offers arrive together.

## Practice

```practice
Find your notice period, buyout and leave rules in your contract
Write the one-line answer you will give a recruiter about your notice period
Work out your earliest join date if you start applying in week 38
```

## Explain it back

```explain
Why resign only after a written offer?
How does a 90-day notice change when you should start applying?
```

## Flashcards

```flashcards
What is a notice buyout? :: The new or old company pays so you can leave before the full notice ends.
When should you resign? :: Only after you hold a written offer letter.
What should you say about your notice period? :: The honest number, on every profile and in the first recruiter call.
How long from first application to joining? :: Roughly 2–3 months of interviews plus your notice period.
```
