---
id: j-llm-production
title: "LLM calls in production: streaming, retries, fallbacks, cost"
level: advanced
phase: 3
week: 41
tags: [ai, llm, production, retries, cost]
estMinutes: 30
---

## What it is

Calling an LLM in a demo is one line. In production the call is **slow** (seconds), **sometimes fails** (rate limits, overload), and **costs money per token**.
So you need the backend basics around it: **timeouts and retries**, a **fallback** model or provider, **streaming** so users see text early, **background jobs** for long work, and **per-request tracking** of tokens, cost and latency.

## Real-life example

A popular dosa stall at lunch hour. Orders take a while, so the stall gives you a token number and starts serving the chutney first (streaming). If the main cook is overloaded, the second cook takes the order (fallback). The owner writes down every order and its cost, so at the end of the day they know which items earn money.

## Picture

```text
 request ──► timeout 20 s ──► primary model ──ok──► stream tokens to the user
                 │                 │
                 │           429 / 529 / timeout
                 │                 ▼
                 │          retry with backoff (max 2)
                 │                 │ still failing
                 │                 ▼
                 └──────────► fallback model ──► answer (marked as fallback)

 every call logs: model, input tokens, output tokens, cost, latency, outcome
```

## How it works inside

- **Timeouts**: always set one. A stuck call holds a worker forever.
- **Retries**: only on temporary errors (429 rate limit, 5xx, overload, timeouts), with backoff and jitter. Respect a `retry-after` header if given.
- **Fallbacks**: a second model (often smaller, cheaper) or another provider when the first is down. Record that you used it.
- **Streaming**: send tokens as they arrive (server-sent events). Time to the first token matters more to users than total time.
- **Long work in the background**: summarising 200 pages goes to a queue; the API returns a job id and the client polls or gets a webhook.
- **Concurrency**: async calls let one server handle many waiting requests; a semaphore caps parallel calls to stay under rate limits.
- **Cost tracking**: cost = input tokens × input price + output tokens × output price. Log it per request and per user, and alert on spikes.
- **Caching**: identical prompts (and the provider's prompt caching for long shared prefixes) cut cost and latency.

## Python, step by step

A wrapper with retries, a fallback and per-call cost logging. The models are fake, so it runs anywhere:

```python
import random

random.seed(1)
PRICES = {"big": (3.0, 15.0), "small": (0.8, 4.0)}      # rupees per million tokens: (input, output), made-up numbers
log = []

class Overloaded(Exception):
    pass

def fake_model(name, prompt, fail_times):
    if fail_times.get(name, 0) > 0:
        fail_times[name] -= 1
        raise Overloaded(name)
    return f"[{name}] answer", len(prompt.split()) * 4, 120   # text, input tokens, output tokens

def ask(prompt, fail_times, retries=2):
    for model in ("big", "small"):                       # primary, then fallback
        for attempt in range(retries + 1):
            try:
                text, tin, tout = fake_model(model, prompt, fail_times)
                pin, pout = PRICES[model]
                cost = (tin * pin + tout * pout) / 1_000_000
                log.append((model, attempt, tin, tout, round(cost, 6)))
                return text
            except Overloaded:
                continue                                 # (real code: sleep with backoff + jitter here)
    return "Sorry, please try again in a minute."

print(ask("summarise this order history for the customer", {}))
print(ask("summarise this order history for the customer", {"big": 5}))
print(ask("hello", {"big": 5, "small": 5}))
for row in log:
    print(row)
```

```output
[big] answer
[small] answer
Sorry, please try again in a minute.
('big', 0, 28, 120, 0.001884)
('small', 0, 28, 120, 0.000502)
```

> With the Claude API, the official SDKs already retry temporary errors with backoff (`max_retries`) and support streaming; you still add timeouts, fallbacks and cost logging yourself.

## Time and space

| Concern | Typical fix |
| --- | --- |
| Users wait too long | stream; show the first token fast |
| Rate limits | semaphore, backoff, queue |
| Provider outage | fallback model or provider |
| Cost surprise | per-request token log, budget alerts, caching |

## Common mistakes

- No timeout, so one stuck call blocks a worker.
- Retrying on every error, including bad requests (400) that will never succeed.
- Not logging tokens, then a surprise bill.
- Doing long LLM work inside the web request instead of a background job.

## Patterns that use it

The AI feature in your flagship project, RAG answers, agents and tool calling, the LLM assistant system design.

## Practice

```practice
Wrap your project's LLM call with a timeout, retries on 429/5xx only, and a fallback model
Log input tokens, output tokens, cost and latency for every call, and chart cost per day
Move one long LLM task to a background job that returns a job id
Stream one response to the browser and measure time to the first token
```

## Explain it back

```explain
Which errors should you retry, and which should you not?
Why does time to the first token matter so much?
How do you find out which feature costs the most?
```

## Flashcards

```flashcards
Which LLM errors are worth retrying? :: Rate limits (429), overload and server errors (5xx), and timeouts, with backoff.
What is a fallback model? :: A second model or provider used when the first fails; log that you used it.
Why stream responses? :: Users see text early; time to the first token feels like speed.
How do you compute the cost of one call? :: Input tokens × input price + output tokens × output price.
Where should long LLM work run? :: In a background job, not inside the web request.
```
