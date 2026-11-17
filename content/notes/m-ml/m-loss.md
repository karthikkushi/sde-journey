---
id: m-loss
title: Loss functions
level: basic
phase: 3
week: 29
tags: [ml, loss, training]
estMinutes: 15
---

## What it is

A **loss function** turns "how wrong are the predictions?" into one number. Lower is better.
Training is the search for weights that make the loss small.
Common ones: **mean squared error (MSE)** for numbers, **cross-entropy** for categories (and for LLMs, which predict the next token).

## Real-life example

A darts game scored by distance from the centre. Each throw's distance is its error. Adding up the squared distances gives one score for the round; a better player gets a smaller score. Squaring punishes the wild throws much more than the near misses.

## Picture

```text
 prediction  actual   error   error²
    48         50       -2       4
   105        100        5      25
   140        150      -10     100
                         MSE = (4 + 25 + 100) / 3 = 43

 classification: the model says P(spam) = 0.9
   truly spam     → loss = -log(0.9) ≈ 0.11   (small: confident and right)
   truly not spam → loss = -log(0.1) ≈ 2.30   (big: confident and wrong)
```

## How it works inside

- **MSE** (regression): average of squared errors. Big mistakes count a lot.
- **MAE**: average of absolute errors. Less sensitive to a few huge mistakes.
- **Cross-entropy** (classification): `-log(probability given to the right answer)`. Confident wrong answers get a very large loss.
- **LLMs** are trained with cross-entropy on the next token: the loss is low when the model gives high probability to the actual next token.
- **Loss vs metric**: loss is what training minimises; metrics (accuracy, precision, recall) are what people read. They usually move together, not always.

## Python, step by step

```python
import math

def mse(predictions, actuals):
    return sum((p - a) ** 2 for p, a in zip(predictions, actuals)) / len(actuals)

def cross_entropy(prob_of_right_answer):
    return -math.log(prob_of_right_answer)

print("MSE:", round(mse([48, 105, 140], [50, 100, 150]), 2))
for p in (0.9, 0.5, 0.1):
    print(f"right answer given {p}: loss {cross_entropy(p):.2f}")
```

```output
MSE: 43.0
right answer given 0.9: loss 0.11
right answer given 0.5: loss 0.69
right answer given 0.1: loss 2.30
```

## Time and space

| Loss | Use for | Punishes |
| --- | --- | --- |
| MSE | numbers | big errors, a lot |
| MAE | numbers with outliers | all errors equally |
| Cross-entropy | categories, next token | confident wrong answers |

## Common mistakes

- Using MSE for a classification problem.
- Watching only the training loss, not the validation loss.
- Assuming a lower loss always means a better metric for users.

## Patterns that use it

Gradient descent (it lowers the loss), overfitting (train vs validation loss), LLM pre-training and fine-tuning.

## Practice

```practice
Compute MSE and MAE by hand for predictions [10, 20, 30] vs actuals [12, 18, 40]
Compute cross-entropy when the right answer gets probability 0.99 and 0.01
Explain why one huge error changes MSE more than MAE
```

## Explain it back

```explain
What does a loss function measure?
Why does cross-entropy punish confident wrong answers so much?
```

## Flashcards

```flashcards
What is a loss function? :: One number for how wrong the predictions are; training makes it smaller.
What is MSE? :: The average of squared errors; used for predicting numbers.
What is cross-entropy? :: -log(probability given to the right answer); used for categories and next tokens.
Loss vs metric? :: Loss is what training minimises; metrics are what people read, like accuracy.
```
