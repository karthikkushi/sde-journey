---
id: trie
name: Trie (prefix tree)
group: Trees
---

## Clues

```clues
Prefix search or autocomplete
Many words, check prefixes fast
Search many words in a grid (Word Search II)
Replace words by their shortest root
```

## Idea

A tree where each edge is one letter. Words that share a beginning share a path. Checking a word or a prefix of length L takes O(L), no matter how many words are stored.

```text
        root
       /    \
      d      ...
      |
      o ─── a ─ l$          dal
      |
      s
     / \
    a$  e$                  dosa, dose
```

## Template

```python
class Trie:
    def __init__(self):
        self.root = {}                       # each node: dict of char -> child node

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})   # go down, creating nodes as needed
        node["$"] = True                     # a word ends here

    def _walk(self, text):
        node = self.root
        for ch in text:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

t = Trie()
for w in ["dosa", "dose", "dal"]:
    t.insert(w)
print(t.search("dos"), t.starts_with("dos"), t.search("dal"))
```

```output
False True True
```

## Walkthrough: Word Search II

1. Put every word in a trie.
2. DFS from each cell of the grid, walking down the trie at the same time.
3. If the trie has no child for the next letter, stop early (this pruning is the whole point).
4. When you reach a node that ends a word, record it (and remove the mark to avoid duplicates).

## Traps

- Forgetting the end-of-word mark: "dos" is a prefix, not a word.
- Using a list of 26 children when a dict is simpler in Python.
- In Word Search II, not pruning finished branches: too slow.
