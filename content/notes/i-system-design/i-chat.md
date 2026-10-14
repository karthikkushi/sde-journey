---
id: i-chat
title: Design a chat app (WhatsApp-style)
level: advanced
phase: 3
week: 39
tags: [system-design, interview, websockets, messaging]
estMinutes: 40
---

## What it is

Design one-to-one and group messaging: messages arrive in real time when online, wait safely when offline, appear in the **right order**, and show sent/delivered/read ticks.
New ideas compared with earlier designs: **persistent connections** (WebSockets), a **connection registry** (which server holds which user), **message IDs that sort by time**, and a write-heavy message store.

## Real-life example

Ravi messages Asha "lunch at 1?" while her phone is off in a meeting. The message waits on the server. When she turns her phone on, both messages arrive in the order sent, and Ravi's ticks turn blue when she reads them.

## Picture

```text
 Ravi's phone ══WebSocket══▶ chat server 1 ──▶ message store (by conversation, time-ordered)
                                  │  where is Asha? ─▶ connection registry (Redis: asha → server 7)
                                  ├─ online  ─▶ chat server 7 ══WebSocket══▶ Asha's phone   (✓✓ delivered)
                                  └─ offline ─▶ push notification service (FCM/APNs) + kept for later sync
 groups: fan out to each member's server; big groups are handled as a stream per group
```

## How it works inside

**Requirements**: 1:1 and group chat, online/offline delivery, ordering, delivery/read receipts, history on new devices, presence (online/last seen). Non-functional: low latency (<200 ms), no lost messages, huge scale (see Estimation: ~23,000 messages/s average for 50M DAU).

**Connections**
- Phones keep a **WebSocket** (or similar long-lived connection) to a chat server, so the server can push instantly. Each server holds hundreds of thousands of connections.
- A **connection registry** (Redis or a distributed map) maps user → server. Servers forward messages to each other (internal RPC or pub/sub).

**Sending a message**
1. The sender's server gives the message an **ID** and a **per-conversation sequence number**, and **stores it** first (durability).
2. It acknowledges the sender (one tick).
3. If the receiver is online, push it (two ticks when the device acknowledges). If offline, send a push notification; the device syncs missed messages on reconnect ("give me everything after sequence 41").

**IDs and ordering**: clocks on different servers disagree, so order by the server-assigned sequence per conversation, or by **Snowflake-style IDs** (timestamp + machine id + counter) that are unique and roughly time-sorted without coordination.

**Storage**: write-heavy and queried by conversation + time → a wide-column store (Cassandra/HBase/ScyllaDB) partitioned by `conversation_id`, clustered by message id. Media goes to object storage, with only the link in the message.

**Other parts**: presence via heartbeats (with TTL), end-to-end encryption (the server stores ciphertext), rate limits, and spam controls.

## Python, step by step

Snowflake-style IDs: unique, sortable by time, no central coordination:

```python
EPOCH = 1_700_000_000_000                       # milliseconds; the service's own "time zero"

def snowflake(ms, machine, seq):
    return ((ms - EPOCH) << 22) | (machine << 12) | seq   # 41 bits time | 10 bits machine | 12 bits counter

a = snowflake(1_791_000_000_000, machine=3, seq=0)
b = snowflake(1_791_000_000_000, machine=3, seq=1)        # same millisecond, next counter
c = snowflake(1_791_000_000_001, machine=1, seq=0)        # 1 ms later, another machine
print(a, b, c)
print("sorted by time:", a < b < c, "| time back:", (c >> 22) + EPOCH, "| machine:", (c >> 12) & 0x3FF)
```

```output
381681664000012288 381681664000012289 381681664004198400
sorted by time: True | time back: 1791000000001 | machine: 1
```

Online and offline delivery with per-conversation order:

```python
from collections import defaultdict

class ChatServer:
    def __init__(self):
        self.online = {}                        # user -> messages pushed over their open connection
        self.pending = defaultdict(list)        # user -> messages waiting while offline
        self.seq = defaultdict(int)             # conversation -> last sequence number
        self.history = defaultdict(list)        # conversation -> stored messages (durable)

    def connect(self, user):
        self.online[user] = list(self.pending.pop(user, []))   # sync what arrived while offline
        return len(self.online[user])

    def send(self, conv, sender, to, text):
        self.seq[conv] += 1
        msg = (conv, self.seq[conv], sender, text)
        self.history[conv].append(msg)          # 1. store first
        if to in self.online:
            self.online[to].append(msg)         # 2a. push in real time
            return "delivered"
        self.pending[to].append(msg)            # 2b. keep for later (and send a push notification)
        return "stored, will deliver on reconnect"

s = ChatServer()
s.connect("ravi")
print(s.send("ravi-asha", "ravi", "asha", "lunch at 1?"))
print(s.send("ravi-asha", "ravi", "asha", "at Vidyarthi Bhavan"))
print("asha connects and gets", s.connect("asha"), "messages:", [m[3] for m in s.online["asha"]])
print(s.send("ravi-asha", "asha", "ravi", "yes!"), "| order:", [m[1] for m in s.history["ravi-asha"]])
```

```output
stored, will deliver on reconnect
stored, will deliver on reconnect
asha connects and gets 2 messages: ['lunch at 1?', 'at Vidyarthi Bhavan']
delivered | order: [1, 2, 3]
```

## Time and space

| Concern | Rough number |
| --- | --- |
| Messages per second (50M DAU × 40/day) | ~23,000 average, ~70,000 peak |
| Storage at 100 bytes each | ~73 TB per year (before replication) |
| Connections per chat server | ~100k–1M (memory-bound) |
| Delivery latency target | under ~200 ms |

## Common mistakes

- Using HTTP polling for real-time delivery (slow and wasteful at scale).
- Ordering by each phone's clock.
- Pushing before storing (a crash loses the message).
- Forgetting offline users, multiple devices per user, and big groups.
- Storing images inside the message database.

## Patterns that use it

WebSockets and pub/sub, Snowflake IDs, wide-column stores partitioned by conversation, queues/streams, push notifications, presence with TTLs.

## Practice

```practice
Extend the simulation with read receipts: the receiver sends "read up to sequence N".
Design group chat for groups of 1,000 members. What changes compared with 1:1?
Draw the design and explain how a message travels when the receiver is on another chat server.
Estimate connections and servers for 50M concurrent users at 200k connections per server.
```

## Explain it back

```explain
Why do chat apps use WebSockets instead of normal HTTP requests?
What is the connection registry for?
How do you keep messages in order when servers have different clocks?
What happens, step by step, when the receiver is offline?
```

## Flashcards

```flashcards
Real-time push to phones? :: Long-lived WebSocket connections.
Find the receiver's server? :: A connection registry (user → server), e.g. in Redis.
Snowflake ID parts? :: Timestamp | machine id | counter: unique and time-sortable.
Store before or after pushing? :: Store first (durability), then push.
Message store choice? :: Wide-column store partitioned by conversation_id.
Offline receiver? :: Keep the message; push notification; sync on reconnect.
```
