---
id: g-http
title: HTTP versions, HTTPS and caching headers
level: core
phase: 3
week: 33
tags: [cs, networking, http, https, tls, caching]
estMinutes: 30
---

## What it is

HTTP has changed over the years to load pages faster:
**HTTP/1.1** (one request at a time per connection, but connections are reused), **HTTP/2** (many requests at once over one connection), **HTTP/3** (the same ideas over QUIC on UDP).
**HTTPS** is HTTP over **TLS**: encrypted, and the server proves who it is with a certificate. **Caching headers** let browsers and CDNs reuse responses.

## Real-life example

- HTTP/1.1: one billing counter per queue; to serve more people you open more counters (more connections).
- HTTP/2: one counter, but the clerk handles many people's slips in parallel, interleaving them.
- HTTP/3: the same, but a dropped slip for one person does not stop everyone else.
- Caching: the shop gives you a printed price list valid for a week; you do not ask again for every item.

## Picture

```text
 HTTP/1.1  conn 1: [req A]────[resp A][req B]────[resp B]      browsers open ~6 connections per site
 HTTP/2    conn 1: [A1][B1][C1][A2][B2]...  streams interleaved on ONE TCP connection
 HTTP/3    QUIC over UDP: streams are independent; a lost packet only delays its own stream

 TLS 1.3 handshake (1 round trip):  ClientHello ─▶ ◀─ ServerHello + certificate + key share
                                      then everything is encrypted
```

## How it works inside

**Versions**
- **HTTP/1.1**: text-based. `Connection: keep-alive` reuses a TCP connection, but requests on it go one after another (head-of-line blocking at the HTTP level).
- **HTTP/2**: binary frames, many **streams** multiplexed over one connection, compressed headers (HPACK). Still on TCP, so one lost TCP packet stalls every stream.
- **HTTP/3**: runs on **QUIC** (UDP). Streams do not block each other, the handshake is faster (and can resume with 0-RTT), and connections survive switching from Wi-Fi to 4G.

**HTTPS / TLS**
- The server sends a **certificate** signed by a trusted **certificate authority** (CA). The browser checks the signature, the domain name and the dates.
- Both sides agree on fresh keys (key exchange), then use fast symmetric encryption for the data.
- Let's Encrypt gives free certificates; most hosting platforms do it automatically.

**Caching headers**
- `Cache-Control: max-age=60` → reuse this response for 60 seconds without asking. `no-store` → never cache (personal data). `private` → only the user's browser, not shared caches.
- `ETag` (a version tag) + `If-None-Match` → "I have version X; anything new?" The server replies **304 Not Modified** with no body if not.
- Cookies: `Set-Cookie` from the server; the browser sends them back automatically (with `HttpOnly`, `Secure`, `SameSite` flags for safety).

## Python, step by step

Keep-alive and an ETag revalidation (a local server, one connection, two requests):

```python
import hashlib
import http.client
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

MENU = b'{"dosa": 60, "idli": 40}'
ETAG = '"' + hashlib.md5(MENU).hexdigest()[:8] + '"'      # a version tag for this content

class Menu(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"                          # keep the connection open between requests

    def do_GET(self):
        if self.headers.get("If-None-Match") == ETAG:
            self.send_response(304)                        # "you already have the latest"
            self.send_header("ETag", ETAG)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        self.send_response(200)
        self.send_header("ETag", ETAG)
        self.send_header("Cache-Control", "max-age=60")
        self.send_header("Content-Length", str(len(MENU)))
        self.end_headers()
        self.wfile.write(MENU)

    def log_message(self, *args):
        pass

server = HTTPServer(("127.0.0.1", 0), Menu)
threading.Thread(target=server.serve_forever, daemon=True).start()

conn = http.client.HTTPConnection("127.0.0.1", server.server_port)    # ONE connection
conn.request("GET", "/menu")
r1 = conn.getresponse()
body = r1.read()
print(r1.status, len(body), r1.getheader("Cache-Control"))
conn.request("GET", "/menu", headers={"If-None-Match": r1.getheader("ETag")})
r2 = conn.getresponse()
r2.read()
print(r2.status, "same connection reused:", conn.sock is not None)
conn.close()                                                          # let the server's handler finish
server.shutdown()
```

```output
200 24 max-age=60
304 same connection reused: True
```

## Time and space

| Setup before the first request byte | Round trips |
| --- | --- |
| HTTP/1.1 or HTTP/2 over TCP + TLS 1.3 | 2 (TCP + TLS) |
| HTTP/3 (QUIC) | 1 (0 when resuming) |
| Any version, connection reused | 0 |

A `304` saves the body download; `max-age` saves the whole request.

## Common mistakes

- Caching personal pages in a shared cache (use `private` or `no-store`).
- Long `max-age` on files whose name never changes (users get old JavaScript). Put a version hash in file names.
- Mixed content (HTTP resources on an HTTPS page) and expired certificates.
- Thinking HTTP/2 needs code changes in your API (usually only the server or load balancer setting changes).

## Patterns that use it

CDNs and caching layers in system design, API performance (keep-alive, compression), the PWA that serves this study site offline, and security (HTTPS, cookies).

## Practice

```practice
In DevTools (Network tab), add the "Protocol" column. Which sites use h2 or h3?
Find a response with an ETag; reload and look for a 304.
Add Cache-Control headers to one FastAPI endpoint (a public list) and no-store to a private one.
Read the certificate details of any HTTPS site in your browser: who issued it, and when does it expire?
```

## Explain it back

```explain
What problem does HTTP/2 solve, and what problem does HTTP/3 solve?
How does a browser know it is talking to the real bank website?
Explain max-age and ETag with the price list example.
When should a response use no-store?
```

## Flashcards

```flashcards
HTTP/2 key idea? :: Many streams multiplexed over one TCP connection.
HTTP/3 runs on? :: QUIC, over UDP.
304 Not Modified? :: Your cached copy (by ETag/date) is still current; no body sent.
Cache-Control: max-age=60? :: Reuse the response for 60 seconds without asking.
TLS certificate proves? :: The server owns the domain (signed by a trusted CA).
Personal data caching? :: Cache-Control: private or no-store.
```
