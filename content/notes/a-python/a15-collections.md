---
id: a15-collections
title: collections (Counter, defaultdict, deque)
level: basic
phase: 2
week: 9
tags: [python, collections, counter, deque, hashing]
estMinutes: 20
---

## What it is

`collections` is a built-in module with ready-made containers.
**Counter** counts things. **defaultdict** gives missing keys a starting value. **deque** is a fast queue: add and remove at **both** ends in O(1).
These three save you many lines in DSA problems.

## Real-life example

- **Counter**: an election booth counting votes for each candidate.
- **defaultdict(list)**: a teacher sorting answer sheets into piles by section. A new section gets a new empty pile automatically.
- **deque**: the queue at a railway ticket counter. People join at the back and are served at the front.

## Picture

```text
deque (double-ended queue)

 appendleft ─▶ [ VIP | Asha | Meena ] ◀─ append
 popleft    ◀─                        ─▶ pop
                   all four: O(1)

 A normal list: append/pop at the end are O(1),
                but insert(0, x) / pop(0) are O(n).
```

## How it works inside

- **Counter** is a dict whose values are counts. A missing key counts as 0 (no `KeyError`).
- **defaultdict(factory)** is a dict that calls `factory()` the first time you read a missing key: `list()` gives `[]`, `int()` gives `0`, `set()` gives an empty set.
- **deque** is built from linked blocks of memory, so both ends are cheap. Reading the **middle** (`d[i]`) is slower than a list: O(n).
- **namedtuple** makes a tuple whose items have names: `shop.rating` instead of `shop[1]`.

## Python, step by step

Counter:

```python
from collections import Counter
votes = ["dosa", "idli", "dosa", "vada", "dosa", "idli"]
count = Counter(votes)                 # counts every item in one line
print(count)
print(count["dosa"], count["poori"])   # a missing item counts as 0
print(count.most_common(2))            # the top 2
```

```output
Counter({'dosa': 3, 'idli': 2, 'vada': 1})
3 0
[('dosa', 3), ('idli', 2)]
```

```python
from collections import Counter
print(Counter("listen") == Counter("silent"))   # same letters, same counts: anagrams
print(Counter("aab") - Counter("ab"))           # subtract counts
```

```output
True
Counter({'a': 1})
```

defaultdict:

```python
from collections import defaultdict
groups = defaultdict(list)            # a missing key starts as []
for word in ["eat", "tea", "tan", "ate", "nat"]:
    key = "".join(sorted(word))       # anagrams share the same sorted letters
    groups[key].append(word)          # no need to check "if key in groups"
print(dict(groups))
```

```output
{'aet': ['eat', 'tea', 'ate'], 'ant': ['tan', 'nat']}
```

deque:

```python
from collections import deque
queue = deque(["Ravi", "Asha"])    # people at a ticket counter
queue.append("Meena")              # joins at the back: O(1)
first = queue.popleft()            # served from the front: O(1)
print(first, list(queue))
queue.appendleft("VIP")            # add at the front: O(1)
print(list(queue))
last3 = deque(maxlen=3)            # keeps only the newest 3 items
for score in [10, 20, 30, 40]:
    last3.append(score)
print(list(last3))
```

```output
Ravi ['Asha', 'Meena']
['VIP', 'Asha', 'Meena']
[20, 30, 40]
```

namedtuple:

```python
from collections import namedtuple
Shop = namedtuple("Shop", ["name", "rating"])
s = Shop("Vidyarthi Bhavan", 4.6)
print(s.name, s.rating)            # read by name instead of s[0], s[1]
```

```output
Vidyarthi Bhavan 4.6
```

## Time and space

| Operation | Time |
| --- | --- |
| `Counter(items)` | O(n) |
| `c[x]`, `c[x] += 1` | O(1) |
| `c.most_common(k)` | O(n log k) |
| `defaultdict` read/write | O(1), like a dict |
| `deque.append`, `appendleft`, `pop`, `popleft` | O(1) |
| `deque[i]` (middle) | O(n) |

## Common mistakes

- Using a list as a queue with `pop(0)`. Each `pop(0)` is O(n). Use `deque.popleft()`.
- Reading a defaultdict key "just to check" creates it. Use `if key in d` to check.
- Forgetting `from collections import Counter`.
- Expecting `Counter.most_common()` ties in a special order. Ties keep the order they were first seen.

## Patterns that use it

- **Frequency counting**: Counter for anagrams, majority element, top K.
- **Grouping**: defaultdict(list) for group anagrams, adjacency lists.
- **BFS**: deque as the queue (`popleft`).
- **Monotonic queue**: deque for sliding window maximum.

## Practice

```practice
Count the letters in your full name with Counter. Print the 3 most common.
Simulate a ticket counter: 5 people join, 2 are served, 1 VIP joins at the front.
first-unique-character-in-a-string
valid-anagram
find-the-difference
majority-element
number-of-recent-calls
group-anagrams
top-k-frequent-elements
```

## Explain it back

```explain
Why is deque.popleft() better than list.pop(0)?
What does defaultdict(list) do when you read a key that is missing?
How would you check if two words are anagrams with Counter?
```

## Flashcards

```flashcards
Count items in a list in one line? :: Counter(items)
Counter for a missing key? :: 0, no KeyError.
Top 2 most common items? :: Counter(items).most_common(2)
What does defaultdict(list) give for a missing key? :: A new empty list.
Cost of deque.popleft()? :: O(1)
Cost of list.pop(0)? :: O(n)
Best queue for BFS in Python? :: collections.deque
```
