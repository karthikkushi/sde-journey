---
id: tp-same
name: Two pointers (same direction / fast and slow)
group: Two pointers
---

## Clues

```clues
Remove duplicates or elements in place
Move zeroes to the end, keep the order
Linked list cycle
Middle of a linked list
Is s a subsequence of t?
```

## Idea

Both pointers move forward. A **read** pointer looks at every item. A **write** pointer marks where the next kept item goes.
For linked lists: a **slow** pointer moves 1 step and a **fast** pointer moves 2. If there is a loop, fast catches slow. When fast reaches the end, slow is in the middle.

## Template

```python
def remove_duplicates(nums):           # sorted list, in place; returns the new length
    write = 1                          # next place to write a new value
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write

class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def has_cycle(head):                   # Floyd: slow 1 step, fast 2 steps
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:               # they meet only if there is a loop
            return True
    return False

nums = [1, 1, 2, 3, 3, 3, 4]
k = remove_duplicates(nums)
print(k, nums[:k])
a, b, c = ListNode(1), ListNode(2), ListNode(3)
a.next, b.next = b, c
print(has_cycle(a))
c.next = b                             # make a loop: 3 -> 2
print(has_cycle(a))
```

```output
4 [1, 2, 3, 4]
False
True
```

## Walkthrough: Move Zeroes

1. `write` starts at 0.
2. For each item: if it is not zero, put it at `write` and move `write` forward.
3. Fill everything from `write` to the end with zeros. Order is kept, O(n), O(1) space.

## Traps

- Starting `write` at the wrong place (0 vs 1).
- In the cycle check, test `fast and fast.next` before moving, or you get `None.next`.
- Comparing node **values** instead of the nodes themselves (`is`).
