---
id: k-thinking-aloud
title: Thinking aloud in interviews
level: core
phase: 3
week: 40
tags: [interview, communication]
estMinutes: 15
---

## What it is

**Thinking aloud** means saying your reasoning while you solve: what you notice, what you are trying, why you chose it, and what you will check next.
Interviewers cannot grade thoughts they cannot hear. A correct solution in silence scores lower than a slightly slower solution explained clearly, and when you say your idea, the interviewer can help you.

## Real-life example

A cab driver who says "there's traffic on Outer Ring Road, so I'll take the service road, about 10 minutes longer" keeps you calm even when the route looks odd. A silent driver taking a strange turn makes you nervous. Interviewers are the passenger.

## Picture

```text
 not this:   [reads problem] ...... (8 minutes of silence) ...... "Done."

 this:       "So we need the longest substring without repeats. Brute force checks every
              substring, O(n³). Since it's about a substring, a sliding window fits: grow the
              right side, shrink the left when a letter repeats. That's O(n). Shall I code that?"
              ... "Now I'm storing the last index of each letter, so I can jump left forward..."
              ... "Let me test 'abba', because the left pointer must never move backwards."
```

## How it works inside

- **Narrate decisions, not keystrokes**: "I'm using a dict because I need O(1) lookups", not "now I type for i in range".
- **Useful phrases**:
  "Let me restate the problem to be sure..." · "A brute force would be ..., which is O(...)." ·
  "The clue here is ..., which suggests ..." · "I'll write a helper for ... to keep this clean." ·
  "I'm not sure about ..., let me check it with a small example." · "Let me trace through this input."
- **Comment-first coding**: write the plan as 3–5 comments, then fill in the code under each. The comments are your narration, and they keep you on track.
- **Silence is fine for a moment**: say "Let me think for 30 seconds" rather than going quiet without a word.
- **Invite input**: "Does this approach sound reasonable before I code it?"
- Practise it alone: it feels strange at first, like speaking in a meeting in a new language.

## Python, step by step

Comment-first: the plan goes in as comments, then the code fills in under each one:

```python
def length_of_longest_substring(s):
    # 1. Window [left, right] always holds unique letters.
    # 2. Remember the last index where each letter was seen.
    # 3. When s[right] was seen inside the window, move left just past it (never backwards).
    # 4. Track the best window length.
    last, left, best = {}, 0, 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:       # seen inside the current window
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best

for s in ["abcabcbb", "bbbbb", "pwwkew", "abba", ""]:   # normal cases, then edge cases said aloud
    print(repr(s), length_of_longest_substring(s))
```

```output
'abcabcbb' 3
'bbbbb' 1
'pwwkew' 3
'abba' 2
'' 0
```

## Time and space

| Phase | What to say |
| --- | --- |
| Start | restate + clarifying questions |
| Planning | brute force + Big O, the better idea + Big O, "shall I code it?" |
| Coding | why each data structure, what each block does |
| Testing | which input and why, the trace, the fix |

## Common mistakes

- Long silences while coding.
- Reading code character by character instead of explaining intent.
- Talking so much that you stop thinking. Short sentences, then pause.
- Ignoring the interviewer's hints. If they ask "what about duplicates?", there is a reason.
- Pretending to be sure. Saying "I'm not sure, let me check" is a strength.

## Patterns that use it

Every interview, design discussion and code review. It is also great for learning: explaining aloud is active recall.

## Practice

```practice
longest-substring-without-repeating-characters
valid-parentheses
Solve one problem while recording your voice. Count the silent gaps longer than 30 seconds.
Write comment-first plans for your next 5 problems before writing any code.
Pair with a friend: one solves aloud, the other only listens and notes unclear moments. Swap.
```

## Explain it back

```explain
Why does thinking aloud improve your interview score even for the same code?
Give four phrases you can use when starting a problem.
What is comment-first coding, and why does it help?
How do you handle needing time to think?
```

## Flashcards

```flashcards
Narrate what? :: Decisions and reasons, not keystrokes.
Need time to think? :: Say "Let me think for 30 seconds."
Comment-first coding? :: Write the plan as comments, then fill code under each.
Before coding, ask? :: "Does this approach sound reasonable?"
Interviewer asks about a case? :: It's a hint. Check that case now.
```
