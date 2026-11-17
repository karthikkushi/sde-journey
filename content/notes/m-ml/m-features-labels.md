---
id: m-features-labels
title: Features and labels
level: basic
phase: 3
week: 27
tags: [ml, features, labels, data]
estMinutes: 15
---

## What it is

In supervised learning, each example has **features** (the inputs you know) and a **label** (the answer you want the model to predict).
Predicting a number (a price) is **regression**; predicting a category (spam or not) is **classification**.
Choosing good features and getting correct labels matters more than choosing a fancy model.

## Real-life example

A vegetable seller guessing a mango's price. The features are what they can see: size, colour, variety, season. The label is the price it actually sold for. After seeing many mangoes and their prices, they can guess a new mango's price.

## Picture

```text
            features (inputs)                 label (answer)
 ┌─────────────┬────────┬──────────┐   ┌──────────────┐
 │ area (sqft) │ rooms  │ area_km  │   │ rent (₹)     │   ← regression
 │ 650         │ 1      │ 8        │   │ 18000        │
 │ 1100        │ 2      │ 3        │   │ 32000        │
 └─────────────┴────────┴──────────┘   └──────────────┘

 email words, sender, links  ──►  spam / not spam      ← classification
```

## How it works inside

- **Features** must be numbers for most models: text becomes counts or embeddings, categories become one-hot columns (one column per value).
- **Scaling**: features on very different scales (area in thousands, rooms in single digits) are often scaled to similar ranges.
- **Labels** must be correct and consistent. Wrong labels teach wrong answers ("garbage in, garbage out").
- **Leakage**: a feature that secretly contains the answer (like "refund issued" when predicting "will the customer complain") makes the model look great in testing and fail in real use.
- **Unsupervised learning** has no labels (for example grouping similar customers).

## Python, step by step

Turning raw records into numeric features and labels, with one-hot encoding for a category:

```python
homes = [
    {"area": 650, "rooms": 1, "city": "Pune", "rent": 18000},
    {"area": 1100, "rooms": 2, "city": "Chennai", "rent": 32000},
    {"area": 900, "rooms": 2, "city": "Pune", "rent": 24000},
]
cities = sorted({h["city"] for h in homes})          # ['Chennai', 'Pune']

X = [[h["area"], h["rooms"]] + [1 if h["city"] == c else 0 for c in cities] for h in homes]
y = [h["rent"] for h in homes]
print("feature columns:", ["area", "rooms"] + [f"city={c}" for c in cities])
for row, label in zip(X, y):
    print(row, "->", label)
```

```output
feature columns: ['area', 'rooms', 'city=Chennai', 'city=Pune']
[650, 1, 0, 1] -> 18000
[1100, 2, 1, 0] -> 32000
[900, 2, 0, 1] -> 24000
```

## Time and space

| Thing | Note |
| --- | --- |
| One-hot encoding | one new column per category value |
| More features | more data needed to learn them well |

## Common mistakes

- Feeding text or categories directly to a model that needs numbers.
- Leaky features that contain the answer.
- Trusting labels without checking a sample by hand.

## Patterns that use it

Every supervised model, train/test split, metrics, fine-tuning datasets (input → desired output is a label too).

## Practice

```practice
List 5 features and the label for predicting food delivery time
Add a "furnished" yes/no feature to the example as a 0/1 column
Find the leaky feature: predicting loan default using "number of missed payments after the loan"
```

## Explain it back

```explain
What is the difference between a feature and a label?
Why is a leaky feature dangerous?
```

## Flashcards

```flashcards
What is a feature? :: An input the model uses to make a prediction.
What is a label? :: The right answer the model should learn to predict.
Regression vs classification? :: Regression predicts a number; classification predicts a category.
What is one-hot encoding? :: Turning a category into 0/1 columns, one per value.
What is data leakage? :: A feature that secretly contains the answer, so testing looks better than reality.
```
