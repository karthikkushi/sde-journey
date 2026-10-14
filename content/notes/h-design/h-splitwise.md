---
id: h-splitwise
title: LLD - design Splitwise (expense sharing)
level: advanced
phase: 5
week: 45
tags: [design, lld, interview, greedy]
estMinutes: 30
---

## What it is

Design an app where friends add shared expenses and see **who owes whom**.
Expenses can be split **equally**, by **exact amounts** or by **percentages**.
The interesting part: **simplify debts** so the group settles with as few payments as possible.

## Real-life example

A Coorg trip with 4 friends. Ravi paid ₹1200 for dinner (split equally), Asha paid ₹400 for a taxi shared with Meena, and John paid ₹200 for Ravi's snacks. At the end, instead of everyone paying everyone, the app says: Meena pays Ravi ₹500, Asha pays Ravi ₹100, John pays Ravi ₹100.

## Picture

```text
 each expense changes BALANCES (positive = others owe you, negative = you owe)

 dinner ₹1200 paid by Ravi, equal among 4   Ravi +900  Asha −300  John −300  Meena −300
 taxi   ₹400  paid by Asha, equal: Asha, Meena          Asha +200              Meena −200
 snacks ₹200  paid by John, exact: Ravi ₹200 Ravi −200              John +200

 final:  Ravi +700   Asha −100   John −100   Meena −500     (always sums to 0)
 settle: biggest debtor pays biggest creditor, repeat → 3 payments
```

## How it works inside

- **Entities**: User, Group, Expense (payer, amount, split type, shares), Split (EqualSplit, ExactSplit, PercentSplit as **strategies**), BalanceSheet.
- **Money**: store amounts in **paise (integers)**, never floats. Equal splits of ₹100 among 3 give 33.33 + 33.33 + 33.34: decide who gets the extra paisa.
- **Balances**: one number per user (net). Adding an expense: payer += amount; each person −= their share. Balances always sum to zero (a good invariant to test).
- **Simplify debts** (greedy): repeatedly match the largest debtor with the largest creditor and transfer the smaller of the two amounts. It needs at most (people − 1) payments. (Finding the true minimum is a hard problem; greedy is the accepted answer.)
- **Validation**: exact shares must add up to the amount; percents to 100.
- **Extensions**: groups, multiple currencies, activity history (an append-only log of expenses), settling up, notifications (observer).

## Python, step by step

```python
from collections import defaultdict

class Splitwise:
    def __init__(self):
        self.balance = defaultdict(int)                      # user -> paise (+ means others owe them)

    def add_expense(self, paid_by, amount, shares):          # shares: user -> paise
        if sum(shares.values()) != amount:
            raise ValueError("shares must add up to the amount")
        self.balance[paid_by] += amount
        for user, share in shares.items():
            self.balance[user] -= share

    @staticmethod
    def equal(amount, users):                                # split fairly, give leftover paise to the first users
        base, extra = divmod(amount, len(users))
        return {u: base + (1 if i < extra else 0) for i, u in enumerate(users)}

    def settle(self):
        creditors = {u: b for u, b in self.balance.items() if b > 0}
        debtors = {u: -b for u, b in self.balance.items() if b < 0}
        payments = []
        while debtors:
            d = max(sorted(debtors), key=debtors.get)        # biggest debtor (ties: by name)
            c = max(sorted(creditors), key=creditors.get)    # biggest creditor
            amount = min(debtors[d], creditors[c])
            payments.append((d, c, amount // 100))           # rupees for display
            debtors[d] -= amount
            creditors[c] -= amount
            if debtors[d] == 0:
                del debtors[d]
            if creditors[c] == 0:
                del creditors[c]
        return payments

app = Splitwise()
app.add_expense("Ravi", 120000, Splitwise.equal(120000, ["Ravi", "Asha", "John", "Meena"]))   # ₹1200 dinner
app.add_expense("Asha", 40000, Splitwise.equal(40000, ["Asha", "Meena"]))                     # ₹400 taxi
app.add_expense("John", 20000, {"Ravi": 20000})                                               # ₹200 snacks
print({u: b // 100 for u, b in app.balance.items()}, "sum:", sum(app.balance.values()))
print(app.settle())
print(Splitwise.equal(10000, ["A", "B", "C"]))               # ₹100 three ways, in paise
```

```output
{'Ravi': 700, 'Asha': -100, 'John': -100, 'Meena': -500} sum: 0
[('Meena', 'Ravi', 500), ('Asha', 'Ravi', 100), ('John', 'Ravi', 100)]
{'A': 3334, 'B': 3333, 'C': 3333}
```

> **Same thing in C#**: use `decimal` (or `long` paise) for money, an `ISplitStrategy` interface with `EqualSplit`, `ExactSplit`, `PercentSplit`, and a `Dictionary<string, long>` for balances.

## Time and space

| Operation | Cost |
| --- | --- |
| Add an expense with k people | O(k) |
| Settle n people (greedy, with heaps) | O(n log n) |
| Space | O(users) for balances (+ the expense history) |

## Common mistakes

- Floats for money (0.1 + 0.2 problems). Use integer paise or `Decimal`.
- Losing a paisa in equal splits (shares must add up exactly).
- Storing "who owes whom" for every pair instead of one net balance per user.
- Not validating exact/percent splits.
- Rebuilding balances from scratch on every view when they can be updated per expense.

## Patterns that use it

Strategy (split types), greedy (settling), heaps (largest creditor/debtor), integer money handling in payment systems, and the LLD method.

## Practice

```practice
Add a PercentSplit: shares given as percentages that must add up to 100.
Use two heaps to make settle() O(n log n).
Add groups: balances per group, and a "settle up" that records a payment as an expense.
Write a test that balances always sum to zero after random expenses.
```

## Explain it back

```explain
Why keep one net balance per user instead of pairwise debts?
How does the greedy settle work, and why is it at most n - 1 payments?
Why store money as integer paise?
How do split types fit the strategy pattern?
```

## Flashcards

```flashcards
Money in code? :: Integer paise (or Decimal), never floats.
Balance invariant? :: All balances sum to zero.
Equal split leftovers? :: divmod; give the extra paise to some users so shares add up exactly.
Greedy settle? :: Largest debtor pays largest creditor the smaller amount; repeat.
Max payments after greedy settle? :: People − 1.
Split types? :: Equal, exact, percent: strategies.
```
