---
id: h-oop
title: OOP - the four pillars
level: core
phase: 3
week: 39
tags: [design, oop, lld, classes]
estMinutes: 30
---

## What it is

Object-oriented programming (OOP) organises code into **objects** that hold data and behaviour together.
Four ideas ("pillars") make it work: **encapsulation**, **abstraction**, **inheritance** and **polymorphism**.
One more rule matters as much: prefer **composition** ("has a") over deep inheritance ("is a").

## Real-life example

A UPI app on your phone. You press "Pay" (abstraction: you do not see bank servers). Your balance can only change through the app's rules (encapsulation). UPI, card and cash are all "a payment" (inheritance). The same "Pay" button does different work for each (polymorphism). A phone **has** a camera; it is not a kind of camera (composition).

## Picture

```text
                  Payment  (abstract: "every payment can pay(amount)")
               /     |     \
            UPI     Card    Cash          ← inheritance: each IS a Payment
             │       │       │
       pay() does different work          ← polymorphism: one call, many behaviours

 Wallet: _balance (hidden) ── only add() / spend() may change it   ← encapsulation
 Car ──has an──▶ Engine                                            ← composition
```

## How it works inside

- **Encapsulation**: keep an object's data private and change it only through methods that enforce the rules (no negative balance). In Python, a leading `_` means "internal"; `@property` exposes read-only values. C# has real `private` fields.
- **Abstraction**: show a simple interface, hide the details. An **abstract base class** (`ABC`) lists the methods every subclass must have; it cannot be created itself.
- **Inheritance**: a subclass reuses and extends a parent class. Use it only for a true "is a" relationship.
- **Polymorphism**: code calls `payment.pay(amount)` without knowing which kind of payment it is; each class answers in its own way. Python also has **duck typing**: any object with a `pay` method works.
- **Composition**: build objects from other objects (`Car` has an `Engine`). Easier to change than deep inheritance trees, which become fragile.

## Python, step by step

Abstraction + inheritance + polymorphism:

```python
from abc import ABC, abstractmethod

class Payment(ABC):                         # abstraction: what every payment must do
    @abstractmethod
    def pay(self, amount): ...

class UPI(Payment):
    def __init__(self, upi_id):
        self.upi_id = upi_id

    def pay(self, amount):
        return f"₹{amount} paid by UPI {self.upi_id}"

class Card(Payment):
    def __init__(self, last4):
        self.last4 = last4

    def pay(self, amount):
        return f"₹{amount} paid by card ending {self.last4}"

class Cash(Payment):
    def pay(self, amount):
        return f"₹{amount} paid in cash"

for method in [UPI("ravi@okbank"), Card("4242"), Cash()]:
    print(method.pay(250))                  # polymorphism: one call, different behaviour

try:
    Payment()                               # an abstract class cannot be created
except TypeError as e:
    print("cannot create Payment:", type(e).__name__)
```

```output
₹250 paid by UPI ravi@okbank
₹250 paid by card ending 4242
₹250 paid in cash
cannot create Payment: TypeError
```

Encapsulation: the balance changes only through rules:

```python
class Wallet:
    def __init__(self):
        self._balance = 0                   # "_" = internal: do not touch from outside

    @property
    def balance(self):                      # read-only view
        return self._balance

    def add(self, amount):
        if amount <= 0:
            raise ValueError("amount must be positive")
        self._balance += amount

    def spend(self, amount):
        if amount > self._balance:
            raise ValueError("not enough money")
        self._balance -= amount

w = Wallet()
w.add(500)
w.spend(120)
print(w.balance)
for action in (lambda: w.spend(1000), lambda: setattr(w, "balance", 10**6)):
    try:
        action()
    except (ValueError, AttributeError) as e:
        print("blocked:", type(e).__name__)
```

```output
380
blocked: ValueError
blocked: AttributeError
```

Composition ("has a") instead of inheritance:

```python
class Engine:
    def start(self):
        return "engine on"

class ElectricMotor:
    def start(self):
        return "motor humming"

class Car:
    def __init__(self, engine):
        self.engine = engine                # a Car HAS an engine; swap it freely

    def drive(self):
        return f"{self.engine.start()}, driving"

print(Car(Engine()).drive())
print(Car(ElectricMotor()).drive())
```

```output
engine on, driving
motor humming, driving
```

> **Same thing in C#**: `public abstract class Payment { public abstract string Pay(int amount); }`, `class Upi : Payment { public override string Pay(int amount) => ...; }`, real `private` fields with public methods, and `interface IEngine` for composition.

## Time and space

OOP is about organising code, not speed. A method call costs a tiny bit more than a plain function call; that almost never matters. Clear objects make big codebases cheaper to change.

## Common mistakes

- Deep inheritance trees ("Animal → Mammal → Dog → ServiceDog → ...") that break when one level changes.
- Inheritance used just to reuse code, without a real "is a" relationship.
- Public fields that anyone can set to invalid values.
- "God classes" that do everything (see SRP in the SOLID note).

## Patterns that use it

Every design pattern, low-level design interviews (parking lot, library, elevator, Splitwise), and LeetCode design problems (LRU cache, min stack).

## Practice

```practice
Model a food delivery app: Restaurant, MenuItem, Order, DeliveryPartner. Which are "is a" and which are "has a" relationships?
Add a Wallet payment type to the Payment example without changing any existing class.
Rewrite a class from your projects so that its data can only change through methods with checks.
design-parking-system
```

## Explain it back

```explain
Explain the four pillars with the UPI app example.
What is the difference between abstraction and encapsulation?
Why is composition often better than inheritance?
What is polymorphism, and how does it remove if/else chains?
```

## Flashcards

```flashcards
Encapsulation? :: Keep data private; change it only through methods with rules.
Abstraction? :: Show a simple interface, hide the details.
Inheritance? :: A subclass reuses and extends a parent ("is a").
Polymorphism? :: The same call works on different types, each in its own way.
Composition? :: Build objects from other objects ("has a").
Abstract base class? :: Declares required methods; cannot be created itself.
```
