---
id: tree-dfs
name: Tree DFS
group: Trees
---

## Clues

```clues
Height, depth or diameter of a tree
Path sum from root to leaf
Validate a binary search tree
A node needs answers from its children
Lowest common ancestor
```

## Idea

Recursion: "If I know the answer for my left child and my right child, what is my answer?" Write the base case for an empty node. Use a helper with `nonlocal best` when the overall answer is not what the function returns (like diameter).

## Template

```python
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def max_depth(node):
    if not node:                        # an empty tree has depth 0
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

def diameter(root):
    best = 0
    def height(node):                   # returns the height, updates best on the way
        nonlocal best
        if not node:
            return 0
        l, r = height(node.left), height(node.right)
        best = max(best, l + r)         # the longest path that bends at this node
        return 1 + max(l, r)
    height(root)
    return best

#        1
#       / \
#      2   3
#     / \
#    4   5
root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))
print(max_depth(root), diameter(root))
```

```output
3 3
```

## Walkthrough: Validate Binary Search Tree

1. Pass down the allowed range `(low, high)` for each node.
2. The root can be anything. Its left child must be below the root; its right child above.
3. If any node is outside its range, the tree is not a BST.

## Traps

- Checking only parent vs child. A node deep on the left must be smaller than **every** ancestor on its right path.
- Forgetting the `None` base case.
- Returning the wrong thing: diameter is tracked in `best`, but the helper returns the height.
