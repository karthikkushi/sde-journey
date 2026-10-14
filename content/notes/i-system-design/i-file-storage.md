---
id: i-file-storage
title: Design file storage and sync (Google Drive/Dropbox-style)
level: advanced
phase: 3
week: 41
tags: [system-design, interview, object-storage, sync]
estMinutes: 40
---

## What it is

Users upload files, see them on every device, share them, and keep old versions.
Key ideas: split files into **chunks**, store chunks in **object storage** addressed by their **content hash** (so identical chunks are stored once), keep file **metadata** (names, folders, versions, sharing) in a database, and **sync** only what changed.

## Real-life example

You edit one sentence in a 50 MB project report on your laptop. Your phone shows the new version a few seconds later, because only the one changed 4 MB piece was uploaded, not the whole file. If you edited the same file offline on your phone too, you get a "conflicted copy" instead of losing work.

## Picture

```text
 client ─ split into chunks ─ hash each chunk ─▶ "which hashes do you need?" ─▶ metadata service
                                                 ◀── "only c7" ──
        ─ upload c7 ─▶ object storage (key = hash)       (dedupe: identical chunks stored once)
        ─ commit: file "report.docx" version 8 = [c1, c2, ..., c7] ─▶ metadata DB
 other devices ◀── change notification (WebSocket / long poll) ── fetch new version's missing chunks
```

## How it works inside

- **Chunking** (for example 4 MB chunks): resumable uploads, parallel transfers, and delta sync. Fixed-size chunks shift when you insert bytes near the start; **content-defined chunking** (cut where a rolling hash matches a pattern) keeps most chunk boundaries stable.
- **Content addressing**: a chunk's key is its SHA-256 hash. Same content → same key → stored once (dedupe across versions and even across users).
- **Metadata DB** (relational): users, folders, files, versions (ordered list of chunk hashes), permissions, sharing links. This is where consistency matters.
- **Upload flow**: ask which chunks are missing, upload them (often directly to object storage with pre-signed URLs), then **commit** a new version atomically.
- **Sync**: devices keep a cursor ("changes since #1042"); the server notifies them; they download missing chunks.
- **Conflicts**: each edit is based on a version; if the server has moved on, save the second edit as a **conflicted copy** rather than overwrite.
- **Durability**: object storage replicates across zones (11 nines of durability claimed by big providers); deleted files go to trash; old versions are kept for a period.
- **Downloads**: through a CDN for shared public files; permissions checked for private ones.

## Python, step by step

Content-addressed chunks: the second version uploads only what changed:

```python
import hashlib

CHUNK = 4                                    # bytes, tiny for the example (real systems: ~4 MB)
store = {}                                   # object storage: chunk hash -> bytes

def upload(data):
    manifest, uploaded = [], 0
    for i in range(0, len(data), CHUNK):
        piece = data[i:i + CHUNK]
        h = hashlib.sha256(piece).hexdigest()[:10]
        if h not in store:                   # the server already has it? skip
            store[h] = piece
            uploaded += 1
        manifest.append(h)                   # the version = the list of chunk hashes
    return manifest, uploaded

v1, n1 = upload(b"Dear Ravi, the meeting is on Monday.")
v2, n2 = upload(b"Dear Ravi, the meeting is on Friday.")
print(len(v1), "chunks, uploaded", n1)
print(len(v2), "chunks, uploaded", n2, "(only the changed one)")
print(b"".join(store[h] for h in v2).decode())   # rebuild version 2 from chunks
```

```output
9 chunks, uploaded 9
9 chunks, uploaded 1 (only the changed one)
Dear Ravi, the meeting is on Friday.
```

Conflicts: never silently overwrite:

```python
server = {"report.txt": {"version": 3, "data": "v3"}}

def save(name, data, base_version):
    current = server[name]["version"]
    if base_version != current:                       # someone saved after we started editing
        copy = f"{name} (conflicted copy)"
        server[copy] = {"version": 1, "data": data}
        return f"conflict: saved as '{copy}'"
    server[name] = {"version": current + 1, "data": data}
    return f"saved version {current + 1}"

print(save("report.txt", "laptop edit", base_version=3))
print(save("report.txt", "phone edit", base_version=3))     # the phone edited the old version 3
```

```output
saved version 4
conflict: saved as 'report.txt (conflicted copy)'
```

## Time and space

| Concern | Effect of chunking + content addressing |
| --- | --- |
| Small edit to a big file | upload/download one chunk instead of the whole file |
| Same file uploaded twice | stored once |
| Flaky mobile network | resume from the last finished chunk |
| Metadata size | one row per version + a list of hashes |

## Common mistakes

- Uploading whole files on every change.
- Storing file bytes in the relational database.
- Overwriting on conflict (lost work).
- Committing a version before all its chunks are uploaded.
- Forgetting sharing permissions on download links.

## Patterns that use it

Object storage + metadata DB (also Pastebin), hashing (content addressing), optimistic concurrency (versions), notifications for sync, CDN for downloads, rolling hashes (string algorithms).

## Practice

```practice
Insert one word at the START of the file in the example. How many chunks are uploaded now? Why? How does content-defined chunking help?
Design sharing: a public link, and sharing with specific users (read/write). What tables do you need?
Estimate storage for 10M users × 2 GB each, with 3 copies. How much does dedupe matter?
```

## Explain it back

```explain
Why split files into chunks?
What is content addressing, and how does it give dedupe for free?
Walk through an upload: which chunks, which services, and when is the version committed?
How does the system avoid losing an edit when two devices change the same file?
```

## Flashcards

```flashcards
Why chunk files? :: Resumable, parallel uploads and syncing only changed parts.
Content addressing? :: A chunk's key is its hash; identical chunks are stored once.
Bytes vs metadata? :: Bytes in object storage; names/versions/permissions in a DB.
Commit order? :: Upload missing chunks first, then commit the new version.
Conflicting edits? :: Save a conflicted copy; never overwrite silently.
Stable chunk boundaries? :: Content-defined chunking with a rolling hash.
```
