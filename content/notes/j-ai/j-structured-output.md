---
id: j-structured-output
title: "Structured output: getting JSON back"
level: core
phase: 2
week: 12
tags: [ai, llm, json, structured-output, validation]
estMinutes: 25
---

## What it is

Programs need data, not paragraphs. **Structured output** means asking the model to answer in a fixed shape, usually **JSON** with known fields, so your code can use it directly.
You describe the shape (a schema), the model fills it, and your code **validates** it before trusting it.

## Real-life example

A bank form has boxes: name, account number, amount. The clerk does not accept a letter that says "please send some money to my friend". Fixed boxes make the form easy to check and process. JSON with a schema is the form for an LLM's answer.

## Picture

```text
 "Book 2 tickets for Chennai Express on 5 Jan, sleeper"
          │  prompt + schema {train, date, seats, class}
          ▼
        LLM ──► {"train": "Chennai Express", "date": "2027-01-05", "seats": 2, "class": "SL"}
          │
          ▼
   validate: all fields present? seats is a number? class in {SL, 3A, 2A}?
          │ ok                         │ not ok
          ▼                            ▼
   use it in code               retry once with the error, or reject
```

## How it works inside

- **Ask clearly**: give the exact fields, types and allowed values, plus one example.
- **Use the API's structured output feature** when the provider has one: you pass a JSON Schema and the model's answer is constrained to match it. This is more reliable than asking nicely in the prompt.
- **Always validate anyway**: parse with `json.loads`, check required fields, types and allowed values (Pydantic in real projects).
- **On failure**: retry once with the error message ("seats must be a number"), then give up gracefully.
- **Keep schemas small and flat** at first. Deep nesting and many optional fields cause more mistakes.
- **Uses**: extracting fields from text (addresses, invoices), classification with a fixed label set, tool-call arguments, anything another program reads.

## Python, step by step

Validating a model's JSON answer (the answers here are written by hand, so no API key is needed):

```python
import json

ALLOWED_CLASS = {"SL", "3A", "2A"}

def validate_booking(text):
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return None, "not valid JSON"
    for field, kind in [("train", str), ("date", str), ("seats", int), ("class", str)]:
        if not isinstance(data.get(field), kind):
            return None, f"{field} must be {kind.__name__}"
    if data["class"] not in ALLOWED_CLASS:
        return None, f"class must be one of {sorted(ALLOWED_CLASS)}"
    return data, "ok"

good = '{"train": "Chennai Express", "date": "2027-01-05", "seats": 2, "class": "SL"}'
bad_type = '{"train": "Chennai Express", "date": "2027-01-05", "seats": "two", "class": "SL"}'
chatty = 'Sure! Here is your booking: {"train": "Chennai Express"}'
for answer in (good, bad_type, chatty):
    print(validate_booking(answer)[1])
```

```output
ok
seats must be int
not valid JSON
```

The real call, asking for JSON (needs an API key, so it does not run here):

```python norun
# NEEDS AN API KEY: set ANTHROPIC_API_KEY in your terminal first. Never put a key in code or Git.
import anthropic, json

client = anthropic.Anthropic()
prompt = """Extract the booking as JSON with exactly these fields:
train (string), date (YYYY-MM-DD), seats (integer), class (one of SL, 3A, 2A).
Reply with the JSON only.

Request: Book 2 tickets for Chennai Express on 5 Jan 2027, sleeper."""
reply = client.messages.create(model="claude-opus-5-5", max_tokens=300, messages=[{"role": "user", "content": prompt}])
data, status = validate_booking(reply.content[0].text)   # always validate before using it
print(status, data)
```

## Time and space

| Approach | Reliability |
| --- | --- |
| "Please answer in JSON" in the prompt | good, needs validation and retries |
| The API's structured output with a schema | best, still validate |
| Free text, parsed with regex | fragile, avoid |

## Common mistakes

- Trusting the JSON without validating it.
- Huge nested schemas on the first try.
- No retry, so one bad answer breaks the feature.
- Allowing free text where a fixed list of values is needed.

## Patterns that use it

Tool calling (arguments are structured output), classification, extraction, evals that compare fields.

## Practice

```practice
Write a validator for an invoice: shop, date, items (list of name and price), total
Extract 10 addresses into JSON with street, city and PIN; count how many pass validation
Add a single retry that sends the validation error back to the model
```

## Explain it back

```explain
Why validate JSON even when the API promises a schema?
What should your code do when validation fails?
```

## Flashcards

```flashcards
What is structured output? :: Asking the model for a fixed shape (usually JSON with known fields) that code can use.
What should you always do with model JSON? :: Parse and validate fields, types and allowed values before using it.
What do you do when validation fails? :: Retry once with the error message, then fail gracefully.
Why keep schemas small? :: Flat, small schemas cause fewer mistakes than deep nesting.
```
