---
id: a06-loops
title: Loops
level: basic
phase: 1
week: 2
tags: [python, basics, loops]
estMinutes: 20
---

## What it is

A loop repeats a block of code.
A `for` loop goes through **each item** of a list, a string or a `range` of numbers.
A `while` loop repeats **as long as** a condition stays true.

## Real-life example

A ticket checker walks through a train, coach by coach: S1, S2, S3... At each coach, the same job: check tickets.
That is a `for` loop over the list of coaches.
A tea stall keeps making chai **while** there is milk left. That is a `while` loop.

## Picture

```text
coaches = ["S1", "S2", "S3"]

for coach in coaches:
        │
        ├─ round 1: coach = "S1"  → run the block
        ├─ round 2: coach = "S2"  → run the block
        ├─ round 3: coach = "S3"  → run the block
        └─ no items left          → loop ends, go to the next line
```

## How it works inside

- `for x in thing:` asks `thing` for its items **one at a time**. Each round, the name `x` points to the next item.
- `range(5)` gives 0, 1, 2, 3, 4. `range(1, 6)` gives 1 to 5. `range(10, 0, -2)` gives 10, 8, 6, 4, 2. A `range` does not build a list in memory; it makes numbers as needed.
- `enumerate(items)` gives (index, item) pairs. `zip(a, b)` walks two lists together.
- `break` leaves the loop at once. `continue` skips to the next round.
- A `while` loop checks its condition **before** every round. If the condition never becomes False, the loop never ends.

## Python, step by step

Add up a bill (the "accumulator" pattern: start at 0, add each item):

```python
prices = [40, 25, 60, 15]
total = 0                 # start the running total at 0
for p in prices:          # p is 40, then 25, then 60, then 15
    total = total + p     # add this price to the running total
print(total)
```

```output
140
```

Find the largest without `max()`:

```python
runs = [45, 82, 13, 67]
best = runs[0]            # assume the first one is the best so far
for r in runs[1:]:        # check the rest
    if r > best:          # found a bigger one?
        best = r          # remember it
print(best)
```

```output
82
```

Index and item together with `enumerate`, two lists together with `zip`:

```python
coaches = ["S1", "S2", "S3"]
for i, c in enumerate(coaches):          # i = 0, 1, 2
    print(i, c)

items = ["rice", "dal"]
prices = [60, 120]
for item, price in zip(items, prices):   # pairs: (rice, 60), (dal, 120)
    print(f"{item}: ₹{price}")
```

```output
0 S1
1 S2
2 S3
rice: ₹60
dal: ₹120
```

`range` patterns:

```python
print(list(range(5)))           # 0 up to 4
print(list(range(1, 6)))        # 1 up to 5
print(list(range(10, 0, -3)))   # count down in steps of 3
```

```output
[0, 1, 2, 3, 4]
[1, 2, 3, 4, 5]
[10, 7, 4, 1]
```

`while`, `break` and `continue`:

```python
milk = 3                      # litres
cups = 0
while milk > 0:               # repeat while there is milk
    milk -= 0.5               # each cup uses half a litre
    cups += 1
print(cups, "cups")

for n in [3, 8, -1, 5]:
    if n < 0:
        print("stop at", n)
        break                 # leave the loop now
    if n % 2 == 0:
        continue              # skip even numbers
    print("odd:", n)
```

```output
6 cups
odd: 3
stop at -1
```

Loops inside loops (a nested loop):

```python
for row in range(1, 4):
    line = ""
    for col in range(row):      # row 1 -> 1 star, row 2 -> 2 stars...
        line += "*"
    print(line)
```

```output
*
**
***
```

## Time and space

| Loop | Time | Notes |
| --- | --- | --- |
| One loop over n items | O(n) | each round is O(1) work |
| Loop inside a loop, both over n | O(n²) | 1,000 items → 1,000,000 rounds |
| `range(n)` itself | O(1) memory | numbers are made one by one |
| `list(range(n))` | O(n) memory | builds a real list |

## Common mistakes

- **Off by one**: `range(1, 10)` stops at 9. Use `range(1, 11)` for 1 to 10.
- Changing a list (adding or removing) while looping over it. Loop over a copy (`for x in items[:]`) or build a new list.
- A `while` loop whose condition never becomes False. Make sure something inside the loop moves you towards the end.
- Writing `for i in range(len(items)):` and then only using `items[i]`. Just write `for item in items:`.
- Putting `total = 0` **inside** the loop. It resets every round.

## Patterns that use it

All array patterns are loops: **prefix sum** (running total), **two pointers** (a `while left < right` loop), **sliding window** (grow and shrink in one loop), **BFS** (`while queue:`).

## Practice

```practice
Print 1 to 10, then the even numbers up to 50, then the 7 times table.
Count the vowels in a sentence.
Print the digits of 4096 in reverse using while and % 10.
running-sum-of-1d-array
richest-customer-wealth
count-odd-numbers-in-an-interval-range
find-numbers-with-even-number-of-digits
count-of-matches-in-tournament
sum-of-all-odd-length-subarrays
```

## Explain it back

```explain
What is the difference between a for loop and a while loop? When would you pick each?
What numbers does range(2, 11, 3) give, and why?
Why does a loop inside a loop over n items cost about n × n steps?
```

## Flashcards

```flashcards
What does range(1, 6) give? :: 1, 2, 3, 4, 5 (the end is not included).
What does enumerate give? :: (index, item) pairs.
break vs continue? :: break leaves the loop. continue skips to the next round.
Cost of a loop inside a loop, both over n items? :: O(n²)
Where should total = 0 go when summing in a loop? :: Before the loop, not inside it.
```
