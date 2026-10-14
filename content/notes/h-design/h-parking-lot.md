---
id: h-parking-lot
title: LLD - design a parking lot
level: advanced
phase: 3
week: 43
tags: [design, lld, interview, oop]
estMinutes: 35
---

## What it is

The most common **low-level design (LLD)** interview question. You design the **classes** for a parking lot: spots, vehicles, tickets, payments.
The interviewer checks how you **clarify requirements**, pick **entities and responsibilities**, and keep the design **easy to extend** (new vehicle type, new pricing).
This note also shows the general LLD method you can reuse for any design question.

## Real-life example

A mall parking with bike, car and truck spots. At the gate you get a ticket with the time; the system assigns a free spot that fits; at exit you pay by the hour. On weekends the price rule changes.

## Picture

```text
 ParkingLot ──has many──▶ Spot (id, size, vehicle?)
     │
     ├── park(plate, size, time) ──▶ Ticket (id, plate, spot, entry time)
     ├── leave(ticket, time) ──▶ fee from a FeeRule (strategy)
     └── free_spots()

 Size: BIKE < CAR < TRUCK      a bike may use a car spot; a truck needs a truck spot
 FeeRule ◁── HourlyFee, WeekendFee, ...   (swap without touching ParkingLot)
```

## How it works inside

**The LLD method (use it in every interview)**
1. **Clarify** (2–3 minutes): How many levels? Vehicle types? Spot sizes? Pricing rule? Payment methods? Display boards? Multiple gates?
2. **List the use cases**: park, leave and pay, show free spots.
3. **Find the entities** (nouns): ParkingLot, Level, Spot, Vehicle, Ticket, FeeRule, Payment.
4. **Give each one responsibilities** and the relationships (has-a, is-a).
5. **Write the core code** for the main flow; keep it small and runnable.
6. **Discuss extensions**: new vehicle type (electric with charging), new pricing (strategy), concurrency (two cars and one spot), multiple gates.

**Design choices here**
- `Size` is an enum ordered by size, so "fits" is a simple comparison.
- Fee calculation is a **strategy** (`HourlyFee`): the lot does not know pricing details (Open/Closed).
- Spot allocation is "first free spot that fits". A better version keeps a **free list per size** (O(1) instead of scanning) or picks the spot nearest the entrance.
- **Concurrency**: two gates may grab the same spot. In memory, use a lock around allocation; with a database, use a transaction and a unique constraint (spot_id where active).

## Python, step by step

```python
import math
from dataclasses import dataclass
from enum import Enum

class Size(Enum):
    BIKE = 1
    CAR = 2
    TRUCK = 3

@dataclass
class Spot:
    spot_id: str
    size: Size
    plate: str | None = None              # the parked vehicle, if any

@dataclass
class Ticket:
    ticket_id: int
    plate: str
    size: Size
    spot: Spot
    entry_hour: float

class HourlyFee:                          # strategy: swap for WeekendFee etc.
    RATES = {Size.BIKE: (10, 10), Size.CAR: (20, 10), Size.TRUCK: (50, 30)}   # (first hour, each extra hour)

    def fee(self, size, hours):
        first, extra = self.RATES[size]
        billed = max(1, math.ceil(hours))  # a part-hour counts as a full hour
        return first + extra * (billed - 1)

class ParkingLot:
    def __init__(self, spots, fee_rule):
        self.spots, self.fee_rule = spots, fee_rule
        self.active, self.next_id = {}, 1   # ticket_id -> Ticket

    def park(self, plate, size, hour):
        for spot in self.spots:                                   # first free spot that fits
            if spot.plate is None and spot.size.value >= size.value:
                spot.plate = plate
                ticket = Ticket(self.next_id, plate, size, spot, hour)
                self.active[ticket.ticket_id] = ticket
                self.next_id += 1
                return ticket
        return None                                               # full for this size

    def leave(self, ticket_id, hour):
        ticket = self.active.pop(ticket_id)
        ticket.spot.plate = None
        return self.fee_rule.fee(ticket.size, hour - ticket.entry_hour)

    def free_spots(self):
        return [s.spot_id for s in self.spots if s.plate is None]

lot = ParkingLot([Spot("B1", Size.BIKE), Spot("C1", Size.CAR), Spot("C2", Size.CAR), Spot("T1", Size.TRUCK)], HourlyFee())
t1 = lot.park("KA01AB1234", Size.CAR, hour=9)
t2 = lot.park("KA05XY9999", Size.BIKE, hour=9.5)
t3 = lot.park("KA03CD4321", Size.CAR, hour=10)
t4 = lot.park("KA02TR0001", Size.TRUCK, hour=10)
print([t.spot.spot_id for t in (t1, t2, t3, t4)], lot.free_spots())
print(lot.park("KA09ZZ0000", Size.CAR, hour=11))                  # no space left
print(lot.leave(t1.ticket_id, hour=11.5), lot.free_spots())        # 2.5 h -> billed 3 h
```

```output
['C1', 'B1', 'C2', 'T1'] []
None
40 ['C1']
```

> **Same thing in C#**: `enum Size`, `record Ticket(...)`, an `IFeeRule` interface with `HourlyFee : IFeeRule`, and a `ParkingLot` class with a `lock` around `Park`.

## Time and space

| Operation | This version | Improved |
| --- | --- | --- |
| park | O(spots) scan | O(1) with a free list (deque) per size |
| leave | O(1) | O(1) |
| free spots | O(spots) | O(1) with counters per size |

## Common mistakes

- Jumping into code without clarifying requirements.
- One giant `ParkingLot` class that also calculates fees, prints receipts and talks to the database.
- Hard-coding prices with if/else (use a strategy).
- Ignoring two cars racing for the same spot.
- Forgetting failure cases (lot full, lost ticket, invalid ticket).

## Patterns that use it

Strategy (fees), factory (vehicles), enums for types, locks/transactions for concurrency, and the general LLD method (library, elevator, Splitwise next).

## Practice

```practice
Add levels: each Level has spots; ParkingLot searches levels from the ground up.
Add electric car spots with charging, and a fee rule that adds ₹5 per kWh.
Keep a free list per size so park() is O(1).
Explain your design out loud in 10 minutes, as in an interview.
design-parking-system
```

## Explain it back

```explain
What are the 6 steps of the LLD method?
Why is the fee calculation a separate strategy class?
How would you stop two gates from giving the same spot to two cars?
How would you add a new vehicle type?
```

## Flashcards

```flashcards
First step in any LLD question? :: Clarify requirements and use cases.
Find entities how? :: Pick the nouns in the use cases.
Pricing rules that change? :: Strategy pattern (FeeRule).
O(1) spot allocation? :: A free list (queue) per spot size.
Two cars, one spot? :: Lock or database transaction + constraint.
Part-hour billing? :: math.ceil(hours)
```
