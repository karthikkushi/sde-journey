---
id: c-linked-lists
title: Linked lists
level: core
phase: 2
week: 15
tags: [dsa, linked-list, pointers]
estMinutes: 30
---

## What it is

A linked list is a chain of **nodes**. Each node holds a value and an arrow (`next`) to the next node.
There is no index: to reach the 5th node you walk from the head.
Adding or removing a node is cheap **once you are at the right place**: just change arrows.

## Real-life example

A treasure hunt: each clue tells you where the next clue is. To find clue 5 you must follow clues 1 to 4.
But adding a new clue between clue 2 and clue 3 is easy: change clue 2 to point to the new clue, and the new clue points to clue 3. Nothing else moves.

## Picture

```svg
<svg viewBox="0 0 360 120" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="cllh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="accent"/></marker></defs>
  <text x="10" y="18" class="muted">head</text>
  <path d="M25 22V36" class="arrow" marker-end="url(#cllh)"/>
  <rect x="10" y="40" width="44" height="36" rx="6" class="hi"/><text x="32" y="63" text-anchor="middle">1</text>
  <rect x="54" y="40" width="22" height="36" rx="4" class="box"/>
  <rect x="100" y="40" width="44" height="36" rx="6" class="hi"/><text x="122" y="63" text-anchor="middle">2</text>
  <rect x="144" y="40" width="22" height="36" rx="4" class="box"/>
  <rect x="190" y="40" width="44" height="36" rx="6" class="hi"/><text x="212" y="63" text-anchor="middle">3</text>
  <rect x="234" y="40" width="22" height="36" rx="4" class="box"/>
  <path d="M65 58H96M155 58H186M245 58H280" class="arrow" marker-end="url(#cllh)"/>
  <text x="286" y="63">None</text>
  <text x="10" y="102" class="muted">each node: value + next (the arrow). Nodes can be anywhere in memory.</text>
</svg>
```

## How it works inside

- Each node is a small object somewhere in memory. Only the arrows connect them, so they need not be side by side (unlike an array).
- **Access the k-th node**: walk k steps: O(k).
- **Insert/delete after a node you already hold**: change one or two arrows: O(1).
- **Dummy node**: a fake node placed before the head. Then "delete the head" or "build from empty" is not a special case. Return `dummy.next` at the end.
- **Fast and slow pointers**: slow moves 1 step, fast moves 2. Fast reaches the end when slow is in the middle. If there is a loop, fast catches slow.
- **Reversal**: walk once, turning each arrow back (see the Linked list reversal pattern).
- A **doubly** linked list has `prev` arrows too, so you can delete a node in O(1) given only that node. The LRU cache uses this.
- Python has no built-in singly linked list for you to use; LeetCode gives you a `ListNode` class. (`collections.deque` is built from linked blocks, but you use it as a queue.)

## Python, step by step

```python
class ListNode:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):                        # [1, 2, 3]  ->  1 -> 2 -> 3
    dummy = tail = ListNode(0)            # a fake first node keeps the loop simple
    for v in values:
        tail.next = ListNode(v)
        tail = tail.next
    return dummy.next

def to_list(head):
    out = []
    while head:                           # walk until None
        out.append(head.val)
        head = head.next
    return out

def remove_all(head, target):             # delete every node with this value
    dummy = ListNode(0, head)             # dummy before head: deleting the head is not special
    prev = dummy
    while prev.next:
        if prev.next.val == target:
            prev.next = prev.next.next    # skip over the node
        else:
            prev = prev.next
    return dummy.next

def middle(head):                         # slow moves 1, fast moves 2
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.val

def merge(a, b):                          # merge two sorted lists
    dummy = tail = ListNode(0)
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b                    # attach whatever is left
    return dummy.next

print(to_list(remove_all(build([7, 1, 7, 2, 7]), 7)))
print(middle(build([1, 2, 3, 4, 5])), middle(build([1, 2, 3, 4])))
print(to_list(merge(build([1, 3, 5]), build([2, 4, 6]))))
```

```output
[1, 2]
3 3
[1, 2, 3, 4, 5, 6]
```

## Time and space

| Operation | Linked list | Array (list) |
| --- | --- | --- |
| Read the k-th item | O(k) | O(1) |
| Insert / delete at the front | O(1) | O(n) |
| Insert / delete after a known node | O(1) | O(n) |
| Insert at the end | O(1) with a tail pointer | O(1) amortized |
| Search for a value | O(n) | O(n) |
| Extra memory per item | an arrow (or two) | none |

## Common mistakes

- Losing the rest of the list: changing `node.next` before saving it.
- Forgetting `None` checks: `fast.next.next` when `fast.next` is `None`.
- Special-casing the head instead of using a dummy node.
- Returning `head` after a reversal (it is now the tail). Return `prev`.
- Comparing values when you should compare nodes (`is`).

## Patterns that use it

**Linked list reversal**, **two pointers (fast/slow)**, **dummy node**, **K-way merge** (merge K sorted lists), **LRU cache** (doubly linked list + dict).

## Practice

```practice
middle-of-the-linked-list
reverse-linked-list
merge-two-sorted-lists
remove-linked-list-elements
linked-list-cycle
remove-nth-node-from-end-of-list
reorder-list
add-two-numbers
```

## Explain it back

```explain
Why is reading the 1000th node slow but inserting after a node you hold fast?
What problem does a dummy node solve?
How do slow and fast pointers find the middle?
When would you choose a linked list over an array?
```

## Flashcards

```flashcards
Cost to reach the k-th node? :: O(k): walk from the head.
Insert after a node you already have? :: O(1): change two arrows.
What is a dummy node? :: A fake node before the head so edge cases disappear. Return dummy.next.
Find the middle in one pass? :: Slow moves 1, fast moves 2. When fast ends, slow is in the middle.
Detect a cycle? :: Floyd: if fast ever meets slow, there is a loop.
Why does LRU cache use a doubly linked list? :: To remove any node in O(1).
```
