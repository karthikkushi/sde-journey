---
id: d-math
title: Math for coding (modulo, GCD, primes, sieve, combinatorics)
level: core
phase: 3
week: 35
tags: [dsa, math, number-theory]
estMinutes: 30
---

## What it is

A small set of maths ideas appears again and again in coding problems:
**modulo** (remainders, and "give the answer mod 10⁹ + 7"), **GCD/LCM**, **prime numbers** (check one, or find all with a **sieve**), **fast power**, and **counting** (nCr).
Each one turns a slow brute force into a quick formula.

## Real-life example

- Modulo: a clock. 10 o'clock + 5 hours = 3 o'clock, because (10 + 5) % 12 = 3.
- GCD: cutting a 84 cm × 36 cm sheet of paper into the biggest equal squares with no waste: side 12 cm.
- Combinations: choosing 3 people out of 10 for a cricket committee: 120 ways.

## Picture

```text
 Euclid's GCD:   gcd(84, 36)
                  84 % 36 = 12  → gcd(36, 12)
                  36 % 12 = 0   → gcd(12, 0) = 12

 Sieve of Eratosthenes up to 30 (cross out multiples of each prime):
  2 3 ✗ 5 ✗ 7 ✗ ✗ ✗ 11 ✗ 13 ✗ ✗ ✗ 17 ✗ 19 ✗ ✗ ✗ 23 ✗ ✗ ✗ ✗ ✗ 29 ✗
```

## How it works inside

**Modulo**
- `(a + b) % m = ((a % m) + (b % m)) % m`, and the same for `*`. So you can keep numbers small at every step.
- Problems say "return the answer mod 10⁹ + 7" because the true answer is huge. 10⁹ + 7 is a prime. Python has big integers, but taking `% MOD` as you go keeps the code fast and matches C#/Java behaviour.
- Python's `%` is never negative for a positive m: `-1 % 5 == 4`.

**GCD and LCM**
- Euclid: `gcd(a, b) = gcd(b, a % b)`, until b is 0. About O(log min(a, b)) steps. `math.gcd` does it for you.
- `lcm(a, b) = a // gcd(a, b) * b`.

**Primes**
- Is n prime? Check divisors only up to √n: if n = a × b, one of them is ≤ √n. O(√n).
- All primes up to N: the **sieve** crosses out multiples of each prime, starting at p². O(N log log N), nearly linear.

**Fast power**: `x^n` with repeated squaring takes O(log n) multiplications. `pow(x, n, mod)` does it with mod built in.

**Counting**
- nCr = n! / (r! (n − r)!) = ways to choose r of n. `math.comb(n, r)`.
- Pascal's rule: `C(n, r) = C(n-1, r-1) + C(n-1, r)` (useful with mod, or as a DP table).

## Python, step by step

GCD by hand, and LCM:

```python
def gcd(a, b):
    while b:
        a, b = b, a % b              # replace (a, b) with (b, remainder)
    return a

def lcm(a, b):
    return a // gcd(a, b) * b        # divide first to keep numbers small

print(gcd(84, 36), lcm(84, 36), gcd(17, 5))
```

```output
12 252 1
```

Primes: one check, and a sieve:

```python
def is_prime(n):
    if n < 2:
        return False
    i = 2
    while i * i <= n:                # only up to the square root
        if n % i == 0:
            return False
        i += 1
    return True

def primes_upto(n):
    is_p = [True] * (n + 1)
    is_p[0] = is_p[1] = False
    p = 2
    while p * p <= n:
        if is_p[p]:
            for multiple in range(p * p, n + 1, p):   # smaller multiples were crossed already
                is_p[multiple] = False
        p += 1
    return [i for i, ok in enumerate(is_p) if ok]

print(is_prime(97), is_prime(91), primes_upto(30))
```

```output
True False [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
```

Modulo, fast power and combinations:

```python
import math

MOD = 10**9 + 7
print((10 + 5) % 12, -1 % 5)                 # clock maths; Python's % is never negative here

def fast_pow(x, n, mod):
    result = 1
    x %= mod
    while n:
        if n & 1:
            result = result * x % mod        # this bit of n is 1: multiply it in
        x = x * x % mod                      # square for the next bit
        n >>= 1
    return result

print(fast_pow(2, 100, MOD), pow(2, 100, MOD), pow(3, 200, MOD))
print(math.comb(10, 3), math.comb(52, 5), math.comb(100, 50) % MOD)
```

```output
3 4
976371285 976371285 136318165
120 2598960 538992043
```

## Time and space

| Task | Time |
| --- | --- |
| gcd(a, b) | O(log min(a, b)) |
| is_prime(n) | O(√n) |
| Sieve up to N | O(N log log N), O(N) space |
| fast power | O(log n) |
| nCr with math.comb | fast for normal sizes |

## Common mistakes

- Checking divisors up to n instead of √n.
- Forgetting 0 and 1 are not prime.
- Taking `% MOD` only at the end in C#/Java (overflow). In Python it is still slower without it.
- Computing `a * b // gcd` (bigger intermediate) instead of `a // gcd * b`.
- Integer division vs float division: use `//` for exact whole-number results.

## Patterns that use it

**Math** problems (count primes, GCD of strings, power, happy number, plus one, multiply strings), and counting answers in **DP** that must be returned mod 10⁹ + 7.

## Practice

```practice
count-primes
greatest-common-divisor-of-strings
powx-n
happy-number
plus-one
multiply-strings
pascals-triangle
reverse-integer
```

## Explain it back

```explain
Why do you only need to check divisors up to the square root?
Explain Euclid's GCD with 84 and 36.
Why do problems ask for the answer mod 10^9 + 7?
How does fast power use the bits of n?
```

## Flashcards

```flashcards
Euclid's GCD step? :: gcd(a, b) = gcd(b, a % b), stop when b is 0.
LCM from GCD? :: a // gcd(a, b) * b
Prime check limit? :: Divisors up to the square root of n.
Sieve starts crossing from? :: p * p for each prime p.
Fast modular power in Python? :: pow(x, n, mod)
nCr in Python? :: math.comb(n, r)
```
