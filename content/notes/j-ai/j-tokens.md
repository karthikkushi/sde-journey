---
id: j-tokens
title: Tokens and the context window
level: basic
phase: 2
week: 10
tags: [ai, llm, tokens, context-window, cost]
estMinutes: 20
---

## What it is

An LLM does not read letters or whole words. It reads **tokens**: small pieces of text, often a word or part of a word. "playing" may be "play" + "ing".
The **context window** is how many tokens the model can look at in one go: your instructions, the conversation, any documents, and its own answer, all together.
You pay per token, and more tokens also means slower answers.

## Real-life example

A chai stall charges per cup, not per sip. An LLM provider charges per token, not per word. And the stall's table only holds so many cups at once: that table is the context window. Bring more cups than fit, and some must go.

## Picture

```text
 "I love masala chai!"
   ┌───┐┌─────┐┌───────┐┌──────┐┌───┐
   │ I ││ love││ masala││ chai ││ ! │   ≈ 5 tokens
   └───┘└─────┘└───────┘└──────┘└───┘

 context window (example: 200,000 tokens)
 ┌──────────────┬───────────────────┬──────────────┬───────────┐
 │ instructions │ conversation so far│ documents    │ the answer │
 └──────────────┴───────────────────┴──────────────┴───────────┘
   everything must fit; the oldest parts get cut or summarised first
```

## How it works inside

- **Tokenizer**: turns text into token ids using a fixed vocabulary learned from lots of text. Common words are one token; rare words, names and code split into several.
- **Rough rule for English**: 1 token ≈ 4 characters ≈ ¾ of a word. Hindi, Tamil and other scripts usually need more tokens per word, so they cost more.
- **Input tokens** (what you send) and **output tokens** (what the model writes) are counted and priced separately; output usually costs more.
- **Context window**: the model's maximum. Long chats grow every turn because the whole history is sent each time.
- **Max output tokens**: a limit you set for the answer. Too low and the answer is cut off mid-sentence.
- **Why it matters**: tokens decide cost, speed, and whether your documents even fit. RAG exists partly because whole libraries never fit in a context window.

## Python, step by step

A rough token estimate and a cost estimate (real tokenizers give exact counts; the 4-characters rule is only for planning):

```python
def estimate_tokens(text):
    return max(1, round(len(text) / 4))          # rough rule for English

def cost_rupees(input_tokens, output_tokens, in_price=250, out_price=1250):
    # prices in rupees per 1 million tokens (made-up example numbers)
    return (input_tokens * in_price + output_tokens * out_price) / 1_000_000

question = "Explain binary search to a beginner with a simple Indian example."
inp = estimate_tokens(question)
out = 400                                         # we expect about 400 tokens back
print("input tokens ≈", inp)
print("cost for one answer ≈ ₹", round(cost_rupees(inp, out), 4))
print("cost for 1,000 answers ≈ ₹", round(cost_rupees(inp, out) * 1000, 2))
```

```output
input tokens ≈ 16
cost for one answer ≈ ₹ 0.504
cost for 1,000 answers ≈ ₹ 504.0
```

Why long chats get expensive: the whole history is sent every turn.

```python
turn_tokens = 300
history = 0
for turn in range(1, 6):
    history += turn_tokens                  # each turn adds about 300 tokens
    print(f"turn {turn}: sending {history} tokens")
```

```output
turn 1: sending 300 tokens
turn 2: sending 600 tokens
turn 3: sending 900 tokens
turn 4: sending 1200 tokens
turn 5: sending 1500 tokens
```

## Time and space

| Thing | Grows with |
| --- | --- |
| Cost | input tokens + output tokens |
| Answer time | mostly output tokens |
| A chat's input | the whole history, every turn |

## Common mistakes

- Thinking 1 word = 1 token.
- Pasting a whole book and expecting it to fit.
- Setting max output tokens too low, so answers stop mid-sentence.
- Forgetting that long chats resend everything each turn.

## Patterns that use it

Cost and latency, RAG (send only the relevant chunks), summarising old chat turns, choosing max output tokens.

## Practice

```practice
Estimate the tokens in your last 3 WhatsApp messages with the 4-characters rule, then check with a tokenizer page
Work out the cost of 100 questions a day for a month with the example prices
Explain why a 50-turn chat costs more per turn than a 5-turn chat
```

## Explain it back

```explain
What is a token, in your own words?
What has to fit inside the context window?
Why do long chats cost more each turn?
```

## Flashcards

```flashcards
What is a token? :: A small piece of text (a word or part of one) that the model reads and writes.
Rough tokens for English text? :: About 1 token per 4 characters, or ¾ of a word.
What is the context window? :: The most tokens the model can look at at once: instructions, history, documents and answer together.
Which usually costs more, input or output tokens? :: Output tokens.
Why does a long chat get expensive? :: The whole history is sent again every turn.
```
