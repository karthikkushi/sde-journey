---
id: f-cicd
title: CI/CD with GitHub Actions
level: core
phase: 3
week: 33
tags: [backend, ci, cd, github-actions, devops]
estMinutes: 30
---

## What it is

**CI (continuous integration)**: every push and pull request automatically runs lint, tests and a build. Red means "do not merge".
**CD (continuous delivery/deployment)**: when `main` is green, the app is automatically packaged and deployed.
**GitHub Actions** runs these steps on GitHub's machines from a YAML file in `.github/workflows/`. (This very study site deploys this way.)

## Real-life example

A factory line for parcels: every parcel passes a scale, a scanner and a seal check before it can leave. If any check fails, a red light stops it. Nobody has to remember to check by hand, and broken parcels never reach customers.

## Picture

```text
 git push ──▶ GitHub Actions
                │
                ├─ job: test  (ubuntu)   checkout → setup Python → install → lint → pytest
                │      red? ✗ stop. PR cannot merge (branch protection)
                │
                └─ job: deploy (only on main, needs: test)
                       build Docker image → push to registry → deploy → health check
```

## How it works inside

- A **workflow** (`.github/workflows/ci.yml`) has **triggers** (`on: push`, `pull_request`, `schedule`), **jobs** (run in parallel unless `needs:` links them) and **steps** (shell commands or reusable **actions** like `actions/checkout`).
- Each job runs on a fresh virtual machine (a **runner**), so the build must install everything it needs: that also proves your setup instructions work.
- **Secrets** (API keys, deploy tokens) are stored in the repository settings and read as `${{ secrets.NAME }}`. They are hidden in logs.
- **Caching** dependencies (`cache: pip`) makes runs faster.
- **Matrix builds** test several versions at once (Python 3.11 and 3.12).
- **Branch protection**: GitHub can require the CI checks to pass before a PR merges.
- **CD safely**: deploy only from `main`, after tests pass; check a health endpoint after deploying; keep a way to **roll back** (redeploy the previous image).

## Python, step by step

What CI does with a broken change: run the tests and fail the build:

```python
import contextlib
import io
import pathlib
import pytest

pathlib.Path("discount.py").write_text('''
def apply_discount(price, percent):
    return price - price * percent // 10      # bug: should divide by 100
''')
pathlib.Path("test_discount.py").write_text('''
from discount import apply_discount

def test_ten_percent():
    assert apply_discount(200, 10) == 180

def test_no_discount():
    assert apply_discount(200, 0) == 200
''')

out = io.StringIO()
with contextlib.redirect_stdout(out):
    code = pytest.main(["-q", "-p", "no:cacheprovider", "test_discount.py"])
summary = [line for line in out.getvalue().splitlines() if " passed" in line or " failed" in line][-1]
print("exit code:", int(code), "|", summary.split(" in ")[0])
print("CI result:", "green, can merge" if code == 0 else "red, merge blocked")
```

```output
exit code: 1 | 1 failed, 1 passed
CI result: red, merge blocked
```

A CI + CD workflow for a FastAPI project (`.github/workflows/ci.yml`):

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-python@v6
        with:
          python-version: '3.12'
          cache: pip
      - run: pip install -r requirements.txt
      - run: ruff check .          # lint
      - run: pytest -q             # tests (a failure makes the job red)

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: test                    # only after the tests pass
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: docker build -t shop-api:${{ github.sha }} .
      - run: ./scripts/deploy.sh shop-api:${{ github.sha }}
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}   # stored in repo settings, hidden in logs
```

> **Same thing for .NET**: the steps become `actions/setup-dotnet`, `dotnet restore`, `dotnet build --no-restore`, `dotnet test --no-build`. Azure Pipelines uses a very similar YAML.

## Time and space

A good CI run takes a few minutes. Keep it fast: cache dependencies, run unit tests first, and split slow suites into parallel jobs. If CI takes 30 minutes, people stop waiting for it.

## Common mistakes

- Secrets written in the workflow file instead of `secrets`.
- Deploying from any branch, or deploying when tests fail (missing `needs:`).
- Flaky tests that fail randomly: people start ignoring red builds.
- No health check or rollback plan after deploying.
- A CI that only "builds" but runs no tests.

## Patterns that use it

Every project from Phase 3 (billing API: tests + Docker build in CI), this study site (deploy on every push), and "how do you ship safely?" interview questions.

## Practice

```practice
Add a GitHub Actions workflow to one of your repos that runs pytest on every push.
Break a test on purpose in a pull request and see the red check. Then fix it.
Turn on branch protection for main: require the CI check to pass.
Add a deploy job that runs only on main after tests pass (even if it only prints "deploying").
```

## Explain it back

```explain
What is the difference between CI and CD?
What are triggers, jobs and steps in a GitHub Actions workflow?
Where should secrets live, and why?
How would you roll back a bad deploy?
```

## Flashcards

```flashcards
CI? :: Every push runs lint, tests and build automatically.
CD? :: Green main is packaged and deployed automatically.
Workflow file location? :: .github/workflows/*.yml
Run deploy only after tests? :: needs: test (and if: main branch)
Secrets in Actions? :: ${{ secrets.NAME }}, stored in repo settings.
Branch protection? :: Requires passing checks before a PR can merge.
```
