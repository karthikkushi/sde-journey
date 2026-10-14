---
id: f-orm
title: Databases in apps (ORM vs raw SQL)
level: core
phase: 3
week: 29
tags: [backend, database, orm, sqlalchemy, sql]
estMinutes: 35
---

## What it is

Your app talks to the database either with **raw SQL** strings or through an **ORM** (object-relational mapper), which maps tables to classes and rows to objects.
Python's main ORM is **SQLAlchemy**; C#'s is **Entity Framework Core**.
Either way you must use **parameters** (never paste user input into SQL) and watch out for the **N+1 query** problem.

## Real-life example

A raw SQL query is like writing your own order slip in the shop's exact format. An ORM is like telling the shop assistant "get me Ravi's orders": convenient, but you should still know what they write on the slip, or you may end up with 50 slips when 1 would do.

## Picture

```text
 Python object                 ORM                 SQL sent to the database
 Customer(name="Ravi")  ── session.add() ──▶   INSERT INTO customers (name) VALUES (?)
 customer.orders        ── lazy load ──────▶   SELECT * FROM orders WHERE customer_id = ?

 N+1 problem:
   1 query for 100 customers  +  100 queries (one per customer's orders)  = 101 queries
 fix: load the orders for all of them in 1 extra query  → 2 queries
```

## How it works inside

- **Engine**: knows how to connect (a URL like `postgresql://...` or `sqlite://`) and keeps a **connection pool** (reusing connections is much faster than opening new ones).
- **Session** (SQLAlchemy) / **DbContext** (EF Core): a unit of work. You add/change objects, then `commit()` writes them in one transaction.
- **Models**: classes with typed columns and **relationships** (`customer.orders`).
- **Lazy loading**: related rows are fetched the first time you touch them. Convenient, but in a loop it causes **N+1 queries**. Fix with eager loading (`selectinload`, EF's `Include`).
- **Raw SQL** is still useful for complex reports. Always pass values as **parameters** (`:max_price`), never with f-strings: that prevents SQL injection.
- **Migrations** (Alembic for SQLAlchemy, EF Core migrations) change the schema step by step, in version control.

**ORM or raw SQL?** ORM for everyday CRUD and safety; raw SQL (or the ORM's query builder) for heavy reports and performance-critical queries. Either way, read the SQL it runs (turn on logging).

## Python, step by step

Models, inserts, the N+1 problem, and its fix (SQLAlchemy 2.0, in-memory SQLite):

```python
from sqlalchemy import ForeignKey, create_engine, event, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, selectinload

class Base(DeclarativeBase):
    pass

class Customer(Base):
    __tablename__ = "customers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    orders: Mapped[list["Order"]] = relationship(back_populates="customer")

class Order(Base):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    total: Mapped[int]
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    customer: Mapped[Customer] = relationship(back_populates="orders")

engine = create_engine("sqlite://")                 # an in-memory database
Base.metadata.create_all(engine)                    # CREATE TABLE ... for every model

queries = []                                        # count every SQL statement sent
event.listen(engine, "before_cursor_execute", lambda *args: queries.append(args[2]))

with Session(engine) as s:
    for name, totals in [("Ravi", [640, 280]), ("Asha", [360]), ("John", [910])]:
        s.add(Customer(name=name, orders=[Order(total=t) for t in totals]))
    s.commit()                                      # one transaction for all inserts

with Session(engine) as s:
    queries.clear()
    for c in s.scalars(select(Customer).order_by(Customer.id)):
        print(c.name, sum(o.total for o in c.orders))      # touching c.orders runs a query EACH time
    print("queries (N+1):", len(queries))

with Session(engine) as s:
    queries.clear()
    stmt = select(Customer).options(selectinload(Customer.orders)).order_by(Customer.id)
    totals = {c.name: sum(o.total for o in c.orders) for c in s.scalars(stmt)}
    print(totals, "queries:", len(queries))
```

```output
Ravi 920
Asha 360
John 910
queries (N+1): 4
{'Ravi': 920, 'Asha': 360, 'John': 910} queries: 2
```

Raw SQL with parameters (safe from injection):

```python
from sqlalchemy import create_engine, text

engine = create_engine("sqlite://")
with engine.begin() as conn:                        # begin = a transaction, committed at the end
    conn.execute(text("CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price INTEGER)"))
    conn.execute(text("INSERT INTO products (name, price) VALUES (:n, :p)"),
                 [{"n": "Rice 5kg", "p": 320}, {"n": "Tea 250g", "p": 120}])
    rows = conn.execute(text("SELECT name, price FROM products WHERE price < :max"), {"max": 200}).all()
print(rows)
```

```output
[('Tea 250g', 120)]
```

> **Same thing in ASP.NET Core (EF Core)**:
>
> ```csharp
> // N+1 fix: Include loads the orders together with the customers
> var totals = await db.Customers
>     .Include(c => c.Orders)
>     .Select(c => new { c.Name, Total = c.Orders.Sum(o => o.Total) })
>     .ToListAsync();
> // raw SQL with parameters
> var cheap = await db.Products.FromSqlInterpolated($"SELECT * FROM products WHERE price < {max}").ToListAsync();
> ```

## Time and space

| Situation | Queries |
| --- | --- |
| N customers, lazy-load orders in a loop | 1 + N |
| Same with `selectinload` / `Include` | 2 |
| Same with a JOIN | 1 (but repeats customer columns per order) |
| New connection per request (no pool) | adds a TCP + auth handshake each time |

## Common mistakes

- Building SQL with f-strings and user input (SQL injection).
- N+1 queries hidden inside loops or templates.
- Forgetting `commit()`, or keeping a session open across many requests.
- Loading whole tables into Python to filter them. Filter in SQL.
- Changing the schema by hand on the server instead of with migrations.

## Patterns that use it

The kirana billing API (Phase 3 project), any CRUD backend, and performance work ("the endpoint makes 300 queries").

## Practice

```practice
Add a Product model and an OrderItem model to the example, then compute each order's total with one query.
Turn on SQL logging (create_engine(..., echo=True)) and count the queries of one of your endpoints.
Write the same report twice: once with the ORM, once with raw SQL using text(). Compare the SQL.
Set up Alembic in a small FastAPI project and create your first migration.
```

## Explain it back

```explain
What is an ORM, and what does it do for you?
Explain the N+1 query problem and two ways to fix it.
Why must values be passed as parameters, not pasted into SQL?
When would you choose raw SQL over the ORM?
```

## Flashcards

```flashcards
ORM? :: Maps tables to classes and rows to objects (SQLAlchemy, EF Core).
N+1 problem? :: 1 query for the list + 1 per item for related data.
Fix N+1 in SQLAlchemy? :: options(selectinload(...)) or a join.
Fix N+1 in EF Core? :: .Include(...)
Safe raw SQL? :: Parameters like :name, never f-strings with user input.
Schema changes? :: Migrations (Alembic, EF Core migrations), kept in Git.
```
