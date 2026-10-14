---
id: i-ride-booking
title: Design a ride booking app (Ola/Uber-style)
level: advanced
phase: 3
week: 42
tags: [system-design, interview, geo, matching]
estMinutes: 40
---

## What it is

Riders request a ride; the system finds a **nearby available driver** within seconds, tracks the trip live, and handles pricing and payment.
The new ideas: **location updates** at very high volume, a **geospatial index** to find drivers near a point quickly, and a **trip state machine** that must never double-assign a driver.

## Real-life example

Ravi books an auto at MG Road during evening rush. Thousands of drivers are sending their location every few seconds. The app looks only at drivers in the few map squares around MG Road, offers the ride to the nearest free one, and if he does not accept in 15 seconds, offers it to the next.

## Picture

```text
 driver apps ─ location every 4 s ─▶ location service ─▶ geo index (in memory / Redis GEO), by cell
 rider app ─ request ride ─▶ trip service ─▶ matching: nearby available drivers ─▶ offer to the best one
                                   │                                          (timeout → next driver)
                                   ▼
          trip state: REQUESTED → DRIVER_ASSIGNED → ARRIVING → IN_TRIP → COMPLETED → PAID
          (stored in a DB; one driver can hold one active trip: enforced with a lock/transaction)

 map split into cells:  only the rider's cell + neighbours are searched
```

## How it works inside

- **Estimate**: 500k active drivers × 1 update / 4 s ≈ 125,000 location writes/s. Too many for a normal database: keep current locations **in memory** (sharded by city/cell, or Redis GEO), and send history to a stream for analytics.
- **Geospatial index**: split the map into **cells** (a simple grid, **geohash** strings, or Uber's H3 hexagons). A driver is stored under their cell; to search, look at the rider's cell and its neighbours, then sort by real distance (haversine) or, better, by road ETA.
- **Matching**: filter available drivers (vehicle type, rating), rank by ETA, **offer** to one at a time (or a few), with a timeout. Mark the driver as "offered" atomically so two riders cannot get the same driver.
- **Trip state machine** in a durable DB (transactions, idempotent updates). Payments happen after completion, through the payment service.
- **Live tracking**: driver → server → rider over WebSockets.
- **Surge pricing**: compare demand and supply per cell; raise the price multiplier where demand is much higher.
- **Scale**: partition by city/region (most rides are local), stateless services, multi-region failover.

## Python, step by step

A grid index: search nearby cells only, then sort by distance:

```python
import math
from collections import defaultdict

def km(a, b):                                       # haversine: distance between (lat, lon) points
    R = 6371
    p1, p2 = math.radians(a[0]), math.radians(b[0])
    dp, dl = p2 - p1, math.radians(b[1] - a[1])
    x = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(x))

def cell(p):                                        # about 1.1 km squares
    return (math.floor(p[0] * 100), math.floor(p[1] * 100))

class DriverIndex:
    def __init__(self):
        self.cells, self.where, self.busy = defaultdict(set), {}, set()

    def update(self, driver, p):                    # called on every location ping
        if driver in self.where:
            self.cells[cell(self.where[driver])].discard(driver)
        self.where[driver] = p
        self.cells[cell(p)].add(driver)

    def nearby(self, p):                            # the rider's cell and its 8 neighbours
        cx, cy = cell(p)
        found = [d for dx in (-1, 0, 1) for dy in (-1, 0, 1) for d in self.cells.get((cx + dx, cy + dy), ())]
        return sorted((d for d in found if d not in self.busy), key=lambda d: km(p, self.where[d]))

    def assign(self, p):
        for d in self.nearby(p):
            self.busy.add(d)                        # real systems: an atomic "offer" with a timeout
            return d, round(km(p, self.where[d]), 2)
        return None, None

index = DriverIndex()
index.update("auto-MG1", (12.9750, 77.6050))       # near MG Road
index.update("auto-MG2", (12.9718, 77.5990))       # very close to the rider
index.update("auto-IND", (12.9784, 77.6408))       # Indiranagar: too far, not searched
index.update("auto-KOR", (12.9352, 77.6245))       # Koramangala: too far, not searched
rider = (12.9716, 77.5946)                          # MG Road
print(index.nearby(rider))
print(index.assign(rider), index.assign(rider), index.assign(rider))
print(round(km((12.9716, 77.5946), (12.9352, 77.6245)), 2), "km from MG Road to Koramangala")
```

```output
['auto-MG2', 'auto-MG1']
('auto-MG2', 0.48) ('auto-MG1', 1.19) (None, None)
5.18 km from MG Road to Koramangala
```

## Time and space

| Concern | Number / choice |
| --- | --- |
| Location updates | ~125k writes/s → in-memory geo index, sharded by region |
| Nearby search | O(drivers in 9 cells), not O(all drivers) |
| Matching latency target | a few seconds end to end |
| Trip data | durable DB with transactions (money and state) |

## Common mistakes

- Writing every location ping to the main SQL database.
- Scanning all drivers to find nearby ones.
- Two riders matched to the same driver (no atomic offer/lock).
- Straight-line distance instead of road ETA for final ranking (fine for a first filter).
- Cells too big (too many drivers to check) or too small (many empty cells to visit).

## Patterns that use it

Geospatial indexing (grids, geohash, quadtrees), partitioning by city, in-memory stores, WebSockets for live tracking, state machines, locks/transactions, streams for analytics.

## Practice

```practice
Search a second ring of cells when the first ring has no free drivers.
Add vehicle types (auto, bike, cab) and filter by the rider's choice.
Design surge pricing per cell: what data do you need, and how often do you update it?
Explain the full design in 15 minutes: requirements, estimates, location updates, matching, trip states.
```

## Explain it back

```explain
Why can't location updates go straight into the main SQL database?
How does a grid (or geohash) make "drivers near me" fast?
How do you stop one driver being assigned to two riders?
Why is a trip a state machine?
```

## Flashcards

```flashcards
Store live driver locations where? :: In memory / Redis GEO, sharded by region.
Nearby search? :: Look in the rider's cell and neighbouring cells, then sort by distance/ETA.
Geo index options? :: Grid, geohash, quadtree, H3 hexagons.
Avoid double assignment? :: Atomic offer/lock on the driver with a timeout.
Trip lifecycle? :: Requested → assigned → arriving → in trip → completed → paid.
Distance between coordinates? :: Haversine (straight line); road ETA for final ranking.
```
