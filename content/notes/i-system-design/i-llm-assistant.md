---
id: i-llm-assistant
title: "System design: an LLM assistant at scale"
level: advanced
phase: 5
week: 52
tags: [system-design, ai, llm, rag]
estMinutes: 40
---

## What it is

Design a customer-support assistant for an app with millions of users: it answers questions from help articles and the user's own orders, and hands over to a human when unsure.
It combines normal backend design (APIs, queues, caches, rate limits) with **retrieval (RAG)**, **tool calls** for order data, **guardrails**, **streaming**, **cost control** and **evaluation**.

## Real-life example

A bank's front desk. The person at the desk answers common questions from the rule book, looks up your account when you show ID, and sends you to the branch manager for anything unusual. They never guess an answer about your money.

## Picture

```text
 app ──► API gateway (auth, rate limit per user)
             │
             ▼
        Assistant service ── cache (same question + same articles)
             │  1. guardrail on input (PII, abuse)
             │  2. retrieve: vector + keyword search over help articles
             │  3. tools: get_orders(user) via the orders API (only this user's data)
             │  4. LLM call (timeout, retries, fallback model), streamed back
             │  5. guardrail on output; low confidence → hand over to a human agent
             ▼
        logs: tokens, cost, latency, retrieved docs, outcome ──► eval set + dashboards
```

## How it works inside

**Requirements**: answer in about 2 seconds to the first token, cite sources, never show another user's data, hand over to humans, keep cost per conversation under a target.

**Retrieval**: articles split into chunks, embedded, stored in a vector index (pgvector or a vector database) plus keyword search (BM25); combine both (hybrid search) and pass the top few chunks to the model.

**Tools for live data**: the model can call `get_orders` and `get_refund_status`. The service passes the **logged-in user's id itself**; the model never chooses whose data to read.

**Guardrails**: mask personal data in logs, block prompt-injection tricks in retrieved text, refuse topics outside support, and check answers for claims not supported by the sources.

**Scale and cost**: most questions repeat ("where is my order", "refund status"), so cache answers by (question intent, relevant articles). Use a small model for routing and simple answers, a larger one for hard cases. Rate-limit per user. Long conversations get summarised.

**Reliability**: timeouts, retries on temporary errors, a fallback model, and a graceful "let me connect you to an agent" when everything fails.

**Evaluation**: a fixed set of real questions with good answers, scored on every change (accuracy, groundedness, refusal when unsure), plus live metrics: handover rate, thumbs down, cost per conversation.

## Python, step by step

Routing: cheap answers for common intents, the big model only when needed, and a human when confidence is low.

```python
CACHE = {"order_status": "Your order status is on the Orders page."}

def classify(question):
    q = question.lower()
    if "where is my order" in q or "order status" in q:
        return "order_status", 0.95
    if "refund" in q:
        return "refund", 0.80
    return "other", 0.40

def answer(question):
    intent, confidence = classify(question)
    if intent in CACHE:
        return "cache", CACHE[intent]
    if confidence < 0.5:
        return "human", "Connecting you to a support agent."
    return "big-model", f"(LLM answer about {intent}, grounded in articles)"

for q in ["Where is my order?", "When will my refund come?", "Can you write my essay?"]:
    print(answer(q))
```

```output
('cache', 'Your order status is on the Orders page.')
('big-model', '(LLM answer about refund, grounded in articles)')
('human', 'Connecting you to a support agent.')
```

## Time and space

| Lever | Effect |
| --- | --- |
| Cache common intents | big cost and latency cut |
| Small model first, big model when needed | lower average cost |
| Streaming | fast first token |
| Eval set in CI | catches quality drops before users do |

## Common mistakes

- Letting the model choose which user's data to fetch.
- No evaluation set, so quality changes go unnoticed.
- Sending every question to the biggest model.
- No human handover path.

## Patterns that use it

RAG, vector search, evals, guardrails, LLM calls in production, MCP tools, rate limiting, caching.

## Practice

```practice
Draw this design in 30 minutes and explain how you stop one user seeing another's orders
Estimate the monthly LLM cost for 1 lakh conversations a day, with and without caching
Design the evaluation set: 30 questions, what counts as a good answer, how you score it
Add a human-handover rule to your project's AI feature
```

## Explain it back

```explain
Why must the service, not the model, decide whose data a tool reads?
How does caching by intent cut cost?
What would you measure to know the assistant is getting worse?
```

## Flashcards

```flashcards
What is hybrid search? :: Combining vector (meaning) search with keyword (BM25) search.
Who picks the user id for a data tool? :: The service, from the login session, never the model.
How do you cut LLM cost at scale? :: Cache common intents, route simple questions to a small model, rate-limit.
What is an eval set? :: Fixed real questions with good answers, scored on every change.
```
