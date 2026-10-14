---
id: l-ai-tutor
title: Using AI as a tutor, not a solver
level: basic
phase: 1
week: 2
tags: [learning, ai, study-skills]
estMinutes: 10
---

## What it is

AI chat tools can explain anything at any hour. They can also quietly stop you from learning, because a pasted solution feels like progress but builds no skill.
The rule on this site: **AI explains, hints, quizzes and reviews; you write the code.** The "Did I write this myself?" list on the AI tutor page keeps you honest.

## Real-life example

A good tuition teacher does not do your homework. They ask what you tried, point at the mistake, give a hint, and make you do the next one alone. Ask AI to be that teacher, not a homework service.

## Picture

```text
 good uses (you stay the one thinking)          bad uses during practice
 ────────────────────────────────────           ────────────────────────────────────
 explain a concept with an Indian example       "solve this LeetCode problem"
 give a hint at level 1, then 2, then 3         pasting the full solution, then "understanding" it
 point to the line with the bug (not fix it)    letting autocomplete write the loop
 quiz me on today's note                         copying an explanation into your notes
 review my solution: edge cases, Big O          trusting every claim without checking
 act as an interviewer for a mock
```

## How it works inside

- **Say what you want**: "I'm practising. Don't give code. Give one hint." The AI tutor page has ready prompts.
- **Hint ladder**: pattern name → key idea → pseudocode. Stop at the first hint that unblocks you.
- **Bug help without fixes**: ask it to point to the line and explain why, with a failing input.
- **Review after you solve**: ask for edge cases you missed, cleaner code, and the complexity. Then rewrite it yourself.
- **Check claims**: AI can be confidently wrong (see LLM basics). Run the code; check official docs.
- **At work**, AI coding tools are normal and useful. In interviews you code alone, so practice must build the skill first.
- **Honesty list**: mark a problem "written by me" only if no AI-written code went into it.

## Python, step by step

Build a hint-ladder prompt, so you only get as much help as you need:

```python
LADDER = [
    "Give me only a one-line hint: which pattern fits? No code.",
    "Explain the key idea in 3 sentences. No code.",
    "Show short pseudocode only. No Python.",
]

def tutor_prompt(problem, attempt, level):
    return (
        "I am practising for interviews and want to learn, not get the answer.\n"
        f"Problem: {problem}\n"
        f"What I tried: {attempt}\n"
        f"{LADDER[level]}"
    )

print(tutor_prompt(
    "Find the longest substring without repeating characters.",
    "Two loops checking every substring with a set. Too slow for long strings.",
    level=0,
))
```

```output
I am practising for interviews and want to learn, not get the answer.
Problem: Find the longest substring without repeating characters.
What I tried: Two loops checking every substring with a set. Too slow for long strings.
Give me only a one-line hint: which pattern fits? No code.
```

## Time and space

| Situation | AI use |
| --- | --- |
| Concept is unclear after the note | explain with a new example, then explain it back yourself |
| Stuck 20–30 min on a problem | one hint level at a time |
| Solved it | review for edge cases and complexity |
| Mock interview practice | AI as interviewer, you code alone |

## Common mistakes

- Asking for the solution "just to compare" before trying.
- Keeping AI autocomplete on while practising problems.
- Copying AI explanations instead of writing your own.
- Believing everything it says without running or checking it.
- Ticking "written by me" when it was not.

## Patterns that use it

The thinking loop (hints in steps), active recall (quiz me), handling being stuck, LLM basics (why AI can be wrong).

## Practice

```practice
Use the "quiz me" prompt from the AI tutor page on today's note. Answer without looking.
Next time you are stuck, use only hint level 0 and try again for 10 minutes before level 1.
Ask AI to review a solution you wrote for edge cases. Fix them yourself.
Turn off AI autocomplete in your editor for practice sessions.
```

## Explain it back

```explain
What is the difference between AI as a tutor and AI as a solver?
What is a hint ladder?
Why practise without AI code if AI is normal at work?
How do you protect yourself from AI being confidently wrong?
```

## Flashcards

```flashcards
AI's job in practice? :: Explain, hint, quiz, review. You write the code.
Hint ladder? :: Pattern name → key idea → pseudocode, one step at a time.
Ask for bug help how? :: Point to the line and explain why; don't fix it.
Mark "written by me" when? :: Only if no AI-written code went in.
AI claims? :: Check them: run the code, read official docs.
```
