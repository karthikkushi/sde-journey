---
id: i-payments
title: "System design: payment system with a ledger"
level: advanced
phase: 5
week: 44
tags: [system-design, payments, ledger, idempotency]
estMinutes: 40
---

## What it is

Design the payments part of an app like Swiggy or Razorpay: a customer pays, the money moves through a payment gateway, and every rupee is recorded.
The heart is a **double-entry ledger** (every movement is two equal entries), **idempotency keys** (no double charge), **signed webhooks** from the gateway, and daily **reconciliation** with the bank's report.

## Real-life example

An old bahi-khata. Every entry has two sides: when a customer pays ₹500, cash goes up by ₹500 and the customer's dues go down by ₹500. If the two sides of the book do not match at the end of the day, something is wrong, and you know to look.

## Picture

```text
 app ── POST /payments (Idempotency-Key) ──► Payment service ──► gateway (UPI / card)
                                               │   state: created → pending → succeeded / failed
                                               │◄── signed webhook: "pay_9 succeeded"
                                               ▼
                                         Ledger (append-only)
                                         debit  customer_wallet  500
                                         credit merchant_payable 500
                                               │
                         nightly: reconcile ledger ⇄ gateway settlement report
```

## How it works inside

**Requirements**: create a payment, show its status, refunds, no double charge, no lost money, audit everything. Scale: thousands of payments per second at peak; correctness matters more than speed.

**Payment state machine**: `created → pending → succeeded | failed`, and `succeeded → refunded`. Only allowed transitions; store each transition with a timestamp.

**Idempotency**: the client sends a key; the service stores key → payment with a unique index, so a retry returns the same payment.

**Gateway calls**: the gateway answers asynchronously. You get the final result through a **webhook**: verify its HMAC signature, de-duplicate by event id, and update state. If the webhook never arrives, a job polls the gateway for payments stuck in `pending`.

**Ledger**: append-only rows `(entry_id, account, direction, amount, payment_id)`. Never update or delete; corrections are new entries. For every payment, debits equal credits. Balances are sums (or cached in a balance table updated in the same transaction).

**Money**: store paise as integers, never floats. Write the ledger rows and the state change in **one database transaction**; use the outbox pattern to publish events.

**Reconciliation**: every night, match your ledger against the gateway's settlement file. Mismatches go to a queue for a human.

**Scale**: partition by merchant or by payment id; the ledger is write-heavy and append-only, which databases handle well.

## Python, step by step

A tiny double-entry ledger: every transfer writes two entries, and the books always balance.

```python
from collections import defaultdict

ledger = []                              # append-only

def transfer(payment_id, debit_acct, credit_acct, paise):
    ledger.append((payment_id, debit_acct, "debit", paise))
    ledger.append((payment_id, credit_acct, "credit", paise))

def balance(account):
    total = 0
    for _, acct, direction, paise in ledger:
        if acct == account:
            total += paise if direction == "credit" else -paise
    return total

transfer("pay_1", "customer:ravi", "merchant:dosa-corner", 50_000)    # ₹500
transfer("pay_2", "customer:asha", "merchant:dosa-corner", 12_050)    # ₹120.50
transfer("ref_1", "merchant:dosa-corner", "customer:asha", 12_050)    # refund: a NEW entry, nothing deleted

debits = sum(p for *_, d, p in ledger if d == "debit")
credits = sum(p for *_, d, p in ledger if d == "credit")
print("balanced:", debits == credits)
print("merchant ₹", balance("merchant:dosa-corner") / 100)
print("asha ₹", balance("customer:asha") / 100)
print("entries:", len(ledger))
```

```output
balanced: True
merchant ₹ 500.0
asha ₹ 0.0
entries: 6
```

## Time and space

| Part | Note |
| --- | --- |
| Ledger write | 2 rows per movement, append-only |
| Balance | sum of entries, or a cached balance updated in the same transaction |
| Storage | grows forever; archive old partitions, never delete |

## Common mistakes

- Floats for money.
- Updating a ledger row instead of adding a correcting entry.
- Trusting the client's redirect ("payment success page") instead of the signed webhook.
- No plan for webhooks that never arrive.

## Patterns that use it

Idempotency keys and webhooks (API engineering note), the outbox pattern, transactions and isolation, the flash-sale design.

## Practice

```practice
Draw this design in 30 minutes from memory, then explain it aloud in 10
Add refunds and partial refunds to the ledger example
Design reconciliation: what happens when the gateway says paid but your ledger has nothing?
Explain how a retried POST /payments avoids a double charge
```

## Explain it back

```explain
Why is the ledger append-only?
Why trust the webhook rather than the browser redirect?
What does reconciliation catch that tests cannot?
```

## Flashcards

```flashcards
What is double-entry? :: Every money movement is two equal entries, a debit and a credit, so the books balance.
How do you store money? :: As integers in the smallest unit (paise), never floats.
How do you correct a ledger mistake? :: Add a new correcting entry; never edit or delete.
How do you learn a payment's final status? :: A signed gateway webhook, plus a poller for payments stuck in pending.
What is reconciliation? :: Matching your ledger with the gateway's settlement report, usually nightly.
```
