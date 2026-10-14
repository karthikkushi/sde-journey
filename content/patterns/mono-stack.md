---
id: mono-stack
name: Monotonic stack
group: Stacks and queues
---

## Clues

```clues
Next greater or next smaller element
How many days until a warmer day
Largest rectangle in a histogram
Stock span (how many days back was the price lower)
Remove digits to make the smallest number
```

## Idea

Keep a stack whose values are always in order (for example, decreasing). When a new item breaks the order, **pop** items: for each popped item, the new item is its "next greater". Every item is pushed once and popped once: O(n), even with a `while` inside the `for`.

## Template

```python
def next_greater(nums):
    answer = [-1] * len(nums)
    stack = []                              # indexes still waiting for a greater number
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            answer[stack.pop()] = x         # x is the next greater for that index
        stack.append(i)
    return answer

print(next_greater([2, 1, 2, 4, 3]))
```

```output
[4, 2, 4, -1, -1]
```

## Walkthrough: Daily Temperatures

1. Walk the days. The stack holds days still waiting for a warmer day (temperatures decreasing).
2. A warmer day pops every cooler day on the stack. For each, the wait is `today - that_day`.
3. Push today. Days left on the stack at the end wait forever: 0.

## Traps

- Storing values when you need distances. Store **indexes**.
- Using `<=` vs `<` wrongly with equal values.
- Forgetting to handle items left on the stack at the end.
