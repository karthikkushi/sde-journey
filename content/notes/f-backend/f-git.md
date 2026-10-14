---
id: f-git
title: Git workflow and pull requests
level: core
phase: 1
week: 6
tags: [backend, git, tools, teamwork]
estMinutes: 30
---

## What it is

**Git** saves snapshots (**commits**) of your project, so you can go back, compare, and work in parallel on **branches**.
**GitHub** hosts your repository online and adds **pull requests (PRs)**: a page where a change is reviewed and tested before it joins `main`.
Every software job uses this flow daily.

## Real-life example

Writing a recipe book with friends. `main` is the printed book. Each friend copies it to try a new recipe (a branch), writes notes as they go (commits), and then asks the editor to add the recipe to the book (a pull request). The editor reads it, asks for a small fix, and then merges it.

## Picture

```text
 main:     A ─── B ─────────────── M        (M = merge of the PR)
                  \               /
 add-idli:         C ─── D ──────          (your branch: 2 commits)

 daily loop:  pull main → new branch → edit → add → commit → push → PR → review → merge
```

## How it works inside

- A **commit** is a snapshot of all tracked files plus a message, an author and a pointer to its parent commit(s). Its id (hash) is computed from its content.
- A **branch** is just a movable name pointing to a commit. `HEAD` is "where you are now".
- **Staging area**: `git add` chooses what goes into the next commit.
- **Merge**: combines two branches. If `main` did not move, it is a **fast-forward** (main just jumps ahead). Otherwise Git makes a merge commit, or stops with a **conflict** when both sides changed the same lines.
- **Rebase** replays your commits on top of the latest `main`: a straight history, but it rewrites your commits (never rebase commits others already use).
- **Remote** (`origin`): the GitHub copy. `push` sends commits; `pull` = fetch + merge.
- **Good commits**: small, one idea each, with a message in the imperative: "Add idli to menu", not "changes".
- **`.gitignore`** lists files Git must ignore: `.venv/`, `node_modules/`, `.env`, build output. Never commit secrets.

**Pull request etiquette**: small PRs, a clear description (what and why), screenshots for UI, tests passing in CI, and reply to every review comment.

## Python, step by step

A real Git repository in a temporary folder (Python runs the git commands):

```python
import os
import pathlib
import subprocess

env = {**os.environ, "GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_NOSYSTEM": "1",   # ignore personal settings
       "GIT_AUTHOR_NAME": "Ravi", "GIT_AUTHOR_EMAIL": "ravi@example.com",
       "GIT_COMMITTER_NAME": "Ravi", "GIT_COMMITTER_EMAIL": "ravi@example.com"}

def git(*args):
    p = subprocess.run(["git", *args], capture_output=True, text=True, env=env)
    return p.returncode, p.stdout.strip()

menu = pathlib.Path("menu.txt")
git("init", "-q", "-b", "main")
menu.write_text("dosa 60\n")
git("add", "menu.txt")
git("commit", "-q", "-m", "Add menu")

git("switch", "-q", "-c", "add-idli")          # a new branch for one change
menu.write_text("dosa 60\nidli 40\n")
git("commit", "-q", "-am", "Add idli")

git("switch", "-q", "main")
print(menu.read_text().splitlines())             # main does not have idli yet
git("merge", "-q", "add-idli")                   # fast-forward: main catches up
print(menu.read_text().splitlines())
print(git("log", "--format=%s")[1].splitlines())  # newest first
```

```output
['dosa 60']
['dosa 60', 'idli 40']
['Add idli', 'Add menu']
```

A merge conflict: both branches changed the same line:

```python
import os
import pathlib
import subprocess

env = {**os.environ, "GIT_CONFIG_GLOBAL": os.devnull, "GIT_CONFIG_NOSYSTEM": "1",
       "GIT_AUTHOR_NAME": "Ravi", "GIT_AUTHOR_EMAIL": "ravi@example.com",
       "GIT_COMMITTER_NAME": "Ravi", "GIT_COMMITTER_EMAIL": "ravi@example.com"}

def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True, env=env).returncode

menu = pathlib.Path("menu.txt")
git("init", "-q", "-b", "main")
menu.write_text("dosa 60\n")
git("add", "menu.txt")
git("commit", "-q", "-m", "Add menu")
git("switch", "-q", "-c", "price-up")
menu.write_text("dosa 70\n")
git("commit", "-q", "-am", "Dosa 70")
git("switch", "-q", "main")
menu.write_text("dosa 65\n")
git("commit", "-q", "-am", "Dosa 65")
print("merge exit code:", git("merge", "price-up"))   # not 0: Git needs your decision
print(menu.read_text())
```

```output
merge exit code: 1
<<<<<<< HEAD
dosa 65
=======
dosa 70
>>>>>>> price-up
```

To fix it: edit the file to the version you want, delete the marker lines, then `git add menu.txt` and `git commit`.

The daily commands (in the terminal):

```bash
git switch main && git pull                 # start from the latest main
git switch -c fix-gst-rounding              # one branch per change
git status                                  # what changed?
git diff                                    # see the exact lines
git add bill.py test_bill.py                # choose what to commit
git commit -m "Round GST to 2 decimals"     # small commit, clear message
git push -u origin fix-gst-rounding         # then open a pull request on GitHub
gh pr create --fill                         # (or with the GitHub CLI)
```

## Time and space

Git stores each version of a file once (compressed) and shares unchanged files between commits, so even long histories stay small. Commits, branches and merges are fast because they happen on your machine.

## Common mistakes

- Huge commits with many unrelated changes ("final changes").
- Committing secrets (`.env`, API keys). If it happens: rotate the key; deleting the file later does not remove it from history.
- Working directly on `main`.
- Rebasing or force-pushing a branch others are using.
- Committing `.venv`, `node_modules` or build output (use `.gitignore`).
- Resolving a conflict by blindly picking one side without reading both.

## Patterns that use it

Every project in this plan (each is a GitHub repo), CI/CD (tests run on every push and PR), and interviews ("walk me through your team's workflow").

## Practice

```practice
Learn Git Branching (learngitbranching.js.org): finish the Introduction and Ramping Up levels.
Create a repo for your Phase 1 exercises; make 5 small commits with clear messages.
Make a branch, change one line on both the branch and main, merge, and resolve the conflict by hand.
Open a pull request on your own repo and review it yourself as if you were a teammate.
```

## Explain it back

```explain
What is a commit, and what is a branch?
What is the difference between a fast-forward merge and a merge commit?
Why can a conflict happen, and how do you resolve it?
What goes into a good pull request?
```

## Flashcards

```flashcards
What is a branch in Git? :: A movable name pointing to a commit.
git add vs git commit? :: add stages changes; commit saves a snapshot of the staged changes.
Fast-forward merge? :: main had no new commits, so it simply moves ahead.
Merge conflict? :: Both branches changed the same lines; you must choose.
Good commit message? :: Short, imperative: "Add idli to menu".
Committed a secret? :: Rotate it. History still contains it.
```
