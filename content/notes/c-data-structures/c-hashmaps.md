---
id: c-hashmaps
title: Hash maps and sets
level: core
phase: 2
week: 9
tags: [dsa, hashing, dict, set]
estMinutes: 25
---

## What it is

A hash map stores **key → value** pairs and finds a key in about O(1). A hash set stores only keys.
Inside, a **hash function** turns the key into a slot number in a table.
Python's `dict` and `set` are hash maps. So are C#'s `Dictionary` and `HashSet`.

## Real-life example

A railway parcel office with 8 numbered shelves. The clerk has a rule: "add up the digits of the parcel number, take the last digit, use that shelf." To find a parcel, use the same rule and go to one shelf. If two parcels get the same shelf, they sit next to each other there: that is a **collision**.

## Picture

```text
 hash("rice") % 8 = 3      table (8 buckets, chaining)
 hash("dal")  % 8 = 1        0: []
 hash("oil")  % 8 = 4        1: [dal → 120]
 hash("salt") % 8 = 4        2: []
                             3: [rice → 60]
                             4: [oil → 180, salt → 20]   ← collision: a short list
                             5..7: []
```

## How it works inside

- **Hash function**: same key → same number, every time (while the program runs). Good hash functions spread keys evenly.
- **Slot** = `hash(key) % table_size`.
- **Collisions** are normal. Two common fixes:
  - **Chaining**: each slot holds a small list (the picture above; Java's HashMap does this).
  - **Open addressing**: if the slot is taken, try another slot by a fixed rule (Python's dict does this).
- **Load factor** = items ÷ slots. When it gets high (Python: about 2/3), the table **grows** and every key is placed again. Rare, so inserts stay O(1) amortized.
- Keys must be **hashable**: their hash must never change. So keys are immutable (str, int, tuple, frozen dataclass), not lists or dicts.
- Worst case is O(n) (everything in one slot). Average is O(1). Interviews accept "O(1) average".
- A hash map has **no order by value**. If you need "the smallest key" or "keys in a range", use sorting, a heap, or a balanced tree.

## Python, step by step

A small hash map with chaining, the same shape as LeetCode's "Design HashMap":

```python
class HashMap:
    def __init__(self, capacity=4):
        self.buckets = [[] for _ in range(capacity)]   # each bucket: a list of [key, value]
        self.size = 0

    def _bucket(self, key):
        return self.buckets[hash(key) % len(self.buckets)]

    def put(self, key, value):
        bucket = self._bucket(key)
        for pair in bucket:
            if pair[0] == key:              # key already here: update it
                pair[1] = value
                return
        bucket.append([key, value])
        self.size += 1
        if self.size > 0.75 * len(self.buckets):   # too full: grow
            self._resize()

    def get(self, key, default=None):
        for k, v in self._bucket(key):
            if k == key:
                return v
        return default

    def remove(self, key):
        bucket = self._bucket(key)
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.size -= 1
                return

    def _resize(self):
        pairs = [pair for bucket in self.buckets for pair in bucket]
        self.buckets = [[] for _ in range(len(self.buckets) * 2)]
        for k, v in pairs:                  # the table size changed, so every key moves
            self._bucket(k).append([k, v])

m = HashMap()
for item, price in [("rice", 60), ("dal", 120), ("oil", 180), ("salt", 20)]:
    m.put(item, price)
m.put("rice", 65)
m.remove("oil")
print(m.get("rice"), m.get("oil"), m.get("salt"), m.size, len(m.buckets))
```

```output
65 None 20 3 8
```

Your own objects as keys: make them immutable (frozen):

```python
from dataclasses import dataclass

@dataclass(frozen=True)              # frozen = cannot change, so Python can hash it
class Seat:
    coach: str
    number: int

booked = {Seat("S1", 23): "Ravi"}
print(booked[Seat("S1", 23)], Seat("S1", 23) in booked, Seat("S2", 23) in booked)
```

```output
Ravi True False
```

The "seen before" trick turns O(n²) into O(n):

```python
def first_repeat(items):
    seen = set()
    for x in items:
        if x in seen:            # O(1) on average
            return x
        seen.add(x)
    return None

print(first_repeat(["dosa", "idli", "vada", "idli", "dosa"]))
```

```output
idli
```

## Time and space

| Operation | Average | Worst |
| --- | --- | --- |
| insert / lookup / delete | O(1) | O(n) |
| resize (rare) | O(n) once | |
| iterate all keys | O(n) | O(n) |
| "smallest key" | O(n) | O(n): not what hash maps are for |

Space: O(n), plus some empty slots.

## Common mistakes

- Using a list (or a normal mutable object) as a key.
- Expecting sorted order from a dict or set. Dicts keep insertion order, not sorted order. Sets keep no promised order.
- Using `d[key]` when the key may be missing. Use `d.get(key, default)`, `defaultdict` or `Counter`.
- Forgetting that `x in d.values()` is O(n).
- Thinking O(1) means "free". Hashing a long string costs O(length).

## Patterns that use it

**Frequency counting**, **two sum / seen-before**, **prefix sum + hash map**, **grouping** (anagrams), **graph adjacency lists**, **memoization** in DP, **LRU cache** (dict + linked list).

## Practice

```practice
contains-duplicate
valid-anagram
two-sum
ransom-note
isomorphic-strings
group-anagrams
top-k-frequent-elements
longest-consecutive-sequence
```

## Explain it back

```explain
Explain hashing with the parcel office example.
What is a collision, and what are two ways to handle it?
Why does a hash table grow, and why does that keep inserts O(1) on average?
Why must keys be immutable?
```

## Flashcards

```flashcards
Average cost of lookup in a hash map? :: O(1)
Worst case of a hash map lookup? :: O(n), when many keys collide.
Chaining vs open addressing? :: Chaining keeps a list per slot; open addressing tries other slots.
What is the load factor? :: Items divided by slots. When high, the table grows.
Can a list be a dict key? :: No. Keys must be hashable (immutable).
Need the smallest key often? :: Not a hash map job. Use a heap or sorting.
```
