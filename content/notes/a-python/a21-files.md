---
id: a21-files
title: Files
level: basic
phase: 1
week: 5
tags: [python, files, csv, json]
estMinutes: 15
---

## What it is

Values in RAM vanish when a program ends. A **file** on disk keeps them.
`open()` gives you a file object. You read text from it or write text into it.
Always open files with `with`, so Python closes them for you.

## Real-life example

Your daily expense notebook. During the day you write lines into it ("chai, 20"). At the end of the month you read every line and add them up.
The notebook stays even when you close it. A file is the program's notebook.

## Picture

```text
 program (RAM)                         disk
 ┌──────────────┐   write / append   ┌─────────────────┐
 │ expenses = …  │ ─────────────────▶ │ expenses.txt    │
 │               │ ◀───────────────── │ chai,20         │
 └──────────────┘        read         │ auto,75         │
                                       └─────────────────┘
 "w" = write (replaces everything)   "a" = append (adds at the end)   "r" = read
```

## How it works inside

- `open(name, mode, encoding="utf-8")` asks the operating system for the file. Mode `"r"` reads (the default), `"w"` writes from scratch (it **erases** the old content), `"a"` adds at the end.
- Writing first goes into a buffer in memory. Closing the file (or leaving the `with` block) **flushes** it to disk. Without closing, data can be lost.
- `for line in f:` reads one line at a time. This works even for files bigger than your RAM.
- Each line keeps its `\n` at the end. Use `.strip()` to remove it.
- Always say `encoding="utf-8"`, so ₹ and Kannada or Hindi text work on every computer.
- For tables, use the `csv` module. For nested data (like this app's progress backup), use `json`.

## Python, step by step

```python
with open("expenses.txt", "w", encoding="utf-8") as f:   # "w" = new file (or erase old)
    f.write("chai,20\n")                                   # \n = end of line
    f.write("auto,75\n")

with open("expenses.txt", "a", encoding="utf-8") as f:   # "a" = add at the end
    f.write("lunch,120\n")

with open("expenses.txt", encoding="utf-8") as f:        # read (the default mode)
    for line in f:                                        # one line at a time
        item, amount = line.strip().split(",")
        print(item, int(amount))
```

```output
chai 20
auto 75
lunch 120
```

Read the whole file at once:

```python
with open("expenses.txt", "w", encoding="utf-8") as f:
    f.write("chai,20\nauto,75\nlunch,120\n")

with open("expenses.txt", encoding="utf-8") as f:
    text = f.read()                    # the whole file as one string
print(repr(text))                      # repr shows the \n characters
total = sum(int(line.split(",")[1]) for line in text.splitlines())
print("Total:", total)
```

```output
'chai,20\nauto,75\nlunch,120\n'
Total: 215
```

CSV files (open in Excel or Google Sheets):

```python
import csv
rows = [["item", "amount"], ["chai", 20], ["auto", 75]]
with open("spend.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows(rows)

with open("spend.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):        # each row becomes a dict, using the header
        print(row["item"], row["amount"])
```

```output
chai 20
auto 75
```

JSON (lists and dicts saved as text; this app's backup is a JSON file):

```python
import json
data = {"streak": 5, "solved": ["two-sum"]}
with open("progress.json", "w", encoding="utf-8") as f:
    json.dump(data, f)                   # Python dict -> JSON text
with open("progress.json", encoding="utf-8") as f:
    back = json.load(f)                  # JSON text -> Python dict
print(back["solved"], back == data)
```

```output
['two-sum'] True
```

`pathlib` makes paths easy:

```python
from pathlib import Path
p = Path("notes.txt")
p.write_text("first line\n", encoding="utf-8")
print(p.exists(), p.read_text(encoding="utf-8").strip())
print(p.suffix, p.stem)
```

```output
True first line
.txt notes
```

## Time and space

| Operation | Time | Memory |
| --- | --- | --- |
| `for line in f` | O(file size) | one line at a time |
| `f.read()` | O(file size) | the whole file in RAM |
| `f.write(s)` | O(len(s)) | buffered |

Disk is about 1,000 times slower than RAM. Read a file once, not inside a loop.

## Common mistakes

- Opening a file that does not exist:

```python
# WRONG: this file does not exist
open("missing.txt")
```

```output
Traceback (most recent call last):
  File "files.py", line 2, in <module>
    open("missing.txt")
    ~~~~^^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'missing.txt'
```

- Using `"w"` when you meant `"a"`. `"w"` erases the file first.
- Forgetting `.strip()`, so every line still ends with `\n`.
- Not using `with`, and forgetting to close the file.
- Forgetting `encoding="utf-8"`. On some Windows computers, ₹ then breaks.
- Building file paths with `+` and `/`. Use `pathlib.Path`.

## Patterns that use it

Not a DSA pattern. But every real project uses files: the expense tracker (Phase 1 project), logs, CSV exports, config files, JSON backups.

## Practice

```practice
Expense tracker: add an expense to a file, then show all expenses and the total.
Word counter: read a text file and print the 5 most common words.
Save a dict of your study streak to JSON, then load it back.
Read a CSV of marks and print each student's average.
```

## Explain it back

```explain
What is the difference between "w" and "a" mode?
Why should you open files with "with"?
Why is "for line in f" better than f.read() for a huge file?
```

## Flashcards

```flashcards
Mode "w"? :: Write. Creates the file or ERASES the old content.
Mode "a"? :: Append. Adds to the end.
Why use "with open(...) as f"? :: The file is closed automatically, even after an error.
How do you remove the newline from a line? :: line.strip()
Save a dict as JSON? :: json.dump(data, f)
Load JSON from a file? :: json.load(f)
```
