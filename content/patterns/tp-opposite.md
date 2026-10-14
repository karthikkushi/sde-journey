---
id: tp-opposite
name: Two pointers (opposite ends)
group: Two pointers
---

## Clues

```clues
Sorted array + find a pair = two pointers
Palindrome check
Reverse in place
Container or water between two walls
3Sum: sort, fix one number, two pointers on the rest
```

## Idea

Start one pointer at each end. Look at both. Decide which pointer to move, so you never need to check that pair again. Each step throws away one option, so the whole thing is O(n).

```text
 1   3   4   6   8   11      target 10
 L                   R       1 + 11 = 12 too big  → move R left
 L               R           1 + 8  = 9  too small → move L right
     L           R           3 + 8  = 11 too big  → move R left
     L       R               3 + 6  = 9  too small → move L right
         L   R               4 + 6  = 10 found
```

## Template

```python
def pair_with_sum(nums, target):      # nums must be sorted
    left, right = 0, len(nums) - 1
    while left < right:
        s = nums[left] + nums[right]
        if s == target:
            return [left, right]
        if s < target:
            left += 1                  # need bigger: move the small end up
        else:
            right -= 1                 # need smaller: move the big end down
    return []

def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

print(pair_with_sum([1, 3, 4, 6, 8, 11], 10), is_palindrome("malayalam"))
```

```output
[2, 3] True
```

## Walkthrough: Two Sum II

1. The array is sorted, so the smallest is on the left and the biggest on the right.
2. If the pair sum is too small, the left number can never work with any right number we have left: move left.
3. If it is too big, move right.
4. Stop when they meet. O(n) time, O(1) space.

## Traps

- Using it on an unsorted array. Sort first, or use a hash map.
- `while left <= right` lets a number pair with itself.
- In 3Sum, skip duplicate values, or you return the same triplet twice.
