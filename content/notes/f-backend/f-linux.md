---
id: f-linux
title: Linux and shell basics
level: core
phase: 3
week: 32
tags: [backend, linux, shell, tools]
estMinutes: 30
---

## What it is

Most servers run **Linux**, and you control them through a **shell** (bash, zsh) by typing commands.
A handful of commands covers 90% of daily work: moving around, reading files and logs, searching, permissions, processes and environment variables.
The superpower is the **pipe** `|`: the output of one small command becomes the input of the next.

## Real-life example

A shell is like talking to a very fast, very literal office assistant. "Go to the reports folder" (`cd reports`). "Show me what is here" (`ls`). "Find every line with the word ERROR in today's log, count them" (`grep ERROR app.log | wc -l`). Small instructions, chained together.

## Picture

```text
 /                      (root of everything)
 ├── home/ravi/         (your home: ~)
 │   └── shop-api/
 │       ├── app/main.py
 │       └── logs/access.log
 ├── etc/               (system settings)
 └── var/log/           (system logs)

 cat access.log | grep " 500 " | wc -l       one tool's output flows into the next
```

## How it works inside

**Moving around**: `pwd` (where am I), `ls -la` (list, with hidden files and details), `cd folder`, `cd ..`, `cd ~`.

**Files**: `cat file`, `less file` (scroll, `q` to quit), `head -n 20`, `tail -n 50`, `tail -f app.log` (follow live), `cp`, `mv`, `rm` (no recycle bin!), `mkdir -p a/b/c`, `touch`.

**Search**: `grep -n "ERROR" app.log` (lines with line numbers), `grep -r "TODO" app/`, `find . -name "*.py"`.

**Pipes and redirection**: `|` passes output on; `>` writes to a file (replaces it); `>>` appends; `2>` redirects errors.

**Permissions**: each file has read (r=4), write (w=2), execute (x=1) for **owner, group, others**. `chmod 755 deploy.sh` = `rwxr-xr-x`: you can do everything, others can read and run. `chmod 600 key.pem` = only you can read/write (needed for SSH keys).

**Processes**: `ps aux | grep uvicorn`, `top` / `htop`, `kill PID` (polite), `kill -9 PID` (forceful), `Ctrl+C` stops the current command.

**Environment variables**: `export APP_ENV=prod`, `echo $APP_ENV`. Apps read settings from them. `PATH` lists the folders searched for commands.

**Remote work**: `ssh user@server`, `scp file user@server:/path`. `curl -i http://localhost:8000/health` to test an API.

**Bonus**: `sudo` runs a command as admin (be careful), `man grep` shows the manual, `history` shows past commands, `Ctrl+R` searches them.

## Python, step by step

What the pipe `awk '{print $4}' access.log | sort | uniq -c | sort -rn` does, written in Python:

```python
from collections import Counter

access_log = """2026-10-14 GET /menu 200
2026-10-14 GET /menu 200
2026-10-14 POST /orders 500
2026-10-14 GET /health 200
2026-10-14 POST /orders 201"""

codes = Counter(line.split()[3] for line in access_log.splitlines())   # take the 4th column, count each value
for code, n in codes.most_common():                                    # biggest count first
    print(n, code)
```

```output
3 200
1 500
1 201
```

Permissions are just numbers:

```python
import os
import pathlib
import stat

script = pathlib.Path("deploy.sh")
script.write_text("echo deploying\n")
os.chmod(script, 0o755)                                  # same as: chmod 755 deploy.sh
print(stat.filemode(script.stat().st_mode), oct(script.stat().st_mode & 0o777))
os.chmod(script, 0o600)                                  # same as: chmod 600 deploy.sh
print(stat.filemode(script.stat().st_mode))
```

```output
-rwxr-xr-x 0o755
-rw-------
```

The commands you will type most (on a Linux server or the macOS terminal):

```bash
cd ~/shop-api && ls -la                       # go to the project, list everything
tail -f logs/app.log                          # watch the log live (Ctrl+C to stop)
grep -n "ERROR" logs/app.log | tail -20       # the last 20 errors, with line numbers
ps aux | grep uvicorn                         # is the API running? (find its PID)
kill 12345                                    # stop it politely
export APP_ENV=prod && echo $APP_ENV          # set and read an environment variable
curl -i http://localhost:8000/health          # call the API, show status and headers
df -h && free -h                              # disk space and memory
```

## Time and space

Shell tools stream data line by line, so `grep` can search a 10 GB log without loading it all into memory. `sort` on huge files uses temporary disk space.

## Common mistakes

- `rm -rf` in the wrong folder (always run `pwd` first; there is no undo).
- `>` when you meant `>>` (the file is replaced).
- `chmod 777` "to make it work": now everyone can change the file.
- Running everything with `sudo`.
- Forgetting quotes around text with spaces: `grep "order failed" app.log`.

## Patterns that use it

Deploying and debugging every backend, Docker (containers are small Linux systems), CI/CD scripts, and the Missing Semester course.

## Practice

```practice
Do The Missing Semester lectures 1 (shell) and 4 (data wrangling).
On your laptop: create a folder tree with mkdir -p, add files, find all .py files with find, and grep for "def ".
Write a small log file and count status codes with awk, sort and uniq -c.
Run a FastAPI app, find its process with ps, and stop it with kill.
```

## Explain it back

```explain
What does a pipe do? Give an example with two commands.
What does chmod 755 mean for owner, group and others?
What is the difference between > and >>?
How do you watch a log file live?
```

## Flashcards

```flashcards
Where am I? List files? :: pwd, ls -la
Watch a log live? :: tail -f app.log
Search lines in a file? :: grep -n "text" file
chmod 755? :: rwxr-xr-x: owner all; group and others read + execute.
> vs >>? :: > replaces the file; >> appends.
Find a running process? :: ps aux | grep name
```
