---
id: a13-comprehensions
title: Comprehensions
level: basic
phase: 1
week: 4
tags: [python, basics, lists, comprehensions]
estMinutes: 15
---

## What it is

A comprehension builds a new list (or dict, or set) from another one **in one line**.
`[p + 10 for p in prices]` means: "for each p in prices, put p + 10 in a new list".
Add `if` at the end to keep only some items.

## Real-life example

A shop adds ₹10 delivery to every price. Instead of rewriting the price list by hand, you say: "new list = every old price plus 10".
Another day you want only the items above ₹100. "New list = every price, but only if it is above 100."

## Picture

```text
[ p + 10      for p in prices      if p > 30 ]
  ───┬───     ─────┬──────────     ────┬────
   what to     loop over every      keep only
   put in      item (left part      these items
   the list    runs first)
```

## How it works inside

- A list comprehension is the same as a `for` loop with `append`. Python runs it a little faster, and it is shorter to read.
- Order of reading: the `for` part first, then the `if`, then the expression on the left.
- `{k: v for ...}` builds a **dict**. `{x for ...}` builds a **set**.
- `(x for ...)` in round brackets is a **generator**: it makes items one at a time and never builds the full list. Inside `sum(...)`, `max(...)` or `any(...)` you can drop the extra brackets.

## Python, step by step

```python
prices = [40, 250, 60, 120, 15]
with_delivery = [p + 10 for p in prices]         # change every item
print(with_delivery)
costly = [p for p in prices if p > 100]          # keep only some items
print(costly)

# the same as the first line, written as a loop
with_delivery2 = []
for p in prices:
    with_delivery2.append(p + 10)
print(with_delivery == with_delivery2)
```

```output
[50, 260, 70, 130, 25]
[250, 120]
True
```

Dict and set comprehensions:

```python
items = ["rice", "dal", "oil"]
lengths = {item: len(item) for item in items}   # dict: item -> length
print(lengths)
squares = {n * n for n in [1, -1, 2, -2]}        # set: duplicates dropped
print(sorted(squares))
```

```output
{'rice': 4, 'dal': 3, 'oil': 3}
[1, 4]
```

A generator inside `sum`: no list is built in memory.

```python
prices = [40, 250, 60]
print(sum(p for p in prices if p < 100))
print(any(p > 200 for p in prices))     # is at least one item above 200?
```

```output
100
True
```

Two `for` parts: read them left to right, like two nested loops.

```python
grid = [[1, 2], [3, 4], [5, 6]]
flat = [x for row in grid for x in row]   # for row in grid: for x in row: keep x
print(flat)
```

```output
[1, 2, 3, 4, 5, 6]
```

## Time and space

| Form | Time | Extra space |
| --- | --- | --- |
| `[f(x) for x in a]` | O(n) | O(n) new list |
| `{k: v for ...}` | O(n) | O(n) |
| `sum(x for x in a)` | O(n) | O(1): generator |

## Common mistakes

- Making it too clever. If you need more than one `if` or two `for`s, a normal loop is easier to read.
- Using a comprehension only for its side effect, like `[print(x) for x in a]`. Use a loop.
- Putting `if/else` in the wrong place. Filtering goes at the end: `[x for x in a if x > 0]`. Choosing a value goes at the front: `[x if x > 0 else 0 for x in a]`.
- Building a list just to sum it: `sum([x for x in a])`. Drop the square brackets.

## Patterns that use it

Everywhere, for small steps: building a DP table `[[0] * cols for _ in range(rows)]`, making an adjacency list `{node: [] for node in range(n)}`, or checking all neighbours with `any(...)`.

## Practice

```practice
Rewrite 5 loops from week 2 as comprehensions.
From a list of words, make a dict word -> number of vowels.
kids-with-the-greatest-number-of-candies
build-array-from-permutation
count-the-number-of-consistent-strings
maximum-number-of-words-found-in-sentences
squares-of-a-sorted-array
concatenation-of-array
```

## Explain it back

```explain
Rewrite [p * 2 for p in prices if p > 50] as a normal loop.
Where does the if go when you want to filter, and where when you want to choose a value?
Why is sum(x for x in a) better than sum([x for x in a])?
```

## Flashcards

```flashcards
List comprehension to double every item of a? :: [x * 2 for x in a]
Keep only positive numbers? :: [x for x in a if x > 0]
Replace negatives with 0? :: [x if x > 0 else 0 for x in a]
Dict comprehension word -> length? :: {w: len(w) for w in words}
What is (x for x in a)? :: A generator: it makes items one by one, without building a list.
Correct way to make a 3x4 grid of zeros? :: [[0] * 4 for _ in range(3)]
```
