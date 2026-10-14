---
id: j-neural-nets
title: Neural networks in simple words
level: core
phase: 3
week: 31
tags: [ai, neural-networks, machine-learning]
estMinutes: 30
---

## What it is

A **neural network** is a stack of simple units called **neurons**. Each neuron multiplies its inputs by **weights**, adds them up with a **bias**, and passes the result through an **activation** function.
One neuron can only draw a straight line between classes. Many neurons in **layers** can learn curved, complex patterns. Training adjusts all the weights to reduce the error, using gradient descent; **backpropagation** is the method that works out how much each weight should change.

## Real-life example

A hiring panel: each interviewer scores one thing (coding, design, communication), each score has a different importance (weight), and a final decision combines them. A deep network is many panels stacked: early layers notice simple things (edges in a photo), later layers combine them into bigger ideas (eyes, faces).

## Picture

```text
 inputs      hidden layer          output
  x1 ─┬──▶ (n1) ─┐
      │╲ ╱       ├──▶ (out) ──▶ prediction
  x2 ─┴──▶ (n2) ─┘
 each arrow has a weight; each neuron: sum(inputs × weights) + bias ─▶ activation

 training loop:  predict ─▶ measure the error (loss) ─▶ backpropagation: blame per weight
                 ─▶ update every weight a little ─▶ repeat many times
```

## How it works inside

- **Neuron**: `output = activation(w1·x1 + w2·x2 + ... + b)`. Common activations: ReLU (`max(0, z)`), sigmoid (squashes to 0..1).
- **Why layers**: a single neuron separates classes with a straight line, so it cannot learn XOR ("exactly one of two"). Two layers can.
- **Training**: start with small random weights; for each batch, compute the loss, get gradients by backpropagation (the chain rule), step the weights against the gradient; repeat for many **epochs**.
- **Deep learning** = networks with many layers, trained on lots of data with GPUs.
- **Kinds**: convolutional networks for images; **transformers** (with attention) for text. LLMs are very large transformers.
- **Attention** in one line: each token computes how much to "look at" every earlier token, and mixes their information using those weights.

## Python, step by step

One neuron (a perceptron) learns the AND gate. Weights start at zero and move a little after each mistake:

```python
AND = [((0, 0), 0), ((0, 1), 0), ((1, 0), 0), ((1, 1), 1)]

def train(data, epochs=20, lr=0.1):
    w1 = w2 = b = 0.0
    for epoch in range(1, epochs + 1):
        mistakes = 0
        for (x1, x2), target in data:
            out = 1 if w1 * x1 + w2 * x2 + b > 0 else 0
            error = target - out
            if error:
                mistakes += 1
                w1, w2, b = w1 + lr * error * x1, w2 + lr * error * x2, b + lr * error
        if mistakes == 0:
            return f"learned in {epoch} epochs: w1={w1:.1f} w2={w2:.1f} b={b:.1f}"
    return f"still making {mistakes} mistakes after {epochs} epochs"

print("AND:", train(AND))
print("XOR:", train([((0, 0), 0), ((0, 1), 1), ((1, 0), 1), ((1, 1), 0)]))
```

```output
AND: learned in 6 epochs: w1=0.2 w2=0.1 b=-0.2
XOR: still making 4 mistakes after 20 epochs
```

XOR needs a hidden layer. Here the weights are set by hand: hidden neurons compute OR and NAND, the output neuron ANDs them:

```python
def step(z):
    return 1 if z > 0 else 0

def xor_net(x1, x2):
    h_or = step(1.0 * x1 + 1.0 * x2 - 0.5)         # OR
    h_nand = step(-1.0 * x1 - 1.0 * x2 + 1.5)      # NAND
    return step(1.0 * h_or + 1.0 * h_nand - 1.5)   # AND of the two

print([(x1, x2, xor_net(x1, x2)) for x1 in (0, 1) for x2 in (0, 1)])
```

```output
[(0, 0, 0), (0, 1, 1), (1, 0, 1), (1, 1, 0)]
```

Attention in miniature: turn similarity scores into weights that add up to 1 (softmax):

```python
import math

def softmax(scores):
    exps = [math.exp(s) for s in scores]
    total = sum(exps)
    return [e / total for e in exps]

# How strongly "bank" relates to each earlier word in "sat by the river bank"
words = ["sat", "by", "the", "river"]
scores = [0.5, 0.1, 0.0, 2.5]
for word, weight in zip(words, softmax(scores)):
    print(f"{word:<6} {weight:.2f}")
```

```output
sat    0.10
by     0.07
the    0.06
river  0.76
```

## Time and space

| Thing | Grows with |
| --- | --- |
| Parameters (memory) | sum of (inputs × outputs) over layers |
| One prediction | about the number of parameters (multiply-adds) |
| Training | parameters × examples × epochs (hence GPUs) |
| Attention over a text | about tokens² (why long contexts are expensive) |

## Common mistakes

- Thinking a neuron "understands" anything: it is weighted sums and simple functions, repeated at huge scale.
- Starting all weights of a multi-layer network at the same value (neurons learn the same thing). Use small random values.
- Learning rate too high (loss jumps around) or too low (learning takes forever).
- Training longer and longer while test error rises (overfitting). Watch a validation set and stop early.

## Patterns that use it

Gradient descent (ML basics), matrix multiplication, softmax and probabilities (LLM basics), embeddings (the hidden layers' numbers).

## Practice

```practice
Train the perceptron on OR and NAND. How many epochs does each take?
Change the learning rate in train() to 1.0. Does AND still get learned? Are the weights different?
Build NOT and a 3-input AND with step() by choosing weights by hand.
Change the attention scores so "the" gets the most weight. What happens to the others?
```

## Explain it back

```explain
What does a single neuron compute?
Why can one neuron not learn XOR, and how do layers fix it?
Describe one training step in your own words.
What does attention do in a transformer, in one sentence?
```

## Flashcards

```flashcards
Neuron? :: activation(weighted sum of inputs + bias).
Why hidden layers? :: To learn patterns a straight line cannot separate (like XOR).
Backpropagation? :: The chain rule, used to find how each weight affects the loss.
Epoch? :: One full pass over the training data.
Softmax? :: Turns scores into positive weights that add up to 1.
Transformer? :: A neural network built around attention; LLMs are large transformers.
```
