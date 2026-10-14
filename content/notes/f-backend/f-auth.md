---
id: f-auth
title: Authentication (passwords, sessions, JWT, OAuth)
level: core
phase: 3
week: 30
tags: [backend, security, auth, jwt, oauth]
estMinutes: 35
---

## What it is

**Authentication** answers "who are you?" (logging in). **Authorization** answers "what may you do?" (permissions).
After login, the server gives the client a **session id** (in a cookie) or a **token** (often a JWT). The client sends it with every request.
**OAuth** lets users log in with another account (like "Sign in with Google") without giving you their password.

## Real-life example

An office building. At the gate you show your ID card once (login). Security gives you a visitor badge (session or token). Every door checks the badge, not your ID card again. Your badge colour decides which floors you may enter (authorization). A badge has an expiry time.

## Picture

```text
 SESSION (server remembers you)              JWT (token carries the facts, signed)
 POST /login ─▶ server stores                POST /login ─▶ server signs
               session 7f3 → ravi                          {"sub":"ravi","exp":...}
 ◀── Set-Cookie: session=7f3                  ◀── token = header.payload.signature
 GET /me  Cookie: session=7f3                GET /me  Authorization: Bearer <token>
 server looks up 7f3 → ravi                   server checks the signature → ravi

 OAuth "Sign in with Google": your app ─▶ Google login page ─▶ user agrees
   ─▶ Google sends a one-time code to your app ─▶ your app swaps it for tokens ─▶ user info
```

## How it works inside

**Passwords**
- Never store passwords. Store a **hash** made with a **slow** algorithm and a random **salt** (bcrypt, scrypt, Argon2, or PBKDF2 with many rounds). The salt makes two equal passwords hash differently.
- Compare hashes with a **constant-time** compare, so timing does not leak information.

**Sessions**
- The server keeps a table: session id → user. The id travels in a cookie marked `HttpOnly` (JavaScript cannot read it), `Secure` (HTTPS only) and `SameSite` (helps against CSRF).
- Easy to log someone out: delete the row.

**JWT (JSON Web Token)**
- Three base64 parts: `header.payload.signature`. The payload holds claims like `sub` (user) and `exp` (expiry). The **signature** (HMAC or RSA) proves the server made it and nobody changed it.
- The payload is **readable by anyone** (only base64): never put secrets in it.
- Stateless: any server can check it without a database. The cost: hard to revoke before it expires, so keep access tokens **short** (minutes) and use a **refresh token** to get new ones.

**OAuth 2.0 / OpenID Connect**
- Your app never sees the Google password. Google sends a short **authorization code**; your server swaps it (with your client secret) for tokens. OpenID Connect adds an **ID token** that says who the user is.

## Python, step by step

Hash and check a password (salted, slow, constant-time compare):

```python
import hashlib
import hmac
import os

def hash_password(password):
    salt = os.urandom(16)                                         # random salt per user
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 200_000)   # slow on purpose
    return salt.hex() + ":" + digest.hex()

def check_password(password, stored):
    salt_hex, digest_hex = stored.split(":")
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 200_000)
    return hmac.compare_digest(digest.hex(), digest_hex)          # constant-time compare

stored = hash_password("chai@123")
print(check_password("chai@123", stored), check_password("chai@124", stored))
print(hash_password("chai@123") == hash_password("chai@123"))    # different salts, different hashes
```

```output
True False
False
```

A JWT built by hand, to see what is inside (in real code, use a library such as PyJWT):

```python
import base64
import hashlib
import hmac
import json

SECRET = b"change-me"              # real apps: a long random secret from an environment variable

def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def unb64(text):
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))

def sign(header, body):
    return b64(hmac.new(SECRET, f"{header}.{body}".encode(), hashlib.sha256).digest())

def make_token(payload):
    header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    body = b64(json.dumps(payload, separators=(",", ":")).encode())
    return f"{header}.{body}.{sign(header, body)}"

def read_token(token, now):
    header, body, sig = token.split(".")
    if not hmac.compare_digest(sig, sign(header, body)):
        return None                                  # changed by someone: reject
    payload = json.loads(unb64(body))
    return payload if payload["exp"] > now else None  # expired: reject

token = make_token({"sub": "ravi", "role": "owner", "exp": 2_000_000_000})
print(token.count("."), read_token(token, now=1_800_000_000))

parts = token.split(".")                              # try to become admin by editing the payload
parts[1] = b64(json.dumps({"sub": "ravi", "role": "admin", "exp": 2_000_000_000}, separators=(",", ":")).encode())
print(read_token(".".join(parts), now=1_800_000_000), read_token(token, now=2_100_000_000))
```

```output
2 {'sub': 'ravi', 'role': 'owner', 'exp': 2000000000}
None None
```

Protecting a FastAPI route with a dependency:

```python
import secrets
from fastapi import Depends, FastAPI, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.testclient import TestClient
from pydantic import BaseModel

app = FastAPI()
USERS = {"ravi": "chai@123"}        # demo only: real apps store password HASHES
TOKENS = {}                         # token -> username (a tiny session store)
bearer = HTTPBearer(auto_error=False)

class Login(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(form: Login):
    if USERS.get(form.username) != form.password:
        raise HTTPException(401, "wrong username or password")
    token = secrets.token_urlsafe(16)
    TOKENS[token] = form.username
    return {"token": token}

def current_user(cred: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if cred is None or cred.credentials not in TOKENS:
        raise HTTPException(401, "please log in")
    return TOKENS[cred.credentials]

@app.get("/me")
def me(user: str = Depends(current_user)):        # FastAPI runs current_user first
    return {"user": user}

client = TestClient(app)
print(client.post("/login", json={"username": "ravi", "password": "nope"}).status_code)
token = client.post("/login", json={"username": "ravi", "password": "chai@123"}).json()["token"]
print(client.get("/me").status_code, client.get("/me").json())
print(client.get("/me", headers={"Authorization": f"Bearer {token}"}).json())
```

```output
401
401 {'detail': 'please log in'}
{'user': 'ravi'}
```

> **Same thing in ASP.NET Core**: add `builder.Services.AddAuthentication().AddJwtBearer(...)` and `app.UseAuthentication(); app.UseAuthorization();`, then put `[Authorize]` (or `.RequireAuthorization()` on a minimal API route). Use ASP.NET Core Identity's `PasswordHasher<T>` for passwords.

## Time and space

| Choice | Check per request | Logout / revoke |
| --- | --- | --- |
| Session id | one lookup (DB or Redis) | delete the session: instant |
| JWT | verify a signature: no lookup | hard until it expires (keep it short) |
| Password hashing | deliberately slow (~100 ms) | slows down attackers guessing passwords |

## Common mistakes

- Storing plain passwords, or a fast hash like plain SHA-256 without salt.
- Putting secrets (or too much personal data) in a JWT payload.
- Long-lived JWTs with no way to revoke them.
- Tokens in `localStorage` on sites with XSS risk (an `HttpOnly` cookie is safer for browsers).
- Checking "is logged in" but not "may this user see **this** order" (that is authorization, see Security basics).
- Writing your own crypto for production. Use well-known libraries.

## Patterns that use it

Every backend: the kirana billing API ("only the owner can change prices"), the serious project, and system design ("an auth service issues short tokens").

## Practice

```practice
Add sign-up to the FastAPI example: store a salted hash, not the password.
Make tokens expire after 15 minutes, and add a /refresh endpoint.
Add a role check: only users with role "owner" may call DELETE /products/{id} (return 403 otherwise).
Read your browser cookies for any site (DevTools → Application) and find HttpOnly and Secure.
```

## Explain it back

```explain
What is the difference between authentication and authorization?
Why must password hashes be salted and slow?
Compare sessions and JWTs: where is the state kept, and how do you log a user out?
Why can anyone read a JWT's payload, and why is that still safe?
```

## Flashcards

```flashcards
Authentication vs authorization? :: Who are you? vs What may you do?
How to store passwords? :: Salted, slow hash (bcrypt, scrypt, Argon2, PBKDF2). Never the password.
JWT parts? :: header.payload.signature (base64url).
Is a JWT payload secret? :: No. It is only encoded. The signature stops changes, not reading.
Why short JWT expiry? :: JWTs are hard to revoke; refresh tokens get new ones.
Cookie flags for sessions? :: HttpOnly, Secure, SameSite.
```
