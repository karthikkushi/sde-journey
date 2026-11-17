---
id: m-metrics
title: "Metrics: accuracy, precision and recall"
level: core
phase: 3
week: 32
tags: [ml, metrics, evaluation, precision, recall]
estMinutes: 20
---

## What it is

**Accuracy**: the share of predictions that were right.
**Precision**: of everything the model flagged as positive, how much really was positive.
**Recall**: of all the real positives, how many the model caught.
Accuracy alone can fool you when one class is rare; precision and recall tell the real story.

## Real-life example

An airport metal detector. High recall: it beeps for every real threat, but also for belt buckles (many false alarms, low precision). High precision: it beeps only when sure, but may miss a real threat (low recall). Airports choose high recall; a spam filter that deletes mail should choose high precision.

## Picture

```text
                    predicted: fraud   predicted: not fraud
 actually fraud         TP = 8               FN = 2
 actually not fraud     FP = 4               TN = 986

 accuracy  = (TP + TN) / all   = 994 / 1000 = 99.4%
 precision = TP / (TP + FP)    = 8 / 12     = 66.7%
 recall    = TP / (TP + FN)    = 8 / 10     = 80.0%
```

## How it works inside

- **Confusion matrix**: true positives (TP), false positives (FP), false negatives (FN), true negatives (TN).
- **Accuracy trap**: if 1% of transactions are fraud, a model that always says "not fraud" is 99% accurate and useless.
- **Precision vs recall trade-off**: raising the threshold (flag only when very sure) raises precision and lowers recall.
- **F1 score**: one number that balances both (their harmonic mean).
- **Choose by cost**: a missed disease (FN) is worse than an extra test (FP), so favour recall; wrongly blocking a good payment (FP) annoys customers, so watch precision.
- **In LLM work** the same ideas apply: retrieval recall ("did the right chunk come back?") and precision of flagged answers.

## Python, step by step

```python
def metrics(tp, fp, fn, tn):
    accuracy = (tp + tn) / (tp + fp + fn + tn)
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return round(accuracy, 3), round(precision, 3), round(recall, 3), round(f1, 3)

print("fraud model:      ", metrics(tp=8, fp=4, fn=2, tn=986))
print("always 'not fraud':", metrics(tp=0, fp=0, fn=10, tn=990))
```

```output
fraud model:       (0.994, 0.667, 0.8, 0.727)
always 'not fraud': (0.99, 0.0, 0.0, 0.0)
```

## Time and space

| Metric | Answers |
| --- | --- |
| Accuracy | how often right overall |
| Precision | when it says yes, how often correct |
| Recall | of the real yeses, how many caught |
| F1 | a balance of precision and recall |

## Common mistakes

- Reporting only accuracy on rare-event problems.
- Mixing up precision and recall.
- Not deciding which mistake (FP or FN) costs more before choosing a threshold.

## Patterns that use it

Evaluating classifiers, RAG retrieval evals, guardrail filters, the overfitting and train/test notes.

## Practice

```practice
Compute all four metrics for TP 30, FP 10, FN 20, TN 940
For a cancer screening test, say whether you favour precision or recall, and why
Measure retrieval recall@5 on 10 questions in your RAG app
```

## Explain it back

```explain
Why is 99% accuracy useless for 1% fraud?
What happens to precision and recall when you raise the threshold?
```

## Flashcards

```flashcards
Precision? :: TP / (TP + FP): when it says yes, how often it is right.
Recall? :: TP / (TP + FN): how many of the real positives it caught.
Why is accuracy misleading on rare classes? :: Always predicting the common class scores high but catches nothing.
What is F1? :: The harmonic mean of precision and recall.
Raising the threshold usually does what? :: Raises precision, lowers recall.
```
