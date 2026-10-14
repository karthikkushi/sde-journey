---
id: i-queues-streams
title: Queues and streams (Kafka-style logs)
level: advanced
phase: 2
week: 26
tags: [system-design, queues, streams, kafka, events]
estMinutes: 25
---

## What it is

Asynchronous messaging lets services talk without waiting for each other.
A **queue** (RabbitMQ, SQS) hands each message to **one** worker, which deletes it when done: good for **jobs**.
A **stream / log** (Kafka, Kinesis) keeps messages in order for days; **many** consumer groups read it independently at their own position (**offset**) and can **replay**: good for **events**.
(Worker code, retries and idempotency: see the backend note "Message queues and background jobs".)

## Real-life example

A queue is the kitchen order rail: each slip is cooked by one cook and then thrown away. A stream is the shop's day book: every sale is written in order, and the accountant, the stock keeper and the owner each read it at their own pace, and can re-read last week if needed.

## Picture

```text
 queue:   producer ─▶ [ job5 job4 job3 ] ─▶ worker A / worker B  (each job to ONE worker, then gone)

 stream (topic "orders", 2 partitions, ordered within a partition):
   partition 0: [o1][o3][o4][o7] ...      consumer group "billing":   offset p0=3, p1=2
   partition 1: [o2][o5][o6] ...          consumer group "analytics": offset p0=1, p1=1  (slower, independent)
   key = customer_id → same customer's orders stay in order in one partition
```

## How it works inside

**Queues**: competing consumers; ack and redelivery; dead letter queues; good for task distribution and smoothing spikes. Message order is not guaranteed across workers.

**Streams/logs**
- A **topic** is split into **partitions**. Each partition is an append-only log; order is guaranteed **within** a partition.
- Producers choose the partition by **key** (`hash(key) % partitions`), so all events for one key are ordered.
- Each **consumer group** keeps its own **offset** per partition. Adding a new group (for example analytics) does not affect others. Within a group, each partition is read by one consumer, so partitions = the maximum parallelism.
- **Retention** (days, or by size) allows **replay**: fix a bug and reprocess history.
- Delivery is usually **at-least-once**; consumers must be idempotent (or use transactional/exactly-once features).
- **Backpressure**: if consumers are slow, the log just grows (lag). Monitor **consumer lag**.

**When to use which**: a queue for "do this task once"; a stream for "this happened" when several systems care, or you need order and replay (event sourcing, analytics, change data capture).

## Python, step by step

A tiny partitioned log with two independent consumer groups:

```python
class Topic:
    def __init__(self, partitions):
        self.logs = [[] for _ in range(partitions)]          # append-only lists
        self.offsets = {}                                    # (group, partition) -> next index to read

    def publish(self, key, event):
        p = sum(map(ord, key)) % len(self.logs)              # same key -> same partition -> ordered
        self.logs[p].append(event)

    def poll(self, group, partition, max_events=10):
        start = self.offsets.get((group, partition), 0)
        batch = self.logs[partition][start:start + max_events]
        self.offsets[(group, partition)] = start + len(batch)   # "commit" the new offset
        return batch

orders = Topic(partitions=2)
for i, customer in enumerate(["ravi", "asha", "ravi", "john", "ravi"], start=1):
    orders.publish(customer, f"order{i}:{customer}")

print(orders.logs)
print("billing  p0:", orders.poll("billing", 0))
print("billing  p0 again:", orders.poll("billing", 0))           # nothing new
print("analytics p0:", orders.poll("analytics", 0, max_events=1)) # its own offset
orders.offsets[("billing", 0)] = 0                                 # replay from the start
print("billing replay p0:", orders.poll("billing", 0, max_events=2))
```

```output
[['order1:ravi', 'order3:ravi', 'order5:ravi'], ['order2:asha', 'order4:john']]
billing  p0: ['order1:ravi', 'order3:ravi', 'order5:ravi']
billing  p0 again: []
analytics p0: ['order1:ravi']
billing replay p0: ['order1:ravi', 'order3:ravi']
```

All of Ravi's orders landed in partition 0, in the order they happened. Billing and analytics read the same events independently, and billing could replay from the start.

## Time and space

| | Queue | Stream (log) |
| --- | --- | --- |
| Message after processing | deleted | kept until retention ends |
| Readers | one worker per message | many consumer groups |
| Order | not guaranteed | per partition |
| Replay | no | yes (move the offset) |
| Parallelism | add workers | up to the number of partitions per group |

## Common mistakes

- Expecting global order across a whole Kafka topic (only per partition).
- Too few partitions (cannot add consumers later without repartitioning).
- Non-idempotent consumers with at-least-once delivery.
- Ignoring consumer lag until the disk fills.
- Using a stream where a simple job queue is enough.

## Patterns that use it

Notification systems, news feed fan-out, analytics pipelines, order processing (order placed → billing, stock, email), change data capture, and the outbox pattern.

## Practice

```practice
For an e-commerce site, list 4 consumers of an "order_placed" stream and what each does.
Choose the partition key for: chat messages, payment events, page-view analytics. Explain the order guarantee you get.
Add a "lag" method to Topic that shows how far behind each group is.
```

## Explain it back

```explain
What is the difference between a queue and a stream?
What is a consumer group, and what is an offset?
Why is order only guaranteed within a partition?
When is replay useful?
```

## Flashcards

```flashcards
Queue? :: Each message goes to one worker and is deleted after ack.
Stream/log? :: Ordered, retained messages; many groups read at their own offsets.
Ordering in Kafka? :: Within a partition only; same key → same partition.
Consumer group? :: A set of consumers sharing the work; each partition read by one member.
Offset? :: The position of the next message a group will read.
Consumer lag? :: How far a group is behind the newest messages.
```
