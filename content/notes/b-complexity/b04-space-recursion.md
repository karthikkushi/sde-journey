---
id: b04-space-recursion
title: Space and the recursion stack
level: basic
phase: 1
week: 6
tags: [complexity, space, recursion]
estMinutes: 15
---

## What it is

**Space complexity** is how the **extra memory** grows as the input grows.
Usually we do not count the input itself, only what your code adds (new lists, dicts, tables).
Recursion uses hidden memory too: every call that is waiting sits on the **call stack**.

## Real-life example

Reversing the order of plates on a shelf.
- **O(1) extra space**: swap the first and last plate, then the second and second-last, and so on. You only need your two hands.
- **O(n) extra space**: take every plate down onto a second table, then put them back in reverse. You need a whole extra table.

## Picture

```text
 recursion: sum_to(4) = 4 + sum_to(3)

 call stack at the deepest point (each box is one waiting call)
   ┌──────────────┐
   │ sum_to(0)  → 0 │   ← base case
   │ sum_to(1)  1+? │
   │ sum_to(2)  2+? │
   │ sum_to(3)  3+? │
   │ sum_to(4)  4+? │
   └──────────────┘
 depth 5 → O(n) space, even though no list was made
```

## How it works inside

- Count what grows with n: a new list of n items is O(n); a 2D table of n × m is O(n·m); a fixed number of variables is O(1).
- **Recursion depth** = the most calls waiting at the same time. Space is O(depth), because each waiting call keeps a frame.
- A recursive function on a **balanced tree** has depth O(log n). On a long chain (a linked list, or a very unbalanced tree), depth is O(n).
- Python stops at about 1,000 frames deep (`RecursionError`). For deep inputs, use a loop.
- Many DP solutions can drop from O(n) space to O(1) by keeping only the last one or two answers.
- Time and space often trade off: a hash set spends O(n) space to save time (O(n²) → O(n)).

## Python, step by step

O(1) extra space vs O(n) extra space:

```python
def reverse_in_place(a):           # O(1) extra: two pointers and swaps
    left, right = 0, len(a) - 1
    while left < right:
        a[left], a[right] = a[right], a[left]
        left += 1
        right -= 1
    return a

def reversed_copy(a):              # O(n) extra: builds a new list
    return a[::-1]

print(reverse_in_place([1, 2, 3, 4]), reversed_copy([1, 2, 3, 4]))
```

```output
[4, 3, 2, 1] [4, 3, 2, 1]
```

Recursion uses O(depth) stack space. A loop does not:

```python
import sys

def sum_to(n):                     # O(n) stack space: n calls wait at once
    if n == 0:
        return 0
    return n + sum_to(n - 1)

def sum_loop(n):                   # O(1) space
    total = 0
    for i in range(1, n + 1):
        total += i
    return total

print(sum_to(500))
print(sum_loop(100_000))           # sum_to(100_000) would hit the recursion limit
print(sys.getrecursionlimit())
```

```output
125250
5000050000
1000
```

Climbing stairs with O(1) space: keep only the last two answers:

```python
def climb(n):                      # ways to climb n steps, 1 or 2 at a time
    a, b = 1, 1                    # ways to reach step 0 and step 1
    for _ in range(n - 1):
        a, b = b, a + b            # slide forward: no list needed
    return b

print([climb(n) for n in range(1, 8)])
```

```output
[1, 2, 3, 5, 8, 13, 21]
```

## Time and space

| Code | Extra space |
| --- | --- |
| A few variables | O(1) |
| A new list / set / dict of n items | O(n) |
| A 2D table n × m | O(n·m) |
| Recursion of depth d | O(d) |
| Recursion on a balanced tree | O(log n) |
| Recursion on a linked list or skewed tree | O(n) |
| Slicing `a[1:]` in each recursive call | O(n) per call (copies!) |

## Common mistakes

- Saying a recursive function is O(1) space because it makes no lists. The stack counts.
- Slicing inside recursion (`f(a[1:])`): each call copies the list. Pass an index instead.
- Forgetting that `sorted(a)` makes a new list (O(n) space), while `a.sort()` sorts in place.
- Deep recursion in Python (10,000+ levels). Convert it to a loop with your own stack.

## Patterns that use it

- **Two pointers**: O(1) extra space for reversing, palindromes, pair sums on sorted input.
- **DP space optimisation**: from a full table to one row, or to two variables.
- **Tree DFS**: O(h) space where h is the height.
- **BFS**: O(width) space for the queue.

## Practice

```practice
Write reverse_in_place and explain why it is O(1) extra space.
Write sum_to recursively and with a loop. Try both with n = 5000. What happens?
fibonacci-number
climbing-stairs
reverse-string
reverse-linked-list
maximum-depth-of-binary-tree
```

## Explain it back

```explain
Why does recursion use memory even if you never create a list?
What is the space complexity of recursion on a balanced tree, and on a linked list?
How can climbing stairs go from O(n) space to O(1)?
```

## Flashcards

```flashcards
What does space complexity count? :: Extra memory your code uses as n grows (usually not the input).
Space of recursion with depth d? :: O(d)
Default Python recursion limit? :: About 1,000.
Space to reverse a list in place with two pointers? :: O(1) extra.
Why is f(a[1:]) in recursion costly? :: Each call copies the list: O(n) per call.
Tree DFS space? :: O(h), the height of the tree.
```
