---
id: a22-modules-venv
title: Modules and virtual environments
level: basic
phase: 1
week: 6
tags: [python, modules, pip, venv, tools]
estMinutes: 15
---

## What it is

A **module** is a Python file you can `import` to reuse its code. Python comes with many (`math`, `random`, `json`).
`pip` installs extra packages from the internet (PyPI).
A **virtual environment** (venv) is a private folder of packages for **one** project, so projects do not fight over versions.

## Real-life example

Your kitchen has a spice box (the built-in modules). For a special dish, you buy extra items from the shop (pip install).
If two dishes need different brands of the same masala, you keep them in **separate boxes** labelled per dish. That is a venv: one box per project.

## Picture

```text
 my-project/
 ├── .venv/              ← this project's own packages (do NOT commit to Git)
 ├── requirements.txt    ← the list of packages and versions (DO commit)
 ├── billing.py          ← your module
 └── main.py             ← import billing

 another-project/
 └── .venv/              ← different versions, no clash
```

## How it works inside

- `import math` finds `math`, runs it **once**, and gives you the module object. A second import reuses it.
- Python looks for modules in a list of folders called `sys.path`: the script's own folder first, then the standard library, then installed packages.
- `if __name__ == "__main__":` is true only when you run the file directly, not when it is imported. Put quick tests or the "start" code there.
- `python3 -m venv .venv` makes a folder with its own Python and its own `pip`. "Activating" it puts that folder first in your shell's PATH.
- `requirements.txt` records exact versions, so another computer (or GitHub Actions) can install the same set.

## Python, step by step

```python
import math                      # import the whole module
print(math.sqrt(144), math.pi > 3)
from math import gcd             # import one name
print(gcd(12, 18))
import random as rd              # a short nickname
rd.seed(1)                       # fixed seed: the same "random" numbers every run
print(rd.randint(1, 6) in range(1, 7))
```

```output
12.0 True
6
True
```

Your own module (normally you create `billing.py` in your editor; here the code writes it first):

```python
from pathlib import Path
Path("billing.py").write_text('''
GST = 5

def with_gst(amount):
    return round(amount * (1 + GST / 100), 2)

if __name__ == "__main__":       # only when you run billing.py itself
    print("testing:", with_gst(100))
''')

import billing                   # finds billing.py in the same folder
print(billing.with_gst(200))     # note: the "testing" line did NOT run on import
```

```output
210.0
```

Virtual environment commands (type these in the terminal, not in Python):

```bash
python3 -m venv .venv              # make a venv in the folder .venv
source .venv/bin/activate          # turn it on (Windows: .venv\Scripts\activate)
pip install requests               # installs only inside this project's .venv
pip freeze > requirements.txt      # save the exact package list
deactivate                         # turn it off

# On another computer:
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt    # install the same packages
```

## Time and space

The first import of a module runs its file once. Later imports are instant. Imports usually go at the top of the file.

## Common mistakes

- Naming your file `random.py` or `math.py`. It hides the real module, and `import random` loads **your** file.
- Running `pip install` without activating the venv, so packages go into the global Python.
- Committing `.venv` to Git. Add it to `.gitignore` and commit `requirements.txt` instead.
- `from module import *`. You cannot tell where names come from. Import what you need.
- Forgetting `if __name__ == "__main__":`, so test code runs every time someone imports your module.

## Patterns that use it

Not a DSA pattern. On LeetCode, common modules are already imported for you (`collections`, `heapq`, `bisect`, `math`, `functools`). In projects, you will use venv + requirements.txt from the first FastAPI app.

## Practice

```practice
Make a folder with a venv, install requests, and save requirements.txt.
Split your expense tracker into two files: storage.py (load/save) and main.py (menu).
Add if __name__ == "__main__": with 3 quick checks to storage.py.
Read the Python docs page for the math module and try 3 functions you did not know.
```

## Explain it back

```explain
What does if __name__ == "__main__": do, and why is it useful?
Why does each project get its own virtual environment?
What goes into Git: .venv or requirements.txt? Why?
```

## Flashcards

```flashcards
What is a module? :: A Python file you can import to reuse its code.
What is pip? :: The tool that installs packages from PyPI.
What is a virtual environment? :: A private set of packages for one project.
Command to make a venv? :: python3 -m venv .venv
Save installed packages? :: pip freeze > requirements.txt
When is __name__ == "__main__" true? :: When the file is run directly, not imported.
```
