---
id: j-hallucination
title: Hallucination and grounding
level: core
phase: 2
week: 22
tags: [ai, llm, hallucination, grounding, rag]
estMinutes: 20
---

## What it is

A **hallucination** is a confident answer that is not true: a made-up fact, a fake link, a wrong number.
It happens because an LLM predicts likely text, not checked facts.
**Grounding** means making the answer come from given sources (your documents, a database, a tool result) and showing which source supports each claim, so you and your users can check it.

## Real-life example

Asking a stranger for directions in a new city. Some people, rather than say "I don't know", point confidently the wrong way. A good guide checks the map first and shows you where it says so. Grounding makes the model check the map.

## Picture

```text
 ungrounded:  question ──► LLM ──► "The refund window is 45 days."   (made up)

 grounded:    question ──► retrieve policy ──► LLM ──► "30 days [policy.md, section 4]"
                                                  └──► nothing found ──► "I don't know"
```

## How it works inside

- **Why it happens**: the model fills gaps with plausible words. Rare facts, exact numbers, recent events and links are the riskiest.
- **Ground the answer**: give the relevant sources in the prompt (RAG) or let it call tools for live data.
- **Ask for citations**: each claim should point to a source id; your code can check the id exists.
- **Allow "I don't know"**: say so in the instructions, and refuse when retrieval found nothing relevant.
- **Check after**: compare numbers and names in the answer against the sources; evals measure groundedness over many questions.
- **Lower the risk**: do not ask for links or exact figures from memory; fetch them.

## Python, step by step

A simple groundedness check: every number in the answer must appear in the sources.

```python
import re

sources = {"policy.md": "Refunds are allowed within 30 days of delivery. Shipping is free above 499 rupees."}

def unsupported_numbers(answer):
    source_text = " ".join(sources.values())
    numbers = re.findall(r"\d+", answer)
    return [n for n in numbers if n not in re.findall(r"\d+", source_text)]

print(unsupported_numbers("You can get a refund within 30 days [policy.md]."))
print(unsupported_numbers("You can get a refund within 45 days."))
```

```output
[]
['45']
```

## Time and space

| Defence | Effort |
| --- | --- |
| "Say I don't know if unsure" in the prompt | tiny |
| RAG with sources and citations | medium |
| Automatic groundedness evals | medium, catches drift |

## Common mistakes

- Trusting a fluent answer because it sounds sure.
- Asking the model for links or exact figures from memory.
- No "I don't know" path, so the model always invents something.
- Citations that are never checked.

## Patterns that use it

RAG, evals, guardrails, any feature that shows facts to users.

## Practice

```practice
Ask an LLM 5 questions about your own notes without giving it the notes; mark every invented fact
Repeat with the notes pasted in and "say I don't know if the notes don't say"; compare
Write a check that flags answers whose numbers are not in the sources
```

## Explain it back

```explain
Why does an LLM hallucinate at all?
What three things make an answer grounded?
```

## Flashcards

```flashcards
What is a hallucination? :: A confident answer that is not true, such as a made-up fact, number or link.
What is grounding? :: Making answers come from given sources and showing which source supports each claim.
Which answers are most at risk? :: Exact numbers, rare facts, recent events and links.
What must a grounded system be able to say? :: "I don't know" when the sources do not cover the question.
```
