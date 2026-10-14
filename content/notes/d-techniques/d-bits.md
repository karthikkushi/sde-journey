---
id: d-bits
title: Bit manipulation
level: core
phase: 3
week: 35
tags: [dsa, bits, xor]
estMinutes: 30
---

## What it is

Computers store numbers in **binary**: 13 is `1101` (8 + 4 + 0 + 1).
Bit operators work on those 0s and 1s directly: AND `&`, OR `|`, XOR `^`, NOT `~`, shift left `<<`, shift right `>>`.
A few tricks solve whole problems in O(1) extra space.

## Real-life example

A row of 8 light switches in a classroom. You can describe all of them with one number: 1 for on, 0 for off. "Turn on switch 3" or "is switch 5 on?" are bit operations. That is exactly how file permissions in Linux (`rwx` = `111` = 7) work.

## Picture

```text
       8 4 2 1
 13 =  1 1 0 1
  6 =  0 1 1 0
 ─────────────────
 13 & 6 = 0 1 0 0 = 4    both 1
 13 | 6 = 1 1 1 1 = 15   either 1
 13 ^ 6 = 1 0 1 1 = 11   different
 13 << 1 = 11010 = 26    × 2
 13 >> 1 =  110  = 6     ÷ 2 (rounded down)
```

## How it works inside

**XOR rules** (the most useful): `a ^ a = 0`, `a ^ 0 = a`, and order does not matter. So XOR-ing a list cancels every pair.

**Tricks to remember**
- `n & 1` → last bit (1 means odd).
- `n & (n - 1)` → removes the lowest 1 bit. Loop it to count 1 bits. `n & (n - 1) == 0` (and n > 0) → power of two.
- `n & -n` → keeps only the lowest 1 bit (used in Fenwick trees).
- `x >> i & 1` → bit i of x. `x | (1 << i)` sets it. `x & ~(1 << i)` clears it. `x ^ (1 << i)` flips it.

**Negative numbers**: computers use **two's complement** (−x = ~x + 1). In C# or Java an `int` has 32 bits. Python integers have **no fixed size**, so negatives behave as if they had endless 1s on the left. For 32-bit problems in Python, mask with `& 0xFFFFFFFF` and convert back when the top bit is set.

**Adding without +**: XOR gives the sum without carries; `(a & b) << 1` gives the carries. Repeat until no carry.

## Python, step by step

See the bits:

```python
print(bin(13), bin(6), 13 & 6, 13 | 6, 13 ^ 6, 13 << 1, 13 >> 1)
print(format(5, "08b"), int("1101", 2))         # 8 digits wide, and binary text -> number
```

```output
0b1101 0b110 4 15 11 26 6
00000101 13
```

XOR cancels pairs: the single number, and the missing number:

```python
from functools import reduce
from operator import xor

def single_number(nums):
    return reduce(xor, nums)                     # every pair cancels; the single one is left

def missing_number(nums):                        # numbers 0..n with one missing
    x = len(nums)
    for i, v in enumerate(nums):
        x ^= i ^ v                               # XOR all indexes and all values
    return x

print(single_number([4, 1, 2, 1, 2]), missing_number([3, 0, 1]), missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]))
```

```output
4 2 8
```

Counting 1 bits, one by one and for a whole range:

```python
def count_ones(n):
    count = 0
    while n:
        n &= n - 1                               # drop the lowest 1 bit
        count += 1
    return count

def count_bits_upto(n):                          # bits[i] = number of 1s in i
    bits = [0] * (n + 1)
    for i in range(1, n + 1):
        bits[i] = bits[i >> 1] + (i & 1)         # i without its last bit, plus the last bit
    return bits

print(count_ones(11), count_ones(128), count_bits_upto(5))
```

```output
3 1 [0, 1, 1, 2, 1, 2]
```

Add two numbers without `+`, with 32-bit rules:

```python
def add(a, b):
    MASK = 0xFFFFFFFF                            # keep 32 bits, like a C# int
    while b & MASK:
        carry = (a & b) << 1                     # where both bits are 1, a carry moves left
        a = a ^ b                                # sum without the carries
        b = carry
    a &= MASK
    return a if a <= 0x7FFFFFFF else ~(a ^ MASK) # turn a 32-bit negative back into Python's form

print(add(5, 7), add(-2, 3), add(-5, -6))
```

```output
12 1 -11
```

## Time and space

| Operation | Time |
| --- | --- |
| `&`, `|`, `^`, `<<`, `>>` on normal-size ints | O(1) |
| Count 1 bits with `n & (n - 1)` | O(number of 1 bits) |
| Count bits for 0..n | O(n) |
| XOR a list | O(n) time, O(1) space |

## Common mistakes

- Precedence: `n & 1 == 0` means `n & (1 == 0)` in some languages. In Python `&` binds before `==`, but write `(n & 1) == 0` anyway.
- Forgetting that Python has no 32-bit overflow. Mask when the problem expects 32 bits.
- `~x` in Python is `-x - 1` (not "flip 32 bits").
- Using bit tricks where clear code would do. Readability first.

## Patterns that use it

**Bit tricks** (single number, missing number, counting bits, reverse bits, power of two, sum of two integers), **bitmask DP**, subsets as masks, **Fenwick trees** (`i & -i`).

## Practice

```practice
single-number
number-of-1-bits
counting-bits
reverse-bits
missing-number
power-of-two
sum-of-two-integers
reverse-integer
```

## Explain it back

```explain
Why does XOR-ing a whole list leave only the number that appears once?
What does n & (n - 1) do, and how does that help count 1 bits?
Why do 32-bit problems need a mask in Python?
```

## Flashcards

```flashcards
a ^ a and a ^ 0? :: 0 and a.
Remove the lowest 1 bit? :: n & (n - 1)
Power of two check? :: n > 0 and n & (n - 1) == 0
Keep only the lowest 1 bit? :: n & -n
Bit i of x? :: (x >> i) & 1
13 in binary? :: 1101
```
