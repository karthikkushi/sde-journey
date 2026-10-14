---
id: b01-big-o
title: Big O
level: basic
phase: 1
week: 6
tags: [complexity, big-o, basics]
estMinutes: 25
---

## What it is

Big O tells you **how the work grows** when the input grows.
It ignores small details (your laptop's speed, constant factors) and keeps only the **shape** of the growth.
O(n) means: double the input, and the work roughly doubles. O(n²) means: double the input, and the work becomes about four times.

## Real-life example

- **O(1)**: Picking the first coach of a train. Same effort for 5 coaches or 25.
- **O(log n)**: Finding a word in a paper dictionary. Open the middle, decide left or right, and halve again. Even a 1,000-page book takes about 10 openings.
- **O(n)**: Checking every name in a class attendance register.
- **O(n²)**: Checking every **pair** of students to see if two share a birthday.

## Picture

```svg
<svg viewBox="0 0 360 250" xmlns="http://www.w3.org/2000/svg">
  <path d="M40 10V220H350" class="line"/>
  <text x="195" y="242" text-anchor="middle" class="muted">input size n →</text>
  <text x="14" y="120" class="muted" transform="rotate(-90 14 120)">work →</text>
  <polyline points="40,220 80,216 120,204 160,184 200,156 240,120 280,76 320,24" fill="none" stroke="var(--danger)" stroke-width="2.5"/>
  <polyline points="50,220 60,218 80,214 120,201 160,186 200,169 240,151 280,132 320,112 340,102" fill="none" stroke="var(--warn)" stroke-width="2.5"/>
  <polyline points="40,220 340,154" fill="none" stroke="var(--accent)" stroke-width="2.5"/>
  <polyline points="50,220 60,214 80,208 120,202 200,196 340,191" fill="none" stroke="var(--text)" stroke-width="2"/>
  <polyline points="40,207 340,207" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="5 4"/>
  <text x="270" y="40">O(n²)</text>
  <text x="285" y="98">O(n log n)</text>
  <text x="300" y="148">O(n)</text>
  <text x="250" y="186">O(log n)</text>
  <text x="60" y="200" class="muted">O(1)</text>
</svg>
```

How many steps for different input sizes:

| Big O | n = 10 | n = 1,000 | n = 100,000 |
| --- | --- | --- | --- |
| O(1) | 1 | 1 | 1 |
| O(log n) | about 3 | about 10 | about 17 |
| O(n) | 10 | 1,000 | 100,000 |
| O(n log n) | about 33 | about 10,000 | about 1,700,000 |
| O(n²) | 100 | 1,000,000 | 10,000,000,000 |
| O(2ⁿ) | 1,024 | impossible | impossible |

## How it works inside

How to find the Big O of code:

1. **Count the loops.** One loop over n items: O(n). A loop inside a loop: O(n²). A loop that halves n each time: O(log n).
2. **Steps in a row add up.** A loop over n, then another loop over n: O(n + n) = O(2n) = **O(n)**.
3. **Nested steps multiply.** For each of n items, do n work: O(n × n) = O(n²).
4. **Drop constants.** O(3n) is O(n). O(n/2) is O(n).
5. **Keep only the biggest term.** O(n² + n) is O(n²). For big n, the small part does not matter.
6. **Different inputs, different letters.** Looping over list a then list b is O(a + b), not O(n). A loop over a inside a loop over b is O(a × b).
7. **Hidden loops count too.** `x in my_list`, `my_list.index(x)`, `sorted(...)`, slicing and `min()` all hide loops (see the Lists note).

## Python, step by step

Three functions, three growth shapes:

```python
def first_item(items):              # O(1): one step, whatever the length
    return items[0]

def total(items):                   # O(n): one step per item
    s = 0
    for x in items:
        s += x
    return s

def has_pair_sum(items, target):    # O(n²): checks every pair
    n = len(items)
    for i in range(n):
        for j in range(i + 1, n):
            if items[i] + items[j] == target:
                return True
    return False

print(first_item([5, 9]), total([5, 9, 1]), has_pair_sum([5, 9, 1], 10))
```

```output
5 15 True
```

Count the steps of the pair loop as n grows. Ten times more input gives about a hundred times more work:

```python
def count_pair_checks(n):
    checks = 0
    for i in range(n):
        for j in range(i + 1, n):
            checks += 1
    return checks

for n in [10, 100, 1000]:
    print(n, count_pair_checks(n))
```

```output
10 45
100 4950
1000 499500
```

Halving is O(log n). A million items need only 19 halvings:

```python
def halvings(n):
    steps = 0
    while n > 1:
        n //= 2            # cut the problem in half
        steps += 1
    return steps

for n in [16, 1000, 1_000_000]:
    print(n, halvings(n))
```

```output
16 4
1000 9
1000000 19
```

The same problem, two speeds. Is there a duplicate?

```python
def has_duplicate_slow(nums):          # O(n²): compare every pair
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] == nums[j]:
                return True
    return False

def has_duplicate_fast(nums):          # O(n): one pass with a set
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False

nums = [4, 8, 15, 16, 23, 42, 8]
print(has_duplicate_slow(nums), has_duplicate_fast(nums))
```

```output
True True
```

## Time and space

| Code shape | Big O |
| --- | --- |
| A fixed number of steps | O(1) |
| Halve (or double) each round | O(log n) |
| One loop over n | O(n) |
| Sort, then one loop | O(n log n) |
| Loop inside a loop | O(n²) |
| Try every subset | O(2ⁿ) |
| Try every order | O(n!) |

## Common mistakes

- Missing hidden loops: `if x in my_list` inside a loop is O(n²), not O(n).
- Saying O(2n) or O(n + 5). Drop constants: O(n).
- Calling two separate loops O(n²). Loops one **after** the other add: O(n).
- Using n for two different inputs. Use O(a + b) or O(a × b).
- Thinking Big O is about seconds. It is about **growth**. A slow O(n) can beat a fast O(n²) only once n is big enough.

## Patterns that use it

Every pattern exists to beat a slower Big O:
- **Hash map**: O(n²) pair search → O(n).
- **Two pointers / sliding window**: O(n²) → O(n).
- **Binary search**: O(n) → O(log n).
- **Heap**: repeated sorting → O(log n) per step.
- **DP**: O(2ⁿ) → O(n²) or less.

## Practice

```practice
Write the Big O of every function you wrote in weeks 1 to 5.
For each LeetCode problem this week, write the Big O of your solution before you submit.
contains-duplicate
two-sum
running-sum-of-1d-array
search-insert-position
find-the-difference
```

## Explain it back

```explain
Explain O(1), O(n) and O(n²) with your own everyday examples.
Why do we drop constants, like O(3n) becoming O(n)?
Why is "x in my_list" inside a loop O(n²)?
What happens to O(n²) work when the input grows 10 times?
```

## Flashcards

```flashcards
What does Big O describe? :: How the work grows as the input size n grows.
O(n) + O(n) in a row? :: O(n)
Loop inside a loop over n? :: O(n²)
Halving each step? :: O(log n)
O(n² + n) simplifies to? :: O(n²)
Input grows 10x. How much more work for O(n²)? :: About 100x.
About how many halvings for 1,000,000 items? :: About 20 (log₂ of a million).
```
