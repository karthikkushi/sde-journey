---
id: tree-bfs
name: Tree BFS (level order)
group: Trees
---

## Clues

```clues
Level by level
Right side view (last node of each level)
Minimum depth
Zigzag order
Anything "per level": average, largest, count
```

## Idea

Use a queue. At the start of each round, the queue holds **exactly one level**. Process `len(queue)` nodes, adding their children for the next round.

## Template

```python
from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def level_order(root):
    if not root:
        return []
    levels, queue = [], deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):        # exactly the nodes of this level
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        levels.append(level)
    return levels

root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
levels = level_order(root)
print(levels, [lvl[-1] for lvl in levels])   # all levels, and the right side view
```

```output
[[3], [9, 20], [15, 7]] [3, 20, 7]
```

## Walkthrough: Binary Tree Right Side View

1. Do level order.
2. From each level, keep only the last node.
3. That is what you see standing on the right.

## Traps

- Calling `len(queue)` inside the loop condition while adding children. Save the level size first (the `range(len(queue))` above does that).
- Using a list with `pop(0)`: O(n) per pop. Use `deque`.
- Forgetting the empty tree.
