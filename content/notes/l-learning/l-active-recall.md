---
id: l-active-recall
title: Active recall
level: basic
phase: 1
week: 2
tags: [learning, study-skills]
estMinutes: 10
---

## What it is

**Active recall** means testing yourself: close the book and pull the idea out of your own head.
Every attempt to remember strengthens the memory, and it shows you exactly what you do not know yet. It is the single most useful study habit, and the explain-back boxes on every note exist for it.

## Real-life example

You can recognise the route to a friend's house when someone else drives, but you only really know it after you ride there yourself without Google Maps. Recognising is not the same as recalling.

## Picture

```text
 passive (weak):   read ─▶ read again ─▶ "yes, I know this"
 active (strong):  read once ─▶ close it ─▶ write/say it from memory ─▶ compare ─▶ re-read ONLY the gaps

 ways to do it:  explain-back boxes · blank-page coding · flashcards · teach a friend (Feynman) ·
                 draw the diagram from memory · predict the output before running code
```

## How it works inside

- **Retrieval practice**: trying to recall, even when you fail, makes the memory stronger than another reading would.
- **Feedback**: compare your answer with the note; the gaps you find are your next reading.
- **Feynman technique**: explain the idea in simple words as if to a school student. Where you get vague, you do not understand yet.
- **Blank-page coding**: rewrite a solution you studied without looking. This is the coding version of recall.
- **Predict first**: before running code, write down what you think it prints.

## Python, step by step

A blank-page check: write what you remember, then see which key points are missing (a keyword match is rough; you are the real judge):

```python
KEY_POINTS = {
    "a hash function picks the place": ["hash"],
    "items live in buckets/slots": ["bucket", "slot"],
    "lookups are O(1) on average": ["o(1)", "constant time"],
    "collisions are handled": ["collision"],
    "keys must be hashable": ["hashable", "immutable"],
}

my_recall = """A dict hashes the key to choose a bucket, so lookup is O(1) on average.
It stores key and value together."""

text = my_recall.lower()
missing = [point for point, words in KEY_POINTS.items() if not any(w in text for w in words)]
print(f"recalled {len(KEY_POINTS) - len(missing)} of {len(KEY_POINTS)}")
for point in missing:
    print("re-read:", point)
```

```output
recalled 3 of 5
re-read: collisions are handled
re-read: keys must be hashable
```

## Time and space

| Activity | Time | Use |
| --- | --- | --- |
| Explain-back after a note | 5 min | every note |
| Blank-page redo | 15–30 min | solved problems, days later |
| Flashcards | 5–15 min | daily |
| Teach someone | 10 min | weekly, for hard topics |

## Common mistakes

- Peeking after a few seconds. Struggle for a minute first.
- Only recalling things you already know well.
- Not comparing with the source, so mistakes stick.
- Writing the explanation in the note's exact words (copying from memory) instead of your own.

## Patterns that use it

Spaced repetition (when to recall), thinking aloud (recall under pressure), the explain-back boxes and Sunday redo on this site.

## Practice

```practice
After your next note, fill every explain-back box without looking. Then check.
Change KEY_POINTS and my_recall to a note you read this week and run the check.
Draw a linked list insert from memory, then compare with the note.
```

## Explain it back

```explain
What is active recall, and why does it beat re-reading?
Name four ways to practise it.
What is the Feynman technique?
Why should you struggle a little before checking the answer?
```

## Flashcards

```flashcards
Active recall? :: Testing yourself: pull the idea from memory, then check.
Feynman technique? :: Explain it simply as if to a child; vague parts show gaps.
Blank-page coding? :: Rewriting a known solution from scratch without looking.
After recall, re-read what? :: Only the parts you missed.
```
