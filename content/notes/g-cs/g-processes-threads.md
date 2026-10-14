---
id: g-processes-threads
title: Processes and threads
level: core
phase: 3
week: 27
tags: [cs, os, processes, threads, concurrency]
estMinutes: 30
---

## What it is

A **process** is a running program with its **own memory**. Opening Chrome and VS Code gives two processes.
A **thread** is a path of execution **inside** a process. All threads of a process **share** its memory.
Threads are cheap and share data easily (but must be careful). Processes are isolated (safer, but sharing data is harder).

## Real-life example

A restaurant building (process) has its own kitchen, store room and money box (memory). The cooks inside (threads) share the same kitchen and store room: fast teamwork, but two cooks can grab the same pan. A second restaurant across the road (another process) has its own kitchen; to share anything, they must send someone with a message.

## Picture

```text
 process A (memory: code, heap, globals)        process B (its own memory)
 ┌──────────────────────────────────────┐       ┌───────────────────────┐
 │ thread 1  [stack]  ┐                  │       │ thread 1  [stack]      │
 │ thread 2  [stack]  ├─ share the heap  │  ←──→ │                        │
 │ thread 3  [stack]  ┘                  │  IPC  └───────────────────────┘
 └──────────────────────────────────────┘ (pipes, sockets, queues)
```

## How it works inside

- The **operating system** (OS) gives each process its own **virtual memory**, open files and an id (PID). One process cannot read another's memory.
- Each **thread** has its own **stack** (local variables, call stack) and registers, but shares the heap and globals with the other threads of its process.
- **Context switch**: the CPU core stops one thread and runs another, saving and loading registers. Switching between threads of one process is cheaper than between processes.
- **Concurrency** = many tasks in progress, taking turns. **Parallelism** = tasks running at the same instant on different cores.
- **Python's GIL**: in the normal CPython build, only one thread runs Python code at a time. So threads help with **I/O-bound** work (waiting for network, disk, database) but not CPU-heavy work. For CPU work use **multiple processes** (`multiprocessing`) or native libraries. (Python 3.13+ also offers an optional "free-threaded" build without the GIL.)
- **async/await** (asyncio) is a third way: one thread switching between many waiting tasks. Great for many network calls (FastAPI uses it).
- A web server usually runs **several worker processes**, each with threads or an event loop.

## Python, step by step

Threads share memory, processes do not:

```python
import multiprocessing as mp
import threading

items = []

def add_item():
    items.append("dosa")

if __name__ == "__main__":                 # needed when starting processes
    t = threading.Thread(target=add_item)
    t.start()
    t.join()
    print("after thread:", items)          # the thread changed OUR list

    p = mp.Process(target=add_item)
    p.start()
    p.join()
    print("after process:", items)         # the child changed its OWN copy
```

```output
after thread: ['dosa']
after process: ['dosa']
```

Threads speed up waiting (I/O-bound) work:

```python
import threading
import time

def fetch(i, results):
    time.sleep(0.2)                         # pretend: waiting for a network reply
    results[i] = f"page {i}"

results = {}
start = time.perf_counter()
threads = [threading.Thread(target=fetch, args=(i, results)) for i in range(5)]
for t in threads:
    t.start()
for t in threads:
    t.join()
elapsed = time.perf_counter() - start
print(len(results), "pages; faster than 5 x 0.2 s one after another:", elapsed < 0.5)
```

```output
5 pages; faster than 5 x 0.2 s one after another: True
```

The same waiting with `asyncio` (one thread, many tasks):

```python
import asyncio

async def fetch(i):
    await asyncio.sleep(0.2)                # while one task waits, others run
    return f"page {i}"

async def main():
    pages = await asyncio.gather(*(fetch(i) for i in range(5)))
    print(pages)

asyncio.run(main())
```

```output
['page 0', 'page 1', 'page 2', 'page 3', 'page 4']
```

## Time and space

| Thing | Rough cost |
| --- | --- |
| Create a thread | ~10–50 microseconds, ~1 MB stack (reserved) |
| Create a process | ~1–10 milliseconds, its own memory |
| Thread context switch | ~1–5 microseconds |
| An asyncio task | very small; thousands are fine |

## Common mistakes

- Using threads for CPU-heavy Python code and expecting a speed-up (the GIL).
- Sharing data between threads without a lock (race conditions: see Concurrency).
- Expecting a child process to change the parent's variables.
- Calling blocking code (like `time.sleep` or a slow library) inside `async` functions: it blocks the whole event loop.

## Patterns that use it

Web servers (worker processes + threads/async), background workers, parallel data processing, and OS interview questions ("process vs thread?").

## Practice

```practice
Write a script that downloads 10 pages with threads and with asyncio; compare times (use time.sleep / asyncio.sleep to fake the network).
Write a CPU-heavy function (sum of squares to 10 million). Run it 4 times with threads, then with multiprocessing. Compare.
Explain to a friend the difference between concurrency and parallelism, using a kitchen.
```

## Explain it back

```explain
What is the difference between a process and a thread?
What do threads share, and what does each thread have of its own?
Why do threads help I/O-bound Python code but not CPU-bound code?
What is a context switch?
```

## Flashcards

```flashcards
Process vs thread? :: A process has its own memory; threads inside a process share it.
What does each thread have of its own? :: Its stack and registers.
Concurrency vs parallelism? :: Taking turns vs truly at the same time on different cores.
Python's GIL effect? :: One thread runs Python code at a time: threads help I/O, not CPU work.
CPU-heavy work in Python? :: multiprocessing (several processes) or native libraries.
asyncio? :: One thread switching between many waiting tasks.
```
