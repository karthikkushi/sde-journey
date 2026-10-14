---
id: f-deploy
title: Deploying to a free cloud tier
level: core
phase: 3
week: 34
tags: [backend, deploy, cloud, devops]
estMinutes: 30
---

## What it is

**Deploying** means running your app on a server that the internet can reach, with a real URL.
For learning, you can use a **free tier**: a cloud platform that runs your Docker image or Python app, plus a free managed PostgreSQL.
Good deploys are **repeatable** (from Git, by CI), **configured by environment variables**, and **checked** by a health endpoint.

## Real-life example

Opening a stall at the weekend market. You do not build the market: you rent a spot (the platform), bring your packed stall (the Docker image), put up your name board (domain + HTTPS), and the market office checks your stall is open each morning (health check). If something breaks, you go back to last week's setup (rollback).

## Picture

```text
 GitHub (main) ──CI green──▶ platform builds the image ──▶ runs 1+ containers
                                                           │  env vars: DATABASE_URL, SECRET_KEY
 user ──https://shop-api.onrender.com──▶ load balancer ───▶ │  GET /health → 200?
                                                           └──▶ managed PostgreSQL (free tier)
```

## How it works inside

**Common free options** (check each site's current limits before you choose; free tiers change often, and some **sleep** when idle, making the first request slow):
- App platforms that run a Docker image or a Python app from GitHub: Render, Railway, Fly.io, Google Cloud Run, Azure App Service.
- Free PostgreSQL: Neon, Supabase.
- Static frontends: GitHub Pages, Vercel, Netlify.

**The "12-factor" habits**
- **Config in environment variables**: `DATABASE_URL`, `SECRET_KEY`, `APP_ENV`. Never commit them. Fail fast at startup if one is missing.
- **Stateless app**: no files saved on the server's disk (it may be wiped); use the database or object storage.
- **Logs to stdout**: the platform collects them.
- **Same build everywhere**: one Docker image, different env vars for dev and prod.

**Deploy steps that matter**
1. **Migrations** run before (or as part of) the new release.
2. **Health check**: the platform calls `/health`; only healthy instances get traffic. A **readiness** check can also test the database connection.
3. **Zero-downtime**: start the new version, wait until it is healthy, then switch traffic (rolling deploy).
4. **Rollback**: redeploy the previous image tag if errors jump.
5. **HTTPS and a domain**: most platforms give HTTPS on their subdomain for free.

## Python, step by step

Load settings from environment variables and fail fast if one is missing:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    env: str
    database_url: str
    debug: bool

def load_settings(environ):
    missing = [key for key in ("DATABASE_URL",) if key not in environ]
    if missing:
        raise RuntimeError(f"missing settings: {missing}")      # crash at startup, not at the first request
    return Settings(
        env=environ.get("APP_ENV", "dev"),
        database_url=environ["DATABASE_URL"],
        debug=environ.get("DEBUG", "false").lower() == "true",
    )

print(load_settings({"DATABASE_URL": "postgresql://shop@db/shop", "APP_ENV": "prod"}))
try:
    load_settings({})
except RuntimeError as e:
    print(e)
```

```output
Settings(env='prod', database_url='postgresql://shop@db/shop', debug=False)
missing settings: ['DATABASE_URL']
```

Health and readiness endpoints (readiness also checks the database):

```python
from fastapi import FastAPI, Response
from fastapi.testclient import TestClient

database_up = {"ok": True}                       # pretend database connection

def check_database():
    return database_up["ok"]                     # real code: run SELECT 1

app = FastAPI()

@app.get("/health")                              # "the process is alive"
def health():
    return {"status": "ok"}

@app.get("/ready")                               # "I can serve real requests"
def ready(response: Response):
    if not check_database():
        response.status_code = 503
        return {"status": "database unavailable"}
    return {"status": "ready"}

client = TestClient(app)
print(client.get("/health").json(), client.get("/ready").status_code)
database_up["ok"] = False                        # the database goes down
print(client.get("/health").status_code, client.get("/ready").status_code, client.get("/ready").json())
```

```output
{'status': 'ok'} 200
200 503 {'status': 'database unavailable'}
```

The start command most platforms need:

```bash
# Start command (the platform sets $PORT)
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
# Run migrations before the new version takes traffic
alembic upgrade head
```

> **Same thing in ASP.NET Core**: `builder.Configuration` reads environment variables (`ConnectionStrings__Default` maps to `ConnectionStrings:Default`), and `builder.Services.AddHealthChecks()` + `app.MapHealthChecks("/health")` give health endpoints.

## Time and space

Free tiers limit memory (often 512 MB), CPU and monthly hours, and may sleep after some idle minutes (the first request then takes 10–60 s). That is fine for a portfolio; for real users, budget a small paid plan.

## Common mistakes

- Secrets in the repository, or `DEBUG=true` in production.
- Saving uploads on the server's disk (gone after a redeploy).
- No health check: broken releases receive traffic.
- Running migrations by hand and forgetting one.
- Not writing down how to roll back.

## Patterns that use it

The kirana billing API ("deploy and share the live docs URL"), the URL shortener, the serious project, and the "it is live" badge in this app.

## Practice

```practice
Deploy a FastAPI hello-world from GitHub to a free platform. Write down every step.
Move all settings of your app into environment variables; make the app refuse to start without DATABASE_URL.
Add /health and /ready endpoints and point the platform's health check at /health.
Practice a rollback: deploy a broken version, then redeploy the previous one.
```

## Explain it back

```explain
Why should configuration live in environment variables?
What is the difference between a health check and a readiness check?
What does "stateless app" mean, and why does it matter on a cloud platform?
Describe a zero-downtime deploy.
```

## Flashcards

```flashcards
Where do secrets go when deploying? :: Environment variables on the platform, never in Git.
Fail fast? :: Check required settings at startup and crash early if missing.
Health vs readiness? :: Health: process alive. Readiness: can serve requests (DB reachable).
Stateless app? :: No local files kept; state lives in the DB or object storage.
Free tier catch? :: Limits, and some apps sleep when idle (slow first request).
Rollback? :: Redeploy the previous image or release.
```
