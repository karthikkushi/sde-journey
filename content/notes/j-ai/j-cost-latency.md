---
id: j-cost-latency
title: Cost and latency of LLM calls
level: core
phase: 2
week: 26
tags: [ai, llm, cost, performance, caching]
estMinutes: 25
---

## What it is

Every LLM call costs **money** (input tokens × input price + output tokens × output price) and **time** (wait for the first token, then the rest stream out).
A feature that costs ₹0.50 per use is fine for 100 users and a disaster for 100,000. Doing the maths before you build is a core skill for an AI-backed backend.

## Real-life example

An auto ride: a fixed charge plus a per-km rate. Input tokens are like the fixed part you control by packing less; output tokens are the per-km part and usually cost several times more. "Answer in 3 lines" is like taking the shorter route.

## Picture

```text
 cost  = input_tokens × input_price + output_tokens × output_price      (prices are per million tokens)
 time  = time to first token + output_tokens ÷ tokens per second

 prompt: [ fixed instructions + examples (same every call) | retrieved chunks | question ]
           └──── cacheable prefix: cheaper on repeat ─────┘
```

## How it works inside

- **Output tokens cost more** than input tokens (often 5×). Reasoning or "thinking" tokens are billed as output too.
- **Model size**: bigger models are smarter, slower and pricier. Measure with evals whether a smaller model is good enough for simple tasks (classification, extraction).
- **Effort / reasoning settings**: many models let you choose how hard they think. Lower effort = fewer tokens and faster answers on easy tasks.
- **Prompt caching**: if the start of the prompt is identical across calls (fixed instructions first, changing parts last), providers can bill the repeated part at a fraction of the price.
- **Batch APIs**: for jobs that can wait (nightly summaries), batch endpoints are much cheaper (around half price) but return later.
- **Your own cache**: identical questions → reuse the stored answer, no call at all.
- **Latency**: stream the answer so users see words after the first token; keep outputs short; run independent calls in parallel; set timeouts.

## Python, step by step

Estimate the monthly bill before building:

```python
# Example prices in US dollars per million tokens (October 2026). Prices change: check the provider's pricing page.
PRICES = {
    "claude-opus-5-5":   {"input": 4.00, "output": 20.00},
    "claude-sonnet-5-5": {"input": 2.00, "output": 10.00},
    "claude-haiku-5-5":  {"input": 0.10, "output": 0.50},
}
INR_PER_USD = 88                     # change to today's rate

def cost_usd(model, input_tokens, output_tokens):
    p = PRICES[model]
    return (input_tokens * p["input"] + output_tokens * p["output"]) / 1_000_000

# A support bot: 2,000 input tokens and 300 output tokens per answer, 5,000 questions a day
for model in PRICES:
    one = cost_usd(model, 2_000, 300)
    month = one * 5_000 * 30
    print(f"{model:<18} ${one:.5f} per answer  ${month:>8,.2f} a month  (about ₹{month * INR_PER_USD:,.0f})")
```

```output
claude-opus-5-5    $0.01400 per answer  $2,100.00 a month  (about ₹184,800)
claude-sonnet-5-5  $0.00700 per answer  $1,050.00 a month  (about ₹92,400)
claude-haiku-5-5   $0.00035 per answer  $   52.50 a month  (about ₹4,620)
```

What caching the fixed part of the prompt saves (cached reads are billed at a fraction of the input price; 10% is assumed here):

```python
INPUT, OUTPUT, CACHED_FACTOR = 4.00, 20.00, 0.10      # $ per million tokens; check your provider

def per_answer(fixed, variable, output, cached):
    fixed_price = INPUT * CACHED_FACTOR if cached else INPUT
    return (fixed * fixed_price + variable * INPUT + output * OUTPUT) / 1_000_000

before = per_answer(1_800, 200, 300, cached=False)
after = per_answer(1_800, 200, 300, cached=True)
print(f"${before:.5f} -> ${after:.5f} per answer ({1 - after / before:.0%} cheaper)")
print(f"output share of the bill after caching: {300 * OUTPUT / 1_000_000 / after:.0%}")
```

```output
$0.01400 -> $0.00752 per answer (46% cheaper)
output share of the bill after caching: 80%
```

After caching, output is most of the bill, so "answer in 3 short lines" is the next big saving.

Latency: how long the user waits, and why streaming feels faster:

```python
def seconds(first_token_s, output_tokens, tokens_per_s):
    return first_token_s + output_tokens / tokens_per_s

for out in (100, 300, 1000):        # example speed: first token after 0.8 s, then 60 tokens a second
    print(f"{out:>5} output tokens: {seconds(0.8, out, 60):5.1f} s in total; with streaming, words appear after 0.8 s")
```

```output
  100 output tokens:   2.5 s in total; with streaming, words appear after 0.8 s
  300 output tokens:   5.8 s in total; with streaming, words appear after 0.8 s
 1000 output tokens:  17.5 s in total; with streaming, words appear after 0.8 s
```

Your own cache: the cheapest call is the one you never make:

```python
from functools import lru_cache

calls = 0

@lru_cache(maxsize=1000)
def answer(question):
    global calls
    calls += 1                       # this is where the real LLM call would go
    return f"answer to {question!r}"

for q in ["Refund time?", "refund time? ", "WFH days?", "REFUND TIME?"]:
    answer(q.strip().lower())        # normalise first, so small differences still hit the cache
print(calls, "model calls for 4 questions")
```

```output
2 model calls for 4 questions
```

## Time and space

| Lever | Saves | Trade-off |
| --- | --- | --- |
| Shorter outputs | cost + time | less detail |
| Prompt caching | input cost, some latency | keep the fixed part first and identical |
| Smaller model / lower effort | cost + time | check quality with evals |
| Batch API | about half the cost | results come later |
| Answer cache | everything for repeats | stale answers; set an expiry |
| Streaming | perceived latency | slightly more complex client |

## Common mistakes

- Building first and looking at the bill later. Estimate per request × requests per day × 30.
- Putting timestamps or user names at the start of the prompt, which breaks prompt caching.
- Letting answers ramble: output tokens are the expensive ones.
- Using the biggest model for simple classification without measuring a smaller one.
- No per-user limits, so one user (or bot) runs up the bill.
- No timeout, so a slow call ties up a server worker.

## Patterns that use it

Caching (LRU, TTL), rate limiting, queues and batch jobs, streaming responses, capacity estimation (system design).

## Practice

```practice
Your bot gets 20,000 questions a day with 3,000 input and 500 output tokens each. Estimate the monthly cost for each model in PRICES.
Change answer() so cached answers expire after 1 hour (store the time with the answer).
Measure the real input and output tokens of 10 calls in your project (response.usage) and compute the real cost.
Write a short plan to cut a feature's cost in half without losing quality, and how you would prove it (evals).
```

## Explain it back

```explain
How is the cost of one call calculated?
Why do output tokens matter more than input tokens for cost and time?
How does prompt caching work, and how can you accidentally break it?
Why does streaming feel faster even when the total time is the same?
Name five ways to reduce cost.
```

## Flashcards

```flashcards
Cost of a call? :: Input tokens × input price + output tokens × output price.
Which tokens are pricier? :: Output tokens (often several times the input price).
Prompt caching needs? :: An identical prompt prefix: fixed parts first, changing parts last.
Batch API? :: Cheaper (around half price) for jobs that can wait.
Streaming helps? :: Perceived latency: users see words after the first token.
Cheapest LLM call? :: The one you never make: cache repeated answers.
```
