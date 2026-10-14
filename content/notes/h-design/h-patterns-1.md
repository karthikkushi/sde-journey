---
id: h-patterns-1
title: Design patterns 1 - singleton, factory, strategy
level: core
phase: 3
week: 41
tags: [design, patterns, lld, oop]
estMinutes: 30
---

## What it is

**Design patterns** are named, proven shapes for common design problems. Knowing the names lets you design faster and talk clearly with other engineers.
This note covers three **creational/behavioural** patterns you will meet every week:
**Singleton** (exactly one shared instance), **Factory** (create the right object from a simple input), **Strategy** (swap an algorithm at run time).

## Real-life example

- Singleton: a shop has one cash register that everyone uses.
- Factory: you tell the counter "one masala dosa"; the kitchen decides which cook, pan and batter. You never build the dosa yourself.
- Strategy: the delivery charge rule changes (flat, by distance, free on Sundays) without rewriting the checkout.

## Picture

```text
 Singleton:  AppConfig.get() ─▶ always the SAME object

 Factory:    make_payment("upi", ...) ─▶ UPI(...)
             make_payment("card", ...) ─▶ Card(...)      caller never names the class

 Strategy:   Checkout ──uses──▶ «DeliveryFee»
                                  ├── FlatFee
                                  ├── DistanceFee
                                  └── FreeOnSunday        pick one at run time
```

## How it works inside

**Singleton**
- One instance for the whole program: configuration, a connection pool, a logger.
- In Python, the simplest singleton is a **module-level object** (modules are imported once). A class-based version overrides `__new__`.
- Use sparingly: singletons are global state and make tests harder. Often **dependency injection of one shared instance** is cleaner.

**Factory**
- A function or class that decides **which class to create** based on input (a string from config, a request field).
- New types are added in one place. Callers depend on the common interface, not on concrete classes.
- In Python a **dictionary of name → class** is often all you need.

**Strategy**
- Several interchangeable algorithms behind one interface; the caller holds one and can switch it.
- Replaces long if/else chains on "mode" or "type" (the Open/Closed principle in action).
- In Python, a strategy can simply be a **function** passed in.

## Python, step by step

Singleton (two ways):

```python
class AppConfig:
    _instance = None

    def __new__(cls):
        if cls._instance is None:                     # create only the first time
            cls._instance = super().__new__(cls)
            cls._instance.settings = {"gst": 5}
        return cls._instance

a, b = AppConfig(), AppConfig()
a.settings["gst"] = 18
print(a is b, b.settings)                             # the same object everywhere

# The Pythonic way: a module-level instance. Every "import config" gets this one object.
config = {"gst": 5, "currency": "INR"}
```

```output
True {'gst': 18}
```

Factory with a registry (adding a type = one new line):

```python
class UPI:
    def __init__(self, ref):
        self.ref = ref
    def pay(self, amount):
        return f"UPI {self.ref}: ₹{amount}"

class Card:
    def __init__(self, ref):
        self.ref = ref
    def pay(self, amount):
        return f"card {self.ref}: ₹{amount}"

PAYMENT_TYPES = {"upi": UPI, "card": Card}            # name -> class

def make_payment(kind, ref):
    try:
        return PAYMENT_TYPES[kind](ref)
    except KeyError:
        raise ValueError(f"unknown payment type: {kind}") from None

print(make_payment("upi", "ravi@okbank").pay(250))
print(make_payment("card", "**4242").pay(900))
try:
    make_payment("barter", "2 coconuts")
except ValueError as e:
    print(e)
```

```output
UPI ravi@okbank: ₹250
card **4242: ₹900
unknown payment type: barter
```

Strategy (as classes, and as plain functions):

```python
class Checkout:
    def __init__(self, fee_rule):
        self.fee_rule = fee_rule                      # the strategy, swappable

    def total(self, amount, km, day):
        return amount + self.fee_rule(amount, km, day)

def flat_fee(amount, km, day):
    return 40

def distance_fee(amount, km, day):
    return 10 * km

def free_on_sunday(amount, km, day):
    return 0 if day == "Sun" else distance_fee(amount, km, day)

for rule in (flat_fee, distance_fee, free_on_sunday):
    shop = Checkout(rule)
    print(rule.__name__, shop.total(500, 3, "Sun"), shop.total(500, 3, "Mon"))
```

```output
flat_fee 540 540
distance_fee 530 530
free_on_sunday 500 530
```

> **Same thing in C#**: register a singleton with `services.AddSingleton<IConfig, AppConfig>()`; factories as a `Dictionary<string, Func<IPayment>>` or `IServiceProvider`; strategies as `interface IFeeRule` (or a `Func<decimal, int, decimal>`).

## Time and space

All three are cheap: a dictionary lookup (factory), one attribute call (strategy), one shared object (singleton). Their value is in how easily the code changes.

## Common mistakes

- Singletons everywhere (hidden global state, hard tests).
- A factory that is a giant if/elif instead of a registry.
- Strategy classes with only one implementation "for the future" (premature abstraction).
- Forgetting a clear error for unknown types in a factory.

## Patterns that use it

Parking lot (fee strategies, vehicle factory), payment systems, notification channels (factory), rate limit algorithms (strategy), and pricing rules in e-commerce.

## Practice

```practice
Write a NotificationFactory that creates EmailNotifier, SmsNotifier or WhatsAppNotifier from a string.
Write three sorting strategies for a product list (by price, by rating, by newest) and switch between them.
Find a long if/elif chain in your code and turn it into a strategy or a registry.
Refactoring Guru: read the Strategy and Factory Method pages.
```

## Explain it back

```explain
When is a singleton reasonable, and why should you use it sparingly?
What problem does a factory solve for the caller?
How does the strategy pattern follow the Open/Closed principle?
Why can a strategy in Python just be a function?
```

## Flashcards

```flashcards
Singleton? :: Exactly one shared instance (config, pool). Use sparingly.
Pythonic singleton? :: A module-level object (modules import once).
Factory? :: Decides which class to create from simple input.
Factory in Python? :: A dict of name -> class.
Strategy? :: Interchangeable algorithms behind one interface, swapped at run time.
Strategy replaces? :: Long if/else chains on a "mode" or "type".
```
