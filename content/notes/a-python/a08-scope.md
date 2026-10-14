---
id: a08-scope
title: Scope
level: basic
phase: 1
week: 5
tags: [python, basics, functions, scope]
estMinutes: 15
---

## What it is

**Scope** is where a name can be seen.
A name made inside a function is **local**: only that function sees it, and it disappears when the call ends.
A name made at the top of the file is **global**: everyone can read it.

## Real-life example

A meeting room whiteboard. What you write there during a meeting is only for that meeting. After the meeting, it is wiped.
The notice board in the office lobby is for everyone. That is global.
You can **read** the notice board from any meeting room. But you should not scribble on it from inside a meeting.

## Picture

Python looks for a name from the inside out: **L**ocal, **E**nclosing, **G**lobal, **B**uilt-in (LEGB).

```svg
<svg viewBox="0 0 360 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="350" height="210" rx="10" class="box"/>
  <text x="18" y="26" class="muted">Built-in: print, len, max ...</text>
  <rect x="25" y="38" width="310" height="168" rx="10" class="box"/>
  <text x="38" y="58" class="muted">Global: names at the top of the file</text>
  <rect x="45" y="70" width="270" height="126" rx="10" class="box"/>
  <text x="58" y="90" class="muted">Enclosing: the outer function</text>
  <rect x="65" y="102" width="230" height="82" rx="10" class="hi"/>
  <text x="78" y="124">Local: inside this function</text>
  <text x="78" y="150" class="muted">Python looks here first,</text>
  <text x="78" y="168" class="muted">then moves outwards</text>
</svg>
```

## How it works inside

- Each function call gets its own **frame** (see Functions). Local names live in that frame.
- When you **read** a name, Python checks Local, then Enclosing, then Global, then Built-in. First match wins.
- When you **assign** to a name inside a function (`x = ...`), Python decides that `x` is local for the **whole** function. That is why reading it before the assignment fails.
- `global x` lets a function assign to a global name. Avoid it: it makes code hard to follow.
- `nonlocal x` lets an inner function change a name of the outer function. You will use this in tree problems (DFS) to keep a running best answer.

## Python, step by step

```python
shop = "Sharma Stores"         # global

def greet(customer):
    message = f"Welcome to {shop}, {customer}"   # local: message; reads global shop
    return message

print(greet("Ravi"))
print(shop)                    # global is still visible here
```

```output
Welcome to Sharma Stores, Ravi
Sharma Stores
```

Local names vanish after the call:

```python
# WRONG: total only exists inside add_up
def add_up(nums):
    total = sum(nums)
    return total

add_up([1, 2, 3])
print(total)
```

```output
Traceback (most recent call last):
  File "scope.py", line 7, in <module>
    print(total)
          ^^^^^
NameError: name 'total' is not defined
```

Assigning makes a name local for the whole function:

```python
# WRONG: count += 1 makes count local, so reading it first fails
count = 0
def visit():
    count += 1
visit()
```

```output
Traceback (most recent call last):
  File "scope.py", line 5, in <module>
    visit()
    ~~~~~^^
  File "scope.py", line 4, in visit
    count += 1
    ^^^^^
UnboundLocalError: cannot access local variable 'count' where it is not associated with a value
```

The better fix is to pass values in and return values out. But for an inner helper, `nonlocal` is clean:

```python
def longest_run(days):
    best = 0                     # belongs to longest_run

    def check(streak):
        nonlocal best            # change the outer best, not a new local one
        best = max(best, streak)

    for streak in days:
        check(streak)
    return best

print(longest_run([3, 7, 2, 5]))
```

```output
7
```

## Time and space

Scope has no running cost you need to think about. Looking up a name is O(1).
Local names are freed when the call ends, so they do not waste memory.

## Common mistakes

- Expecting a local variable to exist after the function ends.
- Using a global and changing it from many functions. Pass values in and return them instead.
- Naming your own variable `list`, `sum`, `max` or `input`. It hides the built-in:

```python
# WRONG: list is now a normal list, not the built-in function
list = [1, 2, 3]
letters = list("abc")
```

```output
Traceback (most recent call last):
  File "scope.py", line 3, in <module>
    letters = list("abc")
TypeError: 'list' object is not callable
```

## Patterns that use it

- **Tree DFS**: a helper `dfs(node)` inside the main function, with `nonlocal best` to track the answer (diameter, max path sum).
- **Backtracking**: a helper `backtrack(...)` that appends to a result list from the outer function.

## Practice

```practice
Write a function that uses a global tax rate (read only). Then rewrite it to take the rate as a parameter. Which is clearer?
Make an UnboundLocalError on purpose, then fix it in two ways: by passing the value in, and with nonlocal inside an inner function.
Write counter() that returns an inner function; each call of the inner function returns 1, 2, 3...
Week 16 preview: diameter-of-binary-tree uses nonlocal best.
diameter-of-binary-tree
```

## Explain it back

```explain
What does LEGB mean, and in which order does Python look?
Why does count += 1 inside a function fail when count is global?
When would you use nonlocal?
```

## Flashcards

```flashcards
What is a local variable? :: A name made inside a function. Only that call sees it; it vanishes when the call ends.
In which order does Python look up names? :: Local, Enclosing, Global, Built-in (LEGB).
Why does x += 1 inside a function fail for a global x? :: Assigning makes x local for the whole function, so reading it first fails.
What does nonlocal do? :: Lets an inner function change a variable of the outer function.
Why not name a variable list? :: It hides the built-in list() function.
```
