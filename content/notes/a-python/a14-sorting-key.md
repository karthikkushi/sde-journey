---
id: a14-sorting-key
title: Sorting and key
level: basic
phase: 1
week: 5
tags: [python, basics, sorting, lambda]
estMinutes: 15
---

## What it is

`sorted(items)` gives a **new** sorted list. `items.sort()` sorts the list **itself**.
`key=` tells Python **what to compare**: the length, the second item, the price...
`reverse=True` sorts from big to small.

## Real-life example

A cricket scorecard: sort the players by runs, highest first. If two players have the same runs, put them in A to Z order by name.
You do not change the players. You only change **what you look at** when comparing. That is the `key`.

## Picture

```text
players:        ("Rohit", 45)  ("Virat", 82)  ("Gill", 45)  ("Rahul", 82)
key = (-runs, name)
compares:       (-45, "Rohit") (-82, "Virat") (-45, "Gill") (-82, "Rahul")
sorted result:  Rahul 82  →  Virat 82  →  Gill 45  →  Rohit 45
```

## How it works inside

- Python uses **Timsort**. It is O(n log n) in the worst case and very fast on lists that are already partly sorted.
- The `key` function runs **once per item**, before sorting. Python then compares the keys, not the items.
- Python's sort is **stable**: items with equal keys keep their old order. This lets you sort by a second rule first, then by the main rule.
- `lambda p: p[1]` is a tiny function with no name. It is the same as `def get_runs(p): return p[1]`.
- Tuples compare item by item (see Tuples). So `key=lambda p: (-p[1], p[0])` means "runs high to low, then name A to Z". The minus sign flips the order for numbers.

## Python, step by step

```python
marks = [67, 45, 82, 45]
print(sorted(marks))                  # small to big, a new list
print(sorted(marks, reverse=True))    # big to small
words = ["idli", "dosa", "pongal", "vada", "upma"]
print(sorted(words))                  # A to Z
print(sorted(words, key=len))         # by length; equal lengths keep their old order
```

```output
[45, 45, 67, 82]
[82, 67, 45, 45]
['dosa', 'idli', 'pongal', 'upma', 'vada']
['idli', 'dosa', 'vada', 'upma', 'pongal']
```

Sort by two rules with a tuple key:

```python
players = [("Rohit", 45), ("Virat", 82), ("Gill", 45), ("Rahul", 82)]
ranked = sorted(players, key=lambda p: (-p[1], p[0]))   # runs high to low, then name A to Z
for name, runs in ranked:
    print(runs, name)
```

```output
82 Rahul
82 Virat
45 Gill
45 Rohit
```

The same result with two stable sorts (useful when one rule is not a number):

```python
players = [("Rohit", 45), ("Virat", 82), ("Gill", 45), ("Rahul", 82)]
players.sort(key=lambda p: p[0])                 # first by the SECOND rule: name
players.sort(key=lambda p: p[1], reverse=True)   # then by the MAIN rule: runs
print(players)
```

```output
[('Rahul', 82), ('Virat', 82), ('Gill', 45), ('Rohit', 45)]
```

Sort the keys of a dict by their values:

```python
stock = {"rice": 12, "dal": 30, "oil": 5}
for item in sorted(stock, key=stock.get):    # stock.get(item) gives the value
    print(item, stock[item])
```

```output
oil 5
rice 12
dal 30
```

## Time and space

| Operation | Time | Space |
| --- | --- | --- |
| `sorted(a)` | O(n log n) | O(n): new list |
| `a.sort()` | O(n log n) | O(n) helper memory in the worst case |
| `key=` function | +O(n) calls | O(n) to keep the keys |
| already sorted input | O(n) | Timsort notices |

## Common mistakes

- `x = a.sort()` gives `None`. Use `x = sorted(a)` or call `a.sort()` on its own line.
- Numbers saved as text sort letter by letter:

```python
# WRONG: "100" comes before "9" because "1" < "9"
print(sorted(["10", "9", "100"]))
```

```output
['10', '100', '9']
```

  Fix: `sorted(nums, key=int)`.

- Sorting a list with mixed types (`[3, "a"]`) raises `TypeError`.
- Using `reverse=True` when you need "high to low on one rule, A to Z on another". Use the minus trick in a tuple key.

## Patterns that use it

- **Intervals**: sort by start time first.
- **Two pointers**: many problems sort the array first (3Sum).
- **Greedy**: sort by end time, by size, by deadline.
- **Group anagrams**: `"".join(sorted(word))` as the key.

## Practice

```practice
Sort cricket players by runs (high first), then by name, using key=.
Sort a list of words by their last letter.
sort-the-people
sort-array-by-parity
height-checker
relative-sort-array
sort-array-by-increasing-frequency
sort-characters-by-frequency
largest-number
k-closest-points-to-origin
```

## Explain it back

```explain
What is the difference between sorted(a) and a.sort()?
What does key= do, and how many times is the key function called?
What does "stable sort" mean, and why is it useful?
```

## Flashcards

```flashcards
sorted(a) vs a.sort()? :: sorted returns a new list. .sort() changes a and returns None.
Time to sort n items? :: O(n log n)
What does key=len do? :: Compares items by their length.
Sort by runs high to low, then name A to Z? :: key=lambda p: (-p[1], p[0])
What is a stable sort? :: Equal items keep their original order.
What is a lambda? :: A tiny function with no name: lambda x: x * 2
```
