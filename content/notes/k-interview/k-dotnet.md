---
id: k-dotnet
title: .NET interview sheet
level: core
phase: 5
week: 44
tags: [interview, dotnet, csharp, career]
estMinutes: 30
---

## What it is

Your resume leads with production C#/.NET work, so interviewers will ask .NET internals.
This sheet covers the usual questions: **async/await and the thread pool**, **garbage collection**, **dependency injection lifetimes**, the **middleware pipeline**, **EF Core** (change tracking, N+1), **hosted background services**, and **LINQ deferred execution**.
Answer each in 2–3 sentences, then give one example from your own work.

## Real-life example

A cricketer who has played county cricket for years still gets asked about basic technique in a selection trial. Experience earns you the trial; clear answers about the basics pass it.

## Picture

```text
 HTTP request
     │
     ▼
 middleware: exception handler → HTTPS → routing → auth → your endpoint
     │                                                     │
     │                         DI container gives the endpoint its services:
     │                           Singleton (one for the app)
     │                           Scoped    (one per request)  ← DbContext lives here
     │                           Transient (new every time)
     ▼
 response goes back through the same middleware in reverse order
```

## How it works inside

- **async/await**: `await` frees the thread while waiting for I/O, so the thread pool can serve other requests. It does not make CPU work faster. Avoid `.Result` and `.Wait()` (thread starvation, deadlocks in some contexts). Use `async` all the way, and `ValueTask` only when measured.
- **Garbage collection**: generations 0, 1, 2 (young objects die young, so gen 0 is collected often and cheaply), plus the Large Object Heap for objects of about 85 KB and more. `IDisposable` and `using` release unmanaged resources (connections, files); the GC only frees memory.
- **DI lifetimes**: singleton, scoped, transient. A singleton must never hold a scoped service (a "captive dependency"), for example a singleton that keeps one `DbContext` for every request.
- **Middleware**: each component calls `next()` or short-circuits. Order matters: authentication before authorization, the exception handler first.
- **EF Core**: change tracking records edits and `SaveChanges` writes them. N+1 queries come from loading a list and then lazily touching each item's relation; fix with `Include` or a projection. Use `AsNoTracking` for read-only queries.
- **Background work**: `BackgroundService` / `IHostedService` for long-running loops; create a scope inside to use scoped services.
- **LINQ deferred execution**: a query runs when you enumerate it (`foreach`, `ToList`). Enumerating twice runs it twice; `IQueryable` becomes SQL, `IEnumerable` runs in memory.

## Python, step by step

Python generators are lazy in the same way as LINQ deferred execution. Watch when the work actually happens:

```python
calls = []

def fetch_prices():
    for item, price in [("atta", 52), ("dal", 140), ("oil", 180)]:
        calls.append(item)                   # pretend this is a database read
        yield item, price

expensive = (item for item, price in fetch_prices() if price > 100)   # nothing runs yet
print("before:", calls)
print(list(expensive))
print("after:", calls)
print(list(expensive))                       # a generator is used up: empty now
```

```output
before: []
['dal', 'oil']
after: ['atta', 'dal', 'oil']
[]
```

In C#, a LINQ query is not "used up" like this: enumerating it twice runs it twice, which can mean two database round trips. Call `ToList()` once when you need the results more than once.

## Time and space

| Question | One-line answer |
| --- | --- |
| Does async make code faster? | No, it frees threads while waiting for I/O |
| Why is gen 0 collected often? | Most objects die young, so it is cheap |
| Where does DbContext live? | Scoped, one per request |
| When does a LINQ query run? | When it is enumerated |

## Common mistakes

- `async void` outside event handlers (exceptions crash the process).
- `.Result` on a task inside a request.
- Injecting a scoped service into a singleton.
- Lazy loading inside a loop (N+1 queries).

## Patterns that use it

Machine-coding rounds in C#, the resume deep dive, and any interview at a Microsoft-stack company or GCC.

## Practice

```practice
Explain async/await and the thread pool aloud in under 2 minutes
Find one N+1 query in a .NET codebase you know and describe the fix
Draw the middleware pipeline of an API you built, in order
Answer "singleton vs scoped vs transient" with an example from your work
```

## Explain it back

```explain
Why can .Result on a task cause trouble in a web app?
What is a captive dependency?
Why can enumerating a LINQ query twice be slow?
```

## Flashcards

```flashcards
What does await do with the thread? :: Frees it while waiting for I/O, so the pool can serve other work.
What are the GC generations? :: 0, 1 and 2, plus the Large Object Heap for big objects.
What is a captive dependency? :: A longer-lived service (singleton) holding a shorter-lived one (scoped).
How do you fix an EF Core N+1? :: Include the relation or project the needed fields in one query.
When does a LINQ query execute? :: When it is enumerated, every time it is enumerated.
```
