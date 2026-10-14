---
id: bits
name: Bit tricks
group: Bits
---

## Clues

```clues
Every number appears twice except one (XOR)
Count the 1 bits
Is n a power of two?
Subsets as bitmasks (n up to about 20)
Add two numbers without + (sum of two integers)
```

## Idea

Numbers are stored in binary. A few tricks cover most problems:
- `a ^ a = 0` and `a ^ 0 = a`: XOR cancels pairs.
- `n & (n - 1)` removes the lowest 1 bit.
- `n & 1` is the last bit (odd or even). `n >> 1` divides by 2. `1 << k` is 2ᵏ.

```text
11      = 1011
11 - 1  = 1010
11 & 10 = 1010    (the lowest 1 bit is gone)
```

## Template

```python
def single_number(nums):
    x = 0
    for n in nums:
        x ^= n               # pairs cancel: a ^ a = 0
    return x

def count_ones(n):
    count = 0
    while n:
        n &= n - 1           # remove the lowest 1 bit
        count += 1
    return count

def is_power_of_two(n):
    return n > 0 and n & (n - 1) == 0

print(single_number([4, 1, 2, 1, 2]), count_ones(11), bin(11), is_power_of_two(64), is_power_of_two(12))
```

```output
4 3 0b1011 True False
```

## Walkthrough: Counting Bits

1. `bits[i]` = number of 1s in i.
2. `i >> 1` is i without its last bit, and that was already computed.
3. So `bits[i] = bits[i >> 1] + (i & 1)`. O(n) total.

## Traps

- Python integers have no fixed size, and negative numbers act as if they have endless 1s on the left. For problems that assume 32 bits, mask with `& 0xFFFFFFFF`.
- `n & 1 == 0` means `n & (1 == 0)` in some languages. In Python, `&` binds tighter than `==`, but add brackets anyway: `(n & 1) == 0`.
- Using bit tricks where a set or a simple loop is clearer.
