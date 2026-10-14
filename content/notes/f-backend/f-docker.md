---
id: f-docker
title: Docker
level: core
phase: 3
week: 32
tags: [backend, docker, containers, devops]
estMinutes: 35
---

## What it is

**Docker** packs your app with everything it needs (Python version, packages, settings) into an **image**. Running an image gives a **container**: an isolated process that behaves the same on your laptop, a teammate's laptop and the server.
A **Dockerfile** is the recipe for the image. **Docker Compose** starts several containers together (API + database + Redis).
It ends "it works on my machine" problems.

## Real-life example

A tiffin service packs each meal in a sealed steel box with the rice, curry and pickle inside. Any delivery boy can carry any box, and the meal is the same at every office. The recipe card is the Dockerfile, the packed box type is the image, and each box on a desk is a container.

## Picture

```text
 Dockerfile ──docker build──▶ image (read-only layers) ──docker run──▶ container (running process)

 image layers (cached, reused when unchanged):
   ┌─────────────────────────────┐  COPY app/ .            ← changes often: rebuilt
   ├─────────────────────────────┤  RUN pip install ...     ← cached if requirements.txt unchanged
   ├─────────────────────────────┤  COPY requirements.txt .
   └─────────────────────────────┘  FROM python:3.12-slim   ← base image

 docker compose up:   [ api :8000 ] ──▶ [ postgres :5432 ]   (one private network)
```

## How it works inside

- A container is **not** a virtual machine. It shares the host's Linux kernel but gets its own files, network and process list (Linux namespaces and cgroups). So it starts in about a second and uses little memory.
- **Images are layers**. Each Dockerfile instruction adds a layer. Docker reuses unchanged layers, so put rarely-changing steps (installing packages) **before** often-changing ones (copying your code).
- **Containers are disposable**. Anything written inside is lost when the container is removed. Keep data in **volumes** (like the Postgres data folder) or in a database.
- **Ports**: `-p 8000:8000` maps a host port to a container port.
- **Configuration** comes from **environment variables** (`-e DATABASE_URL=...`), never baked into the image (especially not secrets).
- **Compose** describes several services in `compose.yaml`; they reach each other by **service name** (`postgres:5432`).
- Use small base images (`-slim`), a `.dockerignore`, and a non-root user.

## Python, step by step

The app we will put in a container (`app/main.py`), tested here with FastAPI's test client:

```python
import os
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/health")
def health():
    return {"ok": True, "env": os.environ.get("APP_ENV", "dev")}   # settings come from the environment

client = TestClient(app)
print(client.get("/health").json())
os.environ["APP_ENV"] = "prod"                                   # what docker run -e APP_ENV=prod does
print(client.get("/health").json())
```

```output
{'ok': True, 'env': 'dev'}
{'ok': True, 'env': 'prod'}
```

The `Dockerfile` (order matters for caching):

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt   # cached until requirements.txt changes
COPY app/ ./app
RUN useradd --create-home appuser
USER appuser                                         # do not run as root
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`.dockerignore` (keep the image small and secret-free):

```text
.venv
__pycache__
.git
.env
tests
```

`compose.yaml` for the API and PostgreSQL:

```yaml
services:
  api:
    build: .
    ports: ["8000:8000"]
    environment:
      APP_ENV: dev
      DATABASE_URL: postgresql://shop:shop@postgres:5432/shop   # "postgres" = the service name
    depends_on: [postgres]
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: shop
      POSTGRES_PASSWORD: shop
      POSTGRES_DB: shop
    volumes: ["pgdata:/var/lib/postgresql/data"]                # data survives restarts
volumes:
  pgdata:
```

The commands:

```bash
docker build -t shop-api .                         # build the image
docker run --rm -p 8000:8000 -e APP_ENV=prod shop-api
docker compose up --build                          # API + Postgres together
docker compose logs -f api                         # follow the API's logs
docker ps                                          # running containers
docker exec -it <container-id> sh                  # a shell inside a container
docker compose down                                # stop (add -v to delete the data volume too)
```

> **Same thing for ASP.NET Core**: use a two-stage Dockerfile: `FROM mcr.microsoft.com/dotnet/sdk` to `dotnet publish`, then copy the output into `FROM mcr.microsoft.com/dotnet/aspnet` (a smaller runtime image).

## Time and space

| Thing | Rough cost |
| --- | --- |
| Start a container | ~1 second |
| Start a virtual machine | ~30–60 seconds |
| Rebuild with cached layers | seconds |
| python:3.12-slim image | ~50 MB compressed |

## Common mistakes

- `COPY . .` before installing packages: every code change re-installs everything (slow builds).
- Secrets in the image or in `compose.yaml` committed to Git.
- Storing data inside the container (lost on restart). Use volumes.
- Using `localhost` to reach another container. Use the service name.
- Huge images (no `-slim`, no `.dockerignore`).

## Patterns that use it

The billing API and URL shortener projects (Docker + Compose), CI/CD (build the image on every push), deploying (most hosts run containers), and system design ("each service runs in containers behind a load balancer").

## Practice

```practice
Write a Dockerfile for your FastAPI app and run it with docker run -p 8000:8000.
Add Postgres with docker compose and connect the API to it with DATABASE_URL.
Change one line of code and rebuild: which layers were cached?
Run docker compose down and up again: is your data still there? Why?
```

## Explain it back

```explain
What is the difference between an image and a container?
Why is the order of lines in a Dockerfile important?
Why should data live in a volume, not inside the container?
How does the API container find the database container in Compose?
```

## Flashcards

```flashcards
Image vs container? :: Image: the packed recipe (read-only). Container: a running instance of it.
Container vs VM? :: A container shares the host kernel: lighter and faster to start.
Faster rebuilds? :: Copy requirements and install them before copying your code.
Keep data safe? :: Use volumes.
Config and secrets? :: Environment variables at run time, never inside the image.
Containers reach each other in Compose by? :: Service name (for example postgres:5432).
```
