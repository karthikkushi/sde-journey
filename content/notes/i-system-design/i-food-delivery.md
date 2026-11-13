---
id: i-food-delivery
title: "System design: food delivery order flow"
level: advanced
phase: 5
week: 49
tags: [system-design, orders, state-machine, events]
estMinutes: 40
---

## What it is

Design the order flow of a food or quick-commerce app (Swiggy, Zomato, Zepto): place an order, the restaurant accepts, a rider is assigned, the order is picked up and delivered, and the customer sees live status.
The core is an **order state machine**, **events** between services, **rider assignment** by location, and **live tracking**.

## Real-life example

A dabbawala system. Each tiffin moves through fixed steps: collected, sorted at the station, on the train, delivered. Everyone along the way knows the next step, and a simple code on the box shows where it should go next.

## Picture

```text
 PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → DELIVERED
    │         │                    │
    └ CANCELLED (customer, or restaurant rejects)
                                   └ rider assigned around READY time

 Order service ──event "order.accepted"──► queue ──► rider service (find nearby riders)
                                                 └──► notification service (push to the customer)
 rider app ── location every 5 s ──► location service (Redis geo) ──► customer's live map
```

## How it works inside

**Requirements**: place and pay, restaurant accept or reject, assign a rider, live tracking, cancel rules, ETAs. Peak load at lunch and dinner; the rider location stream is the biggest write load.

**Order service**: owns the order and its state machine. Each change checks the allowed transition, saves it, and publishes an event (outbox pattern), so other services react without calling each other directly.

**Rider assignment**: riders send their location; store it in a geo index (Redis `GEOADD` / `GEOSEARCH`, or geohash cells). When food is nearly ready, find riders within a few kilometres, score them (distance, current load, rating), offer the order to the best one with a short timeout, then the next.

**Live tracking**: the customer app subscribes (WebSocket or server-sent events) to the order's rider location; positions are short-lived data and do not need the main database.

**ETAs**: preparation time per restaurant plus travel time, refreshed as the rider moves.

**Failure cases**: restaurant does not respond in 3 minutes (auto-reject and refund), no rider found (widen the radius, add an incentive), payment webhook late (order waits in a pending payment state).

## Python, step by step

The order state machine and nearest-rider choice:

```python
import math

ALLOWED = {
    "PLACED": {"ACCEPTED", "CANCELLED"},
    "ACCEPTED": {"PREPARING", "CANCELLED"},
    "PREPARING": {"READY"},
    "READY": {"PICKED_UP"},
    "PICKED_UP": {"DELIVERED"},
}

def move(order, new_state):
    if new_state not in ALLOWED.get(order["state"], set()):
        return f"cannot go {order['state']} -> {new_state}"
    order["state"] = new_state
    return f"now {new_state}"

def nearest_rider(riders, restaurant):
    def km(a, b):                          # rough distance, fine for a few km
        return math.dist(a, b) * 111
    free = [r for r in riders if r["free"]]
    return min(free, key=lambda r: km(r["at"], restaurant))["name"] if free else None

order = {"id": "ORD-1", "state": "PLACED"}
print(move(order, "ACCEPTED"))
print(move(order, "DELIVERED"))
print(move(order, "PREPARING"))

riders = [{"name": "Imran", "at": (12.935, 77.62), "free": True},
          {"name": "Divya", "at": (12.971, 77.59), "free": True},
          {"name": "Kiran", "at": (12.936, 77.61), "free": False}]
print(nearest_rider(riders, restaurant=(12.934, 77.61)))
```

```output
now ACCEPTED
cannot go ACCEPTED -> DELIVERED
now PREPARING
Imran
```

## Time and space

| Part | Load |
| --- | --- |
| Orders | moderate writes, strong consistency |
| Rider locations | very high writes, short-lived, in memory (Redis) |
| Status updates to customers | fan-out through events and push |

## Common mistakes

- Services calling each other in a long synchronous chain for every step.
- Storing every rider location update in the main database.
- No timeouts for restaurant acceptance or rider offers.
- Any service allowed to set any state.

## Patterns that use it

State machines, the outbox pattern, queues and streams, geo indexes, notifications, the payment system.

## Practice

```practice
Draw this design in 30 minutes and walk one order through every state aloud
Add the "no rider found" path to the design
Estimate rider location writes per second for 2 lakh active riders sending every 5 seconds
Write the state machine in C# with an enum and a transition table
```

## Explain it back

```explain
Why publish events instead of calling the rider service directly?
Where do rider locations live, and why not in the main database?
What happens if the restaurant never accepts?
```

## Flashcards

```flashcards
What owns the order state? :: The order service, through a state machine with allowed transitions.
How do other services learn about changes? :: Events published with the outbox pattern.
How do you find nearby riders? :: A geo index such as Redis GEOSEARCH or geohash cells.
How does the customer see the rider move? :: WebSocket or server-sent events with short-lived locations.
```
