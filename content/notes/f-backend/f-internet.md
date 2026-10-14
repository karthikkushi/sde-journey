---
id: f-internet
title: How the internet works (DNS, TCP, HTTP, HTTPS)
level: core
phase: 3
week: 27
tags: [backend, networking, http, dns, tcp]
estMinutes: 30
---

## What it is

When you open a website, your browser (1) finds the server's address with **DNS**, (2) opens a reliable connection with **TCP**, (3) sets up encryption with **TLS** (that is the S in HTTPS), and (4) sends an **HTTP request**. The server sends back an **HTTP response**.
A backend engineer writes the code that answers step 4. Knowing steps 1–3 helps you debug "it is slow" and "it does not connect".

## Real-life example

Sending a parcel to a friend: you look up their address in your contacts (DNS), the courier confirms pickup and delivery (TCP), the box is sealed so nobody can read it on the way (TLS), and inside is your actual letter (HTTP).

## Picture

```text
 you type https://shop.example.com/menu

 browser ──1. DNS: "shop.example.com?"──▶ resolver ──▶ "93.184.216.34"
 browser ──2. TCP: SYN ─▶ ◀─ SYN-ACK ── ACK ─▶ server:443        (3-way handshake)
 browser ──3. TLS: hello, certificate, keys agreed ──────────▶  (now encrypted)
 browser ──4. GET /menu HTTP/1.1 ─────────────────────────────▶
         ◀── HTTP/1.1 200 OK + body ───────────────────────────
```

## How it works inside

- **IP address**: the number that identifies a machine on the network (like `93.184.216.34`). **Port**: which program on that machine (443 = HTTPS, 80 = HTTP, 5432 = PostgreSQL).
- **DNS**: turns a name into an IP. Your computer asks a resolver; answers are **cached** for the record's TTL. "DNS changes take time" because old answers are cached.
- **TCP**: a reliable, ordered byte stream. It starts with a 3-way handshake (SYN, SYN-ACK, ACK), resends lost packets, and controls speed. (UDP skips all that: faster, no guarantees; used for video calls and DNS.)
- **TLS**: the server shows a **certificate** proving it owns the name; both sides agree on keys; then everything is encrypted. HTTPS = HTTP inside TLS.
- **HTTP request**: a method (`GET`, `POST`...), a path (`/menu?item=dosa`), **headers** (`Host`, `Content-Type`, `Authorization`), and an optional body.
- **HTTP response**: a **status code** (`200 OK`, `404 Not Found`), headers, and a body (HTML, JSON...).
- **Latency adds up**: DNS + TCP + TLS each cost round trips before the first byte. That is why connections are reused (keep-alive) and why CDNs put servers near users.

## Python, step by step

Pull a URL apart:

```python
from urllib.parse import urlsplit, parse_qs

u = urlsplit("https://shop.example.com:443/api/orders?status=delivered&page=2#top")
print(u.scheme, u.hostname, u.port, u.path)
print(parse_qs(u.query))
```

```output
https shop.example.com 443 /api/orders
{'status': ['delivered'], 'page': ['2']}
```

A real HTTP request and response, on your own machine (a tiny server in a thread, and a client):

```python
import http.client
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

class Hello(BaseHTTPRequestHandler):
    def do_GET(self):
        body = f"you asked for {self.path}".encode()
        self.send_response(200)                          # status line: 200 OK
        self.send_header("Content-Type", "text/plain")   # headers
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)                           # body

    def log_message(self, *args):                        # keep the output quiet
        pass

server = HTTPServer(("127.0.0.1", 0), Hello)              # port 0 = any free port
threading.Thread(target=server.serve_forever, daemon=True).start()

conn = http.client.HTTPConnection("127.0.0.1", server.server_port)
conn.request("GET", "/menu?item=dosa")                   # what a browser does in step 4
resp = conn.getresponse()
print(resp.status, resp.reason, resp.getheader("Content-Type"))
print(resp.read().decode())
server.shutdown()
```

```output
200 OK text/plain
you asked for /menu?item=dosa
```

What actually travels over the connection (plain text inside TLS):

```text
GET /menu?item=dosa HTTP/1.1
Host: shop.example.com
Accept: application/json

HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 27

{"item": "dosa", "price": 60}
```

## Time and space

| Step | Rough time (same city) |
| --- | --- |
| DNS lookup (not cached) | 10–100 ms |
| TCP handshake | 1 round trip |
| TLS handshake | 1–2 round trips |
| Request + response | 1 round trip + server time |
| Reusing a connection | skips DNS, TCP and TLS |

## Common mistakes

- Thinking HTTPS hides **which site** you visit (the domain is still visible to the network); it hides the content.
- Forgetting DNS caching when a deploy "does not show up" for some users.
- Ignoring the `Host` header (one server can host many sites).
- Opening a new connection for every request in a client (use a session / connection pool).

## Patterns that use it

Every backend topic: REST APIs, load balancers and CDNs (system design), timeouts and retries, and debugging with browser DevTools (Network tab) or `curl -v`.

## Practice

```practice
Open your browser's DevTools, Network tab, load any site. Find the status code, the request headers, and the time spent on DNS, connect and TLS.
Run: curl -v https://example.com and match each line to the steps in the picture.
Explain to a friend what happens when they type a URL and press Enter, in 5 steps.
```

## Explain it back

```explain
Walk through the 4 steps from typing a URL to seeing the page.
What does DNS do, and why can changes take time to reach everyone?
What is the difference between TCP and UDP?
What does the S in HTTPS add?
```

## Flashcards

```flashcards
DNS does? :: Turns a domain name into an IP address.
TCP handshake? :: SYN, SYN-ACK, ACK.
HTTPS = ? :: HTTP inside TLS (encrypted, server identity checked by a certificate).
Parts of an HTTP request? :: Method, path, headers, optional body.
Default ports? :: 80 HTTP, 443 HTTPS.
Why reuse connections? :: To skip DNS, TCP and TLS setup on every request.
```
