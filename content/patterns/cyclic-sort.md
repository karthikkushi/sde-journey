---
id: cyclic-sort
name: Cyclic sort
group: Two pointers
---

## Clues

```clues
Numbers are in the range 1..n (or 0..n)
Find the missing or duplicate numbers in O(1) extra space
First missing positive
```

## Idea

If the numbers are 1..n, each number has a "home": value `v` belongs at index `v - 1`. Swap each number to its home. After that, any index whose value is wrong tells you a missing number (and the value there is a duplicate). O(n) time, O(1) space.

## Template

```python
def cyclic_sort(nums):                     # numbers 1..n: put each at index value - 1
    i = 0
    while i < len(nums):
        home = nums[i] - 1
        if 0 <= home < len(nums) and nums[i] != nums[home]:
            nums[i], nums[home] = nums[home], nums[i]   # send it home
        else:
            i += 1                         # already home, duplicate, or out of range
    return nums

def find_missing(nums):                    # 1..n with some missing
    cyclic_sort(nums)
    return [i + 1 for i, x in enumerate(nums) if x != i + 1]

print(cyclic_sort([3, 1, 5, 4, 2]), find_missing([4, 3, 2, 7, 8, 2, 3, 1]))
```

```output
[1, 2, 3, 4, 5] [5, 6]
```

## Walkthrough: First Missing Positive

1. Ignore numbers ≤ 0 or > n: they can never be the answer's "home".
2. Cyclic sort the rest.
3. The first index `i` where `nums[i] != i + 1` gives the answer `i + 1`. If all are home, the answer is `n + 1`.

## Traps

- Moving `i` forward after a swap. Do not: the new value at `i` may also need to move.
- Swapping when `nums[i] == nums[home]` (a duplicate): infinite loop.
- Using it when the range is not 1..n.
