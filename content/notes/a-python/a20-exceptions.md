---
id: a20-exceptions
title: Exceptions
level: basic
phase: 1
week: 3
tags: [python, errors, exceptions]
estMinutes: 15
---

## What it is

An **exception** is Python's way of saying "something went wrong here", like dividing by zero or `int("abc")`.
If nobody handles it, the program stops and prints a traceback.
`try / except` lets you **catch** an exception and do something sensible instead of crashing.

## Real-life example

An ATM. If your card fails, the ATM does not explode. It shows "Card error, please try again" and returns the card.
The ATM **expects** some problems and has a plan for each one. That plan is the `except` block.

## Picture

```text
try:
    risky step  ──── works ────▶ else:    (runs only if no error)
        │                          │
      error                        ▼
        ▼                       finally:  (always runs: clean up)
except ThatError:                  ▲
    plan B  ───────────────────────┘
```

## How it works inside

- When an error happens, Python makes an **exception object** (like `ValueError("...")`) and **jumps** out of the current code.
- It looks for a matching `except` in the current function, then in the caller, then in the caller's caller... up the call stack.
- If it finds one, that block runs and the program continues after it. If not, the program stops and prints the traceback.
- `else` runs only if the `try` had no error. `finally` always runs, even after a `return`.
- `raise ValueError("message")` creates your own error. Use it when your function gets input it cannot handle.
- Catch only the errors you **expect**, like `ValueError`. A bare `except:` also catches your typos, and hides real bugs.

## Python, step by step

```python
def safe_int(text):
    try:
        return int(text)          # this may fail
    except ValueError:            # catch only the error we expect
        return None

print(safe_int("42"), safe_int("forty"))
```

```output
42 None
```

`else` and `finally`:

```python
def split_bill(total, people):
    try:
        share = total / people
    except ZeroDivisionError:
        print("Nobody to split with")
        return None
    else:                          # only if there was no error
        print(f"Each pays ₹{share:.2f}")
        return share
    finally:                       # always runs, even after return
        print("done")

split_bill(500, 3)
split_bill(500, 0)
```

```output
Each pays ₹166.67
done
Nobody to split with
done
```

Raise your own error, and read its message:

```python
def withdraw(balance, amount):
    if amount <= 0:
        raise ValueError("amount must be positive")
    if amount > balance:
        raise ValueError(f"not enough money: balance {balance}, asked {amount}")
    return balance - amount

print(withdraw(1000, 300))
try:
    withdraw(1000, 5000)
except ValueError as e:            # e is the exception object
    print("Error:", e)
```

```output
700
Error: not enough money: balance 1000, asked 5000
```

Keep asking until the input is good:

```python
# stdin: abc | -5 | 7
while True:
    try:
        n = int(input())
        if n <= 0:
            raise ValueError("must be positive")
        break                      # good input: leave the loop
    except ValueError as e:
        print("Try again:", e)
print("Got", n)
```

```output
Try again: invalid literal for int() with base 10: 'abc'
Try again: must be positive
Got 7
```

## Time and space

`try` costs almost nothing when no error happens. Raising and catching an error is slower, so do not use exceptions for normal, frequent control flow in hot loops.

## Common mistakes

- A bare `except:` that hides a real bug:

```python
# WRONG: the bare except hides a typo (qantity is not defined)
prices = {"rice": 60}
quantity = 2
try:
    print(prices["rice"] * qantity)
except:
    print("Something went wrong")
```

```output
Something went wrong
```

  Catch the specific error (`except KeyError:`), so the `NameError` from the typo still shows.

- Wrapping the whole program in one big `try`. Keep `try` blocks small, around the one risky line.
- Catching an error and doing nothing (`except: pass`). At least print or log it.
- Using exceptions instead of a simple `if` check you could do first.

## Patterns that use it

DSA solutions rarely use exceptions. Backend code uses them all the time: invalid input → `400 Bad Request`, missing record → `404 Not Found`, and `finally` to close files and database connections.

## Practice

```practice
Write safe_divide(a, b) that returns None when b is 0.
Ask for a number until the user types a valid whole number between 1 and 10.
Write withdraw(balance, amount) that raises ValueError for bad amounts. Call it in a try block.
Open a file that does not exist and catch FileNotFoundError with a friendly message.
```

## Explain it back

```explain
What happens, step by step, when an error is raised inside a function?
When does the else block run? When does finally run?
Why is a bare except: dangerous?
```

## Flashcards

```flashcards
What does try/except do? :: Runs risky code and handles a specific error instead of crashing.
When does else run in try/except/else? :: Only when the try block had no error.
When does finally run? :: Always, error or not, even after return.
How do you create your own error? :: raise ValueError("message")
Why avoid bare except:? :: It also catches typos and real bugs, and hides them.
Error from int("abc")? :: ValueError
```
