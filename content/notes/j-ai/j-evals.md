---
id: j-evals
title: Evaluating LLM outputs (evals)
level: core
phase: 2
week: 25
tags: [ai, llm, testing, evals]
estMinutes: 30
---

## What it is

**Evals** are automated tests for AI features: a fixed set of inputs, the expected result for each, and a **grader** that scores the output.
LLM output changes when you change the prompt, the model or a setting, and it can vary between runs. Without evals you are guessing whether a change helped.

## Real-life example

A coaching centre wants to know if a new teaching method works. It gives the same mock test to both batches and compares marks, topic by topic. Evals are that mock test for your prompt: same questions, every version, compare scores.

## Picture

```text
 test set (input, expected, tag) ──▶ system v1 ──▶ outputs ──▶ graders ──▶ 40%  fails: mixed, sarcasm, hinglish
                                 └─▶ system v2 ──▶ outputs ──▶ graders ──▶ 80%  fails: sarcasm
                                                                      │
                                         keep v2, add more sarcasm cases, try v3 ◀┘
```

## How it works inside

- **Dataset**: start with 20–50 real examples (from logs or support tickets), including edge cases. Tag them (easy, sarcasm, Hinglish...) so you see *where* it fails.
- **Graders**, cheapest and most reliable first:
  exact match (labels) · contains / regex (must mention "refund") · JSON and schema checks · run the generated code against tests · numbers within a tolerance · **LLM-as-judge** with a clear rubric for open-ended text · a human reviewing a sample.
- **Check the judge**: compare the LLM judge's scores with human labels on a few dozen cases before trusting it.
- **Track more than accuracy**: cost and latency per case, refusals, format errors.
- **Randomness**: run important evals more than once; look at the average and the spread.
- **Don't overfit**: keep a held-out set you do not look at while tuning the prompt.
- **Regression**: run evals in CI or before every release, like unit tests.

## Python, step by step

Two "versions" of a classifier (plain functions here, standing in for two prompts) on the same tagged test set:

```python
CASES = [
    {"input": "Loved the biryani!", "expected": "positive", "tag": "easy"},
    {"input": "Cold food, rude rider.", "expected": "negative", "tag": "easy"},
    {"input": "Great taste but 90 minutes late.", "expected": "mixed", "tag": "mixed"},
    {"input": "Wah, only 2 hours late. Superb service.", "expected": "negative", "tag": "sarcasm"},
    {"input": "Khana accha tha, delivery slow thi.", "expected": "mixed", "tag": "hinglish"},
]
GOOD = ("loved", "great", "superb", "accha")
BAD = ("cold", "rude", "late", "slow")

def v1(text):                       # only looks for happy words
    return "positive" if any(w in text.lower() for w in GOOD) else "negative"

def v2(text):                       # also notices problems
    good, bad = any(w in text.lower() for w in GOOD), any(w in text.lower() for w in BAD)
    if good and bad:
        return "mixed"
    return "positive" if good else "negative"

def evaluate(system):
    results = [(c["tag"], system(c["input"]) == c["expected"]) for c in CASES]
    score = sum(ok for _, ok in results) / len(results)
    return score, [tag for tag, ok in results if not ok]

for name, system in [("v1", v1), ("v2", v2)]:
    score, failed = evaluate(system)
    print(f"{name}: {score:.0%}  failed: {failed}")
```

```output
v1: 40%  failed: ['mixed', 'sarcasm', 'hinglish']
v2: 80%  failed: ['sarcasm']
```

Common graders:

```python
import json
import re

def grade_exact(out, expected):
    return out.strip().lower() == expected

def grade_contains(out, must_have):
    return all(m.lower() in out.lower() for m in must_have)

def grade_json(out, keys):
    try:
        data = json.loads(out)
    except json.JSONDecodeError:
        return False
    return isinstance(data, dict) and keys <= data.keys()

def grade_number(out, expected, tolerance=0.01):
    m = re.search(r"-?\d+(?:\.\d+)?", out)
    return bool(m) and abs(float(m.group()) - expected) <= tolerance

print(grade_exact(" Positive", "positive"))
print(grade_contains("Refund in 5-7 days to your UPI", ["refund", "upi"]))
print(grade_json('{"name": "Asha"}', {"name", "city"}))
print(grade_number("Total: 1249.50 rupees", 1249.5))
```

```output
True
True
False
True
```

LLM-as-judge for open-ended answers (needs a key):

```python norun
import json
import anthropic

client = anthropic.Anthropic()
RUBRIC = ("Score the ANSWER from 1 to 5 for faithfulness: 5 = every claim is supported by the SOURCES, "
          '1 = mostly unsupported. Reply with JSON only: {"score": <1-5>, "reason": "<one sentence>"}')

def judge(sources, answer):
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        messages=[{"role": "user", "content": f"{RUBRIC}\n\n<sources>{sources}</sources>\n<answer>{answer}</answer>"}],
    )
    text = "".join(b.text for b in response.content if b.type == "text")
    return json.loads(text)          # validate it like any other model output
```

## Time and space

| Grader | Cost | Reliability |
| --- | --- | --- |
| Exact / contains / JSON / number | free, instant | high (for what it checks) |
| Code tests | cheap | high |
| LLM-as-judge | one model call per case | good once checked against humans |
| Human review | slow | best, use on samples |

## Common mistakes

- Changing prompts based on two or three examples you tried by hand.
- One overall score with no tags, so you cannot see what got worse.
- Trusting an LLM judge you never compared with human labels.
- Tuning the prompt until it passes the test set exactly (overfitting). Keep a held-out set.
- Ignoring cost and latency: a 2% better prompt that is 3× slower may not be worth it.

## Patterns that use it

Unit testing and CI, A/B testing, RAG evaluation (retrieval hit rate + faithfulness), prompt design, model choice.

## Practice

```practice
Write a v3 that handles the sarcasm case without breaking the others. Run evaluate().
Add 5 more cases (including Hinglish and emojis) and report the score per tag.
Write grade_length(out, max_words) and use it to check "answer in under 50 words".
Build a 20-case eval for one AI feature in your project and run it before every prompt change.
```

## Explain it back

```explain
Why do LLM features need evals more than normal code needs tests?
Name four kinds of graders, from cheapest to most expensive.
Why tag test cases?
How do you know an LLM judge can be trusted?
What is overfitting to an eval set?
```

## Flashcards

```flashcards
Eval? :: A fixed test set + grader that scores an AI system's outputs.
Cheapest graders? :: Exact match, contains/regex, JSON checks, numeric tolerance.
LLM-as-judge? :: A model grades outputs using a rubric; validate it against human labels.
Why tag cases? :: To see which kinds of input fail.
Held-out set? :: Cases you don't tune on, to catch overfitting.
When to run evals? :: After every prompt, model or setting change (ideally in CI).
```
