---
id: h-elevator
title: LLD - design an elevator system
level: advanced
phase: 5
week: 44
tags: [design, lld, interview, scheduling]
estMinutes: 30
---

## What it is

Design the logic for one or more elevators: people press buttons on floors (up/down) and inside the car (a floor number); the system decides **where each elevator goes next**.
It is a **state machine** (idle, moving up, moving down, doors open) plus a **scheduling** problem.
The classic stop-order rule is **SCAN/LOOK**: keep going in one direction, serving requests on the way, then turn around.

## Real-life example

An office building in Whitefield at 9:45 AM. Everyone presses the button. If the elevator went to floors in the order people pressed (first come, first served), it would bounce up and down all day. Instead it goes up serving every requested floor on the way, then comes down.

## Picture

```text
 elevator at floor 5, going up; requests: 8, 2, 9, 1, 6

 FCFS order:  5 → 8 → 2 → 9 → 1 → 6        floors travelled: 29
 LOOK order:  5 → 6 → 8 → 9 → 2 → 1        floors travelled: 12

 states:   IDLE ──request──▶ MOVING_UP / MOVING_DOWN ──arrive──▶ DOORS_OPEN ──timer──▶ ...
```

## How it works inside

- **Entities**: Building, Elevator (current floor, direction, state, pending stops), Request (floor, direction or target), Controller/Dispatcher (assigns floor calls to elevators), Door, Display.
- **Within one elevator (LOOK)**: while moving up, serve all pending floors above in increasing order; then serve the ones below in decreasing order. It avoids starvation and long zig-zags.
- **Dispatching** many elevators: choose the elevator with the lowest **cost**: distance, plus a penalty if it is moving away, plus its load. Real systems also group calls and use rush-hour modes.
- **State machine** keeps the rules clear: doors only open when stopped; you cannot move with doors open.
- **Concurrency**: requests arrive from many buttons at once; the controller must handle them safely (a queue of events processed one by one is simplest).
- **Extensions**: VIP/fire mode, capacity limits, express elevators that skip floors.

## Python, step by step

LOOK scheduling for one elevator, compared with first come first served:

```python
def look_order(current, direction, requests):
    up = sorted(f for f in requests if f >= current)
    down = sorted((f for f in requests if f < current), reverse=True)
    return up + down if direction == "up" else down + up

class Elevator:
    def __init__(self, floor, direction="up"):
        self.floor, self.direction, self.pending = floor, direction, set()

    def press(self, floor):
        self.pending.add(floor)

    def run(self):
        stops = []
        while self.pending:
            target = look_order(self.floor, self.direction, self.pending)[0]
            if target != self.floor:
                self.direction = "up" if target > self.floor else "down"
            self.floor = target
            self.pending.discard(target)
            stops.append(target)
        return stops

def floors_travelled(start, stops):
    total, here = 0, start
    for s in stops:
        total += abs(s - here)
        here = s
    return total

requests = [8, 2, 9, 1, 6]
e = Elevator(floor=5)
for f in requests:
    e.press(f)
look = e.run()
print("LOOK:", look, floors_travelled(5, look), "floors")
print("FCFS:", requests, floors_travelled(5, requests), "floors")
```

```output
LOOK: [6, 8, 9, 2, 1] 12 floors
FCFS: [8, 2, 9, 1, 6] 29 floors
```

Dispatching a floor call to the best of several elevators:

```python
def cost(elevator, call_floor):
    floor, direction = elevator
    distance = abs(floor - call_floor)
    moving_away = (direction == "up" and call_floor < floor) or (direction == "down" and call_floor > floor)
    return distance + (10 if moving_away else 0)       # going the wrong way costs extra

elevators = {"A": (0, "up"), "B": (7, "idle"), "C": (12, "down")}
for call in (9, 3, 11):
    best = min(elevators, key=lambda name: cost(elevators[name], call))
    print(f"call at floor {call} -> elevator {best}")
```

```output
call at floor 9 -> elevator B
call at floor 3 -> elevator A
call at floor 11 -> elevator C
```

> **Same thing in C#**: `enum Direction { Up, Down, Idle }`, an `Elevator` class with a `SortedSet<int>` for pending stops, and a `Dispatcher` that reads requests from a `Channel<Request>`.

## Time and space

| Operation | Cost |
| --- | --- |
| Next stop (LOOK, sorted sets) | O(log n) with two heaps or a sorted set per direction |
| Dispatch a call (k elevators) | O(k) |
| Memory | O(pending requests) |

## Common mistakes

- Serving requests in arrival order (FCFS): long waits and wasted travel.
- No clear states, leading to "doors open while moving" bugs.
- Ignoring direction for floor buttons (someone pressing "down" on floor 4 should not be picked up by a car going up to 9 first).
- Forgetting multiple elevators and the dispatcher.

## Patterns that use it

CPU and disk scheduling (the same SCAN idea), heaps and sorted sets, state machines, and the LLD method.

## Practice

```practice
Keep two heaps (up stops and down stops) so the next stop is found in O(log n).
Add door states and make sure the elevator never moves with doors open.
Add a capacity limit: a full elevator skips floor calls until someone gets out.
Explain your dispatcher's cost function and one case where it chooses badly.
```

## Explain it back

```explain
Why is LOOK better than first come first served for elevators?
What are the states of an elevator, and which transitions are allowed?
How does the dispatcher choose between several elevators?
Where else does the SCAN/LOOK idea appear in computing?
```

## Flashcards

```flashcards
LOOK/SCAN rule? :: Keep going one way serving requests, then reverse.
Why not FCFS? :: Zig-zag travel and long waits.
Elevator states? :: Idle, moving up, moving down, doors open.
Dispatcher? :: Picks the elevator with the lowest cost for a floor call.
Same idea elsewhere? :: Disk scheduling, CPU scheduling.
```
