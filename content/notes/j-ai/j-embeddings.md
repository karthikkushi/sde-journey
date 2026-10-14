---
id: j-embeddings
title: Embeddings in simple words
level: core
phase: 2
week: 21
tags: [ai, embeddings, vectors]
estMinutes: 25
---

## What it is

An **embedding** is a list of numbers (a vector) that represents the **meaning** of a piece of text.
Texts with similar meaning get vectors that point in similar directions, even when they share no words: "cancel my train ticket" and "refund for a railway booking" end up close together.
An **embedding model** turns text into these vectors. Real ones use a few hundred to a few thousand numbers.

## Real-life example

Think of a map of Bengaluru: places that are close on the map are close in real life. Embeddings put sentences on a "meaning map". Search then becomes "find the points nearest to my question", which is how smart search, recommendations and RAG work.

## Picture

```text
                   vehicle ▲
                           │   • bus
                           │  • auto
                           │
                           │
                           │                       • rupee   (money: a third direction)
                           │
                           └──────────────────────▶ food
                                      • idli • dosa

 similarity = cosine of the angle between two arrows:  1 = same direction, 0 = unrelated
```

## How it works inside

- An embedding model reads the text and outputs a fixed-length vector (same length for every input).
- **Cosine similarity** compares two vectors: dot product divided by their lengths. Close to 1 = very similar meaning.
- You embed your documents **once** and store the vectors. At query time you embed only the question and compare.
- Use the **same model** for documents and questions: vectors from different models are not comparable.
- Simple word-count vectors only match exact words; learned embeddings also match synonyms and paraphrases ("railway" ≈ "train").
- Embeddings are produced by a separate embedding model, either a hosted API or an open-source model you run yourself.

## Python, step by step

Hand-made 3-number embeddings (food, vehicle, money) and cosine similarity:

```python
import math

def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))

#          food  vehicle money
vec = {
    "dosa":  [0.9,  0.0,  0.1],
    "idli":  [0.95, 0.0,  0.05],
    "auto":  [0.0,  0.9,  0.2],
    "bus":   [0.0,  0.95, 0.1],
    "rupee": [0.1,  0.1,  0.95],
}
for a, b in [("dosa", "idli"), ("dosa", "auto"), ("auto", "bus"), ("bus", "rupee")]:
    print(f"{a:>5} vs {b:<5} {cosine(vec[a], vec[b]):.2f}")
```

```output
 dosa vs idli  1.00
 dosa vs auto  0.02
 auto vs bus   0.99
  bus vs rupee 0.21
```

Why we need learned embeddings: word-count vectors miss paraphrases:

```python
import math
from collections import Counter

def bow(text):                                    # "bag of words": just count the words
    return Counter(text.lower().split())

def cosine(a, b):
    dot = sum(a[w] * b[w] for w in a)
    return dot / (math.sqrt(sum(v * v for v in a.values())) * math.sqrt(sum(v * v for v in b.values())))

question = "how do i cancel my train ticket"
docs = ["Cancel a railway booking and get a refund",
        "How do I cancel my train ticket online",
        "Best filter coffee in Chennai"]
for d in docs:
    print(f"{cosine(bow(question), bow(d)):.2f}  {d}")
```

```output
0.12  Cancel a railway booking and get a refund
0.94  How do I cancel my train ticket online
0.00  Best filter coffee in Chennai
```

The first document means the same thing but scores low, because it says "railway booking" instead of "train ticket". A learned embedding model would score it high.

## Time and space

| Step | Cost |
| --- | --- |
| Embed n documents | n model calls, once (batch them) |
| Store | n × d numbers (d = vector length, for example 1024 floats ≈ 4 KB each) |
| Compare one query to all | O(n × d); vector indexes make this faster (next note) |

## Common mistakes

- Comparing vectors from two different embedding models.
- Re-embedding all documents on every search instead of storing them.
- Embedding whole 50-page documents as one vector: the meaning gets blurred. Split into chunks first.
- Expecting exact facts (numbers, names) to match well; combine with keyword search when exact words matter.

## Patterns that use it

Semantic search, RAG, recommendations ("similar products"), duplicate detection, clustering support tickets.

## Practice

```practice
Add "sambar" and "train" to the vec table with sensible numbers and print the most similar word for each.
Write most_similar(word) that returns the closest other word by cosine similarity.
Add a tiny synonym table to bow() (railway → train, booking → ticket) and re-run. What improves, and why does this not scale?
Explain why the cosine of a vector with itself is 1.
```

## Explain it back

```explain
What is an embedding, in one sentence?
What does cosine similarity measure?
Why do we embed documents once and store them?
Why do word-count vectors fail on "railway booking" vs "train ticket"?
```

## Flashcards

```flashcards
Embedding? :: A vector of numbers that represents the meaning of text.
Cosine similarity of 1? :: Same direction: very similar meaning.
Mix two embedding models? :: No. Use the same model for documents and queries.
Why chunk long documents before embedding? :: One vector for a huge text blurs its meaning.
Embeddings vs keyword search? :: Embeddings match meaning; keywords match exact words. Often combine both.
```
