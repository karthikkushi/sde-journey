---
id: a01-how-code-runs
title: How a computer runs code
level: basic
phase: 1
week: 1
tags: [python, basics, memory]
estMinutes: 10
---

## What it is

A program is a list of steps.
Python reads your file from the **top line to the bottom line** and does one step at a time.
While the program runs, its values live in the computer's memory (RAM).

## Real-life example

Think of making chai from a recipe card. Step 1: boil water. Step 2: add tea powder. Step 3: add milk.
You cannot add milk before the vessel is on the stove.
Python is the same. Each line can only use what the lines above it already made.

## Picture

```svg
<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a01h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="accent"/></marker></defs>
  <rect x="10" y="10" width="150" height="54" rx="8" class="box"/>
  <text x="85" y="33" text-anchor="middle">bill.py</text>
  <text x="85" y="52" text-anchor="middle" class="muted">your code (just text)</text>
  <rect x="200" y="10" width="150" height="54" rx="8" class="box"/>
  <text x="275" y="33" text-anchor="middle">Python</text>
  <text x="275" y="52" text-anchor="middle" class="muted">reads and checks it</text>
  <rect x="200" y="94" width="150" height="54" rx="8" class="box"/>
  <text x="275" y="117" text-anchor="middle">bytecode</text>
  <text x="275" y="136" text-anchor="middle" class="muted">many small steps</text>
  <rect x="10" y="94" width="150" height="54" rx="8" class="hi"/>
  <text x="85" y="117" text-anchor="middle">CPU</text>
  <text x="85" y="136" text-anchor="middle" class="muted">runs one step at a time</text>
  <path d="M160 37H196M275 64V90M200 121H164M85 148V166" class="arrow" marker-end="url(#a01h)"/>
  <rect x="10" y="170" width="340" height="70" rx="8" class="box"/>
  <text x="22" y="192" class="muted">RAM (memory), only while it runs</text>
  <text x="22" y="222">price = 25   quantity = 4   total = 100</text>
</svg>
```

## How it works inside

1. You write code in a file, for example `bill.py`. It is just text.
2. You run `python bill.py`. The **Python interpreter** (a program) reads that text.
3. First it checks the grammar. A missing bracket stops everything here, before any line runs (`SyntaxError`).
4. It turns your text into tiny instructions called **bytecode**.
5. It runs the bytecode one instruction at a time. The CPU does the real work.
6. Values (numbers, text, lists) are kept in **RAM** while the program runs. When the program ends, they are gone. To keep data, you must save it to a file or a database.

> Python Tutor (pythontutor.com) shows steps 5 and 6 live. Paste any code from this note and press **Next**.

## Python, step by step

```python
price = 25                # make the number 25 and name it price
quantity = 4              # make 4 and name it quantity
total = price * quantity  # read both, multiply, name the result total
print(total)              # show total on the screen
```

```output
100
```

Order matters. This program uses `fare` before any line has made it:

```python
# WRONG: fare is used on line 2, but it is only made on line 3
print(fare)
fare = 30
```

```output
Traceback (most recent call last):
  File "bill.py", line 2, in <module>
    print(fare)
          ^^^^
NameError: name 'fare' is not defined
```

Python stops at the first error. Lines after it never run.

## Time and space

You will learn the O(...) notation in week 6. For now, one idea: **more lines run = more time**.

| What | Cost |
| --- | --- |
| One simple line, like `total = price * quantity` | Same tiny time, every time. We call this O(1). |
| A loop that runs 1,000 times | About 1,000 times the work of one line |

## Common mistakes

- Using a name before it has a value (`NameError`).
- Thinking Python reads the whole file "at once". It runs top to bottom.
- Expecting values to stay after the program ends. RAM is cleared. Save to a file if you need them later.
- Not reading the last line of an error. It tells you what went wrong.

## Patterns that use it

Every pattern you will learn is built from these steps: store a value, read it, change it, repeat.

## Practice

```practice
Run the price × quantity code in Python Tutor. Press Next and watch each value appear.
Write a 4-line program: an auto ride costs ₹30 base fare plus ₹15 per km. Print the fare for 6 km (answer: 120).
Make a NameError on purpose, then read the last line of the error out loud.
add-two-integers
convert-the-temperature
smallest-even-multiple
```

## Explain it back

```explain
In what order does Python run the lines of a file?
Why does using a name before it gets a value cause an error?
Where do values live while a program runs, and what happens to them after it ends?
```

## Flashcards

```flashcards
In what order does Python run the lines of a file? :: Top to bottom, one at a time.
What is bytecode? :: Small instructions Python makes from your code before running it.
Where are values kept while a program runs? :: In memory (RAM). They vanish when the program ends.
What happens at the first error? :: Python stops. Later lines do not run.
```
