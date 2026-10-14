---
id: g-layers
title: Network layers (OSI and TCP/IP)
level: core
phase: 3
week: 31
tags: [cs, networking, osi, tcp-ip]
estMinutes: 25
---

## What it is

Networking is split into **layers**. Each layer does one job and uses the layer below it, so each can change without breaking the others.
The **OSI model** has 7 layers (used for talking about networks). The real internet uses the simpler **TCP/IP model** with 4.
When data is sent, each layer **wraps** it with its own header (encapsulation); the receiver unwraps it layer by layer.

## Real-life example

Sending a gift by courier: you write a letter (application), put it in an envelope with the flat number (transport: which program), the courier adds the city address (network: which machine), and the delivery van carries it street by street (link and physical). At the other end, each person opens only their own wrapping.

## Picture

```text
 OSI (7)                 TCP/IP (4)          example                 unit
 7 Application  ┐
 6 Presentation ├──────▶ Application         HTTP, DNS, TLS, SMTP     message
 5 Session      ┘
 4 Transport    ───────▶ Transport           TCP, UDP (ports)         segment
 3 Network      ───────▶ Internet            IP (addresses), ICMP     packet
 2 Data link    ┐
 1 Physical     ┴──────▶ Link                Ethernet, Wi-Fi (MAC)    frame / bits

 sending:  [ HTTP data ] → [TCP hdr | HTTP data] → [IP hdr | TCP hdr | data] → [Eth hdr | IP | TCP | data]
```

## How it works inside

- **Physical** (1): signals on copper, fibre or radio.
- **Data link** (2): moves frames between devices on the **same** local network, using **MAC addresses**. Switches work here.
- **Network** (3): moves packets **across** networks using **IP addresses**. Routers work here, choosing the next hop.
- **Transport** (4): connects **programs** using **ports**. TCP adds reliability and order; UDP keeps it simple.
- **Session/Presentation** (5–6): sessions, encryption, data formats. In practice TLS and the app handle these.
- **Application** (7): HTTP, DNS, SMTP, the protocols apps speak.
- Each layer adds a **header** (sometimes a trailer). An IP header has source/destination IPs and a TTL; a TCP header has ports, sequence numbers and flags.
- **Why it matters for backend work**: "Layer 4 load balancer" (looks at IP + port only) vs "Layer 7 load balancer" (reads HTTP: paths, headers, cookies). Firewalls, VPNs and debugging tools are also described by layer.

## Python, step by step

Encapsulation: each layer wraps the data from the layer above (simplified headers):

```python
import struct

payload = b"GET /menu HTTP/1.1\r\nHost: shop\r\n\r\n"                       # layer 7: the HTTP request
segment = struct.pack("!HH", 51515, 80) + payload                           # layer 4: + source and destination ports
packet = bytes([192, 168, 1, 7]) + bytes([93, 184, 216, 34]) + segment      # layer 3: + source and destination IPs
frame = bytes.fromhex("aabbccddeeff") + bytes.fromhex("112233445566") + packet   # layer 2: + MAC addresses

for name, data in [("application", payload), ("transport", segment), ("network", packet), ("link", frame)]:
    print(f"{name:12} {len(data):3} bytes")

src_port, dst_port = struct.unpack("!HH", frame[20:24])                   # the receiver peels the layers off
print("to port", dst_port, "from", ".".join(map(str, frame[12:16])))
```

```output
application   34 bytes
transport     38 bytes
network       46 bytes
link          58 bytes
to port 80 from 192.168.1.7
```

(Real headers are longer: IPv4 20 bytes, TCP 20 bytes, Ethernet 14 bytes, plus checksums and flags.)

## Time and space

Each layer's header is overhead: a tiny 1-byte message still travels with about 54 bytes of Ethernet + IP + TCP headers. That is why many small messages are less efficient than fewer bigger ones.

## Common mistakes

- Mixing up MAC addresses (local network) and IP addresses (across networks).
- Thinking HTTPS is a separate layer (it is HTTP running over TLS, over TCP).
- Memorising 7 layers without knowing what the real stack (4 layers) does.

## Patterns that use it

Load balancers (L4 vs L7), firewalls and security groups, debugging ("is it DNS, TCP or HTTP?"), and system design discussions.

## Practice

```practice
Run traceroute (tracert on Windows) to a website and count the routers (layer 3 hops).
In browser DevTools, look at one request: which parts are layer 7 (HTTP) information?
Write the 4 TCP/IP layers from memory with one protocol and one device for each.
```

## Explain it back

```explain
Why is networking built in layers?
What is encapsulation? Use the courier example.
What is the difference between a switch (layer 2) and a router (layer 3)?
What is the difference between a layer 4 and a layer 7 load balancer?
```

## Flashcards

```flashcards
TCP/IP layers? :: Application, Transport, Internet, Link.
Layer of IP addresses? :: Network (Internet) layer, layer 3.
Layer of ports, TCP and UDP? :: Transport, layer 4.
MAC addresses work where? :: The local network (data link, layer 2).
Encapsulation? :: Each layer adds its header around the data from the layer above.
L4 vs L7 load balancer? :: L4 sees IP and port; L7 reads HTTP (paths, headers).
```
