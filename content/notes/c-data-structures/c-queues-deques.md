---
id: c-queues-deques
title: Queues and deques
level: core
phase: 2
week: 17
tags: [dsa, queue, deque, fifo, bfs]
estMinutes: 20
---

## What it is

A queue is **first in, first out** (FIFO): join at the back, leave from the front.
A **deque** (double-ended queue, say "deck") can add and remove at **both** ends in O(1).
In Python, use `collections.deque` for both. Never use a list's `pop(0)` for a queue.

## Real-life example

The queue at a railway ticket counter. The person who came first is served first.
A deque is like a bus with doors at the front and the back: people can get on or off at either end.

## Picture

```text
            enqueue (append)
                  │
 front ◀─ [ Ravi | Asha | Meena ] ◀─ back
   │
 dequeue (popleft)

 circular buffer (how a fixed-size queue can work inside):
   index:  0     1     2
         [ D ] [ B ] [ C ]      head = 1 → front is "B"; the next slot after 2 wraps to 0
```

## How it works inside

- `deque` is built from linked blocks of memory, so both ends are O(1). Reading the middle (`d[i]`) is O(n).
- A list is a dynamic array: removing from the front shifts everything, so `pop(0)` is O(n).
- A **circular buffer** uses a fixed array and two numbers: where the front is, and how many items there are. The back position "wraps around" with `% capacity`. Many real queues (network buffers, logs) work this way.
- `deque(maxlen=k)` drops the oldest item automatically: perfect for "the last k things".
- Queues are the heart of **BFS**: process things in the order they were found.
- A **priority queue** is different: it serves the smallest (most urgent) first. That is a heap.

## Python, step by step

Count requests in the last 3000 ms (LeetCode "Number of Recent Calls"):

```python
from collections import deque

class RecentCounter:
    def __init__(self):
        self.times = deque()

    def ping(self, t):
        self.times.append(t)                  # newest call joins at the back
        while self.times[0] < t - 3000:       # too old: leave from the front
            self.times.popleft()
        return len(self.times)

rc = RecentCounter()
print([rc.ping(t) for t in [1, 100, 3001, 3002]])
```

```output
[1, 2, 3, 3]
```

A circular queue on a fixed array, to see the inside:

```python
class CircularQueue:
    def __init__(self, k):
        self.data = [None] * k
        self.head = 0                 # index of the front item
        self.count = 0

    def enqueue(self, x):
        if self.count == len(self.data):
            return False              # full
        tail = (self.head + self.count) % len(self.data)    # wrap around the end
        self.data[tail] = x
        self.count += 1
        return True

    def dequeue(self):
        if self.count == 0:
            return None
        x = self.data[self.head]
        self.head = (self.head + 1) % len(self.data)
        self.count -= 1
        return x

q = CircularQueue(3)
print(q.enqueue("A"), q.enqueue("B"), q.enqueue("C"), q.enqueue("D"))
print(q.dequeue(), q.enqueue("D"), q.data)
```

```output
True True True False
A True ['D', 'B', 'C']
```

Both ends, and "the last k":

```python
from collections import deque

d = deque([2, 3])
d.appendleft(1)                   # front
d.append(4)                       # back
print(list(d), d.popleft(), d.pop(), list(d))

last3 = deque(maxlen=3)
for score in [10, 20, 30, 40, 50]:
    last3.append(score)           # the oldest falls off automatically
print(list(last3))
```

```output
[1, 2, 3, 4] 1 4 [2, 3]
[30, 40, 50]
```

## Time and space

| Operation | deque | list |
| --- | --- | --- |
| add at back | O(1) | O(1) amortized |
| remove from front | O(1) | O(n) |
| add at front | O(1) | O(n) |
| read the middle `x[i]` | O(n) | O(1) |

## Common mistakes

- `queue.pop(0)` on a list inside BFS: a big graph becomes O(n²).
- Mixing up `pop()` (back) and `popleft()` (front) on a deque.
- Indexing into a deque in a loop (O(n) each time).
- Using a queue when you need "most urgent first": that is a heap.

## Patterns that use it

**BFS** (tree level order, shortest path on grids, rotting oranges), **monotonic queue** (sliding window maximum), **sliding window** over a time range (recent calls).

## Practice

```practice
number-of-recent-calls
implement-queue-using-stacks
binary-tree-level-order-traversal
rotting-oranges
sliding-window-maximum
open-the-lock
```

## Explain it back

```explain
Why is deque.popleft() O(1) but list.pop(0) O(n)?
How does a circular buffer use % to wrap around?
Why does BFS need a queue and not a stack?
```

## Flashcards

```flashcards
Queue order? :: First in, first out (FIFO).
Python type for a queue? :: collections.deque
Remove from the front of a deque? :: popleft(), O(1)
What does deque(maxlen=3) do? :: Keeps only the newest 3 items.
Circular buffer back position? :: (head + count) % capacity
Queue vs priority queue? :: A queue serves in arrival order; a priority queue serves the smallest first (a heap).
```
