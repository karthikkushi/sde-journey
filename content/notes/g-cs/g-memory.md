---
id: g-memory
title: Memory and virtual memory
level: core
phase: 3
week: 29
tags: [cs, os, memory, virtual-memory]
estMinutes: 30
---

## What it is

Every process thinks it has a big, private block of memory starting at address 0. That is **virtual memory**: the OS and the CPU translate each virtual address to a real place in RAM.
Memory is split into fixed-size **pages** (usually 4 KB). Pages not in RAM can live on disk until needed (a **page fault** brings them back).
Inside a process, memory is organised into the **stack** (function calls) and the **heap** (objects).

## Real-life example

A hotel with 1,000 rooms but a guest list that says "your room is 101" to every family. Reception keeps a register mapping each family's "101" to a real room (the page table). Rarely used luggage goes to the basement store (disk) and is brought up when someone asks for it (a page fault): it works, but it is slow.

## Picture

```text
 virtual address 13000  →  page 3, offset 712      (13000 = 3 × 4096 + 712)

 process page table              physical RAM (frames)
  page 0 → frame 7               frame 2: [ process B, page 0 ]
  page 1 → frame 2 (other proc)  frame 7: [ process A, page 0 ]
  page 3 → frame 9  ──────────▶  frame 9: [ process A, page 3 ]  → address 9 × 4096 + 712
  page 4 → on disk (swapped)     → touching it causes a page fault

 inside one process:   [ code | globals | heap ↓ ...free... ↑ stack ]
```

## How it works inside

- **Stack**: one per thread. Each function call pushes a frame (local variables, return address); returning pops it. Fast, fixed size (a few MB): deep recursion → stack overflow.
- **Heap**: where objects live (all Python objects are on the heap). Allocated and freed as needed. Python frees objects by **reference counting** plus a **garbage collector** for cycles. C# and Java use a garbage collector.
- **Virtual memory** gives each process isolation (it cannot touch another's memory) and the illusion of more memory than RAM.
- **Page table**: virtual page → physical frame. The CPU's **TLB** caches recent translations so most lookups are instant.
- **Page fault**: the page is not in RAM. The OS loads it from disk (a **major** fault: milliseconds, very slow) or maps a fresh page (minor fault).
- **Page replacement**: when RAM is full, the OS evicts a page. LRU-like policies keep recently used pages. Too much swapping = **thrashing** (the machine crawls).
- **Memory hierarchy**: CPU registers → L1/L2/L3 cache → RAM → SSD → network. Each step is roughly 10–1000× slower. Reading memory in order (like an array) is fast because whole cache lines (64 bytes) come at once.
- **OOM**: if a container or machine runs out of memory, the OS kills a process ("out of memory killer"). Common in production when a service loads too much data.

## Python, step by step

Split a virtual address into page number and offset (pages of 4096 bytes):

```python
PAGE = 4096
page_table = {0: 7, 1: 2, 3: 9}               # virtual page -> physical frame

def translate(virtual_address):
    page, offset = divmod(virtual_address, PAGE)
    if page not in page_table:
        return f"page fault on page {page}"
    return page_table[page] * PAGE + offset

print(divmod(13000, PAGE), translate(13000), translate(4 * PAGE + 5))
```

```output
(3, 712) 37576 page fault on page 4
```

Page replacement: count page faults with FIFO and LRU (3 frames):

```python
def count_faults(refs, frames, policy):
    memory, faults = [], 0
    for page in refs:
        if page in memory:
            if policy == "LRU":                # refresh: now the most recently used
                memory.remove(page)
                memory.append(page)
            continue
        faults += 1                            # not in RAM: page fault
        if len(memory) == frames:
            memory.pop(0)                      # evict the oldest (FIFO) or least recently used (LRU)
        memory.append(page)
    return faults

refs = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1]
print("FIFO:", count_faults(refs, 3, "FIFO"), "LRU:", count_faults(refs, 3, "LRU"))
```

```output
FIFO: 15 LRU: 12
```

Reference counting: an object is freed when no name points to it:

```python
import sys
import weakref

class Order:
    pass

o = Order()
watch = weakref.ref(o)              # watches the object without keeping it alive
alias = o
print(sys.getrefcount(o) - 1)       # names pointing to it (getrefcount adds 1 for itself)
del o
print(watch() is not None)          # still alive: alias points to it
del alias
print(watch() is None)              # no names left: freed at once
```

```output
2
True
True
```

## Time and space

| Memory level | Rough access time |
| --- | --- |
| L1 cache | ~1 ns |
| RAM | ~100 ns |
| SSD (page fault from disk) | ~100 µs |
| Network round trip (same datacenter) | ~500 µs |

A page fault from disk is about 1,000× slower than RAM. That is why running out of RAM makes everything slow.

## Common mistakes

- Thinking more threads or processes are free: each needs stack and memory.
- Loading a 10 GB file into memory at once (read it in chunks or stream it).
- Deep recursion in Python (stack limit) or memory leaks from caches that never evict.
- Confusing "virtual memory size" (what a process reserved) with real RAM in use (resident size).

## Patterns that use it

LRU cache (the same idea as page replacement), streaming large files, choosing data layouts (arrays are cache-friendly), and production debugging ("the container was OOM-killed").

## Practice

```practice
Run the page replacement simulation with 4 frames. Do faults go down? (Try FIFO: sometimes more frames give more faults: Belady's anomaly.)
Open your system monitor and find a process's memory use. Then open 20 browser tabs and watch it change.
Read OSTEP chapters 13–15 (address spaces, the memory API, address translation).
lru-cache
```

## Explain it back

```explain
What is virtual memory, and what two problems does it solve?
What is a page fault, and why is it slow?
What lives on the stack, and what lives on the heap?
Why is reading an array in order faster than jumping around memory?
```

## Flashcards

```flashcards
Virtual memory? :: Each process sees private addresses; the OS + CPU map them to real RAM.
Page size (usual)? :: 4 KB.
Page fault? :: The page is not in RAM; the OS must load or map it.
TLB? :: A CPU cache of recent virtual-to-physical translations.
Stack vs heap? :: Stack: function frames per thread. Heap: objects, shared by threads.
Thrashing? :: The system spends its time swapping pages instead of working.
```
