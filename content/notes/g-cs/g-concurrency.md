---
id: g-concurrency
title: Concurrency, locks and deadlocks
level: core
phase: 3
week: 30
tags: [cs, os, concurrency, locks, deadlock]
estMinutes: 35
---

## What it is

When two threads read and change the **same data** at the same time, the result can depend on timing: a **race condition**.
A **lock** (mutex) lets only one thread at a time into the code that touches the shared data (the **critical section**).
Locks bring a new danger: **deadlock**, where threads wait for each other forever.

## Real-life example

A joint bank account with ₹100. Ravi (at an ATM) and Asha (on UPI) both check the balance (₹100) at the same moment. Ravi takes ₹30, the system writes ₹70. Asha takes ₹50, the system writes ₹50 (from her old reading). ₹80 left the account, but the balance says ₹50. One update was lost. A lock makes the second person wait until the first one finishes.

## Picture

```text
 lost update (no lock)                       deadlock
 thread A          thread B                   A holds RICE, wants DAL ──┐
 read 100                                                              │ waits
                   read 100                   B holds DAL, wants RICE ──┘ forever
 write 100-30=70
                   write 100-50=50  ✗        fix: everyone takes locks in the SAME order
```

## How it works inside

- **Race condition**: the outcome depends on the order threads run in. Even `count += 1` is three steps (read, add, write), so it can interleave badly.
- **Mutex / lock**: `with lock:` lets one thread in; others wait. Keep critical sections **short**.
- **Atomic operations**: some updates are done as one indivisible step by the hardware or the database (`UPDATE stock SET qty = qty - 1`).
- **Semaphore**: a counter that lets up to N threads in (for example, at most 5 database connections).
- **Deadlock** needs four conditions together (Coffman conditions): mutual exclusion, **hold and wait**, no preemption, and **circular wait**. Break any one to prevent it:
  - Take locks in a **fixed global order** (breaks circular wait). The most common fix.
  - Use a **timeout** when acquiring, and back off.
  - Take all needed locks at once, or use fewer locks.
- **Livelock**: threads keep reacting to each other and make no progress. **Starvation**: one thread never gets the lock.
- The same problems exist in **databases** (two transactions updating the same rows) and in **distributed systems** (two servers updating the same record). Fixes there: row locks, `SELECT ... FOR UPDATE`, optimistic locking with a version number, or a single writer.

## Python, step by step

A lost update, shown step by step (generators let us control the order exactly):

```python
balance = 100

def withdraw(amount, log):
    global balance
    seen = balance                # step 1: read
    yield                         # ... the other thread runs here ...
    balance = seen - amount       # step 2: write, based on an OLD read
    log.append(f"wrote {balance}")

log = []
ravi, asha = withdraw(30, log), withdraw(50, log)
next(ravi)                        # Ravi reads 100
next(asha)                        # Asha reads 100
next(ravi, None)                  # Ravi writes 70
next(asha, None)                  # Asha writes 50: Ravi's update is lost
print(balance, log)               # should be 20
```

```output
50 ['wrote 70', 'wrote 50']
```

The fix: a lock around the read-and-write (real threads):

```python
import threading

balance = 0
lock = threading.Lock()

def deposit_many(n):
    global balance
    for _ in range(n):
        with lock:                    # only one thread inside at a time
            balance += 1

threads = [threading.Thread(target=deposit_many, args=(100_000,)) for _ in range(4)]
for t in threads:
    t.start()
for t in threads:
    t.join()
print(balance)
```

```output
400000
```

A deadlock (with a timeout so the example does not hang), and the fix (same lock order):

```python
import threading

rice, dal = threading.Lock(), threading.Lock()

def run_two(order_a, order_b, use_barriers):
    results = {}
    holding = threading.Barrier(2) if use_barriers else None
    tried = threading.Barrier(2) if use_barriers else None

    def cook(name, first, second):
        with first:
            if holding:
                holding.wait()                       # both now hold their first lock
            got = second.acquire(timeout=0.2)        # wait for the second lock, but not forever
            results[name] = "got both" if got else "gave up: would deadlock"
            if got:
                second.release()
            if tried:
                tried.wait()                         # nobody lets go until both have tried

    a = threading.Thread(target=cook, args=("A", *order_a))
    b = threading.Thread(target=cook, args=("B", *order_b))
    a.start()
    b.start()
    a.join()
    b.join()
    return dict(sorted(results.items()))

print(run_two((rice, dal), (dal, rice), use_barriers=True))     # opposite orders: circular wait
print(run_two((rice, dal), (rice, dal), use_barriers=False))    # same order: no deadlock
```

```output
{'A': 'gave up: would deadlock', 'B': 'gave up: would deadlock'}
{'A': 'got both', 'B': 'got both'}
```

## Time and space

| Tool | Cost |
| --- | --- |
| Uncontended lock | ~tens of nanoseconds |
| Contended lock | threads wait: throughput drops |
| Big critical sections | turn parallel code into one-at-a-time code |

## Common mistakes

- Assuming `x += 1` is safe across threads.
- Holding a lock while doing slow work (network calls, disk).
- Taking locks in different orders in different places (deadlock).
- Forgetting that two **servers** can race too: a Python lock only protects one process.
- Read-then-write in the database without a lock or an atomic `UPDATE ... SET qty = qty - 1`.

## Patterns that use it

Thread pools and caches in backends, database isolation levels and optimistic locking, distributed locks (Redis), LRU caches shared by threads, and classic interview questions (producer-consumer, dining philosophers).

## Practice

```practice
Remove the lock from the deposit example and run it a few times. Do you always get 400000? (It may still work by luck: races are sneaky.)
Write a producer-consumer with queue.Queue (it has locks built in).
Find every read-then-write in your billing API and make it atomic in SQL or protect it with a version column.
Read OSTEP chapters 28–32 (locks, condition variables, deadlocks).
```

## Explain it back

```explain
Explain a lost update with the joint bank account example.
What is a critical section, and how does a lock protect it?
Name the four conditions for deadlock and one way to break each.
Why does a Python lock not protect data shared by two servers?
```

## Flashcards

```flashcards
Race condition? :: The result depends on the timing of threads.
Why is x += 1 unsafe? :: It is read, add, write: other threads can interleave.
Mutex? :: A lock that lets one thread at a time into a critical section.
Most common deadlock fix? :: Take locks in one fixed global order.
Four deadlock conditions? :: Mutual exclusion, hold and wait, no preemption, circular wait.
Atomic SQL update? :: UPDATE stock SET qty = qty - 1 WHERE id = ?
```
