---
id: ll-reverse
name: Linked list reversal
group: Linked lists
---

## Clues

```clues
Reverse a linked list, or a part of it
Reorder list (first, last, second, second-last...)
Palindrome linked list
Reverse nodes in groups of k
```

## Idea

Walk the list once. At each node, turn its arrow around to point back. Keep three names: `prev`, `head` and `nxt`, so you never lose the rest of the list.

```text
before:  None   1 → 2 → 3 → None
after:   None ← 1 ← 2 ← 3        (3 is the new head)
```

## Template

```python
class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def reverse(head):
    prev = None
    while head:
        nxt = head.next          # 1. remember the rest
        head.next = prev         # 2. point back
        prev = head              # 3. move prev forward
        head = nxt               # 4. move head forward
    return prev                  # prev is the new head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

head = ListNode(1, ListNode(2, ListNode(3, ListNode(4))))
print(to_list(reverse(head)))
```

```output
[4, 3, 2, 1]
```

## Walkthrough: Reorder List

1. Find the middle with slow and fast pointers.
2. Reverse the second half.
3. Merge the two halves, one node from each, alternating.

## Traps

- Doing step 2 before step 1 in the loop: you lose the rest of the list.
- Returning `head` (now `None`) instead of `prev`.
- For "reverse between m and n", use a **dummy node** before the head, so the edge case "m = 1" is not special.
