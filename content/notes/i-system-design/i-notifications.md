---
id: i-notifications
title: Design a notification system
level: advanced
phase: 3
week: 38
tags: [system-design, interview, queues, messaging]
estMinutes: 35
---

## What it is

A shared service that sends **push notifications, SMS and emails** for many other services (orders, payments, OTPs, promotions).
It must respect **user preferences** and **quiet hours**, never send the same notification twice, retry when a provider fails, and never let a flood of promotions delay an OTP.

## Real-life example

A food delivery app: "Order confirmed" (push), "OTP 5521" (SMS, urgent, any time), "Your weekly offers" (email, not at 11 PM). If the SMS provider is down for a minute, the OTP must still reach the user quickly, through a retry or a backup provider.

## Picture

```text
 order service ─┐
 payment svc  ──┼─▶ Notification API ─▶ validate, dedupe, preferences, quiet hours, template
 marketing    ─┘                          │
                     priority queues:  [ OTP / critical ] [ transactional ] [ promotions ]
                                          │                │                │
                                    push workers ─▶ FCM/APNs   SMS workers ─▶ SMS provider (+ backup)
                                                   email workers ─▶ email provider
                     status store: sent / delivered / failed; retries with backoff; dead letter queue
```

## How it works inside

- **API**: `POST /notify {user_id, event_key, template, data, priority}`. Callers never talk to SMS/email providers directly.
- **Idempotency**: an `event_key` (like `order101:shipped`) makes duplicate calls and retries harmless.
- **Preferences**: per user and per category (some users want no promotional SMS). Legal rules (opt-outs, DND registries for SMS in India) live here.
- **Quiet hours / rate limits**: hold non-urgent messages at night; cap promotions per user per day.
- **Templates and localisation**: "Your order {id} is on the way" in English, Hindi, Kannada.
- **Queues per channel and priority**: a promo blast must never delay OTPs. Workers scale per queue.
- **Providers**: wrap each one behind an adapter; retry with backoff; fail over to a second provider for critical messages; dead letter queue for repeated failures.
- **Tracking**: store status and provider callbacks (delivered, bounced, opened) for debugging and analytics.

## Python, step by step

Dedupe, preferences and quiet hours, with one queue per channel:

```python
from dataclasses import dataclass

@dataclass
class Prefs:
    channels: set
    quiet_start: int = 22                       # 10 PM
    quiet_end: int = 7                          # 7 AM

class NotificationService:
    def __init__(self, prefs):
        self.prefs = prefs
        self.seen = set()                       # (user, event_key) already handled
        self.queues = {"push": [], "sms": [], "email": []}
        self.held = []                          # waiting for the morning

    def notify(self, user, event_key, message, hour, urgent=False):
        if (user, event_key) in self.seen:
            return "duplicate, skipped"
        self.seen.add((user, event_key))
        p = self.prefs[user]
        quiet = hour >= p.quiet_start or hour < p.quiet_end
        if quiet and not urgent:
            self.held.append((user, message))
            return "held until morning"
        for channel in sorted(p.channels):
            self.queues[channel].append((user, message))
        return f"queued on {sorted(p.channels)}"

svc = NotificationService({"ravi": Prefs({"push", "email"}), "asha": Prefs({"sms"})})
print(svc.notify("ravi", "order101:shipped", "Your order is on the way", hour=14))
print(svc.notify("ravi", "order101:shipped", "Your order is on the way", hour=14))   # a retried call
print(svc.notify("asha", "promo:diwali", "Diwali sale!", hour=23))
print(svc.notify("asha", "otp:5521", "OTP 5521", hour=23, urgent=True))
print({ch: len(q) for ch, q in svc.queues.items()}, "held:", len(svc.held))
```

```output
queued on ['email', 'push']
duplicate, skipped
held until morning
queued on ['sms']
{'push': 1, 'sms': 1, 'email': 1} held: 1
```

## Time and space

| Concern | Design answer |
| --- | --- |
| Spikes (sale announcements to 10M users) | queues + many workers; batch provider calls |
| OTP latency | separate high-priority queue and workers |
| Provider failures | retries with backoff, backup provider, DLQ |
| Storage | status rows per notification; keep weeks, then archive |

## Common mistakes

- Services calling SMS/email providers directly (no shared preferences, dedupe or tracking).
- One queue for everything (promotions delay OTPs).
- No idempotency: retries send duplicates.
- Ignoring opt-outs, quiet hours and regulations.
- No fallback provider for critical messages.

## Patterns that use it

Queues and priorities, idempotent consumers, retries/backoff/DLQ, adapters for providers, observer/event-driven design, rate limiting.

## Practice

```practice
Add a daily cap: at most 2 promotional notifications per user per day.
Add a backup SMS provider that is used when the main one fails twice in a row.
Draw the full design and explain how an OTP gets delivered within 5 seconds during a big promo blast.
```

## Explain it back

```explain
Why should all services send notifications through one service?
How do event keys prevent duplicate notifications?
Why use separate queues by priority?
What happens when the SMS provider is down?
```

## Flashcards

```flashcards
Prevent duplicate notifications? :: An idempotency/event key per notification.
Keep OTPs fast during promo blasts? :: Separate high-priority queues and workers.
Quiet hours? :: Hold non-urgent messages until morning.
Provider failure? :: Retry with backoff, fail over, then dead letter queue.
Talk to providers through? :: Adapters behind one interface.
```
