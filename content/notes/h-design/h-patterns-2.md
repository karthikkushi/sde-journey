---
id: h-patterns-2
title: Design patterns 2 - observer, adapter, decorator
level: core
phase: 3
week: 42
tags: [design, patterns, lld, oop]
estMinutes: 30
---

## What it is

Three more patterns that appear everywhere in backend code:
**Observer** (when something happens, notify everyone who subscribed), **Adapter** (make an old or third-party interface fit the one your code expects), and **Decorator** (wrap an object or function to add behaviour without changing it).

## Real-life example

- Observer: a WhatsApp group. When the shop posts "fresh vegetables arrived", every member gets it; members can join or leave anytime.
- Adapter: a travel plug adapter. Your Indian charger fits a UK socket without changing the charger or the wall.
- Decorator: gift wrapping. The gift stays the same; you add paper, then a ribbon, then a card.

## Picture

```text
 Observer:   OrderPlaced ──▶ [ send SMS ]  [ update stock ]  [ add loyalty points ]
             (the publisher does not know who listens)

 Adapter:    your code ──notify(to, text)──▶ [ Adapter ] ──old_api.sendMessage(number=..., body=...)──▶ old SMS service

 Decorator:  retry( log( send_sms ) )   each layer adds one behaviour around the same call
```

## How it works inside

**Observer (publish/subscribe)**
- A subject keeps a list of subscribers (callbacks). On an event it calls each one.
- Decouples "something happened" from "what to do about it". Adding a new reaction = one new subscriber.
- At system scale this becomes a **message bus / event queue** (Kafka, RabbitMQ topics).

**Adapter**
- A small class that translates one interface into another: different method names, argument shapes or units.
- Use it to wrap third-party SDKs, legacy code, or two payment gateways behind one interface. Then switching provider touches only the adapter.

**Decorator**
- Wraps an object (or function) with the **same interface**, adding behaviour before/after: logging, timing, caching, retries, auth checks.
- Python's `@decorator` syntax is the function version: `@lru_cache`, `@app.get(...)` in FastAPI, `@retry`.
- Stack several decorators; each does one job (single responsibility).

## Python, step by step

Observer: an event bus for "order placed":

```python
from collections import defaultdict

class EventBus:
    def __init__(self):
        self.subscribers = defaultdict(list)       # event name -> list of handler functions

    def subscribe(self, event, handler):
        self.subscribers[event].append(handler)

    def publish(self, event, data):
        return [handler(data) for handler in self.subscribers[event]]

bus = EventBus()
bus.subscribe("order_placed", lambda o: f"SMS to {o['phone']}")
bus.subscribe("order_placed", lambda o: f"stock reduced for {o['items']}")
bus.subscribe("order_placed", lambda o: f"{o['total'] // 100} loyalty points")
print(bus.publish("order_placed", {"phone": "98xxxxxx01", "items": ["rice"], "total": 640}))
```

```output
['SMS to 98xxxxxx01', "stock reduced for ['rice']", '6 loyalty points']
```

Adapter: make an old SMS service fit our `Notifier` interface:

```python
class OldSmsService:                               # third-party code we cannot change
    def sendMessage(self, number, body, priority=1):
        return f"[old api] {number}: {body} (p{priority})"

class SmsAdapter:                                  # our code expects: notify(to, text)
    def __init__(self, service):
        self.service = service

    def notify(self, to, text):
        return self.service.sendMessage(number=to, body=text, priority=2)

def alert_customer(notifier, phone):
    return notifier.notify(phone, "your order is out for delivery")

print(alert_customer(SmsAdapter(OldSmsService()), "98xxxxxx01"))
```

```output
[old api] 98xxxxxx01: your order is out for delivery (p2)
```

Decorators: add logging and retries without touching the function:

```python
import functools

calls = []

def logged(fn):
    @functools.wraps(fn)
    def wrapper(*args):
        calls.append(f"calling {fn.__name__}{args}")
        return fn(*args)
    return wrapper

def retry(times):
    def decorate(fn):
        @functools.wraps(fn)
        def wrapper(*args):
            for attempt in range(1, times + 1):
                try:
                    return fn(*args)
                except ConnectionError:
                    calls.append(f"attempt {attempt} failed")
            raise ConnectionError(f"{fn.__name__} failed {times} times")
        return wrapper
    return decorate

failures = iter([True, True, False])               # fail twice, then work

@retry(times=3)
@logged
def send_sms(phone):
    if next(failures):
        raise ConnectionError("gateway down")
    return f"sent to {phone}"

print(send_sms("98xxxxxx01"))
print(calls)
```

```output
sent to 98xxxxxx01
["calling send_sms('98xxxxxx01',)", 'attempt 1 failed', "calling send_sms('98xxxxxx01',)", 'attempt 2 failed', "calling send_sms('98xxxxxx01',)"]
```

> **Same thing in C#**: observer via `event`/`EventHandler` or MediatR notifications; adapters as classes implementing your interface around an SDK; decorators by wrapping an interface (`class LoggingNotifier : INotifier`) or with middleware/filters in ASP.NET Core.

## Time and space

Each pattern adds one small layer of indirection (a function call or a list of callbacks). Negligible cost; big gains in flexibility.

## Common mistakes

- Observer: subscribers that throw and stop the others (catch errors per subscriber), or memory leaks from never unsubscribing.
- Adapter: letting the third-party types leak into the rest of your code anyway.
- Decorator: forgetting `functools.wraps` (the function loses its name and docs), or stacking decorators in the wrong order (retry outside log = every attempt is logged).

## Patterns that use it

Event-driven systems and notification services (observer), payment and SMS provider integrations (adapter), FastAPI routes, caching and retries (decorator), and middleware chains.

## Practice

```practice
Add an "unsubscribe" method to EventBus and make one failing subscriber not stop the others.
Write adapters for two fake payment gateways with different method names, behind one PaymentGateway interface.
Write a @timed decorator that records how long a function took.
Swap the order of @retry and @logged above. Predict the calls list, then run it.
```

## Explain it back

```explain
Explain the observer pattern with the WhatsApp group example.
When would you write an adapter?
How is a decorator different from inheritance for adding behaviour?
What does functools.wraps do?
```

## Flashcards

```flashcards
Observer? :: Subscribers register; the subject notifies all of them on an event.
Adapter? :: Translates one interface into the one your code expects.
Decorator? :: Wraps something with the same interface to add behaviour.
Python decorator syntax? :: @decorator above a def.
Why functools.wraps? :: Keeps the wrapped function's name and docs.
Observer at system scale? :: A message bus / event queue (Kafka, RabbitMQ).
```
