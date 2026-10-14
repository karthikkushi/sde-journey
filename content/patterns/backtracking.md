---
id: backtracking
name: Backtracking
group: Backtracking
---

## Clues

```clues
All subsets, permutations or combinations
Generate all valid ... (parentheses, IP addresses)
n is small (about 20 or less)
Place items with rules (N-Queens, Sudoku)
Find a word in a grid
```

## Idea

Build the answer one choice at a time: **choose**, **explore**, **un-choose**. When a path is complete (or clearly bad), go back and try the next choice. Draw the decision tree on paper before coding.

```text
                    []
           [1]      [2]     [3]
       [1,2] [1,3]  [2,3]
   [1,2,3]
```

## Template

```python
def subsets(nums):
    result, path = [], []
    def backtrack(start):
        result.append(path[:])              # every path is a subset: save a COPY
        for i in range(start, len(nums)):
            path.append(nums[i])            # choose
            backtrack(i + 1)                # explore
            path.pop()                      # un-choose
    backtrack(0)
    return result

def permutations(nums):
    result, path, used = [], [], [False] * len(nums)
    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if not used[i]:
                used[i] = True
                path.append(nums[i])
                backtrack()
                path.pop()
                used[i] = False
    backtrack()
    return result

print(subsets([1, 2, 3]))
print(permutations([1, 2, 3]))
```

```output
[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
```

## Walkthrough: Combination Sum

1. Sort the candidates.
2. `backtrack(start, remaining)`: if `remaining == 0`, save the path.
3. For each candidate from `start`: if it is bigger than `remaining`, stop (sorted). Otherwise choose it and recurse with the **same** `start` (numbers can repeat), then un-choose.

## Traps

- Saving `path` instead of `path[:]`: every saved answer becomes the same (empty) list.
- Duplicates in the input (Subsets II): sort, then skip `nums[i] == nums[i - 1]` when `i > start`.
- Forgetting to un-choose.
