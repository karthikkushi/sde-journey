---
id: prefix
name: Prefix sum
group: Arrays and hashing
---

## Clues

```clues
Sum of a range i..j, asked many times
Subarray sum equals K (numbers can be negative)
Running total or running balance
Equal number of 0s and 1s (turn 0 into -1, look for sum 0)
Product of array except self (prefix and suffix products)
```

## Idea

`prefix[i]` = sum of the first i numbers. Then the sum of `nums[i..j]` is `prefix[j+1] - prefix[i]`, in O(1).
With a dict of "prefix sums seen so far", you can count subarrays that sum to K in one pass.

```text
nums:     3   1   4   1   5
prefix: 0   3   4   8   9   14
sum of nums[1..3] = prefix[4] - prefix[1] = 9 - 3 = 6
```

## Template

```python
def build_prefix(nums):
    prefix = [0]                          # prefix[i] = sum of the first i numbers
    for x in nums:
        prefix.append(prefix[-1] + x)
    return prefix

def range_sum(prefix, i, j):              # sum of nums[i..j], both included
    return prefix[j + 1] - prefix[i]

def count_subarrays_with_sum(nums, k):
    seen = {0: 1}                         # prefix value -> how many times seen
    total = count = 0
    for x in nums:
        total += x
        count += seen.get(total - k, 0)   # an earlier prefix k smaller = a subarray summing to k
        seen[total] = seen.get(total, 0) + 1
    return count

p = build_prefix([3, 1, 4, 1, 5])
print(p, range_sum(p, 1, 3), count_subarrays_with_sum([1, 1, 1], 2))
```

```output
[0, 3, 4, 8, 9, 14] 6 2
```

## Walkthrough: Subarray Sum Equals K

1. Keep a running total and a dict of how many times each total has appeared.
2. At each step, a subarray ending here sums to K if some earlier total was `total - k`.
3. Add that count to the answer, then record the current total.
4. Start the dict with `{0: 1}` so subarrays starting at index 0 are counted.

## Traps

- The prefix list has n + 1 items. Off-by-one is the classic bug.
- Forgetting `{0: 1}`.
- Using a sliding window when numbers can be negative. The window logic breaks; prefix sums do not.
