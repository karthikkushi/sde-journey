---
id: c-segment-fenwick
title: Segment tree and Fenwick tree
level: advanced
phase: 3
week: 37
tags: [dsa, segment-tree, fenwick, range-query]
estMinutes: 30
---

## What it is

Both answer **range questions** ("sum of items 2 to 6") while the array **keeps changing**.
Prefix sums answer fast but updating one item costs O(n). These trees do **both** in O(log n).
A **Fenwick tree** (binary indexed tree) is short and handles sums. A **segment tree** is longer but handles sum, min, max and more.

## Real-life example

A shop chain with 8 branches reports sales every hour. The owner keeps asking "total sales of branches 3 to 7?" while sales keep changing.
A segment tree is like an org chart of area managers: each manager knows the total for their area, so any range is covered by a few managers' numbers instead of every branch.

## Picture

```text
 segment tree for sums of [5, 2, 9, -3]           (each box = total of its range)

                 [0..3] = 13
                /           \
        [0..1] = 7         [2..3] = 6
         /      \           /      \
     [0]=5    [1]=2     [2]=9    [3]=-3

 query sum [1..3] = [1] + [2..3] = 2 + 6 = 8      (2 boxes, not 3 items)
 update [2] → walk up and fix [2..3] and [0..3]   (log n boxes)
```

## How it works inside

**Segment tree**
- A binary tree over index ranges. Each node stores the answer (sum, min...) for its range. Leaves are single items.
- **Query** a range: if a node's range is fully inside, use its value; if outside, ignore it; if partly inside, ask both children. Touches O(log n) nodes.
- **Update** one item: change the leaf, then fix the nodes on the path to the root: O(log n).
- Stored in a list of size about 4n, children of node `i` at `2i` and `2i + 1`.

**Fenwick tree (BIT)**
- A list `tree[1..n]` where `tree[i]` covers a block that ends at i. The block length is `i & -i` (the lowest 1 bit of i).
- **Prefix sum** of the first i: add `tree[i]`, then jump `i -= i & -i`, until 0.
- **Add** to item i: add to `tree[i]`, then jump `i += i & -i`.
- Both are O(log n), and the code is about 10 lines. It works for things that can be "undone" by subtraction (sums, counts), not for min/max ranges.

Interview note: these appear in harder problems. Know what they do and when to use them; be able to write a Fenwick tree.

## Python, step by step

Fenwick tree for range sums with updates:

```python
class Fenwick:
    def __init__(self, n):
        self.tree = [0] * (n + 1)          # 1-based inside

    def add(self, i, delta):               # nums[i] += delta  (i is 0-based)
        i += 1
        while i < len(self.tree):
            self.tree[i] += delta
            i += i & -i                    # jump to the next block that covers i

    def prefix(self, i):                   # sum of nums[0..i-1]
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & -i                    # jump to the previous block
        return s

    def range_sum(self, l, r):             # sum of nums[l..r], inclusive
        return self.prefix(r + 1) - self.prefix(l)

nums = [5, 2, 9, -3, 6]
fw = Fenwick(len(nums))
for i, x in enumerate(nums):
    fw.add(i, x)
print(fw.range_sum(1, 3), fw.range_sum(0, 4))
fw.add(2, -9)                              # nums[2] becomes 0
print(fw.range_sum(1, 3))
```

```output
8 19
-1
```

Segment tree for range minimum with updates:

```python
class MinSegmentTree:
    def __init__(self, nums):
        self.n = len(nums)
        self.t = [0] * (4 * self.n)
        self._build(nums, 1, 0, self.n - 1)

    def _build(self, nums, node, lo, hi):
        if lo == hi:
            self.t[node] = nums[lo]                         # a leaf: one item
            return
        mid = (lo + hi) // 2
        self._build(nums, 2 * node, lo, mid)
        self._build(nums, 2 * node + 1, mid + 1, hi)
        self.t[node] = min(self.t[2 * node], self.t[2 * node + 1])

    def update(self, i, value, node=1, lo=0, hi=None):
        hi = self.n - 1 if hi is None else hi
        if lo == hi:
            self.t[node] = value
            return
        mid = (lo + hi) // 2
        if i <= mid:
            self.update(i, value, 2 * node, lo, mid)
        else:
            self.update(i, value, 2 * node + 1, mid + 1, hi)
        self.t[node] = min(self.t[2 * node], self.t[2 * node + 1])   # fix on the way up

    def query(self, l, r, node=1, lo=0, hi=None):                    # min of nums[l..r]
        hi = self.n - 1 if hi is None else hi
        if r < lo or hi < l:
            return float("inf")                             # no overlap
        if l <= lo and hi <= r:
            return self.t[node]                             # fully inside
        mid = (lo + hi) // 2
        return min(self.query(l, r, 2 * node, lo, mid), self.query(l, r, 2 * node + 1, mid + 1, hi))

st = MinSegmentTree([5, 2, 9, -3, 6])
print(st.query(0, 2), st.query(2, 4))
st.update(3, 10)
print(st.query(2, 4))
```

```output
2 -3
6
```

## Time and space

| Structure | Build | Range query | Point update | Space |
| --- | --- | --- | --- | --- |
| Prefix sums | O(n) | O(1) | O(n) | O(n) |
| Fenwick tree | O(n log n) (or O(n)) | O(log n) | O(log n) | O(n) |
| Segment tree | O(n) | O(log n) | O(log n) | O(4n) |

## Common mistakes

- Mixing 0-based and 1-based indexes in a Fenwick tree.
- Using a Fenwick tree for range min/max (it needs subtraction to answer ranges).
- Segment tree array too small (use 4n).
- Reaching for these when there are no updates. Plain prefix sums are simpler.

## Patterns that use it

Range queries with updates (range sum query mutable), counting things to the left/right (count of smaller numbers after self, by indexing values), and calendar/booking problems.

## Practice

```practice
range-sum-query-mutable
count-of-smaller-numbers-after-self
my-calendar-i
range-sum-query-immutable
```

## Explain it back

```explain
Why are prefix sums bad when items change often?
How does a segment tree answer a range query by touching only a few nodes?
What does i & -i give, and why does the Fenwick tree jump by it?
```

## Flashcards

```flashcards
Problem solved by segment/Fenwick trees? :: Range queries while items keep changing.
Query and update cost? :: O(log n) each.
Fenwick jump to the next block? :: i += i & -i (and i -= i & -i for prefix sums).
Can a Fenwick tree do range minimum? :: Not directly. Use a segment tree.
Segment tree array size? :: About 4n.
```
