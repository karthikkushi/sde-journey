---
id: m-training
title: What training means
level: basic
phase: 3
week: 27
tags: [ml, training, model]
estMinutes: 20
---

## What it is

A **model** is a function with adjustable numbers inside (called **parameters** or **weights**).
**Training** means showing it many examples with the right answers, measuring how wrong it is, and nudging the numbers to be a little less wrong, again and again.
After training, the numbers stay fixed and the model makes predictions on new data: that is **inference**.

## Real-life example

Learning to make perfect rotis. You make one, see it is too thick, roll the next one thinner. Too dry? Add a little water. After hundreds of rotis your hands "know" the amounts. The amounts are the parameters; each roti and its result is an example; adjusting a little each time is training.

## Picture

```text
 examples (input, right answer)
        │
        ▼
   model(weights) ──► prediction ──► compare with right answer ──► loss (how wrong)
        ▲                                                            │
        └─────────── nudge weights to lower the loss ◄───────────────┘
                           repeat many times (epochs)

 after training:  new input ──► model(fixed weights) ──► prediction   (inference)
```

## How it works inside

- **Parameters**: the numbers the model learns. A tiny model may have 2; a large language model has billions.
- **Loss**: one number that says how wrong the predictions are (see the loss note).
- **Optimisation**: an algorithm (usually gradient descent) changes the parameters to lower the loss.
- **Epoch**: one pass over all the training examples. Training runs many epochs.
- **Learning rate**: how big each nudge is. Too big and it overshoots; too small and it learns very slowly.
- **Inference**: using the trained model. It is much cheaper than training. When you call an LLM API, you only do inference.

## Python, step by step

Train the smallest possible model, `price = w × kg`, from three examples:

```python
examples = [(1, 50), (2, 100), (3, 150)]      # (kg of onions, price in rupees)
w = 0.0                                        # start with a bad guess
learning_rate = 0.05

for epoch in range(1, 31):
    for kg, price in examples:
        prediction = w * kg
        error = prediction - price             # negative: we guessed too low
        w -= learning_rate * error * kg        # nudge w to make the error smaller
    if epoch in (1, 5, 30):
        print(f"epoch {epoch}: w = {w:.2f}")

print("price for 4 kg ≈", round(w * 4))        # inference on new input
```

```output
epoch 1: w = 29.10
epoch 5: w = 49.36
epoch 30: w = 50.00
price for 4 kg ≈ 200
```

## Time and space

| Stage | Cost |
| --- | --- |
| Training | many passes over all the data; expensive |
| Inference | one pass per prediction; cheap |
| Model size | number of parameters |

## Common mistakes

- Thinking the model "understands" rather than fits numbers to examples.
- Confusing training (changing weights) with inference (using them).
- A learning rate so large that the loss jumps around instead of going down.

## Patterns that use it

Every ML model, fine-tuning and LoRA (training a little more), the loss and gradient descent notes.

## Practice

```practice
Run the example with learning_rate 0.2 and 0.001; describe what changes
Add a fourth example (5, 250) and check the learned w
Explain training vs inference with an example from your daily life
```

## Explain it back

```explain
What changes during training, and what stays fixed during inference?
What is an epoch?
```

## Flashcards

```flashcards
What are parameters (weights)? :: The adjustable numbers inside a model that training changes.
What is training? :: Repeatedly comparing predictions with right answers and nudging the weights to reduce the error.
What is inference? :: Using a trained model with fixed weights to predict on new input.
What is an epoch? :: One pass over all the training examples.
What does the learning rate control? :: How big each weight update is.
```
