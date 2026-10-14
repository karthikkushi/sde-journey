---
id: c-lru-design
title: LRU cache and design problems
level: core
phase: 2
week: 25
tags: [dsa, design, hashing, linked-list]
estMinutes: 30
---

## What it is

An **LRU cache** (least recently used) keeps a limited number of items. When it is full, it throws away the item that was used **longest ago**.
Both `get` and `put` must be O(1). The trick: a **dict** (find any key fast) + a **doubly linked list** (keep the order of use, move/remove any node fast).
LRU is the most famous **design** problem: you write a class whose methods must meet a time limit.

## Real-life example

Your phone's "recent apps" list holds a few apps. Opening an app moves it to the front. When memory is full, the app you have not opened for the longest time is closed.
A tiffin rack with 5 slots works the same: the box nobody has touched for longest goes back first.

## Picture

```text
 dict:  key → node                     doubly linked list (most recent on the right)
   1 ─────────────────┐
   3 ───────────┐     │      head ⇄ [2] ⇄ [3] ⇄ [1] ⇄ tail
   2 ──────┐    │     │             oldest            newest
           ▼    ▼     ▼
 get(3): find the node via the dict (O(1)), unlink it, put it before tail (O(1))
 put when full: remove the node after head (the oldest) and its dict key
```

## How it works inside

- **Dict** maps key → node, so finding a key is O(1).
- **Doubly linked list** keeps usage order. With `prev` and `next` arrows, a node can be removed from anywhere in O(1), and appended at the end in O(1).
- Two **dummy nodes** (`head` and `tail`) remove all the edge cases (empty list, removing the first or last node).
- `get(key)`: if present, move its node to the end (most recent) and return the value.
- `put(key, value)`: update or insert at the end; if over capacity, remove the node right after `head` (least recent) and delete its key from the dict.
- In Python, `collections.OrderedDict` already does both jobs (`move_to_end`, `popitem(last=False)`). Interviewers often ask for the manual version too.

**How to approach any design problem**
1. List the operations and the required time for each.
2. Pick the structure for each need (fast lookup → dict; order → list/linked list/heap; sorted → heap or bisect).
3. Write down the **invariant** (what is always true), for example "the list is ordered from least to most recent".
4. Code the helpers first (`_remove`, `_append`), then the public methods.
5. Test with a small sequence of calls, including the eviction case.

## Python, step by step

The short version with `OrderedDict`:

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)           # now the most recent
        return self.data[key]

    def put(self, key, value):
        self.data[key] = value
        self.data.move_to_end(key)
        if len(self.data) > self.capacity:
            self.data.popitem(last=False)     # remove the least recent (the front)

c = LRUCache(2)
c.put(1, 1)
c.put(2, 2)
out = [c.get(1)]
c.put(3, 3)                                   # evicts key 2
out.append(c.get(2))
c.put(4, 4)                                   # evicts key 1
out += [c.get(1), c.get(3), c.get(4)]
print(out)
```

```output
[1, -1, -1, 3, 4]
```

The manual version: dict + doubly linked list with dummy ends:

```python
class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.map = {}                         # key -> Node
        self.head, self.tail = Node(), Node() # dummies: head.next = oldest, tail.prev = newest
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):                  # unlink a node: O(1)
        node.prev.next, node.next.prev = node.next, node.prev

    def _append(self, node):                  # put a node just before tail: O(1)
        node.prev, node.next = self.tail.prev, self.tail
        self.tail.prev.next = node
        self.tail.prev = node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._append(node)                    # mark as most recent
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._append(node)
        if len(self.map) > self.capacity:
            oldest = self.head.next
            self._remove(oldest)
            del self.map[oldest.key]          # the node remembers its key for this

c = LRUCache(2)
c.put(1, 1)
c.put(2, 2)
out = [c.get(1)]
c.put(3, 3)
out.append(c.get(2))
c.put(4, 4)
out += [c.get(1), c.get(3), c.get(4)]
print(out)
```

```output
[1, -1, -1, 3, 4]
```

## Time and space

| Operation | Time |
| --- | --- |
| get | O(1) |
| put (including eviction) | O(1) |
| Space | O(capacity) |

## Common mistakes

- Using a plain list for the order: removing from the middle is O(n).
- A **singly** linked list: you cannot unlink a node in O(1) without its `prev`.
- Forgetting to store the key in the node (needed to delete it from the dict when evicting).
- Not updating recency on `put` for an existing key.
- Forgetting the eviction case in tests.

## Patterns that use it

**Design** problems: LRU, LFU, min stack, time-based key-value store, Twitter, underground system, snapshot array, insert-delete-getRandom. They combine **hash maps** with lists, heaps or binary search.

## Practice

```practice
lru-cache
min-stack
time-based-key-value-store
design-twitter
insert-delete-getrandom-o1
lfu-cache
design-underground-system
```

## Explain it back

```explain
Why does LRU need both a dict and a doubly linked list?
What do the dummy head and tail nodes save you from?
Why must each node remember its own key?
Describe the 5-step approach to a design problem.
```

## Flashcards

```flashcards
LRU evicts which item? :: The one used longest ago.
Structures for O(1) LRU? :: A dict (key -> node) + a doubly linked list (usage order).
Python shortcut for LRU? :: OrderedDict with move_to_end and popitem(last=False).
Why doubly linked? :: To unlink any node in O(1) using prev.
Why store the key in the node? :: To delete it from the dict when evicting.
First step in any design problem? :: List the operations and the time each must take.
```
