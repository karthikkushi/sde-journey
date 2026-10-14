---
id: a04-input-output
title: Input and output
level: basic
phase: 1
week: 3
tags: [python, basics, input, print]
estMinutes: 10
---

## What it is

`input()` reads one line the user types. It **always gives text** (a string).
`print()` shows values on the screen.
To do maths with input, turn the text into a number first: `int(input())`.

## Real-life example

A billing counter at a kirana shop. The shopkeeper types the quantity (input). The machine prints the bill (output).
The keyboard only sends characters. The machine must turn `"3"` into the number 3 before it can multiply.

## Picture

```text
 keyboard  ──"3"──▶  input()  ──"3" (text)──▶  int()  ──3──▶  your maths
                                                               │
 screen    ◀──────────────  print(f"Total: {total}")  ◀────────┘
```

## How it works inside

- `input("Qty: ")` prints the prompt, waits for Enter, and returns everything typed **before** Enter, as a string.
- `int("3")` turns text into a whole number. `int("3.5")` fails; use `float("3.5")`.
- `print(a, b)` puts a space between values and a newline at the end. Change them with `sep=` and `end=`.
- f-strings (`f"..."`) put values inside text. `{x:.2f}` shows 2 decimals. `{x:>6}` pads to 6 characters on the right.
- On LeetCode you do **not** use `input()`. You write a function, and the website passes the input to it.

## Python, step by step

(The examples below read typed answers. In this note they are given as if you typed them.)

```python
# stdin: Ravi | 23
name = input()            # you type: Ravi
age = int(input())        # you type: 23  -> text "23" -> number 23
print(f"Hi {name}, next year you will be {age + 1}")
```

```output
Hi Ravi, next year you will be 24
```

Read many numbers from one line:

```python
# stdin: 40 25 60
prices = list(map(int, input().split()))   # "40 25 60" -> ["40","25","60"] -> [40, 25, 60]
print(prices)
print("Total:", sum(prices))
```

```output
[40, 25, 60]
Total: 125
```

`print` options and number formatting:

```python
print("a", "b", "c")              # space between, newline at the end
print("a", "b", "c", sep="-")     # choose the separator
print("no newline", end=" | ")    # choose the ending
print("same line")
total = 1234.5
print(f"Total: ₹{total:.2f}")      # 2 decimal places
print(f"[{42:>6}]")               # right-align in 6 characters
print(f"[{'ok':<6}]")             # left-align in 6 characters
```

```output
a b c
a-b-c
no newline | same line
Total: ₹1234.50
[    42]
[ok    ]
```

## Time and space

| Operation | Time | Notes |
| --- | --- | --- |
| `input()` | O(length of line) | Waits for the user |
| `line.split()` | O(length of line) | Makes a list |
| `print(x)` | O(length of output) | Printing is slow compared to maths. Avoid printing inside big loops. |

## Common mistakes

- Doing maths on `input()` without `int()`: `input() + 1` fails, and `input() * 2` repeats the text (`"33"`).
- `int(" 5")` works (spaces are ignored) but `int("5 apples")` fails. Clean the text first.
- Forgetting the `f` in an f-string: `"Total: {x}"` prints the braces as they are.
- Printing inside a loop that runs 100,000 times. It is very slow. Collect results and print once.

```python
# WRONG: input gives text, so this joins text with a number
# stdin: 3
qty = input()
print(qty + 1)
```

```output
Traceback (most recent call last):
  File "bill.py", line 4, in <module>
    print(qty + 1)
          ~~~~^~~
TypeError: can only concatenate str (not "int") to str
```

## Patterns that use it

None directly. But every program you write in Phase 1 uses input and output, and every LeetCode problem gives you input as function arguments.

## Practice

```practice
Ask for an item name, price and quantity. Print a one-line bill: "3 x Rice @ ₹60 = ₹180".
Read 5 marks on one line and print the total and the average with 1 decimal.
Ask for km travelled. Print the auto fare: ₹30 for the first 2 km, then ₹15 per km.
add-two-integers
convert-the-temperature
```

## Explain it back

```explain
What type does input() always return, and why does that matter?
How do you read "10 20 30" from one line into a list of numbers?
What do sep= and end= change in print?
```

## Flashcards

```flashcards
What type does input() return? :: Always a string (text).
How do you read a whole number from the user? :: int(input())
How do you read many numbers from one line? :: list(map(int, input().split()))
How do you show 2 decimals in an f-string? :: f"{x:.2f}"
Do LeetCode solutions use input()? :: No. You write a function; LeetCode passes the input.
```
