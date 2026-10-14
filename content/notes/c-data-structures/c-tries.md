---
id: c-tries
title: Tries (prefix trees)
level: core
phase: 3
week: 32
tags: [dsa, trie, strings, trees]
estMinutes: 25
---

## What it is

A trie stores words **letter by letter** in a tree. Words with the same beginning share the same path.
Checking a word or a prefix of length L takes O(L), no matter how many words are stored.
It is the data structure behind autocomplete.

## Real-life example

Typing "man" on your phone: it suggests "mango", "mandi", "man". The keyboard does not scan every word in its dictionary. It walks m → a → n and looks only at the words below that point.

## Picture

```text
                (root)
               /      \
              m        d
            /   \       \
           a     i       o
          / \     \       \
         n$  s     l       s
        / \   \     \       \
       d   g   a     k$      a$
       |   |   |
       i$  o$  l
               |
               a$          $ = a word ends here
 words: man, mandi, mango, masala, milk, dosa
```

## How it works inside

- Each node has `children` (a dict: letter → node) and a flag `end` that marks "a word ends here".
- **Insert**: walk letter by letter, creating missing nodes. Mark the last node as `end`.
- **Search word**: walk; the word exists only if every letter exists **and** the last node has `end`.
- **Starts with**: walk; it is enough that every letter exists.
- Store extra data in nodes when useful: `count` (how many words pass through) answers "how many words start with this prefix?" in O(L).
- **Memory** is the cost: one node per letter of every word (shared prefixes help).
- Compared with a `set` of words: a set checks a whole word in O(L) too, but "all words starting with man" would scan every word. A trie walks straight there.

## Python, step by step

```python
class TrieNode:
    def __init__(self):
        self.children = {}         # letter -> TrieNode
        self.end = False           # does a word end here?
        self.count = 0             # how many words pass through this node

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
            node.count += 1
        node.end = True

    def _find(self, prefix):
        node = self.root
        for ch in prefix:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word):
        node = self._find(word)
        return node is not None and node.end

    def count_prefix(self, prefix):
        node = self._find(prefix)
        return node.count if node else 0

    def suggest(self, prefix, limit=3):            # autocomplete, A to Z
        out = []
        def dfs(node, path):
            if len(out) == limit:
                return
            if node.end:
                out.append(path)
            for ch in sorted(node.children):
                dfs(node.children[ch], path + ch)
        node = self._find(prefix)
        if node:
            dfs(node, prefix)
        return out

t = Trie()
for w in ["masala", "mango", "mandi", "man", "milk", "dosa"]:
    t.insert(w)
print(t.search("man"), t.search("ma"), t.count_prefix("man"), t.count_prefix("m"))
print(t.suggest("man"), t.suggest("m", limit=2))
```

```output
True False 3 5
['man', 'mandi', 'mango'] ['man', 'mandi']
```

## Time and space

| Operation | Time |
| --- | --- |
| insert a word of length L | O(L) |
| search / starts with | O(L) |
| count words with a prefix (with `count`) | O(L) |
| list all words with a prefix | O(L + size of the answer) |

Space: O(total letters of all words) in the worst case.

## Common mistakes

- Forgetting the `end` flag, so prefixes are reported as words.
- Creating nodes while **searching** (using `setdefault` in search). Use `.get`.
- Not pruning in Word Search II: once a word is found, mark it to avoid duplicates, and remove dead branches.
- Using a trie when a set is enough (only whole-word checks).

## Patterns that use it

**Trie** pattern: autocomplete, replace words, word search II, longest common prefix of many words; also bitwise tries for "maximum XOR" problems (advanced).

## Practice

```practice
implement-trie-prefix-tree
design-add-and-search-words-data-structure
replace-words
search-suggestions-system
word-search-ii
longest-common-prefix
```

## Explain it back

```explain
Why can a trie answer "words starting with man" without looking at every word?
What is the end flag for? Give an example where forgetting it gives a wrong answer.
When is a plain set of words better than a trie?
```

## Flashcards

```flashcards
What does each trie node hold? :: A dict of children (letter -> node) and an end-of-word flag.
Cost to search a word of length L? :: O(L)
search vs startsWith? :: search needs the end flag at the last node; startsWith does not.
How to count words with a prefix fast? :: Store a count in every node on insert.
Main cost of a trie? :: Memory: about one node per letter.
```
