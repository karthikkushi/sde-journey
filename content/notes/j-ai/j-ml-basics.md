---
id: j-ml-basics
title: Machine learning basics
level: core
phase: 3
week: 28
tags: [ai, machine-learning, statistics]
estMinutes: 30
---

## What it is

**Machine learning (ML)**: instead of writing rules by hand, you give the computer many **examples** and it learns the rules (a **model**) that turn inputs into outputs.
Each example has **features** (the inputs, like distance and rain) and, in **supervised learning**, a **label** (the answer, like "late" or "on time"). The goal is to do well on **new** examples, not just the ones it learned from.

## Real-life example

A new delivery rider learns from experience: long distance plus rain usually means a late order. Nobody wrote the rule down; they learned it from many past orders. ML does the same from data, and then predicts for tomorrow's orders.

## Picture

```text
 past orders (features → label)          new order
 ┌──────────┬──────┬───────┐               (3.5 km, rain)
 │ distance │ rain │ late? │                    │
 │ 1.0 km   │ no   │ no    │ ── train ──▶ model ┴──▶ prediction: late
 │ 5.0 km   │ yes  │ yes   │
 │ ...      │ ...  │ ...   │      keep some rows aside (test set) to check it honestly
 └──────────┴──────┴───────┘
```

## How it works inside

- **Kinds**: *supervised* (learn from labelled examples: classify spam, predict rent), *unsupervised* (find structure without labels: group customers into clusters), *reinforcement* (learn by trial and reward: game playing).
- **Train / test split**: learn on one part of the data, measure on data the model has never seen. Score on training data alone is misleading.
- **Overfitting**: the model memorises the training examples (including noise) and fails on new ones. **Underfitting**: the model is too simple to capture the pattern.
- **Training** = adjusting the model's numbers (parameters) to reduce a **loss** (how wrong it is), often with **gradient descent**: nudge each number in the direction that lowers the loss.
- **Metrics**: accuracy is not enough when one class is rare. **Precision**: of the orders we called late, how many were late? **Recall**: of the orders that were late, how many did we catch?
- **Baseline first**: compare with something dumb (always predict "on time"). If the model cannot beat it, it is useless.
- LLMs are ML too: a huge model trained with the same basic ideas on text.

## Python, step by step

k-nearest neighbours: predict like the k most similar past examples:

```python
import math
from collections import Counter

# (distance in km, rain 1/0) -> late 1/0
train = [((1.0, 0), 0), ((2.0, 0), 0), ((2.5, 1), 1), ((4.0, 0), 1),
         ((5.0, 1), 1), ((1.5, 1), 0), ((3.0, 0), 0), ((6.0, 0), 1)]
test = [((2.2, 0), 0), ((4.5, 1), 1), ((3.5, 1), 1), ((1.2, 0), 0)]

def predict(x, k=3):
    nearest = sorted(train, key=lambda ex: math.dist(x, ex[0]))[:k]
    return Counter(label for _, label in nearest).most_common(1)[0][0]

correct = 0
for x, label in test:
    guess = predict(x)
    correct += guess == label
    print(x, "predicted", guess, "actual", label)
print(f"test accuracy: {correct / len(test):.0%}")
```

```output
(2.2, 0) predicted 0 actual 0
(4.5, 1) predicted 1 actual 1
(3.5, 1) predicted 1 actual 1
(1.2, 0) predicted 0 actual 0
test accuracy: 100%
```

Gradient descent learns a line: monthly rent (₹ thousand) from flat size (hundred sq ft):

```python
data = [(5, 12), (7, 16), (9, 20), (11, 24)]          # exactly rent = 2 × size + 2
w, b, lr = 0.0, 0.0, 0.01

for step in range(5001):
    # gradients of the mean squared error with respect to w and b
    gw = sum(2 * (w * x + b - y) * x for x, y in data) / len(data)
    gb = sum(2 * (w * x + b - y) for x, y in data) / len(data)
    w, b = w - lr * gw, b - lr * gb
    if step in (0, 100, 1000, 5000):
        loss = sum((w * x + b - y) ** 2 for x, y in data) / len(data)
        print(f"step {step:>4}: w={w:.2f} b={b:.2f} loss={loss:.4f}")

print(f"predicted rent for 800 sq ft: ₹{(w * 8 + b) * 1000:,.0f}")
```

```output
step    0: w=3.08 b=0.36 loss=54.8320
step  100: w=2.18 b=0.49 loss=0.1651
step 1000: w=2.05 b=1.58 loss=0.0126
step 5000: w=2.00 b=2.00 loss=0.0000
predicted rent for 800 sq ft: ₹18,000
```

Why accuracy can lie: when late orders are rare, "always on time" looks good but catches nothing:

```python
actual = [1, 0, 1, 1, 0, 0, 1, 0, 0, 0]
model  = [1, 0, 0, 1, 1, 0, 1, 0, 0, 0]
always_on_time = [0] * 10

def report(pred):
    tp = sum(p == a == 1 for p, a in zip(pred, actual))
    fp = sum(p == 1 and a == 0 for p, a in zip(pred, actual))
    fn = sum(p == 0 and a == 1 for p, a in zip(pred, actual))
    accuracy = sum(p == a for p, a in zip(pred, actual)) / len(actual)
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    return f"accuracy {accuracy:.0%}  precision {precision:.0%}  recall {recall:.0%}"

print("model:         ", report(model))
print("always on time:", report(always_on_time))
```

```output
model:          accuracy 80%  precision 75%  recall 75%
always on time: accuracy 60%  precision 0%  recall 0%
```

## Time and space

| Model | Training | Prediction |
| --- | --- | --- |
| k-NN | none (just store the data) | O(n × features) per prediction |
| Linear model | O(steps × n × features) | O(features) |
| Neural networks | heavy (GPUs for big ones) | from fast to heavy, by size |

## Common mistakes

- Measuring only on training data.
- Using accuracy when the interesting class is rare. Look at precision and recall.
- Leaking the answer into the features (a "delivered_late_flag" column predicting lateness).
- Skipping a simple baseline.
- Features on very different scales (km vs rupees) without scaling, for distance-based models.

## Patterns that use it

Sorting and heaps (k-NN), loops and maths (gradient descent), statistics, evals (precision/recall are evals too), embeddings and vector search (nearest neighbours again).

## Practice

```practice
Change k to 1 and to 5 in the k-NN example. Add two noisy training rows and see which k copes best.
Change the learning rate to 0.05 and to 0.0001. What happens to the loss?
Compute precision and recall for a third model that predicts "late" for everything.
Explain overfitting with an example from exam preparation.
```

## Explain it back

```explain
What are features and labels?
Why keep a test set aside?
What is overfitting, and how would you notice it?
How does gradient descent improve a model, step by step?
When is accuracy misleading, and what do you use instead?
```

## Flashcards

```flashcards
Supervised learning? :: Learning from examples with known answers (labels).
Overfitting? :: Great on training data, poor on new data (it memorised).
Why a test set? :: To measure on data the model never saw.
Gradient descent? :: Repeatedly nudge parameters in the direction that lowers the loss.
Precision? :: Of the items predicted positive, the share that really are.
Recall? :: Of the real positives, the share the model found.
k-NN? :: Predict like the k most similar stored examples.
```
