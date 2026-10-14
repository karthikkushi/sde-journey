---
id: j-prompts
title: Prompt design basics
level: core
phase: 2
week: 20
tags: [ai, llm, prompts]
estMinutes: 25
---

## What it is

A **prompt** is everything you send the model: instructions, context, examples and the actual input.
Good prompts are like good tickets for a new teammate: clear goal, the needed background, an example of "done", and the exact format you want back.

## Real-life example

"Make a report" gets you a random report. "Make a one-page report for the Monday team meeting: last week's 3 biggest bugs, who fixed them, and what is still open, as a table" gets you what you need.
The model is a very capable new joiner who knows nothing about your project.

## Picture

```text
 ┌ system: role + rules ("You classify customer reviews for a food delivery app.")
 │ instructions: the task, the audience, the output format
 │ examples:  <example> input → expected output </example>   (2–5 good ones)
 │ data:      <review> ...the actual input, kept separate in tags... </review>
 └ ask:       "Reply with only the label."
                            │
                            ▼
                 model reply ──▶ your code checks it (format, allowed values) before using it
```

## How it works inside

- **Be specific**: who it is for, why, how long, what to include and what to avoid. Explain the reason behind a rule; the model follows reasons better than bare commands.
- **Give context**: the model only knows what is in the prompt. Paste the schema, the error message, the policy text.
- **Show examples** ("few-shot"): 2–5 varied examples of input → output teach format and judgement better than a paragraph of rules.
- **Separate instructions from data** with clear markers such as XML-style tags (`<review>...</review>`). This also helps against text inside the data pretending to be instructions (prompt injection, see guardrails).
- **Ask for a format your code can check**: a single label, or JSON with known fields. Many APIs can force JSON that matches a schema (structured outputs); still validate.
- **Let it think for hard tasks**: ask it to work through the problem before the final answer, or use the model's built-in thinking setting.
- **Iterate with tests**: keep a small set of inputs with known good answers and re-run them after every prompt change (see evals).

## Python, step by step

Build the prompt in code: instructions, examples and data in tags:

```python
def build_prompt(review, examples):
    shots = "\n".join(
        f"<example>\n<review>{r}</review>\n<label>{label}</label>\n</example>" for r, label in examples
    )
    return (
        "Classify the customer review as positive, negative or mixed.\n"
        "Reply with only the label.\n\n"
        f"{shots}\n\n<review>{review}</review>"
    )

print(build_prompt(
    "Food was great but delivery took 90 minutes.",
    [("Loved the biryani!", "positive"), ("Cold food, rude rider.", "negative")],
))
```

```output
Classify the customer review as positive, negative or mixed.
Reply with only the label.

<example>
<review>Loved the biryani!</review>
<label>positive</label>
</example>
<example>
<review>Cold food, rude rider.</review>
<label>negative</label>
</example>

<review>Food was great but delivery took 90 minutes.</review>
```

Never trust the reply blindly. Check it before your code uses it:

```python
import json

REQUIRED = {"name": str, "city": str, "years": int}

def parse_reply(text):
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        return None, f"not JSON ({e.msg})"
    for key, typ in REQUIRED.items():
        if not isinstance(data.get(key), typ):
            return None, f"field '{key}' missing or not {typ.__name__}"
    return data, "ok"

for reply in ['{"name": "Asha", "city": "Pune", "years": 3}',
              'Sure! Here is the JSON: {"name": "Asha"}',
              '{"name": "Asha", "city": "Pune", "years": "three"}']:
    print(parse_reply(reply))
```

```output
({'name': 'Asha', 'city': 'Pune', 'years': 3}, 'ok')
(None, 'not JSON (Expecting value)')
(None, "field 'years' missing or not int")
```

Allowed labels only: anything else is treated as a failure, not passed on:

```python
ALLOWED = {"positive", "negative", "mixed"}

def clean_label(reply):
    label = reply.strip().strip(".").lower()
    return label if label in ALLOWED else None

print([clean_label(r) for r in ["Mixed.", " positive", "It is mostly positive", "NEGATIVE"]])
```

```output
['mixed', 'positive', None, 'negative']
```

## Time and space

| Choice | Effect |
| --- | --- |
| Longer prompt, more examples | better answers, more input tokens (cost) |
| Ask for a short format | fewer output tokens, easier to check |
| Fixed instructions first, changing data last | allows prompt caching (cheaper repeats) |

## Common mistakes

- Vague asks ("make it better") with no audience, length or format.
- Mixing data and instructions, so text inside the data changes the behaviour.
- Only one example, so the model copies it too closely. Use a few varied ones.
- Shouting rules in capital letters instead of explaining why.
- Using the reply without validating it.
- Changing the prompt without re-running test cases.

## Patterns that use it

Classification, extraction to JSON, summarising, code review bots, RAG prompts, agent system prompts, LLM-as-judge evals.

## Practice

```practice
Write a prompt that turns a messy bug report into JSON with title, steps, expected, actual. Validate it with parse_reply.
Take a vague prompt you used recently and rewrite it with audience, goal, format and one example.
Write 5 tricky reviews (sarcasm, Hinglish, mixed) and decide the correct labels before trying any prompt.
Add a "reason" field to the JSON and check that it is a non-empty string.
```

## Explain it back

```explain
What 4 things make a prompt clear?
Why are examples often better than long rules?
Why put the input data inside tags?
Why must your code validate the model's reply?
```

## Flashcards

```flashcards
Few-shot prompting? :: Giving a few input → output examples in the prompt.
Why tags like <review>? :: To separate data from instructions clearly.
Best output format for code? :: A small label or JSON with known fields, then validate it.
Rule vs reason? :: Explain why a rule exists; the model follows reasons better.
After changing a prompt? :: Re-run your test cases (evals).
```
