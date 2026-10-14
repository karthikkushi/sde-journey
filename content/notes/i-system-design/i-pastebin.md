---
id: i-pastebin
title: Design Pastebin
level: advanced
phase: 3
week: 37
tags: [system-design, interview, object-storage]
estMinutes: 30
---

## What it is

A service to share a block of text (code, logs, notes) with a short link, optionally private and expiring.
It looks like the URL shortener, but the payload is **big** (up to megabytes). So the key new ideas are: store large content in **object storage**, keep **metadata** in a database, and handle **expiry**.

## Real-life example

During on-call, an engineer shares a 2 MB error log with a teammate: `paste.example.com/k9x2Lm`, expiring in 1 day. The teammate opens it a few times; nobody needs it next week, so it is deleted automatically.

## Picture

```text
 create: POST /pastes {text, expires_in, private}
     API ─▶ key generator ─▶ object storage (S3/GCS): pastes/k9x2Lm  ← the text (big, cheap)
         └─▶ metadata DB: (key, size, created, expires_at, owner, private)

 read:   GET /k9x2Lm ─▶ metadata (check expiry/permission) ─▶ CDN/cache ─▶ object storage
 cleanup job: delete expired pastes every hour (plus a lazy check on read)
```

## How it works inside

- **Requirements**: create, read, expiry (10 min to never), private pastes, size limit (for example 10 MB), syntax highlighting (client side).
- **Estimates**: 1 million pastes/day × 10 KB average = 10 GB/day ≈ 3.6 TB/year. Too big and too cold for the main database: put the text in **object storage**, which is cheap, durable and scales without effort.
- **Keys**: random base62 strings (8–10 characters) with a uniqueness check, or a counter + base62 (see URL shortener). Random keys make private pastes unguessable.
- **Metadata DB**: `pastes(key PK, object_path, size, created_at, expires_at, owner_id, is_private)`, indexed on `expires_at` for cleanup.
- **Reads**: popular public pastes through a CDN/cache; private pastes need an auth check and must not be cached publicly.
- **Expiry**: check on every read (expired = 404) **and** run a background job that deletes expired objects and rows. Object storage lifecycle rules can also delete old objects.
- **Abuse**: rate-limit creation, scan for secrets/malware if needed, size limits.

## Python, step by step

Create, read with expiry, and a cleanup job (a dict stands in for object storage):

```python
import random
import string

class Pastebin:
    def __init__(self, seed=7):
        self.objects = {}                      # object storage: path -> text
        self.meta = {}                         # metadata DB: key -> dict
        self.rng = random.Random(seed)         # fixed seed only to make this example repeatable

    def _new_key(self):
        while True:
            key = "".join(self.rng.choices(string.ascii_letters + string.digits, k=8))
            if key not in self.meta:           # uniqueness check (a unique constraint in a real DB)
                return key

    def create(self, text, now, ttl, max_size=10_000_000):
        if len(text.encode()) > max_size:
            raise ValueError("paste too large")
        key = self._new_key()
        self.objects[f"pastes/{key}"] = text
        self.meta[key] = {"path": f"pastes/{key}", "expires_at": now + ttl, "size": len(text)}
        return key

    def read(self, key, now):
        m = self.meta.get(key)
        if not m or m["expires_at"] <= now:
            return None                        # lazy expiry check: behaves like 404
        return self.objects[m["path"]]

    def cleanup(self, now):                    # the hourly background job
        expired = [k for k, m in self.meta.items() if m["expires_at"] <= now]
        for k in expired:
            del self.objects[self.meta[k]["path"]]
            del self.meta[k]
        return len(expired)

pb = Pastebin()
log_key = pb.create("ERROR db timeout at 09:42\n" * 3, now=0, ttl=3600)
note_key = pb.create("deploy steps: ...", now=0, ttl=86_400)
print(len(log_key), pb.read(log_key, now=60).splitlines()[0])
print(pb.read(log_key, now=4000))              # expired after an hour
print("cleaned:", pb.cleanup(now=4000), "| left:", len(pb.objects), "| note still readable:", pb.read(note_key, now=4000) is not None)
```

```output
8 ERROR db timeout at 09:42
None
cleaned: 1 | left: 1 | note still readable: True
```

## Time and space

| Part | Choice | Why |
| --- | --- | --- |
| Text (GBs per day) | object storage | cheap, durable, effectively unlimited |
| Metadata (small rows) | SQL / key-value DB | fast lookups and queries by expiry |
| Hot public pastes | CDN / cache | read-heavy |
| Expired data | lazy check + cleanup job | correct reads, reclaimed space |

## Common mistakes

- Storing megabytes of text inside database rows.
- Sequential keys for private pastes (anyone can guess the next one).
- Relying only on the cleanup job (expired pastes stay readable until it runs).
- Caching private pastes on a public CDN.

## Patterns that use it

URL shortener (key generation), file storage (object storage + metadata), CDN caching, background jobs for cleanup.

## Practice

```practice
Add private pastes: only the owner (or people with a secret token in the link) can read them.
Estimate storage for 5 million pastes/day at 20 KB average, kept 30 days.
Explain why the text goes to object storage but the metadata goes to a database.
```

## Explain it back

```explain
How is Pastebin different from a URL shortener, and how does that change the design?
Why use both a lazy expiry check and a cleanup job?
Why should private paste keys be random?
```

## Flashcards

```flashcards
Where does big paste text go? :: Object storage (S3/GCS).
Where does metadata go? :: A database (key, path, expiry, owner).
Expiry handling? :: Check on read + background cleanup.
Private paste keys? :: Random and unguessable (8+ base62 chars).
Popular public pastes? :: Serve through a CDN/cache.
```
