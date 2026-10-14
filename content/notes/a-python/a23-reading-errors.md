---
id: a23-reading-errors
title: Reading error messages
level: basic
phase: 1
week: 3
tags: [python, errors, debugging]
estMinutes: 15
---

## What it is

When Python crashes, it prints a **traceback**: the path of calls that led to the error.
Read it **from the bottom up**. The last line tells you **what** went wrong. The lines just above it tell you **where**.
An error message is not an insult. It is a free hint.

## Real-life example

A courier tracking page: "Picked up in Delhi → Reached Nagpur hub → Reached Bengaluru hub → **Delivery failed: address not found**".
The last line is the problem. The lines above show the route it took to get there.

## Picture

```text
Traceback (most recent call last):       ← start of the report
  File "bill.py", line 13, in <module>    ← 1. your main code called bill(...)
    print(bill([("rice", 2), ("oil", 1)]))
  File "bill.py", line 9, in bill          ← 2. bill called line_total(...)
    total += line_total(item, qty)
  File "bill.py", line 5, in line_total    ← 3. the line that actually failed
    return prices[item] * qty
KeyError: 'oil'                           ← WHAT went wrong: no key 'oil'
```

## How it works inside

- When an exception is not caught, Python prints every frame on the **call stack**, oldest first, newest last (see Functions and Recursion).
- Each frame shows the **file**, **line number**, **function name**, and the line of code.
- Newer Python versions add `~~~^^^` marks under the exact part of the line that failed.
- The **last line** is `ErrorType: message`.
- Look for the lowest frame that is in **your** file. Errors "inside Python" usually mean you passed it a bad value.

## Python, step by step

A real traceback, three calls deep:

```python
# WRONG: there is no price for "oil"
prices = {"rice": 60, "dal": 120}

def line_total(item, qty):
    return prices[item] * qty

def bill(cart):
    total = 0
    for item, qty in cart:
        total += line_total(item, qty)
    return total

print(bill([("rice", 2), ("oil", 1)]))
```

```output
Traceback (most recent call last):
  File "bill.py", line 13, in <module>
    print(bill([("rice", 2), ("oil", 1)]))
          ~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "bill.py", line 10, in bill
    total += line_total(item, qty)
             ~~~~~~~~~~^^^^^^^^^^^
  File "bill.py", line 5, in line_total
    return prices[item] * qty
           ~~~~~~^^^^^^
KeyError: 'oil'
```

The errors you will meet most, with one tiny example each. (Grammar errors have no "Traceback" line: Python found them before running anything.)

```python
# WRONG: SyntaxError: the bracket is never closed (nothing runs at all)
print("hello"
```

```output
  File "errors.py", line 2
    print("hello"
         ^
SyntaxError: '(' was never closed
```

```python
# WRONG: IndentationError: the body of a function must be indented
def greet():
print("hi")
```

```output
  File "errors.py", line 3
    print("hi")
    ^^^^^
IndentationError: expected an indented block after function definition on line 2
```

```python
# WRONG: ValueError: the type is right (a string) but the value cannot be a number
age = int("twenty")
```

```output
Traceback (most recent call last):
  File "errors.py", line 2, in <module>
    age = int("twenty")
ValueError: invalid literal for int() with base 10: 'twenty'
```

```python
# WRONG: AttributeError: lists have append, not add
items = []
items.add("rice")
```

```output
Traceback (most recent call last):
  File "errors.py", line 3, in <module>
    items.add("rice")
    ^^^^^^^^^
AttributeError: 'list' object has no attribute 'add'
```

```python
# WRONG: ZeroDivisionError
people = 0
share = 500 / people
```

```output
Traceback (most recent call last):
  File "errors.py", line 3, in <module>
    share = 500 / people
            ~~~~^~~~~~~~
ZeroDivisionError: division by zero
```

Cheat sheet:

| Error | Usually means |
| --- | --- |
| `SyntaxError` | Grammar: missing `:` `)` `"`, or a wrong keyword. Nothing ran. |
| `IndentationError` | Spaces at the start of a line are wrong. |
| `NameError` | A name that does not exist yet: typo, or used before assigned. |
| `TypeError` | Wrong type: `"5" + 5`, calling something that is not a function, wrong number of arguments. |
| `ValueError` | Right type, bad value: `int("abc")`. |
| `IndexError` | List index too big (or too small). |
| `KeyError` | Dict key does not exist. |
| `AttributeError` | That object has no such method or attribute (often a typo, or a `None`). |
| `ZeroDivisionError` | Divided by zero. |
| `RecursionError` | Recursion without a working base case. |

## Time and space

Reading the error carefully costs one minute. Guessing without reading costs thirty.

## Common mistakes

- Reading only the first line ("Traceback...") and panicking. Go to the **last** line.
- Fixing the wrong line. The error line may be fine; the bad value may come from an earlier line.
- Copying the whole error into AI and pasting back the fix without understanding it. Instead: read it, guess the cause, then check.
- `AttributeError: 'NoneType' object has no attribute ...` almost always means a function returned `None` (for example, `x = my_list.sort()`).

## Patterns that use it

Every debugging session. In interviews, reading your own error calmly and fixing it is a strong signal.

## Practice

```practice
Make each error in the cheat sheet on purpose, one by one. Read the last line aloud each time.
Take the bill example, and fix it in two ways: add a price for oil, and use prices.get(item, 0).
Write down the 3 errors you hit most this week, and what caused each.
```

## Explain it back

```explain
In which direction do you read a traceback, and why?
What is the difference between a TypeError and a ValueError?
What does "'NoneType' object has no attribute" usually mean?
```

## Flashcards

```flashcards
Where do you start reading a traceback? :: At the bottom: the last line says what went wrong.
What does the line above the error type show? :: The exact line of code that failed.
TypeError vs ValueError? :: TypeError: wrong type. ValueError: right type, bad value.
"'NoneType' object has no attribute"? :: Something you expected to be a value is None, often a function with no return.
When does SyntaxError happen? :: Before anything runs, when Python reads the grammar.
```
