---
id: c-monotonic
title: Monotonic stack and queue
level: core
phase: 2
week: 12
tags: [dsa, stack, monotonic, deque]
estMinutes: 25
---

## What it is

A **monotonic** stack (or queue) keeps its items **always in order**: always going down, or always going up.
When a new item would break the order, you pop items first. Those pops answer questions like "what is the next bigger number?".
Every item is pushed once and popped at most once, so the whole thing is O(n).

## Real-life example

People standing in a line, all facing right, looking for the first taller person ahead of them.
Walk from left to right. When a tall person arrives, everyone shorter who is still waiting has found their answer: this new person. They leave the waiting line. The waiting line is always "tallest at the back, shortest at the front"... a monotonic stack.

## Picture

```text
heights:   2   1   5   6   2   3
waiting stack (heights going UP from bottom to top), for "next smaller":

  read 2 → [2]
  read 1 → 1 is smaller: pop 2 (its next smaller is 1) → [1]
  read 5 → [1, 5]
  read 6 → [1, 5, 6]
  read 2 → pop 6, pop 5 (both found their next smaller: 2) → [1, 2]
  read 3 → [1, 2, 3]
```

## How it works inside

- Decide what the stack keeps: **indexes** (so you can measure distances and widths) or **(value, extra)** pairs.
- Decide the order:
  - "Next **greater**" → keep a **decreasing** stack; a bigger item pops the smaller ones.
  - "Next **smaller**" → keep an **increasing** stack; a smaller item pops the bigger ones.
- Each pop gives one answer. Items still on the stack at the end have no answer (often −1 or 0).
- **Amortized O(n)**: there is a `while` inside the `for`, but each item can be popped only once in total.
- **Monotonic queue** (a deque) adds one thing: it also removes items from the **front** when they leave a sliding window. The front is always the max (or min) of the window.

## Python, step by step

Stock span: how many days in a row (ending today) was the price ≤ today's price?

```python
def stock_span(prices):
    spans, stack = [], []                    # stack holds (price, span); prices decreasing
    for p in prices:
        span = 1
        while stack and stack[-1][0] <= p:
            span += stack.pop()[1]           # absorb the smaller days before me
        stack.append((p, span))
        spans.append(span)
    return spans

print(stock_span([100, 80, 60, 70, 60, 75, 85]))
```

```output
[1, 1, 1, 2, 1, 4, 6]
```

Largest rectangle in a histogram (a classic hard problem, O(n)):

```python
def largest_rectangle(heights):
    stack = []                               # (start index, height); heights increasing
    best = 0
    for i, h in enumerate(heights + [0]):    # a final 0 pops everything that is left
        start = i
        while stack and stack[-1][1] >= h:
            s, height = stack.pop()
            best = max(best, height * (i - s))   # that bar could stretch from s to i - 1
            start = s                        # the new bar can stretch back to s
        stack.append((start, h))
    return best

print(largest_rectangle([2, 1, 5, 6, 2, 3]))
```

```output
10
```

Next warmer day (store indexes to get distances):

```python
def days_until_warmer(temps):
    answer = [0] * len(temps)
    stack = []                               # indexes of days still waiting
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            answer[j] = i - j                # day j waited i - j days
        stack.append(i)
    return answer

print(days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73]))
```

```output
[1, 1, 4, 2, 1, 1, 0, 0]
```

## Time and space

| Operation | Time | Space |
| --- | --- | --- |
| Next greater / smaller for all items | O(n) total | O(n) |
| Largest rectangle | O(n) | O(n) |
| Sliding window max (monotonic deque) | O(n) | O(k) |

## Common mistakes

- Storing values when you need distances or widths. Store indexes.
- Choosing the wrong order (increasing vs decreasing). Ask: "who pops whom?"
- `<` vs `<=` with equal values. Test with duplicates like `[2, 2, 2]`.
- Forgetting the items left on the stack at the end (a sentinel like the final `0` above helps).

## Patterns that use it

**Monotonic stack** (daily temperatures, car fleet, histogram), **monotonic queue** (sliding window maximum), and some **greedy** string problems (remove k digits).

## Practice

```practice
next-greater-element-i
daily-temperatures
online-stock-span
car-fleet
largest-rectangle-in-histogram
sliding-window-maximum
```

## Explain it back

```explain
Why is a for loop with a while loop inside still O(n) here?
For "next greater element", should the stack be increasing or decreasing? Why?
Why do we store indexes instead of values in Daily Temperatures?
```

## Flashcards

```flashcards
What is a monotonic stack? :: A stack whose items stay in increasing (or decreasing) order.
Next greater element: which stack? :: A decreasing stack; a bigger item pops the smaller ones.
Why O(n) overall? :: Each item is pushed once and popped at most once.
What do you usually store? :: Indexes, so you can compute distances and widths.
Monotonic queue is used for? :: Max or min of every sliding window.
```
