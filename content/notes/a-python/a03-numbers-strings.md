---
id: a03-numbers-strings
title: Numbers and strings
level: basic
phase: 1
week: 3
tags: [python, basics, strings, numbers]
estMinutes: 20
---

## What it is

Python has whole numbers (`int`, like `42`) and decimal numbers (`float`, like `3.5`).
A string (`str`) is text: a row of characters, like `"chai"`.
Strings **cannot be changed** in place. Every string method gives you a **new** string.

## Real-life example

A cricket score card: `"Kohli 82 (54)"` is a string. To work out the strike rate, you pull out `82` and `54`, turn them into numbers, and divide: 82 ÷ 54 × 100 ≈ 151.85.
Text for showing, numbers for maths.

## Picture

Each character has a position (index). Counting starts at **0**. Negative indexes count from the end.

```svg
<svg viewBox="0 0 360 130" xmlns="http://www.w3.org/2000/svg">
  <text x="10" y="18" class="muted">s = "CHAI"</text>
  <rect x="40" y="30" width="60" height="44" rx="6" class="box"/><text x="70" y="58" text-anchor="middle">C</text>
  <rect x="110" y="30" width="60" height="44" rx="6" class="box"/><text x="140" y="58" text-anchor="middle">H</text>
  <rect x="180" y="30" width="60" height="44" rx="6" class="hi"/><text x="210" y="58" text-anchor="middle">A</text>
  <rect x="250" y="30" width="60" height="44" rx="6" class="box"/><text x="280" y="58" text-anchor="middle">I</text>
  <text x="70" y="94" text-anchor="middle">0</text><text x="140" y="94" text-anchor="middle">1</text><text x="210" y="94" text-anchor="middle">2</text><text x="280" y="94" text-anchor="middle">3</text>
  <text x="70" y="118" text-anchor="middle" class="muted">-4</text><text x="140" y="118" text-anchor="middle" class="muted">-3</text><text x="210" y="118" text-anchor="middle" class="muted">-2</text><text x="280" y="118" text-anchor="middle" class="muted">-1</text>
  <text x="10" y="94" class="muted">i</text>
</svg>
```

`s[2]` is `"A"`. `s[-1]` is `"I"`. `s[1:3]` is `"HA"` (from index 1 up to, **not including**, 3).

## How it works inside

**Numbers**

- `int` can be as big as you like. `2 ** 100` works.
- `float` is stored in binary, so some decimals are not exact: `0.1 + 0.2` gives `0.30000000000000004`. For money, count in paise (whole numbers) or use `round()` when showing.
- `/` always gives a float. `//` gives the whole part. `%` gives the remainder.

**Strings**

- A string is a row of characters stored together. Reading `s[i]` jumps straight to position `i`: fast.
- Strings are **immutable**: `s.upper()` does not change `s`. It returns a new string.
- Adding strings in a loop (`result += piece`) copies everything again each time. For many pieces, collect them in a list and use `"".join(pieces)` once.

## Python, step by step

Numbers:

```python
runs = 82                          # int
balls = 54                         # int
print(runs / balls)                # / always gives a float
print(round(runs / balls * 100, 2))  # strike rate, 2 decimals
print(17 // 5)                     # whole part of 17 ÷ 5
print(17 % 5)                      # remainder of 17 ÷ 5
print(2 ** 10)                     # power: 2 to the 10
print(0.1 + 0.2)                   # floats are not always exact
```

```output
1.5185185185185186
151.85
3
2
1024
0.30000000000000004
```

Turning text into numbers and back:

```python
card = "Kohli 82 (54)"
parts = card.split()                 # split on spaces -> a list of 3 strings
print(parts)
runs = int(parts[1])                 # "82" -> 82
balls = int(parts[2].strip("()"))    # "(54)" -> "54" -> 54
print(runs + balls)                  # now real maths works
print("Runs: " + str(runs))          # number back to text with str()
print(f"{parts[0]} scored {runs} off {balls}")  # f-string: put values inside text
```

```output
['Kohli', '82', '(54)']
136
Runs: 82
Kohli scored 82 off 54
```

Indexing and slicing:

```python
s = "BENGALURU"
print(s[0])       # first character
print(s[-1])      # last character
print(s[0:4])     # index 0, 1, 2, 3
print(s[4:])      # from index 4 to the end
print(s[::-1])    # step -1: reversed
print(len(s))     # number of characters
```

```output
B
U
BENG
ALURU
URULAGNEB
9
```

The string methods you will use most:

```python
name = "  ravi KUMAR  "
print(name.strip())              # remove spaces at both ends
print(name.strip().title())      # Ravi Kumar
print(name.lower())              # all small letters (spaces kept)
print("a,b,c".split(","))        # cut text into a list
print("-".join(["2026", "10", "14"]))  # glue a list into one text
print("chai".replace("c", "k"))  # replace every c
print("chai".find("a"))          # index of first "a", or -1 if missing
print("ai" in "chai")            # is it inside?
print("chai".startswith("ch"))
```

```output
ravi KUMAR
Ravi Kumar
  ravi kumar  
['a', 'b', 'c']
2026-10-14
khai
2
True
True
```

Strings never change in place:

```python
city = "mysuru"
city.upper()        # makes "MYSURU" and throws it away
print(city)         # still small letters
city = city.upper() # keep the new string by giving it the name again
print(city)
```

```output
mysuru
MYSURU
```

## Time and space

| Operation | Time | Why |
| --- | --- | --- |
| `len(s)`, `s[i]` | O(1) | Length is stored; index jumps straight there |
| `s[a:b]` slice | O(b − a) | Copies those characters |
| `x in s`, `s.find(x)` | O(n) | Scans the text |
| `s + t` | O(len(s) + len(t)) | Builds a new string |
| `"".join(parts)` | O(total length) | Builds once |
| `s.upper()`, `s.replace(...)` | O(n) | New string of the same size |

## Common mistakes

- `"5" + 5` fails: you cannot add text and a number. Use `int("5") + 5` or `"5" + str(5)`.
- Forgetting that `/` gives a float: `10 / 2` is `5.0`, not `5`. Use `//` when you want a whole number.
- Calling `s.upper()` and expecting `s` to change. Strings never change. Save the result.
- `s[len(s)]` is out of range. The last index is `len(s) - 1`, or just `s[-1]`.
- Building a long string with `+=` inside a big loop. Use a list and `"".join(...)`.

```python
# WRONG: text + number
total = "Total: " + 120
```

```output
Traceback (most recent call last):
  File "bill.py", line 2, in <module>
    total = "Total: " + 120
            ~~~~~~~~~~^~~~~
TypeError: can only concatenate str (not "int") to str
```

## Patterns that use it

- **Two pointers** on strings: check a palindrome from both ends.
- **Sliding window** on strings: longest substring without repeating characters.
- **Frequency counting**: count letters with a dictionary (anagrams).

## Practice

```practice
Turn "Kohli 82 (54)" into the strike rate 151.85 without looking at this note.
Count the vowels in "Bengaluru" with a loop and "in".
to-lower-case
length-of-last-word
defanging-an-ip-address
goal-parser-interpretation
truncate-sentence
palindrome-number
reverse-words-in-a-string
```

## Explain it back

```explain
Why does city.upper() not change city?
What is the difference between /, // and %?
Why is "".join(parts) better than += in a long loop?
```

## Flashcards

```flashcards
What index does the first character have? :: 0
What does s[-1] give? :: The last character.
What does s[1:4] include? :: Index 1, 2 and 3 (not 4).
Are strings mutable? :: No. Methods return a new string.
17 // 5 and 17 % 5? :: 3 and 2.
How do you reverse a string s? :: s[::-1]
Why is 0.1 + 0.2 not exactly 0.3? :: Floats are stored in binary, so some decimals are not exact.
```
