---
id: a24-debugging
title: Debugging with print and a debugger
level: basic
phase: 1
week: 3
tags: [python, debugging, tools]
estMinutes: 15
---

## What it is

Debugging is finding **why** the code does not do what you want.
The goal is to stop guessing: **look** at the real values while the code runs.
Two main tools: `print` (quick) and a **debugger** (pause the code and look around).

## Real-life example

The pressure cooker does not whistle. You do not buy a new cooker. You check step by step: is the lid closed? Is the gasket in place? Is there water? Is the gas on?
One check at a time, until you find the step that is different from what you expected.

## Picture

```text
 1. Reproduce   →  make it fail every time, with a small input
 2. Predict     →  what SHOULD each value be?
 3. Look        →  print / debugger: what IS each value?
 4. Compare     →  the first place where "is" ≠ "should be" is the bug
 5. Fix one thing, run again, and keep the test
```

## How it works inside

- **Print debugging**: add `print(f"{x=}")`. The `=` inside the f-string prints the name and the value: `x=5`.
- **assert**: `assert fare(5) == 75` stops with `AssertionError` if the claim is false. Small, quick checks.
- **Debugger**: `breakpoint()` pauses the program at that line. You can look at variables and step line by line. VS Code has the same with a click: put a red dot (breakpoint) next to a line and press F5.
- **Python Tutor**: for small code, it draws every variable at every step.
- **Rubber duck**: explain the code line by line, out loud, to a toy (or a friend). Very often you hear the bug yourself.

## Python, step by step

Print the state inside a loop:

```python
nums = [3, 8, 2]
best = 0
for i, n in enumerate(nums):
    print(f"{i=} {n=} {best=}")     # name=value for each
    if n > best:
        best = n
print(best)
```

```output
i=0 n=3 best=0
i=1 n=8 best=3
i=2 n=2 best=8
8
```

A real bug hunt. The average of 60, 70, 80 should be 70:

```python
def average(marks):
    total = 0
    for m in marks:
        total = m                # bug is here, but we do not know that yet
    return total / len(marks)

print(average([60, 70, 80]))     # expected 70.0
```

```output
26.666666666666668
```

Predict, then look:

```python
def average(marks):
    total = 0
    for m in marks:
        total = m
        print(f"after {m=}: {total=}")   # expected: 60, 130, 210
    return total / len(marks)

average([60, 70, 80])
```

```output
after m=60: total=60
after m=70: total=70
after m=80: total=80
```

The first difference is on the second line: we expected `total=130` but got `70`. So `total = m` replaces instead of adds. The fix is `total += m`. Now lock it in with checks:

```python
def average(marks):
    total = 0
    for m in marks:
        total += m
    return total / len(marks)

assert average([60, 70, 80]) == 70
assert average([50]) == 50
print("all checks passed")
```

```output
all checks passed
```

Another classic: `return` inside the loop.

```python
# WRONG: the return is indented inside the loop, so it returns after the first item
def total(nums):
    s = 0
    for n in nums:
        s += n
        return s

print(total([5, 6, 7]))     # expected 18
```

```output
5
```

Debugger commands, after `breakpoint()` pauses your code in the terminal:

```text
n        next line
s        step into a function call
p x      print the value of x
l        list the code around this line
c        continue running until the next breakpoint
q        quit
```

## Time and space

Debugging time is the biggest hidden cost in programming. Small inputs, one change at a time, and checks you keep (asserts or tests) make it much shorter.

## Common mistakes

- Changing many things at once. If it starts working, you will not know why.
- Guessing instead of looking at values.
- Testing only with big inputs. Shrink the input until it still fails.
- Deleting the prints after fixing, but not adding a check (assert or test) that would catch the bug again.
- Asking AI to "fix it" before you can say which line is wrong. First find the line yourself.

## Patterns that use it

All of them. For DSA, debug with the **smallest** example: an empty list, one item, two items. For trees and graphs, print the node you visit and the depth.

## Practice

```practice
Write a function with a bug on purpose (for example range(1, len(a)) that skips the first item). Find it using only prints.
Add 3 asserts to every function you write this week.
Put breakpoint() in a loop and use n, p and c to watch it run.
Explain one of your old solutions line by line out loud (rubber duck).
```

## Explain it back

```explain
What are the 5 steps of debugging from this note?
What does f"{x=}" print?
Why should you shrink the input when you debug?
```

## Flashcards

```flashcards
What does print(f"{x=}") show? :: The name and the value, like x=5.
First step of debugging? :: Reproduce the bug with a small input.
What does breakpoint() do? :: Pauses the program so you can look at variables and step through.
Debugger: next line, print x, continue? :: n, p x, c
What does assert do? :: Stops with AssertionError if the condition is False.
What is rubber duck debugging? :: Explaining your code line by line out loud to find the bug.
```
