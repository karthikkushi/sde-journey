---
id: f-security
title: Security basics (OWASP Top 10 in simple words)
level: core
phase: 3
week: 38
tags: [backend, security, owasp]
estMinutes: 35
---

## What it is

Web security is mostly about a short list of **common mistakes**. The **OWASP Top 10** is the best-known list of them.
Most real attacks are not clever: they use a missing permission check, a SQL query built from user text, a leaked key or an old library.
Your job: never trust input, check permissions on every request, and keep secrets secret.

## Real-life example

A housing society: the gate guard checks visitors (authentication), but each flat still needs its own lock (authorization). If flat numbers are written on keys and any key opens any door when you change the number, anyone can walk into any flat. That is "broken access control", the most common web flaw.

## Picture

```text
 OWASP Top 10 (2025 list; OWASP updates it every few years)
 A01 Broken access control        user 7 can read /orders/8 (someone else's); also SSRF
 A02 Security misconfiguration    debug pages in production, default passwords
 A03 Supply chain failures        old or poisoned library, unprotected build pipeline
 A04 Cryptographic failures       plain passwords, no HTTPS
 A05 Injection                    SQL built from user text
 A06 Insecure design              no limits on OTP attempts
 A07 Authentication failures      weak passwords allowed, no lockout
 A08 Integrity failures           running unverified updates or data
 A09 Logging and alerting         attacks happen and nobody notices
 A10 Exceptional conditions       errors that crash, leak details or "fail open"
```

## How it works inside

- **Access control (A01)**: for every request, check "is this user allowed to do this to **this** object?" Fetch `WHERE id = :id AND owner_id = :current_user`. Return 404 or 403 otherwise. Never trust ids from the client alone.
- **Injection (A05)**: user text must never become code. Use **parameters** for SQL, never f-strings. The same goes for shell commands and HTML.
- **XSS** (a kind of injection): if user text is shown in a web page without escaping, it can run as JavaScript in other users' browsers. Escape output (templates usually do), and use a Content Security Policy.
- **Secrets**: in environment variables or a secret manager; never in Git; rotate them if leaked.
- **Passwords and crypto (A04, A07)**: salted slow hashes, HTTPS everywhere, rate-limit login and OTP attempts.
- **Dependencies and supply chain (A03)**: update regularly, pin versions, install only packages you trust; let tools warn you (GitHub Dependabot, `pip-audit`).
- **Misconfiguration (A02)**: `DEBUG=false` in production, no default admin passwords, least privilege for database users and cloud keys.
- **SSRF (part of A01 since 2025)**: if your server fetches URLs, allow only known hosts; block internal addresses.
- **Logging (A09)**: log logins, permission failures and admin actions (without secrets), and alert on spikes.
- **Errors (A10)**: catch errors, show users a short message (never a stack trace), and **fail closed**: if a permission check errors, deny.

## Python, step by step

SQL injection, and the fix:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE users (name TEXT, is_admin INTEGER)")
db.executemany("INSERT INTO users VALUES (?, ?)", [("ravi", 0), ("admin", 1)])

def find_user_unsafe(name):
    return db.execute(f"SELECT name FROM users WHERE name = '{name}'").fetchall()   # DANGER

def find_user_safe(name):
    return db.execute("SELECT name FROM users WHERE name = ?", (name,)).fetchall()  # a parameter

attack = "x' OR '1'='1"
print(find_user_unsafe(attack))     # the attacker's text became SQL: every user is returned
print(find_user_safe(attack))       # treated as plain text: no user has that name
```

```output
[('ravi',), ('admin',)]
[]
```

Broken access control, and the fix (check the owner on every request):

```python
from fastapi import FastAPI, Header, HTTPException
from fastapi.testclient import TestClient

ORDERS = {101: {"owner": "ravi", "total": 640}, 102: {"owner": "asha", "total": 360}}
app = FastAPI()

@app.get("/unsafe/orders/{order_id}")
def unsafe_order(order_id: int, x_user: str = Header()):
    return ORDERS[order_id]                              # anyone can read any order!

@app.get("/orders/{order_id}")
def safe_order(order_id: int, x_user: str = Header()):   # (x_user stands in for the logged-in user)
    order = ORDERS.get(order_id)
    if order is None or order["owner"] != x_user:
        raise HTTPException(404, "order not found")      # do not even reveal that it exists
    return order

client = TestClient(app)
print(client.get("/unsafe/orders/102", headers={"x-user": "ravi"}).json())
print(client.get("/orders/102", headers={"x-user": "ravi"}).status_code)
print(client.get("/orders/101", headers={"x-user": "ravi"}).json())
```

```output
{'owner': 'asha', 'total': 360}
404
{'owner': 'ravi', 'total': 640}
```

Escaping output (XSS) and allowing only known hosts (SSRF):

```python
import html
from urllib.parse import urlsplit

comment = '<script>alert("stolen")</script>'
print(html.escape(comment))                       # shown as text, never run as code

ALLOWED_HOSTS = {"api.partner.example"}
def safe_to_fetch(url):
    parts = urlsplit(url)
    return parts.scheme == "https" and parts.hostname in ALLOWED_HOSTS

print(safe_to_fetch("https://api.partner.example/rates"), safe_to_fetch("http://169.254.169.254/latest/meta-data"))
```

```output
&lt;script&gt;alert(&quot;stolen&quot;)&lt;/script&gt;
True False
```

> **Same thing in ASP.NET Core**: EF Core and `SqlParameter` prevent SQL injection, Razor escapes output by default, `[Authorize(Policy = ...)]` plus resource checks handle access control, and User Secrets / Azure Key Vault keep secrets out of code.

## Time and space

Security checks cost microseconds. Breaches cost money, trust and sometimes legal trouble. Make the safe way the default way in your code.

## Common mistakes

- Checking login but not ownership (the most common real bug).
- f-strings in SQL or shell commands.
- API keys committed to GitHub (bots find them within minutes).
- Detailed error pages or stack traces shown to users in production.
- Never updating dependencies.
- "Security through obscurity": hiding an admin URL instead of protecting it.

## Patterns that use it

Every endpoint you build: the billing API (only the owner changes prices), the serious project, AI apps (prompt injection is the new injection; see the guardrails note), and system design reviews.

## Practice

```practice
Go through your billing API: for every endpoint, write who may call it and which objects they may touch. Add the missing checks.
Run pip-audit (or turn on Dependabot) on one repo and fix what it finds.
Search your repos for keys or passwords (try git log -p | grep -i "key"). Move anything found into environment variables.
Read the OWASP Top 10 page and write one line per item in your own words.
```

## Explain it back

```explain
Explain broken access control with the housing society example.
How do parameters prevent SQL injection?
What is XSS, and how does escaping stop it?
Why return 404 instead of 403 for someone else's order?
```

## Flashcards

```flashcards
Most common web flaw (OWASP A01)? :: Broken access control: no ownership check.
Stop SQL injection? :: Parameters (placeholders), never string formatting with user input.
Stop XSS? :: Escape output (html.escape / template auto-escaping), add CSP.
Where do secrets live? :: Environment variables or a secret manager; never in Git.
Leaked a key? :: Rotate it immediately.
SSRF defence? :: Only fetch allowed hosts; block internal addresses.
```
