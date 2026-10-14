---
id: j-fine-tuning
title: Fine-tuning, and when not to
level: advanced
phase: 3
week: 43
tags: [ai, llm, fine-tuning, machine-learning]
estMinutes: 25
---

## What it is

**Fine-tuning** means training an already-trained model a bit more on **your own examples**, so it learns a style, a format or a narrow task by heart.
It is usually the **last** tool to try: first a better prompt, then RAG for knowledge, and only then fine-tuning, when you have many good examples and a clear, measured reason.

## Real-life example

A new chef from a good culinary school (the pre-trained model) can already cook. Telling them "less spicy, serve on banana leaf" each time is prompting. Giving them the restaurant's recipe book is RAG. Making them cook your 500 house dishes for a month until it is automatic is fine-tuning: expensive, but then they do it without being told.

## Picture

```text
 need fresh or private FACTS?            ──▶ RAG (update documents, no training)
 need a certain BEHAVIOUR/FORMAT?        ──▶ better prompt + examples first
      still inconsistent, high volume, 500+ great examples, evals ready?
                                         ──▶ fine-tune (often a smaller, cheaper model)

 examples.jsonl ─▶ validate + dedupe ─▶ split train / validation ─▶ train (often LoRA)
                ─▶ compare with the best prompt on the SAME eval set ─▶ ship only if clearly better
```

## How it works inside

- **Data**: hundreds to thousands of high-quality input → ideal output pairs, usually as JSONL (one JSON conversation per line). Quality beats quantity; bad examples teach bad habits.
- **Split**: train on most, keep a validation set to watch for overfitting, and a final test set (your evals).
- **Full fine-tuning** updates all weights: costly and needs big GPUs. **LoRA** freezes the model and trains small extra matrices beside some layers: far fewer trainable numbers, cheaper, and the adapter is a small file. **QLoRA** also stores the frozen model in fewer bits to save memory.
- **Good uses**: a strict output format, a house writing style, a narrow classifier, making a small model do what a big model did (cheaper at scale).
- **Bad uses**: teaching facts that change (prices, policies) - use RAG; fixing problems a clearer prompt would fix.
- **Costs and risks**: data preparation, training cost, the model can forget general skills, you must retrain when the base model changes, and your data must be allowed to be used for training.
- **Availability**: some providers offer fine-tuning for some hosted models; open-weight models can be fine-tuned on your own or rented GPUs.

## Python, step by step

Prepare and check training data in the common chat JSONL format:

```python
import json

examples = [
    ("Order 101 delayed by rain", "Sorry! Your order 101 is delayed due to rain. New ETA: 30 minutes."),
    ("Order 102 rider assigned", "Good news! A rider has picked up order 102."),
    ("Order 101 delayed by rain", "Sorry! Your order 101 is delayed due to rain. New ETA: 30 minutes."),  # duplicate
    ("Order 103 cancelled", ""),                                                                          # empty answer
]

def to_line(event, reply):
    return json.dumps({"messages": [
        {"role": "system", "content": "Write a short, friendly customer update."},
        {"role": "user", "content": event},
        {"role": "assistant", "content": reply},
    ]})

seen, lines = set(), []
for event, reply in examples:
    if not reply.strip():
        print("skip (empty answer):", event)
    elif (event, reply) in seen:
        print("skip (duplicate):", event)
    else:
        seen.add((event, reply))
        lines.append(to_line(event, reply))
print(len(lines), "good examples")
print(lines[0][:80] + "...")
```

```output
skip (duplicate): Order 101 delayed by rain
skip (empty answer): Order 103 cancelled
2 good examples
{"messages": [{"role": "system", "content": "Write a short, friendly customer up...
```

A stable train/validation split: hash each example, so it always lands in the same set even when you add new data:

```python
import hashlib

def bucket(text, validation_percent=20):
    h = int(hashlib.sha256(text.encode()).hexdigest(), 16) % 100
    return "validation" if h < validation_percent else "train"

events = [f"Order {n} delayed" for n in range(100, 120)]
split = {"train": 0, "validation": 0}
for e in events:
    split[bucket(e)] += 1
print(split)
print(bucket("Order 105 delayed") == bucket("Order 105 delayed"))     # same answer every time
```

```output
{'train': 16, 'validation': 4}
True
```

Why LoRA is cheap: count the trainable numbers for one 4096 × 4096 weight matrix:

```python
d = 4096
full = d * d
for r in (8, 16, 64):
    lora = 2 * d * r                       # two thin matrices: d × r and r × d
    print(f"rank {r:>2}: {lora:>9,} trainable vs {full:,} full ({lora / full:.2%})")
```

```output
rank  8:    65,536 trainable vs 16,777,216 full (0.39%)
rank 16:   131,072 trainable vs 16,777,216 full (0.78%)
rank 64:   524,288 trainable vs 16,777,216 full (3.12%)
```

## Time and space

| Option | Cost to set up | Cost per request | Updating knowledge |
| --- | --- | --- | --- |
| Better prompt | minutes | longer prompt | edit the prompt |
| RAG | days | retrieval + longer prompt | re-index documents |
| Fine-tuning | weeks (data + training + evals) | can be lower (smaller model, shorter prompt) | retrain |

## Common mistakes

- Fine-tuning to add facts. Facts change; use RAG.
- Skipping the "best prompt" baseline, so you cannot prove fine-tuning helped.
- Small, messy or duplicated data.
- Testing on examples that were also in the training data.
- Training on data you are not allowed to use (customer data, private chats).
- Forgetting that every new base model means repeating the work.

## Patterns that use it

Evals (baseline vs fine-tuned), hashing (stable splits, dedupe), data validation, ML basics (overfitting, validation sets), cost estimation.

## Practice

```practice
Write a validator that rejects lines whose assistant reply is longer than 200 characters or missing the order number.
List three features in an app you know that should use RAG, and one that might justify fine-tuning. Explain why.
Compute LoRA trainable numbers for d = 8192 with rank 16, and the share of a full matrix.
Design an eval to decide between "prompt + big model" and "fine-tuned small model" for the customer update task.
```

## Explain it back

```explain
What is fine-tuning, in one sentence?
When should you use RAG instead of fine-tuning?
What does LoRA change compared with full fine-tuning?
How do you prove a fine-tuned model is worth it?
```

## Flashcards

```flashcards
Fine-tuning? :: Training a pre-trained model further on your own examples.
Facts that change? :: Use RAG, not fine-tuning.
Try first? :: A better prompt with examples, then RAG.
LoRA? :: Freeze the model; train small low-rank matrices beside some layers.
Training data format? :: Usually JSONL: one example conversation per line.
Prove it helped? :: Compare with the best prompt on the same held-out eval set.
```
