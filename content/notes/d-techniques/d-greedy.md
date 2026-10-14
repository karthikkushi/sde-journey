---
id: d-greedy
title: Greedy algorithms
level: core
phase: 3
week: 34
tags: [dsa, greedy]
estMinutes: 30
---

## What it is

A greedy algorithm makes the choice that looks **best right now**, and never goes back.
It is simple and fast, but it is only correct for some problems.
The skill is knowing **when** greedy is safe, and being able to explain why.

## Real-life example

Giving change at a shop with ₹10, ₹5, ₹2 and ₹1 coins: always give the biggest coin that fits. For these coins it always uses the fewest coins.
But with coins ₹1, ₹3 and ₹4, for ₹6 greedy gives 4 + 1 + 1 (three coins), while 3 + 3 (two coins) is better. Same idea, different coins: greedy breaks.

## Picture

```text
 Jump Game II: fewest jumps to reach the end of [2, 3, 1, 1, 4]

 index:  0   1   2   3   4
 jump:   2   3   1   1   4
         └─from 0 you can reach 1..2 (level 1)
             from level 1 the farthest reach is 1+3 = 4 (level 2) → the end
 answer: 2 jumps        (like BFS levels, but with just two numbers)
```

## How it works inside

**When is greedy correct?** Two common arguments:
- **Exchange argument**: take any best answer. If it does not use the greedy choice, swap that choice in. It is no worse. So some best answer uses the greedy choice.
- **Stays ahead**: after every step, the greedy answer is at least as good as any other answer so far.

**Typical greedy shapes**
- **Sort first**, then take items in that order (by end time, by size, by deadline).
- **Track the farthest reach** (jump game).
- **Reset on failure** (gas station: if the tank goes negative, start again after this point).
- **Last position of each letter** (partition labels).

**When greedy fails**, the problem usually needs **DP**: choices interact, and a good choice now can block a better one later (coin change with odd coins, 0/1 knapsack).

**Always test** a greedy idea on a few small, tricky inputs before trusting it.

## Python, step by step

Fewest jumps (Jump Game II):

```python
def min_jumps(nums):
    jumps = current_end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])   # best reach from this "level"
        if i == current_end:                    # we must jump now
            jumps += 1
            current_end = farthest
    return jumps

print(min_jumps([2, 3, 1, 1, 4]), min_jumps([2, 3, 0, 1, 4]))
```

```output
2 2
```

Gas station and partition labels:

```python
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1                               # not enough fuel overall
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:                            # cannot reach i + 1 from start
            start, tank = i + 1, 0              # so no station up to i can be the start
    return start

def partition_labels(s):
    last = {ch: i for i, ch in enumerate(s)}    # last position of every letter
    sizes, start, end = [], 0, 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])                # this part must reach at least here
        if i == end:                            # every letter seen so far ends here
            sizes.append(end - start + 1)
            start = i + 1
    return sizes

print(can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]))
print(partition_labels("ababcbacadefegdehijhklij"))
```

```output
3
[9, 7, 8]
```

Where greedy fails, and DP is right:

```python
def greedy_coins(coins, amount):
    count = 0
    for c in sorted(coins, reverse=True):       # biggest coin first
        count += amount // c
        amount %= c
    return count if amount == 0 else -1

def dp_coins(coins, amount):
    best = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                best[a] = min(best[a], best[a - c] + 1)
    return best[amount]

print(greedy_coins([1, 2, 5, 10], 18), dp_coins([1, 2, 5, 10], 18))   # normal coins: same
print(greedy_coins([1, 3, 4], 6), dp_coins([1, 3, 4], 6))              # odd coins: greedy loses
```

```output
4 4
3 2
```

## Time and space

| Problem | Time | Space |
| --- | --- | --- |
| Jump game / jump game II | O(n) | O(1) |
| Gas station | O(n) | O(1) |
| Partition labels | O(n) | O(alphabet) |
| Sort-then-greedy problems | O(n log n) | O(1) to O(n) |

## Common mistakes

- Trusting a greedy idea without trying to break it with a small example.
- Sorting by the wrong key (start instead of end).
- Using greedy for 0/1 knapsack or coin change with arbitrary coins (needs DP).
- Not explaining **why** it works in an interview. Say the exchange argument in one or two sentences.

## Patterns that use it

**Greedy** (jump game, gas station, partition labels, hand of straights), **intervals** (sort by end), **two pointers** (boats to save people), **heaps** (task scheduler, IPO), and **MST** (Kruskal and Prim are greedy).

## Practice

```practice
assign-cookies
jump-game
jump-game-ii
gas-station
partition-labels
hand-of-straights
two-city-scheduling
valid-parenthesis-string
```

## Explain it back

```explain
Explain the exchange argument in your own words.
Why does greedy give the best change with ₹10, 5, 2, 1 coins but not with 1, 3, 4?
In Gas Station, why can we skip every start up to i when the tank goes negative at i?
```

## Flashcards

```flashcards
What is a greedy algorithm? :: Take the best-looking choice now; never undo it.
How do you prove greedy correct? :: Exchange argument, or "greedy stays ahead".
When does greedy fail? :: When an early choice can block a better later one (often needs DP).
Jump Game II idea? :: Count levels: jump when you reach the end of the current reach.
Gas station reset rule? :: If the tank drops below 0 at i, start again at i + 1.
Coin change [1,3,4] for 6: greedy vs best? :: Greedy 3 coins (4+1+1); best 2 (3+3).
```
