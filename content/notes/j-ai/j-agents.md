---
id: j-agents
title: Agents and tool calling basics
level: advanced
phase: 3
week: 37
tags: [ai, llm, agents, tools]
estMinutes: 35
---

## What it is

**Tool calling**: you describe some functions (tools) to the model; instead of answering directly, it can reply "call `get_train_status` with `{"train_no": "T101"}`". Your code runs the function and sends the result back.
An **agent** is that in a **loop**: the model keeps choosing tools and reading results until it can answer. The model decides the steps; your code runs them and enforces the limits.

## Real-life example

You ask an assistant: "Is my train late, and how much is a taxi from the station?" A good assistant checks the train status, then checks the taxi app, then answers. It does not book a taxi without asking you first. An agent does the same with tools: look things up freely, but ask before anything risky.

## Picture

```text
 user question
      │
      ▼
 ┌─▶ model ── wants a tool? ── no ──▶ final answer
 │     │ yes: {"tool": "get_train_status", "input": {"train_no": "T101"}}
 │     ▼
 │   your code: allowed tool? valid input? risky → ask the user first
 │     │ run it (with a timeout)
 │     ▼
 └── tool result goes back to the model         (stop after max_steps, log every step)
```

## How it works inside

- **Tool definition**: a name, a clear description (when to use it), and an input schema (JSON Schema). Good descriptions matter as much as good prompts.
- The model replies with a **tool_use** block (name + input) and `stop_reason == "tool_use"`. You run the tool and send back a **tool_result** with the same id. Repeat until `stop_reason == "end_turn"`.
- SDKs offer a **tool runner** that does this loop for you; you write only the tool functions.
- **Safety in your code, not the prompt**: allow-list of tools, validate inputs, timeouts, **max steps**, human approval for actions that spend money, send messages or delete data, and logs of every step.
- **Start simple**: if the steps are always the same (retrieve → answer), write a normal workflow. Use an agent only when the steps really depend on what it finds.

## Python, step by step

The agent loop with a scripted fake model (it decides like an LLM would, so you can see every step for free). The train data is made up:

```python
import json

def get_train_status(train_no):
    data = {"T101": "On time, platform 4", "T202": "Late by 25 minutes"}
    return data.get(train_no, "Unknown train number")

def taxi_fare(from_place, to_place):
    table = {("Central Station", "Koramangala"): 420}
    return table.get((from_place, to_place), "No fare found")

TOOLS = {"get_train_status": get_train_status, "taxi_fare": taxi_fare}

def fake_model(messages):
    """Pretends to be the LLM: picks the next step from the results so far."""
    results = [m["content"] for m in messages if m["role"] == "tool"]
    if len(results) == 0:
        return {"tool": "get_train_status", "input": {"train_no": "T202"}}
    if len(results) == 1:
        return {"tool": "taxi_fare", "input": {"from_place": "Central Station", "to_place": "Koramangala"}}
    return {"answer": f"T202 is {results[0].lower()}. A taxi to Koramangala costs about ₹{results[1]}."}

def run_agent(question, model, max_steps=5):
    messages = [{"role": "user", "content": question}]
    for step in range(1, max_steps + 1):
        decision = model(messages)
        if "answer" in decision:
            return decision["answer"]
        name, args = decision["tool"], decision["input"]
        result = str(TOOLS[name](**args)) if name in TOOLS else f"error: unknown tool {name}"
        print(f"step {step}: {name}({json.dumps(args)}) -> {result}")
        messages.append({"role": "tool", "content": result})
    return "Stopped: too many steps."

print(run_agent("Is T202 late? And the taxi fare to Koramangala?", fake_model))
```

```output
step 1: get_train_status({"train_no": "T202"}) -> Late by 25 minutes
step 2: taxi_fare({"from_place": "Central Station", "to_place": "Koramangala"}) -> 420
T202 is late by 25 minutes. A taxi to Koramangala costs about ₹420.
```

Why `max_steps` and the allow-list matter: a confused model can loop or ask for tools that do not exist:

```python
def run_agent(model, tools, max_steps):
    messages = []
    for step in range(1, max_steps + 1):
        decision = model(messages)
        name = decision["tool"]
        result = "ok" if name in tools else f"error: unknown tool {name}"
        print(f"step {step}: {name} -> {result}")
        messages.append({"role": "tool", "content": result})
    return "Stopped: too many steps."

confused = lambda messages: {"tool": "delete_all_bookings" if len(messages) == 1 else "search"}
print(run_agent(confused, tools={"search"}, max_steps=3))
```

```output
step 1: search -> ok
step 2: delete_all_bookings -> error: unknown tool delete_all_bookings
step 3: search -> ok
Stopped: too many steps.
```

The real thing with Claude: the SDK's tool runner builds the schema from your function and runs the loop (needs a key):

```python norun
import anthropic
from anthropic import beta_tool

client = anthropic.Anthropic()

@beta_tool
def get_train_status(train_no: str) -> str:
    """Get the live running status of a train.

    Args:
        train_no: The train number, for example "T202".
    """
    return "Late by 25 minutes"              # call a real status API here

runner = client.beta.messages.tool_runner(
    model="claude-opus-5-5",
    max_tokens=16000,
    tools=[get_train_status],
    messages=[{"role": "user", "content": "Is train T202 running late?"}],
)
for message in runner:                       # one message per model turn; tools run in between
    for block in message.content:
        if block.type == "text":
            print(block.text)
```

## Time and space

| Concern | Effect |
| --- | --- |
| Each step | one more model call: cost and latency add up |
| History | grows with every tool result (input tokens grow) |
| Big tool results | trim them; send only what the model needs |
| Reliability | more steps = more chances to go wrong; keep tasks small |

## Common mistakes

- Building an agent for a fixed, predictable workflow.
- Vague tool descriptions, so the model picks the wrong tool.
- No step limit, timeout or cost limit.
- Letting the model trigger payments, emails or deletes without a human OK.
- Trusting tool inputs from the model without validation (it can send wrong types or values).
- Huge tool results that blow up the context and the bill.

## Patterns that use it

Loops with limits, command/strategy patterns (a tool registry is a dict of functions), validation at trust boundaries, retries and timeouts, logging and tracing, RAG as a tool ("search_docs").

## Practice

```practice
Add a "weather(city)" tool to TOOLS and change fake_model to use it for a new question.
Add an approval step: before running any tool whose name starts with "book_", ask input("Approve? y/n").
Make run_agent stop when the same tool is called with the same input twice in a row.
Rewrite the train example as a fixed workflow (no agent). Which version is simpler to test?
```

## Explain it back

```explain
What is the difference between tool calling and an agent?
Walk through one loop: model reply, your code, tool result.
Which safety checks belong in your code, not in the prompt?
When should you NOT build an agent?
```

## Flashcards

```flashcards
Tool calling? :: The model asks your code to run a described function with given input.
Agent? :: An LLM choosing tools in a loop until it can answer.
stop_reason "tool_use"? :: The model wants a tool; run it and send a tool_result with the same id.
Key agent limits? :: Max steps, timeouts, tool allow-list, cost limits.
Risky actions (pay, email, delete)? :: Require human approval.
Fixed steps every time? :: Use a normal workflow, not an agent.
```
