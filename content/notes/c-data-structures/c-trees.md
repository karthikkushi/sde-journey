---
id: c-trees
title: Trees (DFS, BFS, height, diameter, LCA, serialize)
level: core
phase: 2
week: 16
tags: [dsa, trees, recursion, dfs, bfs]
estMinutes: 35
---

## What it is

A tree is a set of **nodes** joined by edges, with **no loops**. One node is the **root**; nodes with no children are **leaves**.
In a **binary** tree every node has at most two children: `left` and `right`.
Almost every tree problem is solved by asking: "what does each child give back to me?"

## Real-life example

A family tree, or your company's reporting chart: the CEO at the root, managers below, and engineers as leaves.
"How many levels deep is the company?" is the tree's **height**. "Who is the closest common boss of Ravi and Asha?" is the **lowest common ancestor**.

## Picture

```svg
<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M180 30L110 85M180 30L250 85M110 85L70 145M110 85L150 145M250 85L290 145" class="line"/>
  <circle cx="180" cy="30" r="18" class="hi"/><text x="180" y="35" text-anchor="middle">1</text>
  <circle cx="110" cy="85" r="18" class="box"/><text x="110" y="90" text-anchor="middle">2</text>
  <circle cx="250" cy="85" r="18" class="box"/><text x="250" y="90" text-anchor="middle">3</text>
  <circle cx="70" cy="145" r="18" class="box"/><text x="70" y="150" text-anchor="middle">4</text>
  <circle cx="150" cy="145" r="18" class="box"/><text x="150" y="150" text-anchor="middle">5</text>
  <circle cx="290" cy="145" r="18" class="box"/><text x="290" y="150" text-anchor="middle">6</text>
  <text x="208" y="34" class="muted">root</text>
  <text x="10" y="190" class="muted">leaves: 4, 5, 6 · height 3 · level order [1] [2,3] [4,5,6]</text>
</svg>
```

## How it works inside

- **Depth** of a node = edges from the root. **Height** of a tree = levels from root to the deepest leaf.
- **DFS** (depth-first) orders, named by when you "visit" the node:
  - **Preorder**: node, left, right (copy or serialize a tree).
  - **Inorder**: left, node, right (gives sorted order in a BST).
  - **Postorder**: left, right, node (answers that need the children first: height, delete).
- **BFS** (level order) uses a queue and goes level by level.
- Recursion depth = tree height. A balanced tree has height about log n; a "chain" tree has height n.
- **Diameter**: the longest path between any two nodes. At each node it is `left_height + right_height`; keep the best.
- **LCA** (lowest common ancestor): search both values. If one is found on each side, this node is the meeting point.
- **Serialize**: write the tree as text (preorder with `#` for empty), and rebuild it by reading in the same order.

## Python, step by step

Build a tree from a LeetCode-style list, then walk it four ways:

```python
from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def build(values):                        # level order; None = no node (like LeetCode)
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    queue, i = deque([root]), 1
    while queue and i < len(values):
        node = queue.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            queue.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            queue.append(node.right)
        i += 1
    return root

def preorder(n):
    return [n.val] + preorder(n.left) + preorder(n.right) if n else []

def inorder(n):
    return inorder(n.left) + [n.val] + inorder(n.right) if n else []

def postorder(n):
    return postorder(n.left) + postorder(n.right) + [n.val] if n else []

def levels(root):
    out, queue = [], deque([root] if root else [])
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            queue.extend(child for child in (node.left, node.right) if child)
        out.append(level)
    return out

root = build([1, 2, 3, 4, 5, None, 6])
print(preorder(root), inorder(root), postorder(root))
print(levels(root))
```

```output
[1, 2, 4, 5, 3, 6] [4, 2, 5, 1, 3, 6] [4, 5, 2, 6, 3, 1]
[[1], [2, 3], [4, 5, 6]]
```

Height, diameter and lowest common ancestor:

```python
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

#        1
#       / \
#      2   3
#     / \   \
#    4   5   6
root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3, None, TreeNode(6)))

def height(node):
    return 0 if not node else 1 + max(height(node.left), height(node.right))

def diameter(root):
    best = 0
    def h(node):                       # returns height; records the best path on the way
        nonlocal best
        if not node:
            return 0
        l, r = h(node.left), h(node.right)
        best = max(best, l + r)        # the longest path that bends at this node
        return 1 + max(l, r)
    h(root)
    return best

def lca(node, p, q):                   # p and q are values that exist in the tree
    if node is None or node.val in (p, q):
        return node
    left, right = lca(node.left, p, q), lca(node.right, p, q)
    if left and right:
        return node                    # one on each side: I am where they meet
    return left or right

print(height(root), diameter(root), lca(root, 4, 5).val, lca(root, 4, 6).val)
```

```output
3 4 2 1
```

Serialize and rebuild (preorder, `#` = empty), plus an inorder walk without recursion:

```python
class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def serialize(root):
    out = []
    def go(node):
        if not node:
            out.append("#")
            return
        out.append(str(node.val))
        go(node.left)
        go(node.right)
    go(root)
    return ",".join(out)

def deserialize(data):
    values = iter(data.split(","))
    def go():
        v = next(values)
        if v == "#":
            return None
        node = TreeNode(int(v))
        node.left = go()               # read in the same order we wrote
        node.right = go()
        return node
    return go()

def inorder_iterative(root):           # your own stack instead of recursion
    out, stack, node = [], [], root
    while stack or node:
        while node:                    # go left as far as possible
            stack.append(node)
            node = node.left
        node = stack.pop()
        out.append(node.val)           # visit
        node = node.right              # then the right side
    return out

text = "1,2,4,#,#,5,#,#,3,#,6,#,#"
tree = deserialize(text)
print(serialize(tree) == text, inorder_iterative(tree))
```

```output
True [4, 2, 5, 1, 3, 6]
```

## Time and space

| Operation | Time | Space |
| --- | --- | --- |
| Any full traversal (DFS or BFS) | O(n) | O(h) for DFS, O(width) for BFS |
| Height, diameter, LCA | O(n) | O(h) |
| Serialize / deserialize | O(n) | O(n) |

h = height: about log n when balanced, up to n when the tree is a chain.

## Common mistakes

- Forgetting the `None` base case.
- Mixing up height (nodes on the path) and edges (nodes − 1). Read the problem.
- Diameter: returning `best` from the helper instead of the height.
- Deep chain trees hitting Python's recursion limit. Use an explicit stack if n can be 10⁵.
- Rebuilding a tree from a single traversal: you need preorder **with** `#` markers (or two traversals).

## Patterns that use it

**Tree DFS**, **Tree BFS**, **backtracking** (paths), **divide and conquer** (build from preorder + inorder), **DP on trees** (House Robber III).

## Practice

```practice
binary-tree-inorder-traversal
maximum-depth-of-binary-tree
diameter-of-binary-tree
balanced-binary-tree
binary-tree-level-order-traversal
binary-tree-right-side-view
construct-binary-tree-from-preorder-and-inorder-traversal
serialize-and-deserialize-binary-tree
```

## Explain it back

```explain
What are preorder, inorder and postorder? When would you use each?
How does the diameter function compute two things at once?
Explain how LCA works when p is on the left and q is on the right.
Why do we need the # markers to rebuild a tree from one traversal?
```

## Flashcards

```flashcards
Preorder? :: Node, left, right.
Inorder? :: Left, node, right (sorted order for a BST).
Postorder? :: Left, right, node.
DFS space on a tree? :: O(h), the height.
Diameter at a node? :: left height + right height; keep the best over all nodes.
LCA rule? :: If p and q are found on different sides, this node is the LCA.
```
