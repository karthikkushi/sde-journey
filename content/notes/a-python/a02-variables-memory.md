---
id: a02-variables-memory
title: Variables and memory
level: basic
phase: 1
week: 1
tags: [python, basics, memory, variables]
estMinutes: 15
---

## What it is

A variable is a **name tag** tied to a value in memory.
`fare = 30` makes the value 30, then ties the name `fare` to it.
The name does not hold the value inside it. It **points** to the value.

## Real-life example

Your phone contacts. The contact "Amma" is a name. It points to a phone number.
You can have two contacts, "Amma" and "Home", that point to the **same** number.
If you change the name "Amma" to point to a new number, the old number still exists. Nothing points to it now.

## Picture

```svg
<svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a02h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="accent"/></marker></defs>
  <text x="10" y="20" class="muted">names</text>
  <text x="200" y="20" class="muted">values in memory</text>
  <rect x="10" y="34" width="70" height="34" rx="17" class="hi"/>
  <text x="45" y="56" text-anchor="middle">fare</text>
  <rect x="200" y="30" width="70" height="42" rx="6" class="box"/>
  <text x="235" y="56" text-anchor="middle">45</text>
  <rect x="280" y="30" width="70" height="42" rx="6" class="box" stroke-dasharray="4 3" opacity="0.6"/>
  <text x="315" y="56" text-anchor="middle" class="muted">30 (old)</text>
  <path d="M80 51H196" class="arrow" marker-end="url(#a02h)"/>
  <rect x="10" y="120" width="70" height="34" rx="17" class="hi"/>
  <text x="45" y="142" text-anchor="middle">a</text>
  <rect x="10" y="176" width="70" height="34" rx="17" class="hi"/>
  <text x="45" y="198" text-anchor="middle">b</text>
  <rect x="200" y="140" width="150" height="50" rx="6" class="box"/>
  <text x="275" y="170" text-anchor="middle">[1, 2, 3, 4]</text>
  <path d="M80 137L196 160M80 193L196 172" class="arrow" marker-end="url(#a02h)"/>
  <text x="200" y="215" class="muted">one list, two names</text>
</svg>
```

## How it works inside

- Every value in Python is an **object** in memory. An object has a **type** (number, text, list...) and a **value**.
- `fare = 30` does two things: it makes the object `30`, then it ties the name `fare` to it.
- `fare = fare + 15` reads 30, makes a **new** object 45, and moves the name tag to 45. The old 30 is cleaned up later if no name points to it.
- `b = a` does **not** copy anything. It ties a second name to the same object. For numbers and text this never surprises you. For lists it does: change the list through `b`, and `a` sees it too.
- `id(x)` gives the object's identity (like its address). `a is b` asks "same object?". `a == b` asks "same value?".

The basic types you will use every day:

| Type | Example | What it is |
| --- | --- | --- |
| `int` | `42` | Whole number |
| `float` | `3.5` | Number with a decimal point |
| `str` | `"chai"` | Text |
| `bool` | `True` | Yes or no |
| `NoneType` | `None` | "Nothing here yet" |

## Python, step by step

```python
fare = 30          # make 30, tie the name fare to it
print(fare)        # read fare
fare = fare + 15   # read 30, add 15, tie fare to the NEW value 45
print(fare)
```

```output
30
45
```

Two names, one list:

```python
a = [1, 2, 3]    # one list in memory, named a
b = a            # b is a second name tag on the SAME list
b.append(4)      # change the list through b
print(a)         # a sees the change: it is the same list
print(a is b)    # same object? yes
```

```output
[1, 2, 3, 4]
True
```

Ask Python for the type of a value:

```python
print(type(42))       # whole number
print(type(3.5))      # decimal number
print(type("chai"))   # text
print(type(True))     # yes/no
print(type(None))     # nothing
```

```output
<class 'int'>
<class 'float'>
<class 'str'>
<class 'bool'>
<class 'NoneType'>
```

Swap two values in one line:

```python
left, right = 3, 9          # give two names two values at once
left, right = right, left   # swap: the right side is read first, then assigned
print(left, right)
```

```output
9 3
```

## Time and space

| Operation | Time | Space |
| --- | --- | --- |
| `x = value` (tie a name) | O(1) | O(1): nothing is copied |
| `b = a` (second name) | O(1) | O(1): still one object |
| `x = x + 1` | O(1) | makes one new small object |

## Common mistakes

- Thinking `b = a` copies a list. It does not. Use `b = a.copy()` for a real copy (see the Lists note).
- Mixing `=` (give a name) and `==` (compare).
- Names are case-sensitive: `Fare` and `fare` are different names.
- A name cannot start with a digit (`2fare` is not allowed) and cannot have spaces. Use `snake_case`: `total_fare`.
- Naming a variable `list`, `sum` or `max`. It hides Python's built-in function with the same name.

## Patterns that use it

All of them. Two pointers keep two variables (`left`, `right`). Sliding window keeps `start` and a running `total`. Swapping with `a, b = b, a` shows up in sorting and reversing.

## Practice

```practice
Make a = [5, 6]. Then b = a, then b.append(7). Predict what print(a) shows, then run it.
Make x = 10 and y = x. Then x = x + 1. Predict y, then run it. Why is it different from the list case?
Swap two variables without a third variable.
final-value-of-variable-after-performing-operations
convert-the-temperature
number-of-steps-to-reduce-a-number-to-zero
```

## Explain it back

```explain
What does the line fare = 30 actually do in memory?
Why does changing a list through b also change a, after b = a?
What is the difference between == and is?
```

## Flashcards

```flashcards
What is a variable in Python? :: A name tag that points to a value (object) in memory.
Does b = a copy a list? :: No. Both names point to the same list.
What does x = x + 1 do to the old value? :: Makes a new value and moves the name to it. The old one is unchanged.
== vs is? :: == compares values. is checks if it is the same object.
How do you swap a and b in Python? :: a, b = b, a
```
