---
id: a19-classes
title: Classes and objects
level: basic
phase: 1
week: 5
tags: [python, oop, classes]
estMinutes: 25
---

## What it is

A **class** is a blueprint. An **object** is one real thing made from that blueprint.
The class says what data each object has (attributes) and what it can do (methods).
`self` means "this particular object".

## Real-life example

"Auto ride" is the blueprint: every ride has a driver and a distance, and every ride can work out its fare.
Manju's 5 km ride and Shivu's 1.5 km ride are two **objects**. Same blueprint, different data.

## Picture

```text
          class AutoRide                     (blueprint)
          ├─ data:    driver, km
          └─ methods: fare()
                 │
       ┌─────────┴──────────┐
       ▼                    ▼
  r1 = AutoRide          r2 = AutoRide       (objects)
  driver = "Manju"       driver = "Shivu"
  km = 5                 km = 1.5
  r1.fare() → 75         r2.fare() → 30
```

## How it works inside

- `class AutoRide:` creates the blueprint. Nothing is made yet.
- `AutoRide("Manju", 5)` makes a new object, then runs `__init__` on it to fill in its data.
- Each object keeps its own data in a small dict. `r1.km` looks up `"km"` in it: O(1).
- A method is a function inside the class. When you write `r1.fare()`, Python calls `AutoRide.fare(r1)`. That is why every method's first parameter is `self`.
- Attributes written in the class body (not on `self`) are **shared** by all objects.
- **Inheritance**: `class BikeRide(Ride)` gets everything from `Ride` and can replace some methods.
- `__repr__` decides how the object looks when printed. Names with double underscores are special hooks Python calls for you.

## Python, step by step

```python
class AutoRide:
    BASE_FARE = 30                     # shared by every ride
    PER_KM = 15

    def __init__(self, driver, km):    # runs when a new ride is made
        self.driver = driver           # self = this ride
        self.km = km

    def fare(self):                    # a method: a function that belongs to the ride
        if self.km <= 2:
            return self.BASE_FARE
        return self.BASE_FARE + self.PER_KM * (self.km - 2)

    def __repr__(self):                # how the ride looks when printed
        return f"AutoRide({self.driver!r}, {self.km} km)"

r1 = AutoRide("Manju", 5)              # make an object
r2 = AutoRide("Shivu", 1.5)
print(r1, r1.fare())
print(r2, r2.fare())
r1.km = 8                              # each object has its own data
print(r1.fare(), r2.fare())
```

```output
AutoRide('Manju', 5 km) 75
AutoRide('Shivu', 1.5 km) 30
120 30
```

Inheritance: reuse most of a class, change one part:

```python
class Ride:
    def __init__(self, km):
        self.km = km

    def fare(self):
        return 10 * self.km

    def describe(self):
        return f"{type(self).__name__}: {self.km} km, ₹{self.fare()}"

class BikeRide(Ride):                  # a BikeRide is a Ride, with its own fare rule
    def fare(self):
        return 5 * self.km

print(Ride(4).describe())
print(BikeRide(4).describe())          # describe() is inherited; fare() is replaced
```

```output
Ride: 4 km, ₹40
BikeRide: 4 km, ₹20
```

LeetCode "design" problems are classes. Here is Min Stack:

```python
class MinStack:
    def __init__(self):
        self.items = []
        self.mins = []                 # mins[-1] is always the smallest so far

    def push(self, x):
        self.items.append(x)
        self.mins.append(x if not self.mins else min(x, self.mins[-1]))

    def pop(self):
        self.mins.pop()
        return self.items.pop()

    def get_min(self):
        return self.mins[-1]

s = MinStack()
for x in [5, 3, 7]:
    s.push(x)
print(s.get_min())
s.pop()
s.pop()
print(s.get_min())
```

```output
3
5
```

A `dataclass` writes `__init__` and `__repr__` for you:

```python
from dataclasses import dataclass

@dataclass
class Item:
    name: str
    price: int
    qty: int = 1

    def total(self):
        return self.price * self.qty

rice = Item("rice", 60, 2)
print(rice)
print(rice.total())
```

```output
Item(name='rice', price=60, qty=2)
120
```

## Time and space

| Operation | Time |
| --- | --- |
| Make an object | O(1) + the work in `__init__` |
| Read or write `obj.attr` | O(1) (a dict lookup) |
| Call a method | O(1) + the work inside |

Each object uses memory for its own attributes.

## Common mistakes

- Forgetting `self` in a method:

```python
# WRONG: the method forgot "self"
class Shop:
    def open():
        return "open"

print(Shop().open())
```

```output
Traceback (most recent call last):
  File "shop.py", line 6, in <module>
    print(Shop().open())
          ~~~~~~~~~~~^^
TypeError: Shop.open() takes 0 positional arguments but 1 was given
```

- Writing `km = km` instead of `self.km = km` in `__init__`. The value is lost.
- A list as a **class** attribute (`items = []` in the class body) is shared by all objects. Make it in `__init__`: `self.items = []`.
- Calling the class without brackets: `r = AutoRide` gives the blueprint, not a ride.

## Patterns that use it

- **Design problems**: Min Stack, LRU Cache, Trie, Twitter, Time Map. LeetCode gives you a class to fill in.
- **Linked lists and trees**: `ListNode` and `TreeNode` are tiny classes.
- **Low-level design** (Phase 3): parking lot, library, elevator.

## Practice

```practice
Write a class BankAccount with deposit, withdraw (no overdraft) and a balance check.
Write a class Student with name and marks, and a method grade().
design-parking-system
implement-queue-using-stacks
min-stack
design-hashset
design-hashmap
kth-largest-element-in-a-stream
```

## Explain it back

```explain
What is the difference between a class and an object?
What is self, and why does every method need it?
What does __init__ do, and when does it run?
Why is a list in the class body a trap?
```

## Flashcards

```flashcards
Class vs object? :: A class is a blueprint. An object is one thing made from it.
What is self? :: The particular object the method is working on.
When does __init__ run? :: When you make a new object, like AutoRide("Manju", 5).
What does r1.fare() really call? :: AutoRide.fare(r1)
What is inheritance? :: A class that gets everything from a parent class and can change some parts.
What does @dataclass do? :: Writes __init__ and __repr__ for you from the field list.
```
