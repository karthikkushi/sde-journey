---
id: j-deploy-ai
title: Deploying an AI-backed API
level: advanced
phase: 3
week: 39
tags: [ai, backend, fastapi, deploy]
estMinutes: 35
---

## What it is

Putting an LLM feature behind your own backend API, ready for real users.
The model call is the easy part. The backend work is what makes it safe and affordable: keep the key secret, validate and limit input, cap usage per user, cache, handle timeouts and provider errors, log tokens and cost, and test without spending money.

## Real-life example

A restaurant does not let customers walk into the kitchen. Orders go through the counter, which checks them, limits "one free refill", and tells you "kitchen is busy, 10 minutes". Your API is that counter in front of the model provider.

## Picture

```text
 app / website ──HTTPS──▶ your API (/ask)
                            │ 1. validate input (length, type)        → 422
                            │ 2. per-user limit                       → 429
                            │ 3. cache hit? return it                  (free, instant)
                            │ 4. call the LLM with a timeout + retries ──▶ provider (key from env var)
                            │ 5. provider down/slow?                  → 503 "please retry"
                            │ 6. log user, tokens, cost, latency
                            ▼
                         JSON answer (or a stream)
```

## How it works inside

- **Key**: only on the server, from an environment variable or secret manager. The browser or mobile app never sees it.
- **Input limits**: maximum question length (cost control and abuse protection); reject early with 422.
- **Per-user limits**: requests per minute and per day; 429 when exceeded. Use Redis when you run more than one server.
- **Caching**: normalised question → stored answer, with an expiry.
- **Failures**: timeouts, retries with backoff for 429/5xx (the SDK does some), a friendly 503, maybe a fallback model or a canned answer.
- **Testability**: wrap the LLM in a small class and inject it (FastAPI `Depends`); tests swap in a fake. No keys, no cost, no flaky tests.
- **Observability**: log tokens, cost, latency, errors and refusals per request; alert when daily spend crosses a budget.
- **Streaming**: for chat UIs, stream tokens to the client (Server-Sent Events) so users see text quickly.
- **Deploy**: same as any API: Docker image, env vars on the host, health check endpoint, CI running tests and evals.

> **Same thing in ASP.NET Core**: register the LLM wrapper in DI (`builder.Services.AddSingleton<ILlm, ClaudeLlm>()`), read the key from configuration/user secrets, add retries and timeouts with `Microsoft.Extensions.Http.Resilience`, and use the built-in rate limiter (`builder.Services.AddRateLimiter(...)` + `app.UseRateLimiter()`). Tests replace the service with a fake.

## Python, step by step

A FastAPI endpoint with validation, a daily limit, a cache, error handling and logging, tested with a fake LLM:

```python
from fastapi import Depends, FastAPI, HTTPException
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field

class Ask(BaseModel):
    user_id: str
    question: str = Field(min_length=3, max_length=500)       # limit input = limit cost

class FakeLLM:
    """Tests use this instead of the real model: free and predictable."""
    def __init__(self):
        self.calls = 0

    def answer(self, question):
        self.calls += 1
        if "crash" in question:
            raise TimeoutError("model took too long")
        return f"Short answer about: {question}", 40              # (text, tokens used)

llm = FakeLLM()

def get_llm():
    return llm

app = FastAPI()
cache, used_today = {}, {}            # in memory: fine for one server; use Redis for several
DAILY_LIMIT = 2

@app.post("/ask")
def ask(body: Ask, model=Depends(get_llm)):
    key = body.question.strip().lower()
    if key in cache:
        return {"answer": cache[key], "cached": True}
    if used_today.get(body.user_id, 0) >= DAILY_LIMIT:
        raise HTTPException(429, "Daily limit reached. Try again tomorrow.")
    try:
        text, tokens = model.answer(body.question)
    except TimeoutError:
        raise HTTPException(503, "The AI service is busy. Please retry.")
    used_today[body.user_id] = used_today.get(body.user_id, 0) + 1
    cache[key] = text
    print(f"log user={body.user_id} tokens={tokens}")          # real apps: structured logs + a cost dashboard
    return {"answer": text, "cached": False}

client = TestClient(app)
print(client.post("/ask", json={"user_id": "u1", "question": "What is RAG?"}).json())
print(client.post("/ask", json={"user_id": "u1", "question": "what is rag? "}).json())
print(client.post("/ask", json={"user_id": "u1", "question": "hi"}).status_code)
print(client.post("/ask", json={"user_id": "u1", "question": "please crash"}).json())
for q in ["question one", "question two", "question three"]:
    r = client.post("/ask", json={"user_id": "u2", "question": q})
print(r.status_code, r.json())
print("model calls:", llm.calls)
```

```output
log user=u1 tokens=40
{'answer': 'Short answer about: What is RAG?', 'cached': False}
{'answer': 'Short answer about: What is RAG?', 'cached': True}
422
{'detail': 'The AI service is busy. Please retry.'}
log user=u2 tokens=40
log user=u2 tokens=40
429 {'detail': 'Daily limit reached. Try again tomorrow.'}
model calls: 4
```

The production class that replaces `FakeLLM` (same `answer()` method, so the endpoint does not change):

```python norun
import anthropic

class ClaudeLLM:
    def __init__(self):
        # Key from the ANTHROPIC_API_KEY env var. The SDK retries 429/5xx twice by default.
        self.client = anthropic.Anthropic(timeout=30.0)

    def answer(self, question):
        try:
            r = self.client.messages.create(
                model="claude-opus-5-5",
                max_tokens=16000,
                system="Answer in at most 5 short lines, in simple English.",
                messages=[{"role": "user", "content": question}],
            )
        except (anthropic.APIConnectionError, anthropic.RateLimitError, anthropic.InternalServerError) as e:
            raise TimeoutError(str(e)) from e          # the endpoint turns this into a 503
        if r.stop_reason == "refusal":
            return "Sorry, I can't help with that.", r.usage.input_tokens + r.usage.output_tokens
        text = "".join(b.text for b in r.content if b.type == "text")
        return text, r.usage.input_tokens + r.usage.output_tokens
```

## Time and space

| Concern | Typical answer |
| --- | --- |
| Slow model calls (seconds) | timeouts, streaming, async workers or a queue for long jobs |
| Cost | input limits, per-user quotas, caching, budget alerts |
| Provider outage | retries, 503 with a clear message, fallback |
| Many servers | shared Redis for limits and cache |

## Common mistakes

- Calling the provider directly from the browser or app with the key inside.
- No per-user quota: one script can spend your whole month's budget overnight.
- Tests that call the real model (slow, flaky, costly).
- Returning raw provider errors (with internal details) to users.
- No logs of tokens and cost, so a bill spike cannot be explained.
- Blocking a web worker for a 60-second call; use async or a background job for long tasks.

## Patterns that use it

Dependency injection, rate limiting, caching, retries/backoff/timeouts, queues for long jobs, logging and metrics, Docker and CI/CD (see the backend notes).

## Practice

```practice
Add a /health endpoint and a test for it.
Make the cache expire answers after 1 hour, and add a test that uses a fake clock.
Return a "usage" field with the tokens used, and keep a running total of cost per user.
Deploy this API (with FakeLLM) to a free host, then switch to the real model with the key in an env var.
```

## Explain it back

```explain
Why must the model call go through your backend?
List the checks /ask does before calling the model, in order.
How do you test an AI endpoint without spending money?
What do you log for every request, and why?
How would you handle the provider being down?
```

## Flashcards

```flashcards
Where does the LLM key live? :: Only on the server, in an env var or secret manager.
Test AI endpoints how? :: Inject the LLM wrapper and use a fake in tests.
Status for too many requests? :: 429.
Status when the AI provider is down? :: 503 with a retry message.
Log per request? :: User, tokens, cost, latency, errors/refusals.
Long AI jobs? :: Background job/queue, or stream the response.
```
