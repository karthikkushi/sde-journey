---
id: a09-lists
title: Lists
level: basic
phase: 1
week: 1
tags: [python, basics, lists, arrays, memory]
estMinutes: 30
---

## What it is

A list is an **ordered row of items**: `[40, 25, 60]`.
Each item has a position called an **index**, starting at **0**.
You can change a list: add, remove and replace items.

## Real-life example

A train. The coaches are in a fixed order: S1, S2, S3, S4. Coach number 0 is right behind the engine.
To find coach 3, you do not walk through 0, 1, 2. You know exactly where it stands, so you go straight there. That is why `coaches[3]` is fast.
But to add a new coach **right behind the engine**, every other coach must shift back by one. That is slow.

## Picture

A Python list does not hold the items themselves. It holds a row of **arrows** (references) to the items. The row has some **extra free room** at the end.

```svg
<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a09h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="accent"/></marker></defs>
  <rect x="10" y="14" width="80" height="34" rx="17" class="hi"/>
  <text x="50" y="36" text-anchor="middle">coaches</text>
  <rect x="110" y="8" width="240" height="46" rx="8" class="box"/>
  <text x="122" y="28">list object</text>
  <text x="122" y="45" class="muted">length = 3, room for 4</text>
  <path d="M90 31H106" class="arrow" marker-end="url(#a09h)"/>
  <text x="110" y="80" class="muted">row of arrows, side by side in memory</text>
  <rect x="110" y="88" width="60" height="40" class="box"/>
  <rect x="170" y="88" width="60" height="40" class="box"/>
  <rect x="230" y="88" width="60" height="40" class="box"/>
  <rect x="290" y="88" width="60" height="40" class="box" stroke-dasharray="4 3"/>
  <text x="320" y="113" text-anchor="middle" class="muted">free</text>
  <text x="140" y="146" text-anchor="middle" class="muted">0</text>
  <text x="200" y="146" text-anchor="middle" class="muted">1</text>
  <text x="260" y="146" text-anchor="middle" class="muted">2</text>
  <text x="320" y="146" text-anchor="middle" class="muted">3</text>
  <path d="M140 108V186M200 108V186M260 108V186" class="arrow" marker-end="url(#a09h)"/>
  <rect x="110" y="190" width="60" height="40" rx="6" class="hi"/><text x="140" y="215" text-anchor="middle">"S1"</text>
  <rect x="170" y="190" width="60" height="40" rx="6" class="hi"/><text x="200" y="215" text-anchor="middle">"S2"</text>
  <rect x="230" y="190" width="60" height="40" rx="6" class="hi"/><text x="260" y="215" text-anchor="middle">"S3"</text>
  <text x="10" y="215" class="muted">the items:</text>
</svg>
```

## How it works inside

**Reading `coaches[i]` is instant.** The arrows sit side by side, each 8 bytes. Python computes "start + 8 × i" and jumps there. It does not matter if the list has 10 items or 10 million: O(1).

**`append` is usually instant.** If there is free room at the end, Python puts the new arrow there. O(1).

**When the room runs out**, Python asks for a **bigger block** of memory (about 1.125 times bigger, plus a little), copies all the arrows over, and frees the old block. That one append is slow (O(n)). But it happens rarely, because each time the list grows by a good amount. On average, append is still O(1). This is called **amortized O(1)** (see the Amortized note). Try the List resize visualizer.

**`insert(0, x)` is slow.** All arrows must move one step right to make space at the front. O(n). Same for `pop(0)`: everything moves one step left.

**`x in my_list` is slow.** Python checks items one by one from the start. O(n). If you need many "is it there?" checks, use a set or a dict.

**`b = a` does not copy.** It is a second name for the same list (see Variables and memory). `a.copy()`, `a[:]` or `list(a)` make a new list. These are **shallow** copies: the new list has new arrows, but they point to the same items. For a list of lists, the inner lists are still shared.

## Python, step by step

The everyday operations:

```python
coaches = ["S1", "S2", "S3"]     # a list of 3 strings
print(coaches[0])                # first item: index 0
print(coaches[-1])               # last item: index -1
coaches.append("S4")             # add at the end (fast)
print(coaches)
coaches.insert(0, "ENGINE")      # add at the front (slow: everything shifts right)
print(coaches)
last = coaches.pop()             # remove the last item and give it back (fast)
print(last, coaches)
first = coaches.pop(0)           # remove the first item (slow: everything shifts left)
print(first, coaches)
print(len(coaches), "S2" in coaches)   # length, and a membership check (scans the list)
```

```output
S1
S3
['S1', 'S2', 'S3', 'S4']
['ENGINE', 'S1', 'S2', 'S3', 'S4']
S4 ['ENGINE', 'S1', 'S2', 'S3']
ENGINE ['S1', 'S2', 'S3']
3 True
```

Slicing makes a **new** list from a part of the old one:

```python
nums = [10, 20, 30, 40, 50]
print(nums[1:4])     # index 1, 2, 3 (4 is not included)
print(nums[:2])      # the first two
print(nums[-2:])     # the last two
print(nums[::2])     # every second item
print(nums[::-1])    # a reversed copy
nums[1:3] = [99]     # replace a slice: the list can shrink or grow
print(nums)
```

```output
[20, 30, 40]
[10, 20]
[40, 50]
[10, 30, 50]
[50, 40, 30, 20, 10]
[10, 99, 40, 50]
```

Copy or not a copy:

```python
a = [1, 2, 3]
b = a            # same list, two names
c = a.copy()     # a new list with the same items (a[:] and list(a) do the same)
a.append(4)
print(b)         # b sees the change
print(c)         # c does not
```

```output
[1, 2, 3, 4]
[1, 2, 3]
```

The grid trap. `[[0] * 3] * 3` makes **one** inner list and three arrows to it:

```python
grid = [[0] * 3] * 3                 # 3 arrows to the SAME inner list
grid[0][0] = 1
print(grid)                          # every row changed!
good = [[0] * 3 for _ in range(3)]   # 3 separate inner lists
good[0][0] = 1
print(good)
```

```output
[[1, 0, 0], [1, 0, 0], [1, 0, 0]]
[[1, 0, 0], [0, 0, 0], [0, 0, 0]]
```

`sorted()` gives a new list. `.sort()` changes the list and gives back `None`:

```python
marks = [67, 45, 82]
print(sorted(marks))     # new sorted list
print(marks)             # unchanged
result = marks.sort()    # sorts marks itself
print(result, marks)     # .sort() returns None
```

```output
[45, 67, 82]
[67, 45, 82]
None [45, 67, 82]
```

See the list grow its memory now and then (the numbers depend on your Python version):

```python
import sys
items = []
last_size = sys.getsizeof(items)
for i in range(20):
    items.append(i)
    size = sys.getsizeof(items)
    if size != last_size:              # it just moved to a bigger block
        print(f"after {len(items):2} items: {size} bytes")
        last_size = size
```

You will see the size jump only on some appends, not on every one. That is amortized O(1) in action.

## Time and space

| Operation | Time | Why |
| --- | --- | --- |
| `a[i]`, `a[i] = x` | O(1) | jump straight to slot i |
| `len(a)` | O(1) | the length is stored |
| `a.append(x)` | O(1) amortized | free room at the end; rare resize |
| `a.pop()` (last) | O(1) | nothing moves |
| `a.insert(0, x)`, `a.pop(0)` | O(n) | every item shifts |
| `a.insert(i, x)`, `a.pop(i)` | O(n − i) | items after i shift |
| `x in a`, `a.index(x)`, `a.remove(x)` | O(n) | scan from the start |
| `a[i:j]` | O(j − i) | copies that part |
| `a.copy()`, `a[:]` | O(n) | copies every arrow |
| `min(a)`, `max(a)`, `sum(a)` | O(n) | looks at every item |
| `a.sort()`, `sorted(a)` | O(n log n) | Timsort |

Space: a list of n items uses O(n) memory (the arrows plus the items).

## Common mistakes

- **Index out of range.** A list of 3 items has indexes 0, 1, 2:

```python
# WRONG: the last index of a 3-item list is 2
coaches = ["S1", "S2", "S3"]
print(coaches[3])
```

```output
Traceback (most recent call last):
  File "lists.py", line 3, in <module>
    print(coaches[3])
          ~~~~~~~^^^
IndexError: list index out of range
```

- Thinking `b = a` copies the list.
- `[[0] * 3] * 3` for a grid. Use a comprehension.
- `x = my_list.sort()` and then using `x`. It is `None`.
- Adding or removing items while looping over the same list.
- Using `insert(0, x)` or `pop(0)` in a big loop. Use `collections.deque` for a queue.
- Using `in` on a big list many times. Use a set.

## Patterns that use it

Almost all of them: **two pointers**, **sliding window**, **prefix sum**, **binary search** (on a sorted list), **monotonic stack** (a list used as a stack), and **DP** (the table is a list).

## Practice

```practice
By hand: sum of a list, largest number, reverse a list (without [::-1]), count words in a sentence, palindrome check.
Predict the output of the grid trap before running it. Then explain it to a friend.
concatenation-of-array
build-array-from-permutation
shuffle-the-array
create-target-array-in-the-given-order
decompress-run-length-encoded-list
remove-element
merge-sorted-array
```

## Explain it back

```explain
Why is reading coaches[1000] just as fast as coaches[0]?
What happens in memory when append finds no free room?
Why is insert(0, x) slow but append(x) fast?
What is the difference between b = a and b = a.copy()?
```

## Flashcards

```flashcards
What does a Python list store inside? :: A row of references (arrows) to the items, side by side in memory.
Cost of a[i]? :: O(1)
Cost of append? :: O(1) amortized (rare resize copies everything).
Cost of insert(0, x) or pop(0)? :: O(n): every item shifts.
Cost of x in a_list? :: O(n): it scans.
Does b = a copy a list? :: No. a.copy(), a[:] or list(a) make a (shallow) copy.
What does .sort() return? :: None. It sorts the list in place.
Right way to make a 3x3 grid of zeros? :: [[0] * 3 for _ in range(3)]
```
