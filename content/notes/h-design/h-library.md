---
id: h-library
title: LLD - design a library system
level: advanced
phase: 3
week: 43
tags: [design, lld, interview, oop]
estMinutes: 30
---

## What it is

A classic LLD question: members borrow and return books, with **limits**, **due dates** and **fines**.
The key insight: separate a **book** (the title, by ISBN) from a **copy** (one physical item on the shelf). Loans are about copies.
The design should make rules (loan days, fines, limits) easy to change.

## Real-life example

The city library has 3 copies of "Wings of Fire". Ravi borrows one on 1 October; it is due on 15 October; he returns it on 18 October and pays ₹15 (3 days × ₹5). When all copies are out, John joins the waitlist.

## Picture

```text
 Book (isbn, title, author) 1 ──── * Copy (copy_id, available?)
 Member (id, name) 1 ──── * Loan (copy, member, due date)
 Library: borrow(member, isbn, today) → (copy_id, due date)
          return_copy(copy_id, today) → fine
 Rules (easy to change): LOAN_DAYS = 14, MAX_BOOKS = 3, FINE_PER_DAY = ₹5
```

## How it works inside

- **Entities**: Book (catalogue data), Copy (physical item, available or not), Member, Loan (who has which copy, until when), optionally Reservation (waitlist) and Fine.
- **Borrow**: check the member's limit, find an available copy of that ISBN, mark it unavailable, create a Loan with a due date.
- **Return**: close the loan, mark the copy available, compute the fine from the days late, and notify the next person on the waitlist (observer).
- **Rules as configuration**: different member types (student, staff) can get different limits: a strategy or a small policy object.
- **Search**: by title or author → an index (dict of word → books) in memory, or SQL with indexes.
- **Persistence**: these classes map directly to tables (books, copies, members, loans) — see Normalization.

## Python, step by step

```python
from dataclasses import dataclass
from datetime import date, timedelta

LOAN_DAYS, MAX_BOOKS, FINE_PER_DAY = 14, 3, 5

@dataclass
class Copy:
    copy_id: str
    isbn: str
    available: bool = True

@dataclass
class Loan:
    copy: Copy
    member: str
    due: date

class Library:
    def __init__(self):
        self.copies = {}                      # copy_id -> Copy
        self.loans = {}                       # copy_id -> Loan (only active loans)

    def add_copy(self, copy_id, isbn):
        self.copies[copy_id] = Copy(copy_id, isbn)

    def borrow(self, member, isbn, today):
        if sum(1 for loan in self.loans.values() if loan.member == member) >= MAX_BOOKS:
            raise ValueError("limit reached: return a book first")
        for c in self.copies.values():
            if c.isbn == isbn and c.available:
                c.available = False
                self.loans[c.copy_id] = Loan(c, member, today + timedelta(days=LOAN_DAYS))
                return c.copy_id, self.loans[c.copy_id].due.isoformat()
        raise ValueError("no copy available: join the waitlist")

    def return_copy(self, copy_id, today):
        loan = self.loans.pop(copy_id)
        loan.copy.available = True
        days_late = max(0, (today - loan.due).days)
        return days_late * FINE_PER_DAY

lib = Library()
for copy_id in ("WOF-1", "WOF-2"):
    lib.add_copy(copy_id, "wings-of-fire")
print(lib.borrow("ravi", "wings-of-fire", date(2026, 10, 1)))
print(lib.borrow("asha", "wings-of-fire", date(2026, 10, 2)))
try:
    lib.borrow("john", "wings-of-fire", date(2026, 10, 3))
except ValueError as e:
    print("john:", e)
print("fine:", lib.return_copy("WOF-1", date(2026, 10, 18)))
print(lib.borrow("john", "wings-of-fire", date(2026, 10, 18)))
```

```output
('WOF-1', '2026-10-15')
('WOF-2', '2026-10-16')
john: no copy available: join the waitlist
fine: 15
('WOF-1', '2026-11-01')
```

> **Same thing in C#**: `record Copy`, `class Loan`, `DateOnly` for dates, and a `LibraryPolicy` class (loan days, limit, fine) injected into `Library`.

## Time and space

| Operation | This version | Improved |
| --- | --- | --- |
| borrow | O(copies) | O(1) with a dict isbn -> available copies |
| member's active loans | O(loans) | O(1) with a dict member -> loans |
| return | O(1) | O(1) |

## Common mistakes

- No difference between Book and Copy (you cannot track 3 copies of one title).
- Fines and limits hard-coded deep in methods.
- Forgetting the waitlist and what happens on return.
- Not handling "member already has this book" or "copy is lost".

## Patterns that use it

Observer (notify the waitlist), strategy (member types and fine rules), database design (normalization), and the LLD method.

## Practice

```practice
Add a waitlist per ISBN: when a copy is returned, reserve it for the first person waiting (observer).
Add member types: students may borrow 3 books for 14 days; staff 5 books for 30 days.
Make borrow() O(1) with a dict from ISBN to a list of available copies.
Write the SQL tables for this design (books, copies, members, loans).
```

## Explain it back

```explain
Why separate Book and Copy?
Walk through borrow and return, including the fine.
How would you add a waitlist without making Library a giant class?
Where would you put rules that differ for students and staff?
```

## Flashcards

```flashcards
Book vs Copy? :: Book = the title (ISBN); Copy = one physical item.
What does a Loan link? :: A copy, a member and a due date.
Fine formula? :: max(0, days late) × fine per day.
Notify the waitlist? :: Observer pattern on return.
Different rules per member type? :: A policy/strategy object.
```
