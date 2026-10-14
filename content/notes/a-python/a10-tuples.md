---
id: a10-tuples
title: Tuples
level: basic
phase: 1
week: 4
tags: [python, basics, tuples]
estMinutes: 10
---

## What it is

A tuple is like a list that **cannot change**: `(12.97, 77.59)`.
You make it once and only read from it.
Because it cannot change, a tuple can be a **dictionary key** or go into a **set**. A list cannot.

## Real-life example

The location of your favourite dosa shop: latitude and longitude. The shop does not move, so the pair should never change.
A date of birth: (day, month, year). Fixed for life.
Use a tuple for a small group of values that belong together and should stay as they are.

## Picture

```text
 list  [ 12.97 | 77.59 ]   ← you can change, add, remove
 tuple ( 12.97 | 77.59 )🔒 ← read only. Safe to use as a key.
          [0]     [1]
```

## How it works inside

- A tuple stores arrows to its items, like a list, but the row is **fixed size** and **cannot be changed**.
- Reading `t[i]` is O(1), the same as a list.
- A tuple can be **hashed** (turned into a fixed number) if all its items can. That is what dicts and sets need (see Dictionaries).
- Comparing or sorting tuples goes **item by item**: first items first; if equal, then second items, and so on. This makes "sort by runs, then by name" easy.
- **Packing and unpacking**: `point = 3, 4` packs two values into a tuple. `x, y = point` unpacks them. Functions use this to return two values.

## Python, step by step

```python
shop = (12.97, 77.59)           # latitude, longitude
lat, lon = shop                 # unpack into two names
print(lat, lon)
print(shop[0])                  # indexing works like a list
point = 3, 4                    # the brackets are optional
print(type(point), point)
single = (5,)                   # one item needs a comma
not_tuple = (5)                 # this is just the number 5 in brackets
print(type(single), type(not_tuple))
```

```output
12.97 77.59
12.97
<class 'tuple'> (3, 4)
<class 'tuple'> <class 'int'>
```

A tuple as a dictionary key: perfect for grid positions `(row, col)`:

```python
visited = {}
visited[(0, 1)] = True          # (row, col) as a key
visited[(2, 3)] = True
print((0, 1) in visited, (1, 1) in visited)
```

```output
True False
```

Sorting tuples compares the first item, then the second:

```python
players = [("Rohit", 45), ("Virat", 82), ("Gill", 45)]
print(sorted(players))                               # by name (first item)
print(sorted(players, key=lambda p: (-p[1], p[0])))  # runs high to low, then name A to Z
```

```output
[('Gill', 45), ('Rohit', 45), ('Virat', 82)]
[('Virat', 82), ('Gill', 45), ('Rohit', 45)]
```

## Time and space

| Operation | Time |
| --- | --- |
| `t[i]` | O(1) |
| `len(t)` | O(1) |
| `x in t` | O(n) |
| `hash(t)` | O(n) the first time |
| compare two tuples | O(n) worst case |

A tuple uses a little less memory than a list with the same items.

## Common mistakes

- `(5)` is not a tuple. Write `(5,)`.
- Trying to change a tuple:

```python
# WRONG: tuples cannot be changed
shop = (12.97, 77.59)
shop[0] = 13.0
```

```output
Traceback (most recent call last):
  File "tuples.py", line 3, in <module>
    shop[0] = 13.0
    ~~~~^^^
TypeError: 'tuple' object does not support item assignment
```

- Unpacking the wrong number of values: `a, b = (1, 2, 3)` fails with `ValueError`.

## Patterns that use it

- **Graph BFS on a grid**: the queue holds `(row, col)` tuples; `visited` is a set of tuples.
- **Heaps**: push `(priority, item)` tuples; the heap sorts by the first item.
- **Intervals**: `(start, end)` pairs, sorted by start.

## Practice

```practice
Store 3 shops as (name, lat, lon) tuples in a list. Print the shop names sorted by latitude.
Write min_max(nums) that returns (smallest, largest). Unpack the result.
sort-the-people
height-checker
relative-sort-array
k-closest-points-to-origin
```

## Explain it back

```explain
Why can a tuple be a dictionary key but a list cannot?
How does Python compare (45, "Gill") and (45, "Rohit")?
When would you choose a tuple instead of a list?
```

## Flashcards

```flashcards
Can you change a tuple after making it? :: No. Tuples are immutable.
How do you write a tuple with one item? :: (5,)  with a comma.
Why use (row, col) tuples in grid problems? :: They can be dict keys and set items.
How are tuples compared? :: Item by item, from the left.
What is unpacking? :: x, y = (3, 4) gives x = 3 and y = 4.
```
