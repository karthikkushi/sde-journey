---
id: j-ai-coding
title: Working with AI coding assistants
level: basic
phase: 3
week: 28
tags: [ai, coding-assistant, testing, review]
estMinutes: 20
---

## What it is

AI coding assistants write code fast, and much of it is **almost right**. In the 2025 Stack Overflow survey, 66% of developers said that was their biggest frustration.
The skill employers now want is a **checking discipline**: write the spec, write the tests, let the assistant generate, **read the diff**, run it, and own every line.
Some interviews now allow your own AI agent; they grade exactly this discipline.

## Real-life example

A new helper in a kirana shop packs orders very fast but sometimes puts in the wrong brand. The owner does not unpack every bag, but checks the bill against the list before it leaves the shop. Speed comes from the helper; trust comes from the check.

## Picture

```text
  1. spec       what must it do? inputs, outputs, edge cases
  2. tests      write them first (or ask the AI for tests, then read them)
  3. generate   small steps, one function or change at a time
  4. review     read the diff line by line: would you approve it from a colleague?
  5. run        tests green? try a weird input by hand
  6. own it     you can explain every line, or you delete it
```

## How it works inside

- **Small steps** beat "write the whole app". Ask for one function with a clear signature.
- **Give context**: the error message, the relevant file, the constraint ("no new libraries", "Python 3.12").
- **Tests are the referee.** Generated code that passes your tests is evidence; generated code that "looks fine" is not.
- **Read for the classic mistakes**: off-by-one errors, missing edge cases (empty input, duplicates), wrong library versions, invented functions, swallowed exceptions, secrets in code, SQL built with string formatting.
- **Learning vs working.** While you study DSA, solve it yourself first. A 2025 PNAS study found that students with unrestricted AI help scored 48% higher in practice but 17% lower on later exams without it. Use AI to explain or to review after you try, not to replace the try.

## Python, step by step

An "almost right" function, the kind an assistant might produce, and the test that catches it:

```python
def average_rating(ratings):
    # generated: looks fine
    return sum(ratings) / len(ratings)

def check(fn):
    cases = [([4, 5], 4.5), ([3], 3.0), ([], None)]
    for given, want in cases:
        try:
            got = fn(given)
        except ZeroDivisionError:
            got = "crash"
        print(given, "->", got, "OK" if got == want else "WRONG")

check(average_rating)
```

```output
[4, 5] -> 4.5 OK
[3] -> 3.0 OK
[] -> crash WRONG
```

After review, you fix the edge case yourself, and the test proves it:

```python
def average_rating(ratings):
    if not ratings:
        return None
    return sum(ratings) / len(ratings)

print([average_rating(r) for r in ([4, 5], [3], [])])
```

```output
[4.5, 3.0, None]
```

## Time and space

| Task | Good use of AI |
| --- | --- |
| Boilerplate, config, test data | yes |
| A function with clear tests | yes, then review |
| Learning a new DSA pattern | only after your own attempt |
| Security, money, migrations | yes, with extra careful review |

## Common mistakes

- Accepting a large diff you did not read.
- Asking the AI to fix its own bug in a loop instead of reading the code.
- Using AI during practice that is meant to build your own skill.
- Pasting secrets or private company code into a tool your employer has not approved.

## Patterns that use it

Every project task from now on, the AI-assisted interview drills from week 40, and "agentic" machine-coding rounds.

## Practice

```practice
Ask an assistant for one function in your project, write 3 tests first, and review the diff before running it
List every mistake you caught in one week of AI-generated code
Solve one problem yourself, then ask an AI to review it and judge each suggestion
```

## Explain it back

```explain
Why do tests matter more when code is generated?
How can AI help in practice but hurt in an exam?
```

## Flashcards

```flashcards
What is the checking discipline? :: Spec, tests, generate in small steps, read the diff, run, own every line.
Biggest frustration with AI code (2025 survey)? :: Code that is almost right (66% of developers).
When should you use AI while learning DSA? :: After your own attempt, to explain or review.
Name three classic mistakes in generated code. :: Missing edge cases, invented functions or versions, and swallowed errors.
```
