---
id: g-db-indexes
title: Database internals - B+ trees, LSM trees and index types
level: core
phase: 3
week: 35
tags: [cs, database, indexes, b-tree, lsm]
estMinutes: 30
---

## What it is

Databases store data on disk in **pages** and use index structures to find rows quickly.
Most SQL databases use **B+ trees** (great for reads and ranges). Many write-heavy NoSQL stores (Cassandra, RocksDB) use **LSM trees** (great for writes).
Knowing the difference explains why some databases are fast at reads and others at writes.

## Real-life example

- B+ tree: a library catalogue kept always sorted. Adding a book means finding its exact place and making room (slower writes), but finding any book is quick.
- LSM tree: new books go in a "new arrivals" box (fast). When the box is full, it is sorted and shelved as a new section. Every night, sections are merged. Finding a book may mean checking the box and a few sections.

## Picture

```text
 B+ tree (fanout ~100): 3 levels cover a million keys
            [ root ]
        /     |      \
   [inner] [inner] [inner]
   /  |  \
 [leaf]→[leaf]→[leaf]→ ...   leaves are linked: range scans walk right

 LSM tree
   writes → [ memtable (in RAM, sorted) ] ──full──▶ flush ─▶ [ run 3 (newest, sorted, never changed) ]
                                                             [ run 2 ]
                                                             [ run 1 (oldest) ]  ← compaction merges runs
   reads → memtable, then runs from newest to oldest (Bloom filters skip runs without the key)
```

## How it works inside

**Pages**: databases read and write disk in fixed blocks (PostgreSQL 8 KB, InnoDB 16 KB). Fewer page reads = faster queries.

**B+ tree**
- Inner nodes hold keys and pointers; **leaves** hold the keys plus row data (or row locations), and are **linked** for range scans.
- Fanout is large (hundreds of keys per page), so height is tiny: log_fanout(n).
- Writes update a page **in place** (plus the write-ahead log). Page splits happen when a page fills.

**Clustered vs secondary indexes**
- **Clustered** (InnoDB primary key, SQL Server clustered index): the table rows themselves are stored in primary key order inside the B+ tree. Range queries on the key are very fast.
- **Secondary** index: a separate B+ tree from the indexed column to the row's primary key (or location). Using it can need a second lookup into the table, unless the index is **covering**.
- PostgreSQL keeps rows in a heap (unordered) and every index is secondary.

**LSM tree** (log-structured merge)
- Writes go to an in-memory sorted **memtable** (plus a log for safety). When full, it is written to disk as an immutable sorted file (**SSTable / run**). Writes are sequential: very fast.
- Reads check the memtable, then runs newest-first. **Bloom filters** quickly say "this key is definitely not in this run".
- **Compaction** merges runs in the background, dropping overwritten and deleted values.
- Trade-off: B+ trees favour reads and ranges; LSM trees favour heavy writes (logs, events, time series).

**Hash indexes**: O(1) equality lookups, but no ranges or sorting.

## Python, step by step

How tall does a B+ tree get?

```python
def tree_height(rows, fanout):
    height, reach = 1, fanout
    while reach < rows:                       # each extra level multiplies the reach by the fanout
        reach *= fanout
        height += 1
    return height

for rows in [1_000, 1_000_000, 1_000_000_000]:
    print(f"{rows:>13,} rows: B+ tree height {tree_height(rows, 100)}, binary tree height {tree_height(rows, 2)}")
```

```output
        1,000 rows: B+ tree height 2, binary tree height 10
    1,000,000 rows: B+ tree height 3, binary tree height 20
1,000,000,000 rows: B+ tree height 5, binary tree height 30
```

A tiny LSM tree: a memtable, sorted runs, and compaction:

```python
import bisect

class TinyLSM:
    def __init__(self, memtable_limit=3):
        self.memtable, self.runs, self.limit = {}, [], memtable_limit

    def put(self, key, value):
        self.memtable[key] = value                                   # fast: memory only
        if len(self.memtable) >= self.limit:
            self.runs.insert(0, sorted(self.memtable.items()))       # flush a sorted run (newest first)
            self.memtable = {}

    def get(self, key):
        if key in self.memtable:
            return self.memtable[key]
        for run in self.runs:                                         # newest run first
            keys = [k for k, _ in run]
            i = bisect.bisect_left(keys, key)                         # each run is sorted: binary search
            if i < len(keys) and keys[i] == key:
                return run[i][1]
        return None

    def compact(self):
        merged = {}
        for run in reversed(self.runs):                               # oldest first; newer values overwrite
            merged.update(run)
        self.runs = [sorted(merged.items())]

db = TinyLSM()
for k, v in [("rice", 320), ("dal", 160), ("tea", 120), ("rice", 330), ("oil", 150), ("salt", 20)]:
    db.put(k, v)
print(len(db.runs), "sorted runs on disk;", db.get("rice"), db.get("dal"), db.get("milk"))
db.compact()
print(len(db.runs), "run after compaction:", db.runs[0])
```

```output
2 sorted runs on disk; 330 160 None
1 run after compaction: [('dal', 160), ('oil', 150), ('rice', 330), ('salt', 20), ('tea', 120)]
```

## Time and space

| Structure | Point read | Range read | Write |
| --- | --- | --- | --- |
| B+ tree | O(log n) pages (3–4) | fast (linked leaves) | O(log n), random page writes |
| LSM tree | memtable + a few runs (Bloom filters help) | merge across runs | very fast (sequential) + background compaction |
| Hash index | O(1) | not supported | O(1) |

## Common mistakes

- Picking a random UUID as a clustered primary key in InnoDB (inserts land all over the tree; ordered ids or UUIDv7 are kinder).
- Expecting a hash index to help `ORDER BY` or ranges.
- Ignoring compaction load and disk space in LSM databases.
- Too many secondary indexes on a write-heavy table.

## Patterns that use it

SQL index design (see the Indexes note), choosing a database in system design ("write-heavy logs → an LSM-based store like Cassandra"), binary search (inside every sorted page and run).

## Practice

```practice
Compute the B+ tree height for 50 million rows with fanout 200.
Add a "delete" to TinyLSM using a tombstone value that compaction removes.
Read about Bloom filters and explain in 3 lines how they let an LSM skip a run.
Watch one CMU Database Systems lecture on B+ trees.
```

## Explain it back

```explain
Why is a B+ tree only 3–4 levels deep for millions of rows?
What is the difference between a clustered and a secondary index?
Why are LSM trees fast at writes? What do they pay for it?
What does compaction do?
```

## Flashcards

```flashcards
Why are B+ trees shallow? :: Huge fanout: hundreds of keys per page.
B+ tree leaves are linked because? :: Fast range scans.
Clustered index? :: Rows stored in key order inside the index (InnoDB primary key).
LSM write path? :: Memtable in RAM, flushed as sorted immutable runs.
LSM read help? :: Bloom filters skip runs that cannot hold the key.
Compaction? :: Merging runs, dropping old and deleted values.
```
