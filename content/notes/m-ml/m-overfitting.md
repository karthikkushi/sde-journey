---
id: m-overfitting
title: Overfitting and underfitting
level: core
phase: 3
week: 31
tags: [ml, overfitting, underfitting, generalisation]
estMinutes: 15
---

## What it is

**Underfitting**: the model is too simple to learn the pattern; it does badly on training **and** test data.
**Overfitting**: the model memorises the training data, including its noise; it does great on training data but badly on new data.
The goal is **generalisation**: doing well on data it has never seen.

## Real-life example

Two students before an exam. One read only the chapter titles (underfitting): fails both practice and exam. The other memorised the practice answers word for word (overfitting): perfect in practice, lost when the exam asks the same idea differently. The student who understood the ideas does well on both.

## Picture

```text
 error
   │ \                                   validation error
   │  \                               ___/
   │   \___                      ___/
   │       \_____         ______/
   │             \_______/   ← best point: stop here
   │  training error  \_____________________
   │                                        \____
   └────────────────────────────────────────── training time / model size
     underfitting        just right        overfitting
```

## How it works inside

- **Spot it**: compare training and validation loss. Both high → underfitting. Training low but validation high and rising → overfitting.
- **Fix underfitting**: a bigger model, better features, train longer.
- **Fix overfitting**: more data, a simpler model, **regularisation** (penalise large weights), **dropout** (randomly switch off parts of a network during training), **early stopping** (stop when validation loss starts rising).
- **Fine-tuning LLMs** overfits easily on small datasets: the model starts repeating training answers word for word. Keep a validation set and stop early.

## Python, step by step

Early stopping: keep the epoch with the lowest validation loss.

```python
train_loss = [2.0, 1.4, 1.0, 0.7, 0.5, 0.35, 0.25, 0.18]
valid_loss = [2.1, 1.5, 1.1, 0.9, 0.85, 0.88, 0.95, 1.05]

best_epoch = min(range(len(valid_loss)), key=lambda e: valid_loss[e]) + 1
print("best epoch:", best_epoch, "with validation loss", min(valid_loss))
gap = valid_loss[-1] - train_loss[-1]
print("final gap:", round(gap, 2), "-> overfitting" if gap > 0.3 else "-> fine")
```

```output
best epoch: 5 with validation loss 0.85
final gap: 0.87 -> overfitting
```

## Time and space

| Symptom | Training error | Validation error |
| --- | --- | --- |
| Underfitting | high | high |
| Good fit | low | low |
| Overfitting | very low | high |

## Common mistakes

- Celebrating a near-zero training loss.
- No validation set, so overfitting is invisible.
- Adding model size when the real problem is too little data.

## Patterns that use it

Train/test split, loss curves, regularisation, fine-tuning and LoRA, LLM eval sets.

## Practice

```practice
Given train loss 0.1 and validation loss 0.9, name the problem and two fixes
Given train loss 1.8 and validation loss 1.9 that stopped improving, name the problem and two fixes
Find the early-stopping epoch for your own made-up loss curves
```

## Explain it back

```explain
How do you tell overfitting from underfitting using two numbers?
Why does more data help against overfitting?
```

## Flashcards

```flashcards
What is overfitting? :: Memorising the training data so the model does badly on new data.
What is underfitting? :: A model too simple to learn the pattern; bad on training and test data.
What is early stopping? :: Stopping training when validation loss starts rising.
Name two fixes for overfitting. :: More data, a simpler model, regularisation, dropout or early stopping.
```
