---
id: j-rag-retrieval
title: "RAG retrieval: chunking and re-ranking"
level: core
phase: 2
week: 20
tags: [ai, rag, chunking, retrieval, re-ranking]
estMinutes: 30
---

## What it is

RAG answers are only as good as the chunks you retrieve. Two steps decide that:
**chunking** (how you cut documents into pieces) and **retrieval plus re-ranking** (how you pick the best few pieces for a question).
Bad chunks or wrong pieces lead to wrong or "I don't know" answers, no matter how good the model is.

## Real-life example

Finding a recipe step in a big cookbook. Torn into single words, the pages are useless. Kept as whole chapters, you still read too much. Cut into one recipe per card, and you can grab the 3 most likely cards, then read them carefully to pick the right one. Grabbing quickly is retrieval; reading carefully is re-ranking.

## Picture

```text
 document ──► chunks (about 300–800 tokens, small overlap, cut at headings)
                │
 question ──► retrieve top 20 (vector search + keyword search)
                │
             re-rank: score each of the 20 against the question more carefully
                │
             top 3–5 chunks ──► prompt ──► answer with sources
```

## How it works inside

**Chunking**
- **Size**: too small and a chunk loses context ("it" — what is "it"?); too big and it mixes topics and wastes tokens. A few hundred tokens is a common start.
- **Overlap**: repeat a little text between chunks so an idea cut in half still appears whole somewhere.
- **Follow structure**: cut at headings, paragraphs and code blocks, not in the middle of a sentence.
- **Keep metadata**: source file, heading, date, so you can filter and cite.

**Retrieval**
- **Vector search** finds chunks with similar meaning; **keyword search (BM25)** finds exact words, names and codes. **Hybrid** search uses both.
- Retrieve more than you need (say 20), then narrow down.

**Re-ranking**
- A re-ranker reads the question and each candidate together and gives a better relevance score than the first fast search. Keep the top 3–5.
- Cheaper alternative: ask the LLM to pick the relevant chunks, or use simple rules (prefer newer documents).

## Python, step by step

Chunking with overlap, then a simple keyword-overlap re-ranker:

```python
def chunk(words, size, overlap):
    step = size - overlap
    return [" ".join(words[i:i + size]) for i in range(0, max(1, len(words) - overlap), step)]

text = ("Binary search needs a sorted list . It halves the search space each step . "
        "Two pointers work on sorted arrays too . A hash map gives O(1) lookups .").split()
chunks = chunk(text, size=10, overlap=3)
for c in chunks:
    print("-", c)

def rerank(question, candidates, k=1):
    q = set(question.lower().split())
    scored = sorted(candidates, key=lambda c: len(q & set(c.lower().split())), reverse=True)
    return scored[:k]

print("best:", rerank("why does binary search need a sorted list", chunks))
```

```output
- Binary search needs a sorted list . It halves the
- It halves the search space each step . Two pointers
- . Two pointers work on sorted arrays too . A
- too . A hash map gives O(1) lookups .
best: ['Binary search needs a sorted list . It halves the']
```

## Time and space

| Step | Cost |
| --- | --- |
| Chunk and embed | once per document (re-run when it changes) |
| First retrieval | fast, from an index |
| Re-rank 20 candidates | slower, but only 20 items |

## Common mistakes

- One fixed chunk size for everything, cutting code and tables in half.
- No overlap, so key sentences are split.
- Sending 20 chunks to the model instead of the best 3–5.
- Losing the source, so answers cannot cite anything.

## Patterns that use it

Your RAG app, evals for retrieval, hybrid search, the LLM assistant system design.

## Practice

```practice
Chunk 5 of your notes three ways (by heading, 200 words, 500 words) and compare answers to the same 5 questions
Add overlap and check whether a split sentence now appears whole
Add a simple re-rank step and count how often the right chunk reaches the top 3
```

## Explain it back

```explain
What goes wrong with chunks that are too small or too big?
Why retrieve 20 and keep only 3–5?
```

## Flashcards

```flashcards
Why overlap chunks? :: So an idea cut at a boundary still appears whole in some chunk.
What is hybrid search? :: Vector search (meaning) plus keyword search (exact words) together.
What does a re-ranker do? :: Scores each candidate against the question more carefully, then keeps the best few.
Why keep metadata on chunks? :: To filter results and cite sources.
```
