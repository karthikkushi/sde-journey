---
id: dp-state
name: DP state machine
group: Dynamic programming
---

## Clues

```clues
Stock buy and sell with a cooldown, a fee, or at most k transactions
Each day you are in one of a few "states" (holding, not holding, cooling down)
Paint houses where the state is the last colour used
```

## Idea

List the states, and how you can move between them each day. Keep the best value for each state, and update all of them together every day.

```text
          buy                 sell
  rest ────────▶ hold ─────────────▶ sold
   ▲  ◀─────────────────────────────── │   (cooldown: sold → rest next day)
```

## Template

```python
def max_profit_cooldown(prices):
    hold, sold, rest = float("-inf"), 0, 0   # best profit if today I hold / just sold / am free
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)

def max_profit_fee(prices, fee):
    hold, free = float("-inf"), 0
    for p in prices:
        hold, free = max(hold, free - p), max(free, hold + p - fee)
    return free

print(max_profit_cooldown([1, 2, 3, 0, 2]), max_profit_fee([1, 3, 2, 8, 4, 9], 2))
```

```output
3 8
```

## Walkthrough: Best Time to Buy and Sell Stock with Cooldown

1. States: `hold` (own a share), `sold` (sold today), `rest` (free, can buy).
2. `hold` = keep holding, or buy today from `rest`. `sold` = sell today from `hold`. `rest` = stay resting, or yesterday was a sale (cooldown is over).
3. Update all three at once (tuple assignment), so today's values use yesterday's.

## Traps

- Updating the states one by one, so one uses today's new value instead of yesterday's.
- Starting `hold` at 0 instead of minus infinity (you cannot hold before buying).
- Not drawing the state diagram first.
