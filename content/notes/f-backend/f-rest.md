---
id: f-rest
title: REST API design and status codes
level: core
phase: 3
week: 28
tags: [backend, api, rest, http, fastapi]
estMinutes: 35
---

## What it is

A **REST API** lets programs talk over HTTP using **resources** (nouns like `/products`, `/orders/101`) and **HTTP methods** (verbs like `GET`, `POST`).
Responses carry a **status code** that says what happened (`201 Created`, `404 Not Found`).
Good API design means a stranger can guess how your API works.

## Real-life example

A restaurant counter. The menu lists dishes (resources). You can **ask** about a dish (GET), **order** a new one (POST), **change** your order (PUT/PATCH), or **cancel** it (DELETE). The counter replies "here it is" (200), "order placed" (201), "we do not have that" (404) or "you forgot to say the size" (422).

## Picture

```text
 resource               GET            POST          PUT / PATCH        DELETE
 /products              list           create one    -                  -
 /products/7            read one       -             replace / update   delete
 /customers/1/orders    that customer's orders (nested resource)

 status codes:  2xx success    3xx redirect    4xx YOUR mistake    5xx SERVER's mistake
```

## How it works inside

**Methods**
- `GET` reads. It must not change anything. **Safe** and **idempotent** (calling it twice = once).
- `POST` creates (or runs an action). Not idempotent: two POSTs may create two orders.
- `PUT` replaces the whole resource. Idempotent.
- `PATCH` changes some fields.
- `DELETE` removes. Idempotent (deleting twice leaves it deleted).

**Status codes you must know**

| Code | Meaning | Use it when |
| --- | --- | --- |
| 200 OK | worked | GET, PUT, PATCH success |
| 201 Created | new resource made | POST created something (add a `Location` header) |
| 204 No Content | worked, nothing to return | DELETE |
| 400 Bad Request | malformed request | broken JSON, impossible values |
| 401 Unauthorized | who are you? | missing or bad login/token |
| 403 Forbidden | I know you, but no | logged in, not allowed |
| 404 Not Found | no such resource | wrong id |
| 409 Conflict | clashes with current state | duplicate email, version conflict |
| 422 Unprocessable | valid JSON, invalid fields | FastAPI's validation errors |
| 429 Too Many Requests | slow down | rate limit hit |
| 500 Internal Server Error | bug on the server | never on purpose |
| 503 Service Unavailable | down or overloaded | maintenance, dependency down |

**Design rules**
- Nouns, plural: `/orders`, not `/getOrders`. Use ids in the path: `/orders/101`.
- Filters, sorting and pages in the **query string**: `/orders?status=delivered&limit=20&offset=40` (or cursor-based pages for big lists).
- Consistent JSON field names and one error shape: `{"detail": "..."}`.
- **Version** breaking changes: `/v1/...` or a header.
- Make retries safe: idempotent methods, or an **idempotency key** header for POSTs like payments.

## Python, step by step

A small products API with FastAPI, called with its test client (no server needed):

```python
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
products = {}                                  # id -> product (a dict instead of a database)

class ProductIn(BaseModel):                    # what a client must send
    name: str
    price: int

@app.post("/products", status_code=201)
def create_product(p: ProductIn):
    pid = len(products) + 1
    products[pid] = {"id": pid, **p.model_dump()}
    return products[pid]

@app.get("/products/{pid}")
def get_product(pid: int):
    if pid not in products:
        raise HTTPException(status_code=404, detail="product not found")
    return products[pid]

@app.get("/products")
def list_products(max_price: int | None = None, limit: int = 10, offset: int = 0):
    items = [p for p in products.values() if max_price is None or p["price"] <= max_price]
    return {"items": items[offset:offset + limit], "total": len(items)}

@app.delete("/products/{pid}", status_code=204)
def delete_product(pid: int):
    products.pop(pid, None)                    # deleting twice is fine: idempotent

client = TestClient(app)
r = client.post("/products", json={"name": "Rice 5kg", "price": 320})
print(r.status_code, r.json())
client.post("/products", json={"name": "Tea 250g", "price": 120})
print(client.get("/products", params={"max_price": 200}).json())
r = client.get("/products/99")
print(r.status_code, r.json())
r = client.post("/products", json={"name": "Dal"})          # price is missing
print(r.status_code, r.json()["detail"][0]["msg"])
print(client.delete("/products/1").status_code, client.get("/products/1").status_code)
```

```output
201 {'id': 1, 'name': 'Rice 5kg', 'price': 320}
{'items': [{'id': 2, 'name': 'Tea 250g', 'price': 120}], 'total': 1}
404 {'detail': 'product not found'}
422 Field required
204 404
```

> **Same thing in ASP.NET Core** (minimal API):
>
> ```csharp
> var products = new Dictionary<int, Product>();
> app.MapPost("/products", (ProductIn p) => {
>     var id = products.Count + 1;
>     products[id] = new Product(id, p.Name, p.Price);
>     return Results.Created($"/products/{id}", products[id]);
> });
> app.MapGet("/products/{id:int}", (int id) =>
>     products.TryGetValue(id, out var p) ? Results.Ok(p) : Results.NotFound());
> ```

## Time and space

API design is about clarity, not Big O. But: always **paginate** list endpoints (never return 1 million rows), and keep each request's work bounded.

## Common mistakes

- Verbs in URLs (`/createOrder`) and singular/plural mixed.
- Returning `200` with `{"error": ...}` in the body. Use the right status code.
- Mixing up 401 (not logged in) and 403 (logged in, not allowed).
- Changing data on `GET`.
- No pagination on list endpoints.
- Leaking internal errors (stack traces) in 500 responses.

## Patterns that use it

The kirana billing API and URL shortener projects, every system design answer ("API: POST /urls → 201 {short}"), and the AI-backed API in the AI section.

## Practice

```practice
Design the REST API for a library: books, members, loans. Write the method, path and status code for 8 actions.
Extend the products API above with PATCH /products/{id} that changes only the price.
Add pagination with limit and offset to a list endpoint and test page 2.
Decide the status code: duplicate email on sign-up; wrong password; deleting someone else's order; server database down.
```

## Explain it back

```explain
What makes a method idempotent? Which methods are?
Explain 401 vs 403 vs 404 with a real example.
Why should list endpoints be paginated?
Why do payment APIs use an idempotency key?
```

## Flashcards

```flashcards
GET, POST, PUT, PATCH, DELETE? :: Read, create, replace, partly update, remove.
Idempotent methods? :: GET, PUT, DELETE (calling twice = once).
201 vs 204? :: 201 Created (new resource), 204 No Content (success, empty body).
401 vs 403? :: 401: who are you? 403: I know you, but you may not.
422 in FastAPI? :: Valid JSON, but fields fail validation.
4xx vs 5xx? :: 4xx: the client's mistake. 5xx: the server's.
```
