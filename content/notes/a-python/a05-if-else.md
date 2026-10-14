---
id: a05-if-else
title: if / else
level: basic
phase: 1
week: 2
tags: [python, basics, conditions]
estMinutes: 15
---

## What it is

`if` lets your program choose. It runs a block of code **only when** a condition is true.
`elif` checks another condition. `else` runs when nothing above was true.
Python checks from top to bottom and runs **only the first** true branch.

## Real-life example

An auto fare in this example: ₹30 for the first 2 km. After that, ₹15 for every extra km.
If the ride is 2 km or less, the fare is 30. Otherwise it is 30 plus 15 × (km − 2).
That "if this, otherwise that" is exactly an `if / else`.

## Picture

```svg
<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a05h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="accent"/></marker></defs>
  <polygon points="180,10 290,60 180,110 70,60" class="hi"/>
  <text x="180" y="58" text-anchor="middle">km &lt;= 2 ?</text>
  <text x="180" y="76" text-anchor="middle" class="muted">condition</text>
  <rect x="10" y="150" width="140" height="60" rx="8" class="box"/>
  <text x="80" y="176" text-anchor="middle">fare = 30</text>
  <text x="80" y="196" text-anchor="middle" class="muted">if block</text>
  <rect x="210" y="150" width="140" height="60" rx="8" class="box"/>
  <text x="280" y="176" text-anchor="middle">30 + 15*(km-2)</text>
  <text x="280" y="196" text-anchor="middle" class="muted">else block</text>
  <path d="M110 75L80 146M250 75L280 146" class="arrow" marker-end="url(#a05h)"/>
  <text x="70" y="115" class="muted">True</text>
  <text x="268" y="115" class="muted">False</text>
</svg>
```

## How it works inside

- A condition is any expression that gives `True` or `False`: `km <= 2`, `name == "Ravi"`, `x in prices`.
- Compare with `==`, `!=`, `<`, `<=`, `>`, `>=`. Join conditions with `and`, `or`, `not`.
- `and` stops early if the left side is False. `or` stops early if the left side is True. This is called **short-circuit**. It lets you write `if items and items[0] > 5:` safely, even when the list is empty.
- Python also treats values as true or false: `0`, `""`, `[]`, `{}` and `None` count as **False**. Everything else counts as **True**.
- The block under `if` must be indented (4 spaces). Indentation is how Python knows which lines belong to the `if`.

## Python, step by step

```python
km = 5
if km <= 2:                      # condition is False (5 is not <= 2)
    fare = 30                    # skipped
else:                            # so this branch runs
    fare = 30 + 15 * (km - 2)    # 30 + 15 * 3 = 75
print(fare)
```

```output
75
```

Many choices with `elif`. Order matters: the first true branch wins.

```python
marks = 82
if marks >= 90:          # False
    grade = "A+"
elif marks >= 75:        # True -> this runs, and Python stops checking
    grade = "A"
elif marks >= 35:        # not checked
    grade = "Pass"
else:
    grade = "Fail"
print(grade)
```

```output
A
```

Combining conditions, and "truthy" values:

```python
hour = 23
is_night = hour >= 22 or hour < 6        # True if late night OR early morning
print(is_night)

cart = []
if not cart:                             # an empty list counts as False
    print("Cart is empty")

age, has_ticket = 20, True
if age >= 18 and has_ticket:             # both must be True
    print("You can enter")
```

```output
True
Cart is empty
You can enter
```

Short form for a simple choice:

```python
km = 1.5
fare = 30 if km <= 2 else 30 + 15 * (km - 2)   # value_if_true if condition else value_if_false
print(fare)
```

```output
30
```

## Time and space

| Operation | Time | Notes |
| --- | --- | --- |
| One comparison like `a < b` | O(1) | for numbers |
| `x == y` on two strings | O(length) | compares letter by letter |
| `x in some_list` | O(n) | scans the list (a set or dict is O(1)) |
| A chain of `elif` | O(number of branches) | usually tiny |

## Common mistakes

- `if x = 5:` is a `SyntaxError`. Use `==` to compare.
- `if x == 1 or 2:` is **always** true, because `2` alone counts as True. Write `if x == 1 or x == 2:` or `if x in (1, 2):`.
- Putting `elif marks >= 35` before `elif marks >= 90`. The wider check catches everything first.
- Forgetting the colon `:` at the end of the `if` line.
- Mixed indentation (tabs and spaces). Use 4 spaces always.

```python
# WRONG: "or 2" is always true, so every number "matches"
x = 7
if x == 1 or 2:
    print("matched")   # prints, even though x is 7
else:
    print("no match")
```

```output
matched
```

## Patterns that use it

Every pattern. Binary search decides "go left or go right". Two pointers decide "move left or move right". Sliding window decides "grow or shrink".

## Practice

```practice
Write the auto fare with a night charge: after 10 PM the fare is 1.5 times.
Given marks, print A+, A, Pass or Fail. Test 95, 75, 35, 34.
Given a year, print whether it is a leap year (divisible by 4, but not by 100 unless also by 400).
fizz-buzz
determine-color-of-a-chessboard-square
sign-of-the-product-of-an-array
maximum-69-number
number-of-steps-to-reduce-a-number-to-zero
```

## Explain it back

```explain
Why does the order of elif branches matter?
Why is "if x == 1 or 2" always true?
Which values count as False in Python?
```

## Flashcards

```flashcards
How many branches of an if/elif/else chain run? :: At most one: the first one whose condition is True.
Which values count as False? :: 0, 0.0, "", [], {}, set(), None, False
What does short-circuit mean for "and"? :: If the left side is False, the right side is not checked.
How do you check if x is 1 or 2? :: if x in (1, 2):  or  if x == 1 or x == 2:
Write a one-line if/else for a value. :: value = a if condition else b
```
