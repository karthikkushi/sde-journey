---
id: i-ticket-booking
title: "System design: ticket booking with seat holds"
level: advanced
phase: 5
week: 47
tags: [system-design, booking, locking, concurrency]
estMinutes: 40
---

## What it is

Design movie or bus ticket booking (like BookMyShow or redBus): users pick **exact seats**, hold them while paying, and no seat is ever sold twice.
Unlike the flash sale (a count of identical items), every seat is unique, so the design is about **locking specific rows** and **expiring holds**.

## Real-life example

At a cinema counter, you point at seats F7 and F8 on the chart. The clerk marks them in pencil while you take out your wallet. If you walk away, the pencil mark is rubbed out after a few minutes. Once you pay, the mark becomes ink.

## Picture

```text
 seat states:   AVAILABLE ──hold (10 min)──► HELD ──paid──► BOOKED
                    ▲                          │
                    └──── hold expired ────────┘

 hold request: BEGIN
               SELECT * FROM seats WHERE show = 42 AND seat IN ('F7','F8') FOR UPDATE
               all AVAILABLE?  yes → set HELD, held_until = now + 10 min, held_by = user
                                no → ROLLBACK, "seat just taken, pick another"
               COMMIT
```

## How it works inside

**Requirements**: browse shows and seat maps, hold 1–10 seats, pay within 10 minutes, never double-book, release unpaid holds.

**Data**: `shows(id, screen, starts_at)`, `seats(show_id, seat_no, status, held_by, held_until, booking_id)` with primary key (show_id, seat_no).

**Holding seats**: in one transaction, lock the requested rows (`SELECT ... FOR UPDATE`, in a fixed seat order to avoid deadlocks), check that all are available (or their hold has expired), then mark them held. Either all seats are held or none.

**Alternative**: optimistic locking with a version column: `UPDATE ... SET status='HELD', version = version + 1 WHERE seat_no = 'F7' AND version = 3`. If 0 rows change, someone else won; retry or tell the user.

**Expiry**: treat a hold with `held_until < now` as available when reading, and a background job cleans them up. No hold depends on the job running on time.

**Payment**: the booking is confirmed only by the payment webhook; the seats then become booked in the same transaction as the booking row.

**Scale**: the seat map is read far more than written, so cache it and refresh on change (or push updates over WebSockets). Partition by show; a single show's seats are small and fit on one database node.

## Python, step by step

All-or-nothing holds with expiry:

```python
seats = {s: {"status": "AVAILABLE", "by": None, "until": 0} for s in ["F7", "F8", "F9"]}

def free(seat, now):
    s = seats[seat]
    return s["status"] == "AVAILABLE" or (s["status"] == "HELD" and s["until"] < now)

def hold(user, wanted, now, minutes=10):
    if not all(free(seat, now) for seat in wanted):      # checked inside one locked transaction in real life
        return f"{user}: sorry, a seat was just taken"
    for seat in sorted(wanted):
        seats[seat] = {"status": "HELD", "by": user, "until": now + minutes}
    return f"{user}: holding {sorted(wanted)}"

print(hold("ravi", ["F7", "F8"], now=0))
print(hold("asha", ["F8", "F9"], now=1))       # F8 is held: nothing is held for Asha
print(seats["F9"]["status"])
print(hold("asha", ["F8", "F9"], now=11))      # Ravi's hold expired at 10
```

```output
ravi: holding ['F7', 'F8']
asha: sorry, a seat was just taken
AVAILABLE
asha: holding ['F8', 'F9']
```

## Time and space

| Part | Note |
| --- | --- |
| Hold | one transaction locking a few rows |
| Seat map read | cached; very frequent |
| Expiry | checked on read, cleaned by a job |

## Common mistakes

- Holding seats one at a time, so a user ends up with half their seats.
- Locking seats in random order, causing deadlocks.
- Relying only on a cleanup job for expiry.
- Confirming the booking from the browser redirect instead of the payment webhook.

## Patterns that use it

Row locks and isolation levels, optimistic locking, the payment system, the flash sale.

## Practice

```practice
Draw this design in 30 minutes, then explain the seat state machine aloud
Write the hold transaction in SQL with SELECT FOR UPDATE and test it from two sessions
Redesign the hold with optimistic locking and compare the two
Machine coding: build movie booking with seat locking in 90 minutes
```

## Explain it back

```explain
Why lock seats in a fixed order?
Why check hold expiry on read instead of trusting the cleanup job?
How does this differ from a flash sale of identical items?
```

## Flashcards

```flashcards
What are a seat's states? :: Available, held (with an expiry), booked.
How do you hold several seats safely? :: One transaction: lock the rows in a fixed order, check all, mark all, or none.
What is optimistic locking? :: Update only if the version still matches; 0 rows changed means someone else won.
What confirms a booking? :: The payment webhook, writing the booking and seat status in one transaction.
```
