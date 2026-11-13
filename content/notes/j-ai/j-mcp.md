---
id: j-mcp
title: The Model Context Protocol (MCP)
level: core
phase: 3
week: 43
tags: [ai, mcp, agents, tools]
estMinutes: 25
---

## What it is

The **Model Context Protocol (MCP)** is an open standard for connecting AI apps to tools and data.
You write an **MCP server** once (for example "search orders", "refund an order"), and any MCP-aware app (an IDE assistant, a chat app, an agent) can discover and call those tools.
In the 2025 Stack Overflow survey, 34% of developers who use AI agents already used MCP. For a backend developer it is a natural skill: an MCP server is an API whose client is a model.

## Real-life example

A universal phone charger port. Before it, every phone needed its own charger. With one standard port, any charger fits any phone. MCP is that port between AI apps and your tools.

## Picture

```text
  AI app (host)                     your MCP server
  ┌──────────────┐  "list tools"   ┌────────────────────────────┐
  │ model decides│ ───────────────►│ tools:                      │
  │ which tool   │◄─────────────── │  search_orders(phone)       │
  │ to call      │  "call tool"    │  refund_order(order_id)     │
  │              │ ───────────────►│ → calls your real API + DB  │
  └──────────────┘  result (JSON)  └────────────────────────────┘
```

## How it works inside

- **Hosts and clients**: the AI app (host) runs an MCP client that talks to one or more servers.
- **Servers expose three things**: **tools** (functions the model may call), **resources** (data to read, like a file or a record), and **prompts** (reusable templates).
- **Messages** are JSON-RPC 2.0: `tools/list` returns each tool's name, description and JSON Schema for its inputs; `tools/call` runs one.
- **Transports**: local servers use stdio (the host starts your program); remote servers use HTTP.
- **Safety is your job**: validate every input, give tools the smallest permissions, require confirmation for actions that change data (refunds, emails), and log every call. The model chooses the tool, but your server decides what is allowed.
- **Good tool design** is good API design: clear names, short descriptions that say when to use the tool, few required parameters, and errors the model can understand.

## Python, step by step

The core idea without any library: a registry of tools with schemas, and a `call` that validates input before running.

```python
TOOLS = {}

def tool(name, description, params):
    def register(fn):
        TOOLS[name] = {"description": description, "params": params, "fn": fn}
        return fn
    return register

ORDERS = {"9876543210": ["ORD-1", "ORD-7"]}

@tool("search_orders", "Find a customer's orders by phone number.", {"phone": str})
def search_orders(phone):
    return ORDERS.get(phone, [])

def list_tools():
    return [{"name": n, "description": t["description"], "params": list(t["params"])} for n, t in TOOLS.items()]

def call(name, args):
    t = TOOLS.get(name)
    if t is None:
        return {"error": f"unknown tool {name}"}
    for p, kind in t["params"].items():
        if not isinstance(args.get(p), kind):
            return {"error": f"{p} must be {kind.__name__}"}
    return {"result": t["fn"](**args)}

print(list_tools())
print(call("search_orders", {"phone": "9876543210"}))
print(call("search_orders", {"phone": 98765}))
print(call("delete_everything", {}))
```

```output
[{'name': 'search_orders', 'description': "Find a customer's orders by phone number.", 'params': ['phone']}]
{'result': ['ORD-1', 'ORD-7']}
{'error': 'phone must be str'}
{'error': 'unknown tool delete_everything'}
```

With the official Python SDK (needs the `mcp` package and an MCP host to connect, so it does not run here):

```python norun
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("orders")

@mcp.tool()
def search_orders(phone: str) -> list[str]:
    """Find a customer's orders by phone number."""
    return lookup_orders(phone)        # your real database call

if __name__ == "__main__":
    mcp.run()                          # stdio transport by default
```

## Time and space

| Choice | When |
| --- | --- |
| stdio server | a local tool for your own IDE or desktop app |
| HTTP server | a shared tool for a team or a product |
| Read-only tools first | always; add actions that change data later, with confirmation |

## Common mistakes

- Tools that can do anything ("run SQL") instead of narrow, safe actions.
- Trusting the model's arguments without validation.
- Vague tool descriptions, so the model picks the wrong tool.
- No logging of which tool was called with what.

## Patterns that use it

Agents and tool calling, guardrails, the AI feature in your flagship project.

## Practice

```practice
Expose two read-only endpoints of your project as MCP tools and call them from an MCP-aware assistant
Add input validation and a clear error message to each tool
Add one action tool that needs a confirmation step, and log every call
```

## Explain it back

```explain
What problem does MCP solve that a plain REST API does not?
Why should tools be narrow instead of "run any SQL"?
```

## Flashcards

```flashcards
What is MCP? :: An open standard for connecting AI apps to tools and data through MCP servers.
What three things can an MCP server expose? :: Tools, resources and prompts.
What message format does MCP use? :: JSON-RPC 2.0, for example tools/list and tools/call.
Who decides what a tool may do? :: Your server: validate inputs, limit permissions, confirm risky actions.
```
