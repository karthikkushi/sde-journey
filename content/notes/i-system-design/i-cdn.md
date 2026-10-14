---
id: i-cdn
title: CDN (content delivery network)
level: advanced
phase: 2
week: 21
tags: [system-design, cdn, caching, latency]
estMinutes: 20
---

## What it is

A **CDN** is a network of servers in many cities (**edge locations**) that keep copies of your content close to users.
A user in Kochi downloads your images from a nearby edge, not from your server in Mumbai or Virginia.
CDNs serve static files (images, JavaScript, video), can cache some API responses, and also absorb traffic spikes and attacks.

## Real-life example

A newspaper is not printed only in Delhi and posted to every village. It is printed in many city presses and delivered locally each morning. The CDN is the network of local presses; your server is the head office.

## Picture

```text
 user (Kochi) ──8 ms──▶ CDN edge (Kochi)  ── hit: done
                              │ miss (first request for this file)
                              └────── 120 ms ──────▶ origin server (Virginia) ── file cached at the edge

 file names with a content hash:  app.3f2a9c1b.js  → cache "forever"; a new build gets a new name
```

## How it works inside

- **Pull CDN**: the edge fetches from your **origin** on the first request, then caches it (most common). **Push CDN**: you upload files to the CDN ahead of time.
- **Cache keys**: usually the URL (plus some headers). Your `Cache-Control` headers tell the CDN how long to keep things.
- **Invalidation is slow and costly**, so use **versioned file names**: put a hash of the content in the name (`app.3f2a9c1b.js`) and cache it for a year. Changing the file changes the name.
- **Dynamic content**: CDNs can cache public API responses briefly (seconds), and run small code at the edge. Personal data stays uncached (or uses `private`).
- **Other benefits**: fewer requests reach your origin, TLS is handled close to the user, and DDoS traffic is absorbed by the CDN's huge capacity.
- Video streaming platforms are mostly CDNs: video chunks served from edges near viewers.

## Python, step by step

Why distance matters (every round trip costs the full distance):

```python
def page_load_ms(round_trip_ms, round_trips=4):         # DNS + TCP + TLS + the request itself
    return round_trip_ms * round_trips

print("from origin (Kochi -> Virginia):", page_load_ms(240), "ms")
print("from a CDN edge in Kochi:      ", page_load_ms(8), "ms")
```

```output
from origin (Kochi -> Virginia): 960 ms
from a CDN edge in Kochi:       32 ms
```

Versioned file names from the content (the same idea build tools use):

```python
import hashlib

def versioned_name(name, content):
    digest = hashlib.md5(content).hexdigest()[:8]        # changes whenever the content changes
    stem, ext = name.rsplit(".", 1)
    return f"{stem}.{digest}.{ext}"

v1 = versioned_name("app.js", b"console.log('v1')")
v2 = versioned_name("app.js", b"console.log('v2')")
print(v1 != v2, v1.startswith("app."), v1.endswith(".js"), len(v1))
```

```output
True True True 15
```

## Time and space

| Request served from | Typical time |
| --- | --- |
| Browser cache | ~0 ms |
| CDN edge, same city | ~5–20 ms |
| Origin in the same country | ~30–60 ms |
| Origin on another continent | ~150–300 ms |

## Common mistakes

- Caching personal pages on a CDN.
- Same file name for every release, then fighting stale caches.
- Forgetting that the first request (a miss) still goes to the origin.
- Setting `no-cache` everywhere and getting no benefit.

## Patterns that use it

Static websites (this study site on GitHub Pages is served through a CDN), image-heavy apps, video streaming, file storage downloads, and system design ("put a CDN in front of static content").

## Practice

```practice
Open DevTools on a big site and find response headers from a CDN (look for cache "HIT" or "MISS" headers and Age).
For a food delivery app, list what goes on the CDN and what never should.
Explain why versioned file names make invalidation unnecessary.
```

## Explain it back

```explain
How does a pull CDN fill its cache?
Why do versioned file names solve the invalidation problem?
Besides speed, name two other benefits of a CDN.
```

## Flashcards

```flashcards
CDN? :: Servers in many cities caching content near users.
Pull vs push CDN? :: Pull fetches from the origin on first request; push is uploaded in advance.
Origin? :: Your own server, the source of truth behind the CDN.
Avoid invalidation? :: Versioned (content-hashed) file names + long max-age.
CDN for personal data? :: No (or private/no-store).
```
