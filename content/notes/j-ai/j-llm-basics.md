---
id: j-llm-basics
title: What an LLM is, and what tokens are
level: core
phase: 2
week: 18
tags: [ai, llm, tokens]
estMinutes: 25
---

## What it is

A **large language model (LLM)** is a program trained on a huge amount of text to do one thing: **predict the next token**.
A **token** is a small piece of text: a word, part of a word, a space plus a word, or a symbol.
Repeat "predict the next token, add it, predict again" and you get sentences, code and answers.

## Real-life example

Your phone keyboard suggests the next word: type "Happy" and it offers "birthday". An LLM is the same idea at a vastly bigger scale. It has read so much text that the "next word" it predicts can be a correct SQL query or a clear explanation of recursion.
It also explains the failures: it writes what *sounds* likely, so it can confidently state a wrong train time. That is called a **hallucination**.

## Picture

```text
 "chai is very" ─▶ tokenizer ─▶ [chai][ is][ very] ─▶ model ─▶ probabilities for the next token
                                                              " hot"   0.41
                                                              " sweet" 0.30
                                                              " good"  0.12 ...
      pick one (temperature decides how adventurous) ─▶ append it ─▶ run again
      ... until a stop token, or max_tokens is reached
```

## How it works inside

- **Tokenizer**: text → token ids. Common words are one token; rare words are split into pieces. Roughly 3–4 characters of English per token; Hindi or Tamil text usually needs more tokens for the same meaning.
- **Model**: a very large neural network (a *transformer*). Its **attention** layers let each token look at the earlier tokens, so "bank" near "river" is understood differently from "bank" near "loan".
- **Output**: a probability for every token in the vocabulary. **Temperature** controls the choice: low = safe and repetitive, high = varied and riskier.
- **Context window**: the maximum number of tokens the model can see at once (your prompt + its answer). Anything outside it does not exist for the model.
- **Training**: first *pretraining* (predict the next token on huge text), then *instruction tuning* and feedback training so it follows instructions and answers helpfully.
- **No memory between calls**: every API call starts fresh. Chat apps feel like they remember because they send the whole conversation again each time.
- **Knowledge cutoff**: it only knows what was in its training data (plus what you put in the prompt).

## Python, step by step

A toy tokenizer: always take the longest piece that is in the vocabulary:

```python
VOCAB = {"un", "break", "able", "chai", " is", " very", " hot"}

def tokenize(text):
    tokens, i = [], 0
    while i < len(text):
        for size in range(len(text) - i, 0, -1):     # longest match first
            if text[i:i + size] in VOCAB:
                tokens.append(text[i:i + size])
                i += size
                break
        else:                                         # unknown character: its own token
            tokens.append(text[i])
            i += 1
    return tokens

print(tokenize("chai is very hot"))
print(tokenize("unbreakable chai"))
```

```output
['chai', ' is', ' very', ' hot']
['un', 'break', 'able', ' ', 'chai']
```

A toy "language model": count which word follows which, then turn counts into probabilities. Temperature changes how sharp they are:

```python
from collections import Counter, defaultdict

corpus = "i drink chai . i drink coffee . i drink chai . you drink water .".split()
following = defaultdict(Counter)
for a, b in zip(corpus, corpus[1:]):
    following[a][b] += 1

def probs(counts, temperature=1.0):
    weights = {w: c ** (1 / temperature) for w, c in counts.items()}
    total = sum(weights.values())
    return {w: round(v / total, 2) for w, v in weights.items()}

print(following["drink"])
for t in (0.5, 1.0, 2.0):
    print(f"temperature {t}:", probs(following["drink"], t))
```

```output
Counter({'chai': 2, 'coffee': 1, 'water': 1})
temperature 0.5: {'chai': 0.67, 'coffee': 0.17, 'water': 0.17}
temperature 1.0: {'chai': 0.5, 'coffee': 0.25, 'water': 0.25}
temperature 2.0: {'chai': 0.41, 'coffee': 0.29, 'water': 0.29}
```

Generation is a loop: predict, append, repeat. Always picking the top token gets repetitive:

```python
from collections import Counter, defaultdict

corpus = "i drink chai . i drink coffee . i drink chai . you drink water .".split()
following = defaultdict(Counter)
for a, b in zip(corpus, corpus[1:]):
    following[a][b] += 1

def generate(start, max_tokens):
    words = [start]
    for _ in range(max_tokens):
        options = following[words[-1]]
        if not options:                                  # nothing ever followed this word: stop
            break
        words.append(options.most_common(1)[0][0])      # greedy: the most likely next word
    return " ".join(words)

print(generate("you", 6))
print(generate("tea", 6))                 # a word it never saw: nothing to predict
```

```output
you drink chai . i drink chai
tea
```

## Time and space

| Thing | Grows with | Why it matters |
| --- | --- | --- |
| Cost | input tokens + output tokens | you pay per token |
| Time | mostly output tokens | each new token is one more pass through the model |
| Context window | prompt + answer tokens | too long = error, or old text must be dropped |
| Memory between calls | none | resend the history yourself |

## Common mistakes

- Treating the model as a database of facts. Check facts, or give it the facts (see RAG).
- Thinking tokens = words. Count tokens with the provider's tools when cost or limits matter.
- Expecting it to remember earlier calls without sending the history.
- Using high temperature for tasks that need one correct answer (SQL, JSON, classification).
- Forgetting the knowledge cutoff: "latest" anything may be out of date.

## Patterns that use it

Every AI feature: chat, summarising, classifying, extracting data, writing code, RAG, agents.

## Practice

```practice
Add " sweet" and " cold" to VOCAB and tokenize "chai is very sweet". Then tokenize a word that is not in the vocabulary. What happens?
Add more sentences to the corpus and print the probabilities after "i" at temperatures 0.5, 1 and 2.
Change generate() to pick randomly using the probabilities (random.choices) instead of greedily. Run it a few times.
Ask any chatbot the same question twice. Are the answers identical? Explain why using temperature.
```

## Explain it back

```explain
What is a token? Why is it not the same as a word?
Explain "predict the next token" using your phone keyboard as the example.
What does temperature change? When do you want it low?
Why does a chat app need to resend the conversation on every call?
What is a hallucination, and why does it happen?
```

## Flashcards

```flashcards
What does an LLM do at its core? :: Predicts the next token, again and again.
Token? :: A small piece of text (word, part of a word, symbol) the model reads and writes.
Context window? :: The most tokens the model can see at once: prompt plus answer.
Temperature? :: How random the next-token choice is. Low = safe, high = varied.
Does the model remember previous API calls? :: No. Send the history every time.
Hallucination? :: Confident text that sounds right but is false.
What costs money in LLM calls? :: Input tokens and output tokens.
```
