---
id: a07-functions
title: Functions
level: basic
phase: 1
week: 5
tags: [python, basics, functions]
estMinutes: 20
---

## What it is

A function is a **named block of code** you can run again and again.
You give it inputs (parameters). It can give back one result with `return`.
Every LeetCode solution is a function.

## Real-life example

A juice machine at a stall. You put in fruit and sugar (inputs). It gives you a glass of juice (output).
You do not care how it works inside. You just call it again for the next customer.

## Picture

```text
          inputs                         output
   km = 5 ──┐                        ┌──▶ 75
            ▼                        │
      ┌─────────────────────────────────┐
      │ def auto_fare(km):              │
      │     if km <= 2: return 30       │
      │     return 30 + 15 * (km - 2)   │
      └─────────────────────────────────┘
```

## How it works inside

- `def name(params):` only **defines** the function. Nothing runs yet.
- `name(args)` **calls** it. Python creates a fresh workspace (a **frame**) for this call. Parameters and variables made inside live in that frame.
- `return value` sends the value back and **ends** the call at once. The frame is thrown away.
- A function with no `return` gives back `None`.
- Calls stack up: if `a()` calls `b()`, Python pauses `a`, runs `b`, then comes back. This is the **call stack**. You will see it again in recursion.

## Python, step by step

```python
def auto_fare(km):                  # define: name auto_fare, one input km
    if km <= 2:
        return 30                   # send 30 back and stop
    return 30 + 15 * (km - 2)       # otherwise send this back

print(auto_fare(1))                 # call with km = 1
print(auto_fare(5))                 # call with km = 5
ride_cost = auto_fare(10)           # keep the result in a variable
print(ride_cost)
```

```output
30
75
150
```

Default values and keyword arguments:

```python
def bill(amount, gst_percent=5):          # gst_percent is 5 unless you say otherwise
    return round(amount * (1 + gst_percent / 100), 2)

print(bill(200))                  # uses the default 5%
print(bill(200, 18))              # pass 18 instead
print(bill(gst_percent=12, amount=100))   # name the arguments: order does not matter
```

```output
210.0
236.0
112.0
```

Return two values (Python packs them into a tuple):

```python
def lowest_and_highest(scores):
    return min(scores), max(scores)

low, high = lowest_and_highest([45, 82, 13, 67])   # unpack the two results
print(low, high)
```

```output
13 82
```

`print` is not `return`:

```python
def double_print(x):
    print(x * 2)        # shows it, but gives nothing back

def double_return(x):
    return x * 2        # gives it back

a = double_print(4)     # prints 8, but a gets None
b = double_return(4)    # prints nothing, b gets 8
print(a, b)
```

```output
8
None 8
```

Functions are values too. You can pass one to another function:

```python
def by_length(word):
    return len(word)

words = ["idli", "dosa", "pongal", "vada"]
print(sorted(words, key=by_length))   # sorted calls by_length on each word
```

```output
['idli', 'dosa', 'vada', 'pongal']
```

## Time and space

| What | Time | Space |
| --- | --- | --- |
| Calling a function | O(1) to start | one frame on the call stack |
| The work inside | depends on the code | |
| Recursion depth d | | O(d) frames (see Recursion) |

## Common mistakes

- Using `print` when you need `return`. LeetCode checks the **returned** value.
- Forgetting `return`: the function gives `None`.
- Forgetting the brackets: `auto_fare` is the function itself; `auto_fare(5)` calls it.
- A list as a default value. The same list is reused across calls:

```python
def add_item(item, cart=[]):   # this list is made ONCE, when def runs
    cart.append(item)
    return cart

print(add_item("rice"))
print(add_item("dal"))         # surprise: rice is still there
```

```output
['rice']
['rice', 'dal']
```

Fix it with `cart=None`, then `if cart is None: cart = []` inside.

## Patterns that use it

Every LeetCode problem. Helper functions inside your solution keep code clean: `def in_bounds(r, c):` in grid problems, `def dfs(node):` in trees and graphs.

## Practice

```practice
Write is_even(n) that returns True or False. Use it to count even numbers in a list.
Write strike_rate(runs, balls) that returns a number rounded to 2 decimals.
Write grade(marks) using if/elif and test it with 4 values.
calculate-money-in-leetcode-bank
subtract-the-product-and-sum-of-digits-of-an-integer
smallest-even-multiple
maximum-69-number
number-of-steps-to-reduce-a-number-to-zero
```

## Explain it back

```explain
What is the difference between defining a function and calling it?
Why does a function that only prints give back None?
Why is a list as a default argument a trap?
```

## Flashcards

```flashcards
What does a function without return give back? :: None
What happens to local variables after a function returns? :: Its frame is thrown away, so they are gone.
How do you return two values? :: return a, b  (a tuple). Unpack with x, y = f()
Default argument trap? :: A list default is made once and shared between calls. Use None instead.
print vs return? :: print shows text. return gives a value back to the caller.
```
