---
id: m-train-test-split
title: Train, validation and test split
level: basic
phase: 3
week: 28
tags: [ml, evaluation, data, split]
estMinutes: 15
---

## What it is

To know if a model works on **new** data, you must test it on data it never saw during training.
So you split your examples: a **training set** to learn from, a **validation set** to tune choices, and a **test set** you touch only once, at the end.
Testing on training data is like grading a student with the exact questions they practised.

## Real-life example

A teacher gives 100 practice questions, but the board exam uses different questions. If the student only memorised the practice answers, they fail the exam. The test set is the board exam: new questions that show real understanding.

## Picture

```text
 all labelled examples (shuffled)
 ┌───────────────────────────────┬──────────┬──────────┐
 │           train 70%           │ valid 15%│ test 15% │
 └───────────────────────────────┴──────────┴──────────┘
   learn the weights              tune settings  final score, once
```

## How it works inside

- **Shuffle first** (unless the data is ordered in time), so each set looks like the others.
- **Typical split**: 70/15/15 or 80/10/10. With little data, use **cross-validation** (rotate which part is held out).
- **Time-based data** (sales, prices): train on the past, test on later dates. Never let the future leak into training.
- **Stratify** classification splits so each set has the same share of each class (for example 5% spam in every set).
- **The test set is sacred**: if you keep tuning until the test score is good, it stops being a fair test.
- **Same idea in LLM evals**: keep a held-out set of questions you never use while writing prompts.

## Python, step by step

A reproducible shuffle-and-split:

```python
import random

examples = list(range(1, 21))                  # 20 labelled examples (ids)
random.Random(42).shuffle(examples)            # fixed seed: the same split every run

n = len(examples)
train = examples[: int(n * 0.7)]
valid = examples[int(n * 0.7): int(n * 0.85)]
test = examples[int(n * 0.85):]
print(len(train), len(valid), len(test))
print("overlap:", set(train) & set(test))      # must be empty
```

```output
14 3 3
overlap: set()
```

## Time and space

| Set | Used for | How often |
| --- | --- | --- |
| Train | learning weights | every epoch |
| Validation | choosing settings | many times |
| Test | the final score | once |

## Common mistakes

- Reporting the training score as the model's quality.
- Shuffling time-series data so the future leaks into training.
- Tuning on the test set until it looks good.
- Duplicates of the same example in both train and test.

## Patterns that use it

Overfitting checks, metrics, fine-tuning (train and validation files), LLM eval sets.

## Practice

```practice
Split 100 examples 80/10/10 with a fixed seed and check there is no overlap
For daily sales data, write how you would split by date
Explain why your RAG eval questions must not be the ones you tuned the prompt on
```

## Explain it back

```explain
Why can't you test on the training data?
What is the validation set for, compared with the test set?
```

## Flashcards

```flashcards
Why split data? :: To measure how the model does on data it never saw.
Validation vs test set? :: Validation is for tuning choices; test is the final, one-time score.
How do you split time-based data? :: Train on earlier dates, test on later dates.
What is stratifying? :: Keeping the same class shares in every split.
```
