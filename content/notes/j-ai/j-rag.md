---
id: j-rag
title: RAG (retrieval-augmented generation) step by step
level: core
phase: 2
week: 23
tags: [ai, rag, embeddings, llm]
estMinutes: 35
---

## What it is

**RAG** = first **retrieve** the few pieces of your own documents that match the question, then ask the LLM to answer **using only those pieces**, with citations.
It lets a model answer about things it was never trained on (your company handbook, your product docs) and cuts down made-up answers, because the facts are right there in the prompt.

## Real-life example

An open-book exam. You do not memorise the whole textbook; you find the right two pages and write the answer from them. If the book does not cover the question, the honest answer is "not in the book".

## Picture

```text
 once (indexing):   documents ─▶ split into chunks ─▶ embed each chunk ─▶ vector store (+ file name, owner)

 every question:    question ─▶ embed ─▶ top-k similar chunks ─▶ prompt = rules + chunks + question
                                                                           │
                                                      LLM ◀────────────────┘
                                                       │
                                     "18 days a year [1]"  ─▶ check citations ─▶ show answer + sources
```

## How it works inside

- **Chunking**: split documents into pieces of a few hundred tokens, by headings where possible, with a little **overlap** so a sentence cut at a border still appears whole in one chunk.
- **Embedding + storing**: embed each chunk once; store the vector with metadata (file, section, who may read it).
- **Retrieval**: embed the question, take the top-k (often 3–8) chunks. **Hybrid search** (vectors + keywords) helps with names, codes and numbers. A **re-ranker** can reorder the candidates more precisely.
- **Prompt**: clear rules ("use only the sources", "cite like [1]", "if the answer is not there, say you don't know"), then the sources in tags, then the question.
- **Generation and checks**: validate citations, show the sources to the user.
- **Evaluate two things separately**: did retrieval find the right chunk (hit rate)? Is the answer faithful to the chunks?
- **Keep it fresh and safe**: re-index changed documents; filter by permissions before anything reaches the prompt.

## Python, step by step

Chunking with overlap (word-based here; real systems count tokens):

```python
def chunk(text, size=12, overlap=4):
    words = text.split()
    step = size - overlap
    return [" ".join(words[i:i + size]) for i in range(0, max(len(words) - overlap, 1), step)]

text = ("Earned leave is 18 days a year. Apply in the HR portal at least 3 days before. "
        "Unused leave up to 30 days carries over to next year.")
for i, c in enumerate(chunk(text)):
    print(i, c)
```

```output
0 Earned leave is 18 days a year. Apply in the HR portal
1 in the HR portal at least 3 days before. Unused leave up
2 before. Unused leave up to 30 days carries over to next year.
```

Retrieve and build the prompt. Simple word overlap stands in for embeddings so it runs anywhere:

```python
HANDBOOK = {
    "leave.md": "Earned leave is 18 days a year. Apply in the HR portal at least 3 days before.",
    "wfh.md": "You can work from home up to 2 days a week. Tell your manager by Friday.",
    "laptop.md": "If your laptop is lost or stolen, report it to IT within 24 hours and file a police complaint.",
    "travel.md": "Book work travel through the travel desk. Claim expenses within 30 days with bills.",
}
STOP = {"the", "a", "an", "is", "of", "to", "in", "for", "and", "how", "many", "do", "i", "my",
        "can", "what", "it", "or", "if", "you", "your", "be", "within", "at", "by", "with"}

def words(text):
    return {w.strip(".,?!").lower() for w in text.split()} - STOP

def retrieve(question, docs, k=2):
    q = words(question)
    scores = {name: len(q & words(text)) for name, text in docs.items()}
    best = sorted(scores, key=scores.get, reverse=True)[:k]       # ties keep file order
    return [name for name in best if scores[name] > 0]

def build_prompt(question, names):
    sources = "\n".join(f'<source id="{i}" file="{n}">{HANDBOOK[n]}</source>' for i, n in enumerate(names, 1))
    return ("Answer using only the sources. Cite them like [1]. "
            "If the sources do not contain the answer, say \"I don't know\".\n\n"
            f"{sources}\n\n<question>{question}</question>")

print(retrieve("How many days of leave do I get in a year?", HANDBOOK))
print(retrieve("My laptop was stolen, what should I do?", HANDBOOK))
print(retrieve("Can I bring my dog to office?", HANDBOOK))       # nothing matches: don't call the LLM
print()
print(build_prompt("My laptop was stolen, what should I do?", ["laptop.md"]))
```

```output
['leave.md', 'wfh.md']
['laptop.md']
[]

Answer using only the sources. Cite them like [1]. If the sources do not contain the answer, say "I don't know".

<source id="1" file="laptop.md">If your laptop is lost or stolen, report it to IT within 24 hours and file a police complaint.</source>

<question>My laptop was stolen, what should I do?</question>
```

Check the answer's citations before showing it:

```python
import re

def check_citations(answer, n_sources):
    cited = {int(x) for x in re.findall(r"\[(\d+)\]", answer)}
    if not cited:
        return "no citation"
    bad = sorted(c for c in cited if not 1 <= c <= n_sources)
    return f"bad citation {bad}" if bad else "ok"

for a in ["You get 18 days of earned leave a year [1].",
          "You get 25 days.",
          "18 days [1], see also [4]."]:
    print(check_citations(a, 2))
```

```output
ok
no citation
bad citation [4]
```

The LLM call itself (needs a key, so the checker skips it):

```python norun
import anthropic

client = anthropic.Anthropic()

def answer(question):
    names = retrieve(question, HANDBOOK)
    if not names:                                   # nothing relevant: save the call
        return "I don't know. The handbook does not cover this."
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        messages=[{"role": "user", "content": build_prompt(question, names)}],
    )
    if response.stop_reason == "refusal":
        return "Sorry, I can't help with that."
    return "".join(b.text for b in response.content if b.type == "text")
```

## Time and space

| Step | When | Cost |
| --- | --- | --- |
| Chunk + embed documents | once, and when files change | one embedding per chunk |
| Retrieve | every question | one query embedding + vector search |
| Generate | every question | prompt tokens grow with k × chunk size |

## Common mistakes

- Chunks too big (the answer is buried) or too small (no context). Try a few sizes and measure.
- No overlap, so key sentences are split across two chunks.
- Not telling the model to say "I don't know", so it guesses.
- Mixing documents from different users or teams: always filter by permission first.
- Only testing the final answer. Test retrieval separately: was the right chunk in the top-k?
- Forgetting to re-index when documents change.

## Patterns that use it

Embeddings, vector search with heaps, prompt design, evals, caching (repeated questions).

## Practice

```practice
Add "holidays.md" to HANDBOOK and ask a question that should retrieve it.
Make retrieve() return the scores too, and skip chunks scoring below 2.
Write 5 questions with the file that should be retrieved for each. Measure the hit rate of retrieve().
Build a RAG bot over your own study notes (the markdown files of this site) as a weekend project.
```

## Explain it back

```explain
What problem does RAG solve that a plain LLM call does not?
Walk through indexing and answering, step by step.
Why do chunks overlap?
How would you test whether a RAG system is good?
Why must permission filtering happen before the prompt is built?
```

## Flashcards

```flashcards
RAG in one line? :: Retrieve relevant chunks of your documents, then answer only from them.
Why chunk overlap? :: So sentences cut at a border still appear whole in one chunk.
Hybrid search? :: Combine vector (meaning) and keyword (exact words) search.
What if nothing relevant is retrieved? :: Say "I don't know" (often without calling the LLM).
Two things to evaluate in RAG? :: Retrieval hit rate and answer faithfulness.
Where to enforce permissions? :: Before retrieved chunks are put in the prompt.
```
