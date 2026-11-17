---
id: m-transformers
title: Transformers at a high level
level: core
phase: 3
week: 33
tags: [ml, transformers, attention, llm]
estMinutes: 25
---

## What it is

The **transformer** is the neural network design behind every modern LLM (from the 2017 paper "Attention Is All You Need").
Its key idea is **attention**: for each token, the model looks at every other token in the context and decides how much each one matters for understanding it.
An LLM is a big stack of transformer layers trained to predict the next token.

## Real-life example

In "The cricketer hit the ball and it flew over the boundary", what is "it"? You glance back over the sentence and notice "ball" matters most, "cricketer" a little, "the" not at all. Attention does that glance for every word, in every layer.

## Picture

```text
 tokens:  The  ball  hit  the  window  and  it  broke
                                             │
 attention from "it":  ball 0.15  window 0.70  others small
                                             ▼
 "it" now carries meaning from "window"

 an LLM:
 tokens ─► embeddings + positions ─► [attention ─► feed-forward] × N layers ─► probabilities for the next token
```

## How it works inside

- **Embeddings**: each token becomes a vector; **positional information** is added so word order matters.
- **Self-attention**: each token makes a query; every token offers a key and a value. Query × key scores say how relevant each token is; softmax turns scores into weights; the output is the weighted mix of values.
- **Multi-head attention**: several attention "heads" run side by side, each free to focus on a different kind of relation.
- **Feed-forward layers** then process each token's mixed information.
- **Stacking**: dozens of these layers build up meaning step by step.
- **Next-token prediction**: the last layer gives a probability for every token in the vocabulary; generation picks one, appends it, and repeats.
- **Why it won**: attention looks at all tokens in parallel (fast on GPUs) and handles long-range relations better than older sequence models.
- **Cost**: attention compares every token with every other, so cost grows quickly with context length.

## Python, step by step

Attention weights for one query, with tiny 2-number vectors: scores, then softmax.

```python
import math

def softmax(scores):
    exps = [math.exp(s) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

query_it = [1.0, 2.0]                                   # "it" is looking for something breakable
keys = {"ball": [1.0, 0.5], "window": [0.5, 2.0], "hit": [0.2, 0.1]}

scores = [sum(q * k for q, k in zip(query_it, key)) for key in keys.values()]
weights = softmax(scores)
for word, w in zip(keys, weights):
    print(f"{word:7} {w:.2f}")
```

```output
ball    0.07
window  0.91
hit     0.02
```

## Time and space

| Part | Cost grows with |
| --- | --- |
| Attention | context length squared |
| Feed-forward | context length × model width |
| Model size | layers × width (billions of parameters) |

## Common mistakes

- Thinking the model "looks up" facts; it predicts likely next tokens.
- Forgetting that word order comes from positional information, not from attention itself.
- Assuming longer context is free; attention cost grows fast.

## Patterns that use it

Tokens and context window, embeddings, fine-tuning and LoRA, the "Attention Is All You Need" paper.

## Practice

```practice
Change the query in the example so "ball" gets the highest weight
Explain self-attention to a friend in 5 sentences, without maths
Read the abstract and Figure 1 of "Attention Is All You Need" and label each box
```

## Explain it back

```explain
What does attention let each token do?
Why are transformers fast to train on GPUs?
```

## Flashcards

```flashcards
What is attention? :: Each token weighs how much every other token matters, then mixes in their information.
What does softmax do in attention? :: Turns raw scores into weights that add up to 1.
Why add positional information? :: Attention alone ignores word order.
What does an LLM's last layer output? :: A probability for every possible next token.
How does attention cost grow? :: Roughly with the square of the context length.
```
