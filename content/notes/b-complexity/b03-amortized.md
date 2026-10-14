---
id: b03-amortized
title: Amortized cost (why append is O(1))
level: core
phase: 1
week: 6
tags: [complexity, amortized, lists]
estMinutes: 20
---

## What it is

**Amortized** cost is the average cost per operation over a **long run** of operations.
A few operations can be slow, if they are rare enough that the total stays small.
`list.append` is the classic example: sometimes it copies the whole list, but on average it is still O(1).

## Real-life example

A family's water tank. Most days you just pour water in: cheap.
When the tank is full, you buy a tank **twice as big** and pour all the old water into it. That day is expensive.
But because the tank doubles each time, the expensive days get rarer and rarer. Spread over all the water ever added, the cost per litre stays small and steady.

## Picture

```text
append #:   1   2   3   4   5   6   7   8   9  ...  17
cost:       1   2   3   1   5   1   1   1   9  ...  17
                ↑   ↑       ↑               ↑        ↑
          copies happen only when the room runs out (1, 2, 4, 8, 16 items)

total for 16 appends = 16 (placing) + 15 (copying) = 31  → about 2 per append
```

## How it works inside

- A Python list keeps **spare room** (see Lists). Append puts the item in the spare room: 1 step.
- When the room is full, the list moves to a bigger block and **copies** every item: n steps.
- If the room grows by a **fixed multiple** (×2 in this note's model; CPython uses about ×1.125 plus a bit), copies happen at sizes 1, 2, 4, 8, 16...
- Total copies for n appends ≤ 1 + 2 + 4 + ... + n < 2n. Add n for placing items: < 3n steps for n appends. That is **O(1) per append, amortized**.
- If the room grew by a fixed **amount** instead (say +10 each time), copies would happen every 10 appends, and the total would be O(n²). The multiplying is what makes it work.
- **Amortized vs average**: average case depends on which inputs are "typical". Amortized is a **guarantee** about any sequence of operations, even the worst one.

## Python, step by step

Simulate a list that doubles its room. Count every copy:

```python
def append_cost(n):
    capacity, size, copies = 1, 0, 0
    for _ in range(n):
        if size == capacity:        # full: get double the room and copy everything
            copies += size
            capacity *= 2
        size += 1                   # place the new item: 1 step
    return copies

for n in [8, 1000, 1_000_000]:
    c = append_cost(n)
    print(n, "appends,", c, "copies,", round((n + c) / n, 2), "steps per append")
```

```output
8 appends, 7 copies, 1.88 steps per append
1000 appends, 1023 copies, 2.02 steps per append
1000000 appends, 1048575 copies, 2.05 steps per append
```

The steps per append stay near 2, even for a million items. That is O(1) amortized.

A queue made from two stacks (LeetCode 232). One `pop` can move many items, but **each item moves only once**:

```python
class TwoStackQueue:
    def __init__(self):
        self.inbox, self.outbox = [], []
        self.moves = 0

    def push(self, x):
        self.inbox.append(x)

    def pop(self):
        if not self.outbox:               # only when outbox is empty...
            while self.inbox:             # ...move everything (this reverses the order)
                self.outbox.append(self.inbox.pop())
                self.moves += 1
        return self.outbox.pop()

q = TwoStackQueue()
for x in range(1, 7):
    q.push(x)
print([q.pop() for _ in range(6)], "moves:", q.moves)
```

```output
[1, 2, 3, 4, 5, 6] moves: 6
```

6 items, 6 moves in total: O(1) per operation, amortized.

## Time and space

| Operation | Single worst case | Amortized |
| --- | --- | --- |
| `list.append` | O(n) (a resize) | O(1) |
| `dict[key] = value` | O(n) (a resize) | O(1) average |
| Two-stack queue `pop` | O(n) | O(1) |

## Common mistakes

- Saying "append is O(n)" because one append can copy everything. Say: "O(1) amortized".
- Saying "append is always O(1)". One append can be O(n). In real-time systems that rare pause can matter.
- Confusing amortized with average case.
- Building a list by `new = old + [x]` in a loop. That copies every time: O(n²) total. Use `append`.

## Patterns that use it

- **Monotonic stack**: each item is pushed once and popped at most once, so the whole loop is O(n) even though there is a `while` inside the `for`.
- **Sliding window**: each item enters and leaves the window once: O(n) total.
- **Union-find** with path compression: almost O(1) per operation, amortized.

## Practice

```practice
Change append_cost to grow by +10 instead of ×2. Print the copies for n = 1000 and n = 10000. What shape is the growth?
Explain why a for loop with a while loop inside can still be O(n) (hint: count how many times each item is popped).
implement-queue-using-stacks
min-stack
design-hashset
concatenation-of-array
```

## Explain it back

```explain
Explain amortized cost with the water tank example.
Why must the list grow by a multiple (like ×2) and not by a fixed amount?
How is amortized cost different from average case?
```

## Flashcards

```flashcards
What is amortized cost? :: The average cost per operation over a long sequence, even in the worst case.
Why is list append O(1) amortized? :: Resizes copy everything, but the room multiplies, so copies total less than 2n.
Total steps for n appends with doubling? :: Less than 3n.
What if the list grew by +10 each time? :: Total cost would be O(n²).
Two-stack queue pop: single worst case and amortized? :: O(n) worst for one pop, O(1) amortized.
```
