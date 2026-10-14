---
id: a11-dictionaries
title: Dictionaries (hashing explained)
level: basic
phase: 1
week: 4
tags: [python, basics, dict, hashing, hash-map]
estMinutes: 30
---

## What it is

A dictionary stores **key → value** pairs: `{"rice": 60, "dal": 120}`.
You find a value by its key, not by position. And it is **fast**: about the same time for 10 keys or 10 million.
The trick that makes it fast is called **hashing**.

## Real-life example

The kirana shop price register. The shopkeeper does not read every line to find the price of dal.
Imagine a register with 26 pages, one per letter. "Dal" goes on page D. To find dal, go straight to page D.
Turning "dal" into "page D" is what a **hash function** does. Python's version is smarter, but the idea is the same.

## Picture

```svg
<svg viewBox="0 0 360 270" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="a11h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="accent"/></marker></defs>
  <rect x="10" y="20" width="76" height="36" rx="18" class="hi"/>
  <text x="48" y="43" text-anchor="middle">"rice"</text>
  <path d="M48 56V84" class="arrow" marker-end="url(#a11h)"/>
  <rect x="10" y="88" width="76" height="36" rx="6" class="box"/>
  <text x="48" y="111" text-anchor="middle">hash()</text>
  <path d="M48 124V152" class="arrow" marker-end="url(#a11h)"/>
  <text x="48" y="172" text-anchor="middle" class="muted">big number</text>
  <text x="48" y="190" text-anchor="middle" class="muted">% 8 slots</text>
  <text x="48" y="212" text-anchor="middle">= slot 2</text>
  <path d="M90 206C130 206 140 98 196 98" class="arrow" marker-end="url(#a11h)"/>
  <text x="200" y="20" class="muted">table with 8 slots</text>
  <rect x="200" y="28" width="150" height="28" class="box"/><text x="190" y="47" text-anchor="end" class="muted">0</text>
  <rect x="200" y="56" width="150" height="28" class="box"/><text x="190" y="75" text-anchor="end" class="muted">1</text>
  <rect x="200" y="84" width="150" height="28" class="hi"/><text x="190" y="103" text-anchor="end" class="muted">2</text>
  <text x="212" y="103">"rice" → 60</text>
  <rect x="200" y="112" width="150" height="28" class="box"/><text x="190" y="131" text-anchor="end" class="muted">3</text>
  <rect x="200" y="140" width="150" height="28" class="box"/><text x="190" y="159" text-anchor="end" class="muted">4</text>
  <text x="212" y="159">"dal" → 120</text>
  <rect x="200" y="168" width="150" height="28" class="box"/><text x="190" y="187" text-anchor="end" class="muted">5</text>
  <rect x="200" y="196" width="150" height="28" class="box"/><text x="190" y="215" text-anchor="end" class="muted">6</text>
  <rect x="200" y="224" width="150" height="28" class="box"/><text x="190" y="243" text-anchor="end" class="muted">7</text>
</svg>
```

## How it works inside

1. **Hash.** Python calls `hash(key)`. It turns the key into a big whole number. The same key always gives the same number (while the program runs).
2. **Pick a slot.** It takes that number modulo the table size (`% 8` above) to get a slot number.
3. **Store or find.** To store, it puts the key and value in that slot. To look up, it does steps 1 and 2 again and goes **straight** to the slot. No scanning. That is why lookups are O(1) on average.
4. **Collisions.** Two keys can land on the same slot. Python then tries other slots in a fixed order until it finds the right key or an empty slot. With a good hash, this is rare and short.
5. **Growing.** When the table gets about two-thirds full, Python makes a bigger table and puts every key in again. That is slow once, but rare, so adding keys is still O(1) **on average** (amortized, like list append).
6. **Keys must not change.** If a key changed after being stored, its hash would change and Python would look in the wrong slot. So keys must be **immutable**: strings, numbers, tuples. A list cannot be a key.
7. Since Python 3.7, a dict **remembers the order** you added keys.

Try the Dictionary buckets visualizer to watch keys land in slots.

## Python, step by step

The everyday operations:

```python
prices = {"rice": 60, "dal": 120, "sugar": 45}   # item -> price
print(prices["dal"])              # look up by key
prices["oil"] = 180               # add a new key
prices["rice"] = 65               # change an existing key
del prices["sugar"]               # remove a key
print(prices)
print("oil" in prices, "salt" in prices)   # is this key there? (fast)
print(len(prices))
```

```output
120
{'rice': 65, 'dal': 120, 'oil': 180}
True False
3
```

`.get()` does not crash when a key is missing:

```python
prices = {"rice": 60}
print(prices.get("rice"))         # found
print(prices.get("salt"))         # missing: gives None
print(prices.get("salt", 0))      # missing: gives the default you choose
```

```output
60
None
0
```

Looping over a dict:

```python
prices = {"rice": 60, "dal": 120}
for item in prices:                    # loops over the keys
    print(item)
for item, price in prices.items():     # keys and values together
    print(f"{item}: ₹{price}")
print(list(prices.keys()), list(prices.values()))
```

```output
rice
dal
rice: ₹60
dal: ₹120
['rice', 'dal'] [60, 120]
```

Counting with a dict (the **frequency counting** pattern):

```python
text = "chai coffee chai tea chai coffee"
count = {}
for word in text.split():
    count[word] = count.get(word, 0) + 1   # 0 the first time, then add 1
print(count)
```

```output
{'chai': 3, 'coffee': 2, 'tea': 1}
```

A dict turns an O(n²) search into O(n). This is LeetCode problem 1, Two Sum:

```python
def two_sum(nums, target):
    seen = {}                        # number -> its index
    for i, n in enumerate(nums):
        need = target - n            # the partner we are looking for
        if need in seen:             # O(1) check, no scanning
            return [seen[need], i]
        seen[n] = i                  # remember this number for later
    return []

print(two_sum([2, 7, 11, 15], 9))
```

```output
[0, 1]
```

The same key always gives the same hash:

```python
print(hash(42))                          # small whole numbers hash to themselves
print(hash((1, 2)) == hash((1, 2)))      # equal values give equal hashes
```

```output
42
True
```

## Time and space

| Operation | Average | Worst case |
| --- | --- | --- |
| `d[k]`, `d[k] = v`, `del d[k]` | O(1) | O(n) (many collisions, very rare) |
| `k in d`, `d.get(k)` | O(1) | O(n) |
| `len(d)` | O(1) | O(1) |
| loop over keys/items | O(n) | O(n) |
| `d.copy()` | O(n) | O(n) |

Space: O(n). A dict uses more memory than a list, because the table always keeps some empty slots.

## Common mistakes

- Reading a missing key with `[]`:

```python
# WRONG: "salt" is not a key
prices = {"rice": 60}
print(prices["salt"])
```

```output
Traceback (most recent call last):
  File "shop.py", line 3, in <module>
    print(prices["salt"])
          ~~~~~~^^^^^^^^
KeyError: 'salt'
```

  Use `prices.get("salt", 0)`, or check `if "salt" in prices` first.

- Using a list as a key:

```python
# WRONG: a list can change, so it cannot be a key
seats = {}
seats[[1, 2]] = "booked"
```

```output
Traceback (most recent call last):
  File "shop.py", line 3, in <module>
    seats[[1, 2]] = "booked"
    ~~~~~^^^^^^^^
TypeError: cannot use 'list' as a dict key (unhashable type: 'list')
```

  (Python 3.13 and older say just `TypeError: unhashable type: 'list'`.) Use a tuple: `seats[(1, 2)] = "booked"`.

- Searching the **values** with `in`: `60 in prices` checks keys, not values. `60 in prices.values()` works but scans: O(n).
- Adding or deleting keys while looping over the same dict. Loop over `list(d)` instead.

## Patterns that use it

- **Frequency counting**: anagrams, majority element, top K frequent.
- **"Seen before" map**: Two Sum, longest substring without repeating characters.
- **Prefix sum + dict**: subarray sum equals K.
- **Grouping**: group anagrams (key = sorted word).
- **Graphs**: adjacency list `{node: [neighbours]}`.
- **Memoization** in DP: `{state: answer}`.

## Practice

```practice
Kirana register: make a dict of 5 items and prices. Add one, update one, delete one, then print the total of all prices.
Count each word in a paragraph, then print the most common word.
two-sum
jewels-and-stones
number-of-good-pairs
first-unique-character-in-a-string
how-many-numbers-are-smaller-than-the-current-number
unique-number-of-occurrences
ransom-note
valid-anagram
```

## Explain it back

```explain
Explain hashing to a friend using the kirana register example.
Why is "key in my_dict" fast but "item in my_list" slow?
Why must dictionary keys be immutable?
What is a collision, and what does Python do about it?
```

## Flashcards

```flashcards
Average cost of d[key] lookup? :: O(1)
What does hash(key) do? :: Turns the key into a number that picks a slot in the table.
What is a collision? :: Two keys landing on the same slot. Python probes for another slot.
Why can a list not be a dict key? :: It can change, so its hash would change. Keys must be immutable.
How do you read a key that may be missing? :: d.get(key, default)
Does "60 in prices" check keys or values? :: Keys.
Do dicts keep insertion order? :: Yes, since Python 3.7.
```
