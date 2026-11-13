---
id: f-api-engineering
title: "API engineering: versions, idempotency, contracts, webhooks"
level: core
phase: 3
week: 35
tags: [backend, api, idempotency, webhooks, openapi]
estMinutes: 30
---

## What it is

The REST note covers routes and status codes. Real APIs also need:
**versioning** (change without breaking old clients), **idempotency keys** (a retry never charges twice), **cursor pagination**, an **OpenAPI contract**, **webhooks** (you call the client when something happens), **CORS** (which browser sites may call you) and sometimes **gRPC**.
Interviewers at payment and delivery companies ask about these by name.

## Real-life example

You tap "Pay" on a UPI app, the network drops, and you tap again. You must be charged once. The app sends the same **request id** both times, and the bank sees it has already done that payment and returns the first result. That request id is an idempotency key.

## Picture

```text
 client                       server
   │ POST /payments            │
   │ Idempotency-Key: k-42 ───►│ new key: charge ₹500, save (k-42 → result)
   │ (timeout, no reply)       │
   │ POST /payments            │
   │ Idempotency-Key: k-42 ───►│ seen k-42: return the SAVED result, no new charge
   │◄─── 201 {id: p-1} ────────│
```

## How it works inside

- **Versioning**: put the version in the path (`/v1/orders`) or a header. Add fields freely; never remove or rename a field inside a version. Announce a deprecation date for old versions.
- **Idempotency keys**: the client sends a unique key per action. The server stores key → response (with a unique index) for a day or so. Same key again → same response. Same key with a different body → `422`.
- **Cursor pagination**: `?after=<last id>&limit=50` instead of `?page=7`. Pages stay stable when new rows arrive, and the query uses an index.
- **OpenAPI**: a machine-readable contract of every route. FastAPI and ASP.NET Core generate it; clients and tests are built from it.
- **Webhooks**: you `POST` an event to the client's URL. Sign the body with HMAC so they can trust it, retry with backoff, and let them de-duplicate by event id.
- **CORS**: browsers block a page on site A from calling API B unless B answers with `Access-Control-Allow-Origin: A`. It protects browser users; it is not authentication.
- **gRPC vs REST**: gRPC uses binary messages over HTTP/2 with a strict schema. It is fast for service-to-service calls; REST with JSON is simpler for public and browser APIs.

## Python, step by step

An idempotent payment endpoint with an in-memory store:

```python
import hashlib, json

payments, seen = [], {}            # seen: key -> (body hash, response)

def create_payment(key, body):
    digest = hashlib.sha256(json.dumps(body, sort_keys=True).encode()).hexdigest()
    if key in seen:
        old_digest, response = seen[key]
        if old_digest != digest:
            return 422, {"error": "key reused with a different body"}
        return response                       # replay: same answer, no new charge
    payments.append(body)
    response = (201, {"id": f"p-{len(payments)}", "amount": body["amount"]})
    seen[key] = (digest, response)
    return response

print(create_payment("k-42", {"amount": 500}))
print(create_payment("k-42", {"amount": 500}))   # the retry
print(create_payment("k-42", {"amount": 900}))
print(len(payments))
```

```output
(201, {'id': 'p-1', 'amount': 500})
(201, {'id': 'p-1', 'amount': 500})
(422, {'error': 'key reused with a different body'})
1
```

Signing a webhook so the receiver can check it came from you:

```python
import hmac, hashlib

secret = b"shared-secret"
body = b'{"event": "order.delivered", "id": "evt_9"}'
signature = hmac.new(secret, body, hashlib.sha256).hexdigest()

def receiver_accepts(body, signature):
    expected = hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)    # constant-time compare

print(receiver_accepts(body, signature))
print(receiver_accepts(b'{"event": "order.cancelled", "id": "evt_9"}', signature))
```

```output
True
False
```

Cursor pagination over sorted ids:

```python
orders = list(range(1, 11))          # order ids 1..10

def page(after, limit):
    items = [o for o in orders if o > after][:limit]
    return items, (items[-1] if len(items) == limit else None)

items, cursor = page(0, 4)
print(items, cursor)
items, cursor = page(cursor, 4)
print(items, cursor)
items, cursor = page(cursor, 4)
print(items, cursor)
```

```output
[1, 2, 3, 4] 4
[5, 6, 7, 8] 8
[9, 10] None
```

> **Same thing in ASP.NET Core**: `Asp.Versioning` for versions, `builder.Services.AddCors(...)`, Swashbuckle or the built-in OpenAPI support for the contract, and a filter or middleware that stores idempotency keys.

## Time and space

| Idea | Cost |
| --- | --- |
| Idempotency store | one row per key, kept about 24 hours |
| Cursor page | O(limit) with an index, no matter how deep |
| Offset page | the database still walks past every skipped row |

## Common mistakes

- Removing a field from `v1` because "nobody uses it".
- Idempotency keys checked in memory on one server only; use the database with a unique index.
- Webhooks without signatures or retries.
- Treating CORS as security for the API itself.

## Patterns that use it

Payment systems, order creation, webhook services and any "safe to retry" endpoint. The outbox and message-queue notes pair with webhooks.

## Practice

```practice
Add an Idempotency-Key header to the POST endpoint of your project, backed by a unique index
Replace offset pagination in one list endpoint with a cursor
Write the OpenAPI file for one endpoint and generate a client from it
Sign your webhook payloads with HMAC and verify them in a test
```

## Explain it back

```explain
Why must a retried payment return the first response?
Why is cursor pagination stable when new rows arrive?
What does CORS protect, and what does it not protect?
```

## Flashcards

```flashcards
What is an idempotency key? :: A client-chosen id for one action; the server returns the saved result if it sees the key again.
Same idempotency key, different body? :: Reject it, usually with 422.
Why cursor pagination? :: Stable pages and index-friendly queries, unlike deep offsets.
How does a receiver trust a webhook? :: It recomputes the HMAC of the body with the shared secret and compares.
When is gRPC a good fit? :: Fast service-to-service calls with a strict schema.
```
