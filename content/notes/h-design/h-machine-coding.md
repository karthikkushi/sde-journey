---
id: h-machine-coding
title: "Machine coding: how the round works"
level: core
phase: 3
week: 33
tags: [lld, machine-coding, interview, oop]
estMinutes: 25
---

## What it is

A **machine coding round** gives you 90 to 120 minutes to build a small working program: a parking lot, Splitwise, a movie booking system.
It is common at Indian product companies (Flipkart, Swiggy, PhonePe, Razorpay, Urban Company), often in SDE-2 loops.
They grade code that **runs**, is **split into clean classes**, and is **easy to extend** when they add a new requirement at the end.

## Real-life example

A tailor gets 90 minutes to stitch a shirt while the customer watches. A beautiful sketch with no shirt fails. A shirt that falls apart when the customer asks for a pocket also fails. You need a plain shirt that fits, finished on time, with seams that can take a pocket later.

## Picture

```text
 0 ─ 15 min   clarify: list features, ask about scale, agree what is out of scope
15 ─ 25 min   design: entities, one class per job, interfaces at the edges
25 ─ 55 min   build one feature end to end (it RUNS by minute 55)
55 ─ 85 min   the other features, one by one, running after each
85 ─ 100 min  tests for the main flow, clean names, a short demo
then          they add a new requirement: you change ONE place, not ten
```

## How it works inside

- **Requirements first.** Write the 4–6 features you will build, and say out loud what you will not build (no database, no UI, no login unless asked).
- **Entities and services.** Nouns become classes (`Spot`, `Ticket`, `Vehicle`); actions become a service (`ParkingService.park()`). Keep storage **in memory behind an interface**, so a database could replace it.
- **Strategy at the edges.** Anything likely to change (pricing, spot choice, split rules) goes behind an interface with one implementation. That is where the follow-up requirement lands.
- **Run early, run often.** A small `main` or a test that drives the flow. Interviewers type their own inputs in the demo.
- **Use your strongest language.** For a .NET developer that is C#: clean classes, enums, interfaces and LINQ are fast to write.
- **Some companies now allow your own AI agent** in this round. Then they grade how you own the design: you decide the classes, check every generated line, and explain the trade-offs.

Common follow-ups: "add a new vehicle type", "add hourly pricing", "make it thread safe", "split by percentage instead of equally".

## Python, step by step

A tiny parking lot, built the machine-coding way: entities, a strategy for choosing spots, a service, and a run.

```python
from dataclasses import dataclass

@dataclass
class Spot:
    id: str
    size: str            # "bike" or "car"
    taken_by: str = ""

class FirstFreeSpot:                     # strategy: easy to swap later
    def choose(self, spots, size):
        return next((s for s in spots if s.size == size and not s.taken_by), None)

class ParkingService:
    def __init__(self, spots, strategy):
        self.spots, self.strategy = spots, strategy

    def park(self, plate, size):
        spot = self.strategy.choose(self.spots, size)
        if spot is None:
            return f"{plate}: full"
        spot.taken_by = plate
        return f"{plate}: spot {spot.id}"

    def leave(self, plate):
        for s in self.spots:
            if s.taken_by == plate:
                s.taken_by = ""
                return f"{plate}: left {s.id}"
        return f"{plate}: not found"

lot = ParkingService([Spot("B1", "bike"), Spot("C1", "car"), Spot("C2", "car")], FirstFreeSpot())
print(lot.park("KA01", "car"))
print(lot.park("KA02", "car"))
print(lot.park("KA03", "car"))
print(lot.leave("KA01"))
print(lot.park("KA03", "car"))

# The follow-up "fill the last spot first" is one new class. Nothing else changes.
class LastFreeSpot:
    def choose(self, spots, size):
        return next((s for s in reversed(spots) if s.size == size and not s.taken_by), None)

lot2 = ParkingService([Spot("C1", "car"), Spot("C2", "car")], LastFreeSpot())
print(lot2.park("MH12", "car"))
```

```output
KA01: spot C1
KA02: spot C2
KA03: full
KA01: left C1
KA03: spot C1
MH12: spot C2
```

## Time and space

| Part | Budget |
| --- | --- |
| Clarify and design | 25 minutes, no more |
| First feature running | by minute 55 |
| Each later feature | runs before you start the next |

## Common mistakes

- Designing for 40 minutes and running nothing.
- One giant class with every method in it.
- Adding a database, REST layer or UI nobody asked for.
- Never running the code until the end, then debugging under pressure.
- Copying a design from memory without checking it fits their requirements.

## Patterns that use it

Strategy (spot choice, pricing, split rules), factory (create vehicles or payments by type), observer (notify on events), and a repository interface over in-memory storage. See the LLD notes on OOP, SOLID and design patterns.

## Practice

```practice
Build a parking lot in 90 minutes with a timer, then add hourly pricing as a new class
Build Splitwise (equal, exact and percentage splits) in 90 minutes
Build an in-memory key-value store with expiry in 90 minutes
Ask a friend to add one surprise requirement at minute 90 and time how long the change takes
```

## Explain it back

```explain
Why must the code run by minute 55, not minute 100?
Where in your design does a new requirement land, and why only there?
Why keep storage in memory behind an interface?
```

## Flashcards

```flashcards
How long is a machine coding round? :: Usually 90 to 120 minutes, then a demo and a new requirement.
What do they grade? :: Code that runs, clean classes with one job each, and how easily it takes a new requirement.
When should one feature run end to end? :: By about minute 55.
Where does a likely change go? :: Behind an interface (a strategy), so the follow-up is one new class.
Which language should you use? :: Your strongest one. For a .NET developer, C#.
```
