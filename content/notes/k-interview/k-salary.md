---
id: k-salary
title: Salary talk basics
level: core
phase: 5
week: 49
tags: [career, negotiation, money]
estMinutes: 20
---

## What it is

Understanding an offer and asking for a fair one, politely and with facts.
In India offers are usually quoted as **CTC** (cost to company), which mixes very different things: monthly salary, a bonus that may not be paid in full, one-time payments, stock that vests over years, and benefits you never see as cash. Compare offers by what you actually receive.

## Real-life example

Two flats both "₹25,000 a month". One includes maintenance and parking; the other adds ₹4,000 maintenance and a one-time deposit. Same headline, different real cost. CTC is the same: always ask for the breakdown.

## Picture

```text
 CTC (per year)
 ├── Fixed salary ............ paid monthly (before tax)          ◀ the most important number
 ├── Variable / bonus ........ paid only if targets are met (ask the usual payout %)
 ├── Joining bonus ........... one time; often returned if you leave within a year
 ├── Stock (RSUs/ESOPs) ...... vests over years; startup ESOPs may be worth nothing
 ├── Employer PF ............. retirement savings, not monthly cash
 └── Gratuity, insurance ..... gratuity only after about 5 years of service

 in-hand per month ≈ fixed ÷ 12 − employee PF − professional tax − income tax (TDS)
```

## How it works inside

- **Get the offer in writing with a breakdown** before deciding.
- **Know the range**: market data sites (levels.fyi, AmbitionBox, Glassdoor) and people in similar roles. Treat them as rough guides.
- **Strongest lever: another offer.** Say it honestly: "I have an offer with a fixed salary of X. I'd prefer to join you; can you get closer?"
- **Ask, don't demand**: "Is there flexibility in the fixed component?" Be specific about the number you want and why (market data, skills, competing offer).
- **Negotiable parts**: fixed salary, joining bonus (useful to cover a notice-period buyout or a bonus you lose by leaving), stock, start date, level. Level matters most long term.
- **The "current CTC" question** is common in India. You can answer with your expected range for the role instead, based on market data.
- **Notice period**: 30–90 days is common; some companies buy it out. Discuss it early.
- **Tax**: depends on the regime you choose and the rules for that year; use an official calculator rather than guessing.
- **Stay honest and polite**: never invent offers. Once you accept, stop negotiating.

## Python, step by step

Compare two example offers by first-year cash and guaranteed yearly pay (all numbers are made up):

```python
def lakh(x):
    return f"₹{x / 100_000:.2f} L"

offers = {
    "A (product company)": {"fixed": 1_800_000, "variable": 180_000, "payout": 0.8,
                            "joining": 200_000, "stock_total": 800_000, "vest_years": 4},
    "B (services company)": {"fixed": 2_000_000, "variable": 0, "payout": 0,
                             "joining": 0, "stock_total": 0, "vest_years": 1},
}

for name, o in offers.items():
    ctc = o["fixed"] + o["variable"] + o["joining"] + o["stock_total"] / o["vest_years"]
    guaranteed = o["fixed"]
    expected_year1 = o["fixed"] + o["variable"] * o["payout"] + o["joining"] + o["stock_total"] / o["vest_years"]
    print(f"{name}: headline {lakh(ctc)}, guaranteed {lakh(guaranteed)}, "
          f"expected year 1 {lakh(expected_year1)}, year 2 {lakh(expected_year1 - o['joining'])}")
```

```output
A (product company): headline ₹23.80 L, guaranteed ₹18.00 L, expected year 1 ₹23.44 L, year 2 ₹21.44 L
B (services company): headline ₹20.00 L, guaranteed ₹20.00 L, expected year 1 ₹20.00 L, year 2 ₹20.00 L
```

Offer A looks ₹3.8 L bigger, but its guaranteed part is ₹2 L smaller, and year 2 drops when the joining bonus ends. Neither is "right": it depends on how much you value certainty, stock and the work itself.

## Time and space

| Step | When |
| --- | --- |
| Research the market range | before the recruiter call |
| Share an expected range | when the recruiter asks |
| Negotiate | after the written offer, before accepting |
| Decide | within the deadline; ask for a few days if needed |

## Common mistakes

- Comparing headline CTC instead of fixed and guaranteed pay.
- Accepting on the call without seeing the written breakdown.
- Bluffing about offers you don't have.
- Negotiating only salary and ignoring level, joining bonus or notice buyout.
- Being rude or making ultimatums. Recruiters are usually on your side once they want you.

## Patterns that use it

Clear communication (STAR, questions to ask), simple calculations, decision making with trade-offs.

## Practice

```practice
Add an offer C to the code with a 15% variable at 70% payout and no stock. Compare all three.
Write the exact 3 sentences you would say to ask for a higher fixed salary, using a competing offer.
List what you would ask a recruiter to clarify in an offer letter.
```

## Explain it back

```explain
What is inside a CTC number?
Why is fixed salary the most important number to compare?
What can you negotiate besides salary?
How would you answer "What is your current CTC?"
```

## Flashcards

```flashcards
CTC? :: Cost to company: fixed + variable + bonuses + stock + benefits (not all cash).
Compare offers by? :: Fixed and guaranteed pay, then expected variable and stock.
Joining bonus catch? :: Often must be returned if you leave within a year.
Strongest negotiation lever? :: A real competing offer, shared honestly.
Besides salary, negotiate? :: Level, joining bonus, stock, start date, notice buyout.
```
