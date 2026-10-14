---
id: j-llm-api
title: Call an LLM API from Python
level: core
phase: 2
week: 19
tags: [ai, llm, api, python]
estMinutes: 30
---

## What it is

An LLM provider runs the model on its servers. You send an HTTP request with your **messages**; it sends back the model's reply, why it stopped, and how many **tokens** you used (your bill).
Providers ship an official Python package (an SDK) so you call a function instead of building HTTP requests by hand. Here we use Anthropic's SDK for Claude; other providers look very similar.

## Real-life example

Like ordering on a food app: you send the order (messages + settings), the kitchen (the model) cooks, and you get the food plus a bill (token usage). If the kitchen is busy you get "try again" (a rate limit), and the app retries for you.

## Picture

```text
 your code ──▶ client.messages.create(model, max_tokens, system, messages) ──HTTPS──▶ provider
           ◀── response: content blocks (the text), stop_reason, usage (input/output tokens)

 messages = [ {"role": "user", "content": "..."},           ◀ what the user said
              {"role": "assistant", "content": "..."},      ◀ what the model said earlier
              {"role": "user", "content": "..."} ]          ◀ the new question
 system   = "You are a patient tutor..."                     ◀ the role and rules, set by you
```

## How it works inside

- **API key**: proves who you are and who pays. Keep it in an environment variable, **never in code or git**. If it leaks, revoke it in the console and make a new one.
- **model**: which model to use. **max_tokens**: the most tokens the reply may use (a ceiling, not a target: you pay only for what is generated).
- **system**: your instructions for the whole conversation (role, tone, rules).
- **messages**: the conversation so far. The API is **stateless**, so you resend the history on every call.
- **response.content**: a list of blocks. Read the `text` blocks. **stop_reason** tells you why it stopped: `end_turn` (finished), `max_tokens` (cut off), `tool_use` (wants a tool, see agents), `refusal` (declined for a safety reason).
- **Errors**: 429 (rate limited) and 5xx (server problems) are retried automatically by the SDK (2 retries by default). 400 means your request is wrong: fix it, do not retry.

## Python, step by step

Hello world. This needs `pip install anthropic`, a key from the provider's console, and costs a little money, so the checker does not run it:

```python norun
# In your terminal, not in code:
#   export ANTHROPIC_API_KEY="..."            (Windows PowerShell: $env:ANTHROPIC_API_KEY="...")
import anthropic

client = anthropic.Anthropic()          # reads ANTHROPIC_API_KEY from the environment

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=16000,                    # a ceiling; you pay only for tokens actually generated
    system="You are a patient tutor. Answer in simple English with an Indian everyday example.",
    messages=[{"role": "user", "content": "Explain a hash map in 5 lines."}],
)

for block in response.content:          # the reply is a list of blocks; text blocks hold the words
    if block.type == "text":
        print(block.text)
print(response.stop_reason)             # "end_turn" = finished, "max_tokens" = cut off
print(response.usage.input_tokens, response.usage.output_tokens)   # what you pay for
```

Good habits for real apps: catch errors by type, and handle a refusal before reading the text.
`fallbacks="default"` asks the API to retry a safety refusal on a recommended fallback model:

```python norun
import anthropic

client = anthropic.Anthropic(timeout=60.0)        # seconds; retries 429/5xx twice by default

try:
    response = client.beta.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        messages=[{"role": "user", "content": "Summarise this bug report: ..."}],
    )
except anthropic.RateLimitError:
    print("Too many requests. Wait and try again later.")
except anthropic.APIStatusError as e:
    print("API error", e.status_code, e.message)
except anthropic.APIConnectionError:
    print("Network problem.")
else:
    if response.stop_reason == "refusal":
        print("The model declined this request.")
    else:
        print("".join(b.text for b in response.content if b.type == "text"))
```

Practise the conversation logic without a key: a fake client with the same shape. Notice that the input grows every turn, because the whole history is sent again:

```python
from types import SimpleNamespace as NS

class FakeClient:
    """Same shape as the real client, so you can practise for free."""
    def __init__(self):
        self.messages = self                       # so client.messages.create(...) works
        self.calls = 0

    def create(self, model, max_tokens, messages, system=None):
        self.calls += 1
        reply = f"(reply {self.calls}) I got: {messages[-1]['content']!r}"
        words_in = sum(len(m["content"].split()) for m in messages)
        return NS(content=[NS(type="text", text=reply)], stop_reason="end_turn",
                  usage=NS(input_tokens=words_in, output_tokens=len(reply.split())))

def chat(client, history, user_text):
    history.append({"role": "user", "content": user_text})
    response = client.messages.create(model="claude-opus-5-5", max_tokens=16000, messages=history)
    text = "".join(b.text for b in response.content if b.type == "text")
    history.append({"role": "assistant", "content": text})
    return text, response.usage.input_tokens

client, history = FakeClient(), []
for question in ["hi", "what is a token?", "and a context window?"]:
    text, size = chat(client, history, question)
    print(f"{text:<40} input size {size}")
print(len(history), "messages in history")
```

```output
(reply 1) I got: 'hi'                    input size 1
(reply 2) I got: 'what is a token?'      input size 10
(reply 3) I got: 'and a context window?' input size 22
6 messages in history
```

## Time and space

| Part | Typical |
| --- | --- |
| One call | from about a second to a minute, mostly decided by output length |
| Cost per call | input tokens × input price + output tokens × output price |
| Long chats | input grows every turn (history is resent) |
| Retries | automatic for 429 and 5xx; set a timeout |

## Common mistakes

- Putting the API key in code, a notebook or a GitHub repo.
- Calling the API from browser JavaScript (anyone can read the key). Call it from your backend.
- Reading `response.content[0].text` without checking the block type or `stop_reason`.
- Setting `max_tokens` too low, so answers are cut off (`stop_reason == "max_tokens"`).
- Retrying 400 errors forever. Those are bugs in your request.
- Forgetting the history, then wondering why the model "forgot" the user's name.

## Patterns that use it

Every LLM feature; RAG and agents are built on this same call. Backend skills apply directly: env vars for secrets, retries with backoff, timeouts, logging usage.

## Practice

```practice
Run the fake client chat for 6 questions. Print the input size each turn. How would you keep it from growing forever?
Write keep_last(history, n) that keeps only the last n messages (and always starts with a user message).
Make a free-tier account with any LLM provider, store the key in an env var, and run the hello world once.
Add a timeout and print stop_reason and usage for every call. Make a call hit max_tokens on purpose.
```

## Explain it back

```explain
What goes into a request, and what comes back?
Why must the API key never be in code or in the frontend?
What is stop_reason, and what do you do for "max_tokens" and "refusal"?
Why does the input get bigger in a long chat?
Which errors should be retried, and which should not?
```

## Flashcards

```flashcards
Where should the API key live? :: In an environment variable or secret store, never in code or git.
Is the LLM API stateful? :: No. Send the conversation history every call.
stop_reason "max_tokens"? :: The reply was cut off; raise max_tokens or ask for less.
system prompt? :: Your instructions for the whole conversation: role, tone, rules.
Which errors are worth retrying? :: 429 rate limits and 5xx server errors (the SDK does it).
What do you pay for? :: Input tokens plus output tokens.
```
