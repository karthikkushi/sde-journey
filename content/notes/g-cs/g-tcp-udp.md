---
id: g-tcp-udp
title: TCP vs UDP
level: core
phase: 3
week: 32
tags: [cs, networking, tcp, udp, sockets]
estMinutes: 25
---

## What it is

Both run on top of IP and use **ports**, but they make opposite promises.
**TCP** is a reliable, ordered byte stream: it sets up a connection, numbers the bytes, resends lost ones and slows down when the network is busy.
**UDP** just sends separate **datagrams**: no connection, no order, no resending. Faster and simpler, but "fire and forget".

## Real-life example

TCP is a registered post parcel: you get a receipt, it is tracked, and lost parcels are resent. UDP is shouting the cricket score across the street: quick, and if someone missed one shout, the next score update is more useful than repeating the old one.

## Picture

```text
 TCP                                         UDP
 client            server                    client            server
   ── SYN ─────────▶                           ── datagram 1 ──▶
   ◀──────── SYN-ACK ──                        ── datagram 2 ──▶  (lost? nobody resends)
   ── ACK ─────────▶   connection open         ── datagram 3 ──▶
   ── data (seq 1..100) ─▶
   ◀── ACK 101 ──      (lost data is resent)
   ── FIN ─▶ ... close
```

## How it works inside

**TCP**
- **3-way handshake** (SYN, SYN-ACK, ACK) before any data: one round trip of delay.
- **Sequence numbers + acknowledgements**: the receiver puts bytes in order and asks again for missing ones.
- **Flow control**: the receiver says how much it can take (the window).
- **Congestion control**: TCP slows down when packets get lost, to avoid flooding the network.
- **Head-of-line blocking**: one lost packet makes everything after it wait.
- It is a **stream**, not messages: two `send()` calls can arrive as one `recv()`. Apps add their own message boundaries (HTTP does).

**UDP**
- No handshake, no order, no resend. Each datagram stands alone (up to about 64 KB, usually much smaller).
- Good when **speed matters more than perfection**, or when the app handles loss itself: video calls, online games, DNS lookups, live streams.
- **QUIC** (used by HTTP/3) builds reliability and encryption **on top of UDP**, to avoid TCP's head-of-line blocking and to connect faster.

## Python, step by step

UDP and TCP on your own machine:

```python
import socket
import threading

# UDP: no connection, just send a datagram to an address
receiver = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
receiver.bind(("127.0.0.1", 0))                       # port 0 = any free port
sender = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sender.sendto(b"score: 182/4", receiver.getsockname())
data, _ = receiver.recvfrom(1024)
print("UDP got:", data.decode())

# TCP: listen, connect (the handshake happens here), then a reliable stream
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind(("127.0.0.1", 0))
server.listen()

def echo_once():
    conn, _ = server.accept()                         # waits for a client to connect
    with conn:
        msg = conn.recv(1024)
        conn.sendall(b"echo: " + msg)

threading.Thread(target=echo_once, daemon=True).start()
client = socket.create_connection(server.getsockname())
client.sendall(b"order 101")
print("TCP got:", client.recv(1024).decode())
client.close()
server.close()
```

```output
UDP got: score: 182/4
TCP got: echo: order 101
```

## Time and space

| | TCP | UDP |
| --- | --- | --- |
| Setup before data | 1 round trip (plus TLS) | none |
| Header size | 20+ bytes | 8 bytes |
| Lost data | resent | gone |
| Order | guaranteed | not guaranteed |
| Typical uses | HTTP/1.1, HTTP/2, databases, SSH, email | DNS, video/voice calls, games, QUIC (HTTP/3) |

## Common mistakes

- Treating TCP as messages: one `recv()` may return part of a message, or two messages together.
- Thinking UDP is "unsafe": it is unreliable, not insecure (encryption is separate).
- Choosing TCP for live video and getting freezes when packets are lost.

## Patterns that use it

HTTP versions (next note), DNS, load balancers (L4), real-time systems in system design (chat, calls, live scores).

## Practice

```practice
Change the UDP example to send 5 datagrams and print them all.
Write a TCP chat: a server that echoes every line until the client sends "bye".
Explain why DNS uses UDP but HTTP/1.1 uses TCP.
```

## Explain it back

```explain
What does TCP promise that UDP does not?
Describe the TCP 3-way handshake.
Why would a video call prefer UDP?
What is head-of-line blocking?
```

## Flashcards

```flashcards
TCP in one line? :: Reliable, ordered byte stream with a connection.
UDP in one line? :: Separate datagrams, no connection, no resend, no order.
TCP handshake? :: SYN, SYN-ACK, ACK.
Why does TCP slow down sometimes? :: Congestion control reacts to packet loss.
UDP use cases? :: DNS, voice/video calls, games, QUIC.
QUIC? :: Reliable, encrypted transport built on UDP (used by HTTP/3).
```
