---
id: c-stacks
title: Stacks
level: core
phase: 2
week: 12
tags: [dsa, stack, lifo]
estMinutes: 20
---

## What it is

A stack is **last in, first out** (LIFO). You add (push) and remove (pop) only at the **top**.
In Python, a list is a perfect stack: `append` to push, `pop()` to pop. Both O(1).
Stacks appear whenever the **most recent** unfinished thing matters most.

## Real-life example

A pile of plates at a wedding buffet. Washed plates go on top. Guests take from the top. The plate at the bottom waits the longest.
"Undo" in a text editor is a stack too: the last change is the first one undone.

## Picture

```text
 push("dosa")  push("idli")  push("vada")   pop()      pop()
                              ┌──────┐
               ┌──────┐       │ vada │ ←top
 ┌──────┐      │ idli │       │ idli │      │ idli │←top
 │ dosa │      │ dosa │       │ dosa │      │ dosa │      │ dosa │←top
 └──────┘      └──────┘       └──────┘      └──────┘      └──────┘
```

## How it works inside

- A Python list keeps its top at the **end**. `append` and `pop()` at the end are O(1) (amortized), because nothing shifts.
- Do **not** use the front of a list as the top: `insert(0, x)` and `pop(0)` are O(n).
- `stack[-1]` peeks at the top without removing it.
- The **call stack** that runs your functions is a stack: the newest call finishes first. Any recursion can be rewritten with your own stack.
- Stacks match "openings" with "closings": brackets, HTML tags, function calls.
- A **monotonic stack** keeps its values in order to answer "next greater/smaller" questions (next note).

## Python, step by step

Balanced brackets: the latest unclosed opening must match the next closing:

```python
def is_balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)                   # an opening: remember it
        elif ch in pairs:
            if not stack or stack.pop() != pairs[ch]:
                return False                   # does not match the latest opening
    return not stack                           # anything still open?

print(is_balanced("{[()()]}"), is_balanced("([)]"), is_balanced("(("))
```

```output
True False False
```

Evaluate Reverse Polish Notation (`2 1 + 3 *` means `(2 + 1) * 3`):

```python
import operator

OPS = {"+": operator.add, "-": operator.sub, "*": operator.mul, "/": lambda a, b: int(a / b)}  # / rounds toward 0

def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in OPS:
            b = stack.pop()                    # the right side is on top
            a = stack.pop()
            stack.append(OPS[t](a, b))
        else:
            stack.append(int(t))
    return stack[0]

print(eval_rpn(["2", "1", "+", "3", "*"]), eval_rpn(["4", "13", "5", "/", "+"]))
```

```output
9 6
```

Undo with a stack of old states:

```python
history = []
text = ""
for word in ["chai", " and", " samosa"]:
    history.append(text)          # save the old state before changing it
    text += word
print(text)
text = history.pop()               # undo once
print(text)
```

```output
chai and samosa
chai and
```

## Time and space

| Operation | Time |
| --- | --- |
| push (`append`) | O(1) amortized |
| pop (`pop()`) | O(1) |
| peek (`stack[-1]`) | O(1) |
| search | O(n): stacks are not for searching |

Space: O(n).

## Common mistakes

- Popping from an empty stack:

```python
# WRONG: popping from an empty stack
stack = []
stack.pop()
```

```output
Traceback (most recent call last):
  File "stack.py", line 3, in <module>
    stack.pop()
    ~~~~~~~~~^^
IndexError: pop from empty list
```

  Check `if stack:` first.

- Using `pop(0)` (that is a queue, and O(n)).
- In RPN, popping operands in the wrong order for `-` and `/`.
- Forgetting to check what is left on the stack at the end.

## Patterns that use it

**Monotonic stack** (next greater, daily temperatures, largest rectangle), **DFS** with an explicit stack, **backtracking** (the path is a stack), **parsing** (brackets, decode string), **min stack** design.

## Practice

```practice
valid-parentheses
min-stack
evaluate-reverse-polish-notation
decode-string
asteroid-collision
implement-queue-using-stacks
generate-parentheses
daily-temperatures
```

## Explain it back

```explain
Why is a Python list a good stack but a bad queue?
How does a stack check that brackets are balanced?
How is the call stack related to recursion?
```

## Flashcards

```flashcards
Stack order? :: Last in, first out (LIFO).
Push and pop in Python? :: list.append(x) and list.pop(), both O(1).
Peek at the top? :: stack[-1]
Why not pop(0)? :: It is O(n) and makes a queue, not a stack.
Bracket matching idea? :: Push openings; each closing must match the most recent opening.
What else is a stack? :: The call stack, undo history, DFS.
```
