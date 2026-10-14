---
id: k-edge-cases
title: Edge case checklist
level: core
phase: 2
week: 26
tags: [interview, testing, problem-solving]
estMinutes: 15
---

## What it is

**Edge cases** are the unusual inputs where code most often breaks: empty, one item, duplicates, negatives, very large values.
Checking them before the interviewer asks is one of the clearest signals of a careful engineer, and it is also how you avoid production bugs.

## Real-life example

A lift is tested not only with 3 people going from floor 2 to 5, but with nobody inside, the maximum load, someone pressing the current floor, and a power cut. Normal cases prove it works; edge cases prove it is safe.

## Picture

```text
 ARRAYS / STRINGS     empty · one item · two items · all the same · duplicates · already sorted ·
                      reverse sorted · negatives · zeros · very large n · spaces / capital letters
 NUMBERS              0 · 1 · negative · very big · division by zero · integer vs float
 LINKED LISTS         empty · one node · cycle · change the head
 TREES                empty · one node · only left children (a "line") · duplicates in a BST
 GRAPHS               disconnected parts · cycles · self-loop · single node · no edges
 OUTPUT               no answer exists? several answers? what to return?
```

## How it works inside

- **Ask first**: many edge cases are really questions. "If there is no second largest, should I return None?"
- **Handle at the top**: an early `if not nums: return ...` guard keeps the main logic clean.
- **Test aloud after coding**: dry run one normal case, then 2–3 edge cases from the checklist.
- **Pick by structure**: the checklist above, by data type, is enough for almost every problem.
- In real work these become **unit tests**, so the bug can never come back.

## Python, step by step

A first attempt at "second largest" looks fine on the normal case:

```python
def second_largest(nums):              # first attempt
    return sorted(nums)[-2]

def second_largest_fixed(nums):        # after asking: "second largest DISTINCT value, None if missing"
    distinct = sorted(set(nums))
    return distinct[-2] if len(distinct) >= 2 else None

CASES = {"normal": [3, 1, 2], "max repeated": [5, 5, 3], "all same": [4, 4],
         "one item": [7], "empty": [], "negatives": [-1, -5, -3]}

for fn in (second_largest, second_largest_fixed):
    print(fn.__name__)
    for name, nums in CASES.items():
        try:
            result = fn(nums)
        except Exception as e:
            result = type(e).__name__
        print(f"  {name:<13} {str(nums):<12} -> {result}")
```

```output
second_largest
  normal        [3, 1, 2]    -> 2
  max repeated  [5, 5, 3]    -> 5
  all same      [4, 4]       -> 4
  one item      [7]          -> IndexError
  empty         []           -> IndexError
  negatives     [-1, -5, -3] -> -3
second_largest_fixed
  normal        [3, 1, 2]    -> 2
  max repeated  [5, 5, 3]    -> 3
  all same      [4, 4]       -> None
  one item      [7]          -> None
  empty         []           -> None
  negatives     [-1, -5, -3] -> -3
```

Two crashes and two wrong answers, all caught by the checklist, none by the normal case.

## Time and space

| Habit | Cost | Benefit |
| --- | --- | --- |
| Ask 2–3 edge questions up front | 1 minute | no surprise rewrites |
| Guard clauses at the top | 1–2 lines | simpler main logic |
| Test 3 edge cases aloud | 3 minutes | catch bugs before the interviewer |

## Common mistakes

- Only testing the example from the problem statement.
- Fixing an edge case with a special `if` deep inside a loop instead of a guard at the top.
- Assuming input is valid and sorted without asking.
- Forgetting "no answer" and "many answers" cases.

## Patterns that use it

Every pattern; unit tests and testing (backend notes).

## Practice

```practice
remove-duplicates-from-sorted-array
merge-two-sorted-lists
binary-search
For each of these 3, write the edge cases from the checklist before coding.
Take a problem you solved last week and add 5 edge-case asserts. Did any fail?
```

## Explain it back

```explain
List the edge cases for arrays from memory.
Why are many edge cases really clarifying questions?
Where should edge case handling go in your code?
What edge cases matter for graphs?
```

## Flashcards

```flashcards
Top 3 array edge cases? :: Empty, one item, all duplicates.
Graph edge cases? :: Disconnected parts, cycles, self-loops, single node.
Tree edge cases? :: Empty, one node, a skewed "line" tree.
Where to handle edge cases? :: In guard clauses at the top of the function.
Edge cases in real work become? :: Unit tests.
```
