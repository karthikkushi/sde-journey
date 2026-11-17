---
id: j-ai-system-design
title: AI system design basics
level: advanced
phase: 5
week: 48
tags: [ai, system-design, rag, agents, interview]
estMinutes: 30
---

## What it is

AI system design interviews ask you to design a product with an LLM inside: a support assistant, a document search tool, a coding helper.
It is normal system design (APIs, storage, queues, caching, scale) **plus** the AI parts: **choosing the approach** (prompting, RAG, fine-tuning, agent), **retrieval**, **evals**, **guardrails**, and **cost and latency**.
This note gives the checklist; the LLM assistant design note is a full worked example.

## Real-life example

Opening a restaurant. You still need a kitchen, tables, billing and staff (normal system design). The star chef (the LLM) is only one part: you also plan where ingredients come from (retrieval), how you taste-test dishes (evals), food safety (guardrails), and the cost per plate.

## Picture

```text
 1. requirements     users, tasks, scale, latency target, cost target, safety needs
 2. approach         prompting → RAG → agent → fine-tuning (cheapest that works)
 3. data             sources, chunking, embeddings, vector + keyword index, freshness
 4. serving          API, streaming, timeouts, retries, fallback model, cache
 5. quality          eval set, groundedness, human handover
 6. safety           prompt injection, personal data, permissions on tools
 7. cost and scale   tokens per request × requests, model routing, caching
```

## How it works inside

- **Requirements first**: who uses it, how many requests per day, how fast (time to first token), how much per request, and what must never happen (leaking another user's data).
- **Pick the simplest approach that works**: prompting for general skills; RAG when answers live in your documents; an agent when it must take steps with tools; fine-tuning for a fixed style or a narrow task at scale.
- **Data pipeline**: ingest, chunk, embed, index; re-index when documents change.
- **Serving**: an API in front, rate limits per user, streaming, timeouts, retries on temporary errors, a fallback model, caching of repeated questions.
- **Quality**: an eval set run on every change; human handover when confidence is low.
- **Safety**: treat retrieved text and user input as untrusted; tools get only the permissions they need; the service (not the model) decides whose data is read.
- **Cost**: estimate tokens per request × requests per day × price; cut it with caching, smaller models for easy questions, and shorter prompts.

## Python, step by step

A back-of-the-envelope cost estimate, the kind interviewers ask for:

```python
requests_per_day = 100_000
input_tokens, output_tokens = 2_000, 300          # question + retrieved chunks, and the answer
in_price, out_price = 250, 1250                   # rupees per 1 million tokens (example numbers)
cache_hit_rate = 0.30                             # 30% of questions are answered from cache

paid = requests_per_day * (1 - cache_hit_rate)
per_request = (input_tokens * in_price + output_tokens * out_price) / 1_000_000
print("cost per request ₹", round(per_request, 3))
print("cost per day ₹", round(paid * per_request))
print("cost per month ₹", round(paid * per_request * 30))
```

```output
cost per request ₹ 0.875
cost per day ₹ 61250
cost per month ₹ 1837500
```

## Time and space

| Lever | Effect |
| --- | --- |
| Caching | fewer paid calls |
| Small model for easy questions | lower average cost |
| Fewer, better chunks | fewer input tokens, often better answers |
| Streaming | faster feel, same cost |

## Common mistakes

- Jumping to fine-tuning before trying prompting and RAG.
- No eval plan, so "it seems better" is the only measure.
- Forgetting cost: 1 lakh requests a day multiplies every token.
- Letting the model decide whose data a tool reads.

## Patterns that use it

RAG, agents, MCP, evals, guardrails, LLM calls in production, the LLM assistant design.

## Practice

```practice
Design a RAG search for a 5,000-page company handbook in 30 minutes, aloud
Estimate the monthly cost of your design at 10,000 and at 1 lakh questions a day
List the 5 things that must never go wrong in your design and how you prevent each
```

## Explain it back

```explain
How do you choose between prompting, RAG, an agent and fine-tuning?
Which numbers do you need for a cost estimate?
```

## Flashcards

```flashcards
First step of an AI system design? :: Requirements: users, scale, latency and cost targets, and what must never happen.
Order to try approaches? :: Prompting, then RAG, then an agent, then fine-tuning: the cheapest that works.
How do you estimate cost? :: Tokens per request × requests per day × price, minus cache hits.
Who decides whose data a tool reads? :: The service, from the login, never the model.
```
