---
id: g-scheduling
title: CPU scheduling
level: core
phase: 3
week: 28
tags: [cs, os, scheduling]
estMinutes: 25
---

## What it is

A computer runs hundreds of processes but has only a few CPU cores. The **scheduler** (part of the OS) decides which process runs next and for how long.
Different rules (algorithms) trade off **fairness**, **response time** and **throughput**.
Classic ones: first come first served, shortest job first, round robin, and priority scheduling.

## Real-life example

A single ticket counter at a railway station. If someone with a group booking of 50 tickets is served first (first come first served), everyone behind them waits long. Serving quick requests first (shortest job first) lowers the average wait. Giving each person 2 minutes, then sending them to the back of the line (round robin) is fair to everyone.

## Picture

```text
 jobs: P1 needs 24 ms, P2 needs 3 ms, P3 needs 3 ms (all arrive at time 0)

 FCFS:        |P1........................|P2.|P3.|       waits 0, 24, 27  → avg 17
 SJF:         |P2.|P3.|P1........................|       waits 6, 0, 3    → avg 3
 Round robin  |P1..|P2.|P3.|P1....................|     waits 6, 4, 7    → avg 5.67
 (slice 4 ms)
```

## How it works inside

- A process is **running**, **ready** (waiting for a CPU) or **blocked** (waiting for I/O). The scheduler picks among the ready ones.
- **FCFS** (first come, first served): simple, but short jobs get stuck behind long ones (the "convoy effect").
- **SJF** (shortest job first): best average waiting time, but you must guess job lengths, and long jobs can starve.
- **Round robin**: each job gets a **time slice** (quantum); unfinished jobs go to the back. Fair and responsive. Slices too small → too much switching overhead; too big → behaves like FCFS.
- **Priority** scheduling: important jobs first. Risk: **starvation** of low priority jobs; fix with **aging** (priority rises while waiting).
- **Preemptive** schedulers can stop a running job (a timer interrupt); non-preemptive ones wait until it gives up the CPU.
- Real OSes mix these: Linux's scheduler (CFS/EEVDF) gives each runnable task a fair share of CPU time, weighted by priority ("nice" values).
- The same ideas appear in backend work: request queues, thread pools, job queues, and LeetCode's Task Scheduler problem.

## Python, step by step

Simulate the three classic schedulers and compare average waiting time:

```python
from collections import deque

jobs = {"P1": 24, "P2": 3, "P3": 3}          # name -> CPU time needed (all arrive at 0)

def fcfs(order):
    t, waits = 0, {}
    for name in order:
        waits[name] = t                       # waited until now
        t += jobs[name]
    return waits

def sjf():
    return fcfs(sorted(jobs, key=jobs.get))   # shortest first (ties keep their order)

def round_robin(quantum):
    remaining, last_run = dict(jobs), {n: 0 for n in jobs}
    waits = {n: 0 for n in jobs}
    queue, t = deque(jobs), 0
    while queue:
        name = queue.popleft()
        waits[name] += t - last_run[name]     # time spent waiting in the queue
        run = min(quantum, remaining[name])
        t += run
        remaining[name] -= run
        last_run[name] = t
        if remaining[name]:
            queue.append(name)                # not done: back of the line
    return waits

for label, waits in [("FCFS", fcfs(list(jobs))), ("SJF", sjf()), ("RR q=4", round_robin(4))]:
    print(f"{label:7} waits={waits} average={round(sum(waits.values()) / len(waits), 2)}")
```

```output
FCFS    waits={'P1': 0, 'P2': 24, 'P3': 27} average=17.0
SJF     waits={'P2': 0, 'P3': 3, 'P1': 6} average=3.0
RR q=4  waits={'P1': 6, 'P2': 4, 'P3': 7} average=5.67
```

## Time and space

| Algorithm | Picking the next job | Notes |
| --- | --- | --- |
| FCFS | O(1) (a queue) | convoy effect |
| SJF | O(log n) (a heap by length) | needs length estimates; starvation |
| Round robin | O(1) (a queue) | fair; overhead from switching |
| Priority | O(log n) (a heap) | add aging to avoid starvation |

## Common mistakes

- Thinking "fair" and "fastest on average" are the same goal.
- Forgetting starvation in priority or SJF scheduling.
- Choosing a tiny time slice: the CPU spends its time switching instead of working.

## Patterns that use it

Heaps (priority queues), queues (round robin), greedy (SJF), LeetCode Task Scheduler and Single-Threaded CPU, and backend thread pools and job queues.

## Practice

```practice
Add arrival times to the simulation (jobs do not all arrive at 0) and recompute FCFS and SJF.
Change the round robin quantum to 1, 4 and 30. What happens to the average wait and the number of switches?
task-scheduler
process-tasks-using-servers
```

## Explain it back

```explain
Why does SJF give the lowest average waiting time?
What is the convoy effect in FCFS?
How does round robin trade fairness against switching overhead?
What is starvation, and how does aging fix it?
```

## Flashcards

```flashcards
Scheduler's job? :: Choose which ready process runs next on a CPU, and for how long.
FCFS weakness? :: Convoy effect: short jobs wait behind long ones.
Best average wait (if lengths known)? :: Shortest job first.
Round robin? :: Each job gets a time slice, then goes to the back of the queue.
Starvation fix? :: Aging: priority grows while a job waits.
Preemptive scheduling? :: The OS can stop a running job (timer interrupt).
```
