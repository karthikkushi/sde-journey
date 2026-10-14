---
id: h-solid
title: SOLID principles
level: core
phase: 3
week: 40
tags: [design, oop, solid, clean-code]
estMinutes: 30
---

## What it is

**SOLID** is five guidelines for classes that are easy to change and test:
**S**ingle responsibility, **O**pen/closed, **L**iskov substitution, **I**nterface segregation, **D**ependency inversion.
They are not laws. They are reasons to split, simplify or invert a design when it starts to hurt.

## Real-life example

A good kitchen: one cook per job (S), new dishes can be added without rebuilding the kitchen (O), any trained cook can replace another at the same station (L), a tea-maker is not forced to know how to make biryani (I), and the head chef asks for "a cook", not "Ramesh specifically" (D).

## Picture

```text
 S  one class, one reason to change        Invoice ≠ InvoicePrinter ≠ InvoiceRepository
 O  add new behaviour by adding code       new DiscountRule class, no edits to the old ones
 L  subtypes must keep the parent's promise a Square that breaks Rectangle's rules is a trap
 I  small, focused interfaces              Printer, Scanner instead of one AllInOneMachine
 D  depend on abstractions, inject them    OrderService(notifier) instead of EmailSender() inside
```

## How it works inside

- **S (single responsibility)**: a class should have one reason to change. If tax rules, PDF layout and database code all live in `Invoice`, every change risks breaking the others.
- **O (open/closed)**: open for extension, closed for modification. Instead of a growing `if/elif` on types, give each case its own class (or function) and pick it from a table.
- **L (Liskov substitution)**: anywhere a parent is expected, a subclass must work without surprises. The classic violation: `Square(Rectangle)`: setting the width also changes the height, so code written for rectangles breaks.
- **I (interface segregation)**: many small interfaces beat one big one. Classes should not be forced to implement methods they do not need.
- **D (dependency inversion)**: high-level code should depend on an abstraction (a notifier, a repository), and the concrete thing is **passed in** (dependency injection). This is what makes code testable with fakes.

## Python, step by step

Open/closed: add a new discount without editing the old code:

```python
class NoDiscount:
    def apply(self, total):
        return total

class FestivalDiscount:                     # 10% off
    def apply(self, total):
        return total * 90 // 100

class BulkDiscount:                         # ₹50 off above ₹1000 (added later, nothing else changed)
    def apply(self, total):
        return total - 50 if total > 1000 else total

def checkout(total, rule):
    return rule.apply(total)

for rule in (NoDiscount(), FestivalDiscount(), BulkDiscount()):
    print(type(rule).__name__, checkout(1200, rule))
```

```output
NoDiscount 1200
FestivalDiscount 1080
BulkDiscount 1150
```

Dependency inversion: pass the notifier in, so a test can use a fake:

```python
class EmailNotifier:
    def send(self, to, message):
        raise RuntimeError("would send a real email")   # never in tests!

class FakeNotifier:
    def __init__(self):
        self.sent = []

    def send(self, to, message):
        self.sent.append((to, message))

class OrderService:
    def __init__(self, notifier):           # depends on "something with send()", injected
        self.notifier = notifier

    def place(self, order_id, email):
        self.notifier.send(email, f"order {order_id} placed")
        return "ok"

fake = FakeNotifier()
print(OrderService(fake).place(101, "ravi@example.com"), fake.sent)
```

```output
ok [('ravi@example.com', 'order 101 placed')]
```

Liskov: a subclass that breaks its parent's promise:

```python
class Rectangle:
    def __init__(self, w, h):
        self.w, self.h = w, h

    def set_width(self, w):
        self.w = w

    def area(self):
        return self.w * self.h

class Square(Rectangle):                    # "a square IS a rectangle"... in maths, not in code
    def set_width(self, w):
        self.w = self.h = w                 # keeps it square, but surprises callers

def stretch(shape):                         # written for rectangles: only the width changes
    shape.set_width(10)
    return shape.area()

print(stretch(Rectangle(2, 5)), stretch(Square(5, 5)))   # expected 50 and 50
```

```output
50 100
```

> **Same thing in C#**: interfaces (`INotifier`) plus constructor injection, registered in ASP.NET Core's built-in container: `builder.Services.AddScoped<INotifier, EmailNotifier>();`.

## Time and space

SOLID adds a few small classes and interfaces. Apply it when a class keeps changing for different reasons, or is hard to test, not "just in case" (over-engineering is also a design smell).

## Common mistakes

- Turning every function into an interface plus three classes for no reason.
- A huge `if type == ...` chain that grows with every new feature (violates O).
- Creating dependencies inside methods (`EmailNotifier()` inside `place`) so tests cannot replace them.
- Subclasses that throw "not supported" for parent methods (often an L or I problem).

## Patterns that use it

Strategy (O and D), dependency injection in FastAPI (`Depends`) and ASP.NET Core, LLD interviews ("how would you add a new vehicle type?"), and testable backends.

## Practice

```practice
Find a class in your projects that does 3 jobs. Split it by responsibility.
Replace an if/elif chain on types with a dictionary of small classes or functions.
Rewrite one service to receive its database and email clients through the constructor; write a test with fakes.
Explain the Square/Rectangle problem to a friend.
```

## Explain it back

```explain
Explain each SOLID letter with the kitchen example.
How does dependency inversion make code easier to test?
Why is Square(Rectangle) a Liskov violation?
When is applying SOLID overkill?
```

## Flashcards

```flashcards
S? :: Single responsibility: one reason to change.
O? :: Open for extension, closed for modification.
L? :: Subtypes must work wherever the parent works.
I? :: Small, focused interfaces.
D? :: Depend on abstractions; inject concrete classes.
Classic Liskov violation? :: Square as a subclass of Rectangle.
```
