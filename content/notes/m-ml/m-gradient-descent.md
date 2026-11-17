---
id: m-gradient-descent
title: Gradient descent
level: core
phase: 3
week: 30
tags: [ml, gradient-descent, optimisation, training]
estMinutes: 20
---

## What it is

**Gradient descent** is how most models learn. The **gradient** tells you which way the loss goes up if you change a weight a little; you step the **other way**, downhill, by a small amount (the **learning rate**).
Repeat until the loss stops going down.

## Real-life example

Walking down a hill in thick fog to reach the village at the bottom. You cannot see the village, but you can feel the slope under your feet. Take a small step in the downhill direction, feel again, step again. Steps too big and you overshoot into the next hill; too small and night falls before you arrive.

## Picture

```text
 loss
  │\                         .
  │ \                      .
  │  \   ← step            .
  │   ●                  .
  │    \  ← step       .
  │     ●            .
  │      \_  ← tiny steps near the bottom
  │        ●___.__
  └──────────────────────── weight
            best weight (lowest loss)
```

## How it works inside

- **Update rule**: `w = w - learning_rate × gradient`.
- **Gradient**: the slope of the loss with respect to each weight. Libraries compute it automatically (**backpropagation** in neural networks).
- **Learning rate**: the most important setting. Too high: the loss jumps around or explodes. Too low: training crawls.
- **Batch, mini-batch, stochastic**: compute the gradient on all examples, a small batch (common: 32–1,024), or one example at a time. Mini-batches are fast and good enough.
- **Better optimisers** like Adam adjust the step size per weight automatically; most modern training uses them.
- **Local minima and plateaus**: the path can get stuck or slow; large models are surprisingly fine in practice.

## Python, step by step

Minimise `loss(w) = (w - 3)²` (best at w = 3). Its gradient is `2 × (w - 3)`:

```python
def gradient(w):
    return 2 * (w - 3)

for lr in (0.1, 0.9, 1.1):
    w = 0.0
    for _ in range(20):
        w = w - lr * gradient(w)
    print(f"learning rate {lr}: w after 20 steps = {w:.3f}")
```

```output
learning rate 0.1: w after 20 steps = 2.965
learning rate 0.9: w after 20 steps = 2.965
learning rate 1.1: w after 20 steps = -112.013
```

With 0.1 it walks steadily toward 3; with 0.9 it zig-zags but still gets there; with 1.1 every step overshoots further and it blows up.

## Time and space

| Choice | Effect |
| --- | --- |
| Larger learning rate | faster, risk of blowing up |
| Smaller learning rate | safer, slower |
| Mini-batch | fast, slightly noisy steps |

## Common mistakes

- A learning rate that is too high, then blaming the model.
- Not watching the loss curve while training.
- Thinking gradient descent finds the perfect answer; it finds a good-enough one.

## Patterns that use it

Training every neural network, fine-tuning and LoRA, the training and loss notes.

## Practice

```practice
Run the example with learning rates 0.01 and 0.5; how many steps until w is within 0.01 of 3?
Write gradient descent for loss(w) = (w + 2)² and check it reaches -2
Explain in 3 sentences why a too-large learning rate makes the loss explode
```

## Explain it back

```explain
What does the gradient tell you?
Why do we step against the gradient?
```

## Flashcards

```flashcards
What is gradient descent? :: Repeatedly stepping weights against the gradient to lower the loss.
Update rule? :: w = w - learning_rate × gradient.
Learning rate too high? :: The loss jumps around or explodes.
What is a mini-batch? :: A small group of examples used to estimate the gradient for one step.
What computes gradients in neural networks? :: Backpropagation.
```
