---
id: c-bst
title: Binary search trees (BST)
level: core
phase: 2
week: 18
tags: [dsa, bst, trees]
estMinutes: 30
---

## What it is

A **binary search tree** is a binary tree with one rule: everything in the **left** subtree is smaller than the node, everything in the **right** subtree is bigger.
So you can search like binary search: go left or right at each node.
Walking it **inorder** gives the values in sorted order.

## Real-life example

Finding a word in a dictionary book by opening it in the middle: "my word comes before this page, go left" or "after, go right". Each choice throws away half the book.
A BST keeps that choice ready at every node, even while new words are added.

## Picture

```text
                 50
               /    \
             30      70          left < node < right, at EVERY node,
            /  \    /  \         for the whole subtree (not just children)
          20   40  60   80

 search 60:  50 → right → 70 → left → 60   (3 steps)
 inorder:    20 30 40 50 60 70 80          (sorted)
```

## How it works inside

- **Search / insert**: compare with the node, go left or right, repeat. Cost = height of the tree.
- **Balanced** BST: height about log n, so O(log n). **Skewed** BST (insert 1, 2, 3, 4... in order): it becomes a chain, height n, so O(n).
- **Self-balancing** trees (AVL, red-black) rotate nodes to stay balanced. Java's TreeMap and C#'s SortedDictionary use them. Python has no built-in one; use `bisect` on a sorted list, a heap, or the `sortedcontainers` package.
- **Delete** has three cases: no child (just remove), one child (replace by the child), two children (copy the **inorder successor**, the smallest value in the right subtree, then delete that).
- **Validate**: pass down a `(low, high)` range. Checking only parent vs child is not enough.
- **Kth smallest**: inorder walk, stop at the kth node.

## Python, step by step

Insert, search, sorted walk and delete:

```python
class Node:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

def insert(node, val):
    if not node:
        return Node(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node

def search(node, val):
    while node and node.val != val:
        node = node.left if val < node.val else node.right   # go left or right
    return node is not None

def inorder(node):
    return inorder(node.left) + [node.val] + inorder(node.right) if node else []

def delete(node, val):
    if not node:
        return None
    if val < node.val:
        node.left = delete(node.left, val)
    elif val > node.val:
        node.right = delete(node.right, val)
    else:
        if not node.left:                  # zero or one child
            return node.right
        if not node.right:
            return node.left
        succ = node.right                  # two children: smallest value on the right
        while succ.left:
            succ = succ.left
        node.val = succ.val                # copy it here...
        node.right = delete(node.right, succ.val)   # ...and delete it below
    return node

root = None
for v in [50, 30, 70, 20, 40, 60, 80]:
    root = insert(root, v)
print(inorder(root), search(root, 60), search(root, 65))
root = delete(root, 30)                    # has two children
root = delete(root, 50)                    # the root
print(inorder(root), root.val)
```

```output
[20, 30, 40, 50, 60, 70, 80] True False
[20, 40, 60, 70, 80] 60
```

Validate with a range, and see a skewed tree:

```python
class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_bst(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return is_bst(node.left, low, node.val) and is_bst(node.right, node.val, high)

good = Node(50, Node(30, Node(20), Node(40)), Node(70))
tricky = Node(5, Node(4), Node(6, Node(3), Node(7)))   # 3 is right of 5, but smaller than 5
print(is_bst(good), is_bst(tricky))

def height(n):
    return 0 if not n else 1 + max(height(n.left), height(n.right))

chain = None
def insert(node, val):
    if not node:
        return Node(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node
for v in [1, 2, 3, 4, 5]:                  # sorted input makes a chain
    chain = insert(chain, v)
print(height(chain))
```

```output
True False
5
```

## Time and space

| Operation | Balanced | Skewed (worst) |
| --- | --- | --- |
| search / insert / delete | O(log n) | O(n) |
| min / max | O(log n) | O(n) |
| inorder (sorted list) | O(n) | O(n) |
| kth smallest | O(h + k) | O(n) |

## Common mistakes

- Validating with only `left.val < node.val < right.val`. Use a range.
- Forgetting that sorted input makes a chain (O(n) operations).
- In delete with two children, forgetting to delete the successor from the right subtree.
- Duplicates: decide where equal values go (left or right) and stay consistent.

## Patterns that use it

**Tree DFS** with ranges (validate BST), **inorder = sorted** (kth smallest, BST iterator), **binary search** ideas (LCA in a BST: go left if both are smaller, right if both are bigger).

## Practice

```practice
search-in-a-binary-search-tree
insert-into-a-binary-search-tree
convert-sorted-array-to-binary-search-tree
lowest-common-ancestor-of-a-binary-search-tree
validate-binary-search-tree
kth-smallest-element-in-a-bst
delete-node-in-a-bst
```

## Explain it back

```explain
State the BST rule exactly. Why is "left child < node < right child" not enough?
Why does inserting sorted numbers make a BST slow?
Walk through deleting a node with two children.
```

## Flashcards

```flashcards
BST rule? :: Every value in the left subtree < node < every value in the right subtree.
Inorder of a BST gives? :: The values in sorted order.
Search cost? :: O(h): O(log n) if balanced, O(n) if skewed.
Delete with two children? :: Copy the inorder successor (min of right subtree), then delete it there.
Validate a BST? :: Pass (low, high) bounds down the tree.
Balanced BST in Python? :: Not built in. Use bisect on a sorted list, a heap, or sortedcontainers.
```
