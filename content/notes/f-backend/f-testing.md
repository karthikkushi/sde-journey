---
id: f-testing
title: Testing (unit and integration)
level: core
phase: 3
week: 31
tags: [backend, testing, pytest, quality]
estMinutes: 35
---

## What it is

A **test** is code that runs your code and checks the result automatically.
**Unit tests** check one small piece (a function) in isolation. **Integration tests** check pieces working together (an API endpoint plus its database).
Tests let you change code without fear: if you break something, a test goes red.

## Real-life example

Before a cricket match, the ground staff check each thing separately: the pitch, the stumps, the lights (unit tests). Then they run a short practice game to see everything works together (integration test). On match day there are no surprises.

## Picture

```text
                 ▲   few, slow, real browser        end-to-end tests
                ▲▲▲  some: API + database           integration tests
              ▲▲▲▲▲▲▲ many, fast, one function each   unit tests

 Each test:  Arrange (set up)  →  Act (call the code)  →  Assert (check the result)
```

## How it works inside

- **Arrange, act, assert**: every test sets up data, calls one thing, and checks one outcome.
- **pytest** is Python's most used test tool: any function named `test_...` in a file named `test_*.py` is a test; plain `assert` statements are the checks; **fixtures** give each test fresh setup data.
- **Test the edges**, not only the happy path: empty input, zero, negative, the limit (2 km exactly), wrong types, missing records.
- **Mocks / fakes** stand in for slow or risky things (payment gateways, email, time). A test must never move real money or send real SMS.
- **Integration tests for APIs**: FastAPI's `TestClient` calls your endpoints in-process; use a test database (SQLite in memory, or a throwaway Postgres container).
- **Coverage** shows which lines ran during tests. High coverage is good, but it does not prove your asserts are meaningful.
- **CI** runs all tests on every push (see the CI/CD note), so nobody merges red code.
- **TDD** (test-driven development): write a failing test, make it pass, clean up. Great for bug fixes: first write a test that reproduces the bug.

## Python, step by step

Unit tests with the built-in `unittest` (run here in-process):

```python
import io
import unittest

def auto_fare(km):
    if km <= 0:
        raise ValueError("km must be positive")
    return 30 if km <= 2 else 30 + 15 * (km - 2)

class TestFare(unittest.TestCase):
    def test_minimum_fare(self):
        self.assertEqual(auto_fare(1), 30)

    def test_edge_exactly_two_km(self):          # edges find bugs
        self.assertEqual(auto_fare(2), 30)

    def test_long_ride(self):
        self.assertEqual(auto_fare(5), 75)

    def test_bad_input(self):
        with self.assertRaises(ValueError):
            auto_fare(0)

suite = unittest.defaultTestLoader.loadTestsFromTestCase(TestFare)
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.testsRun, "tests,", len(result.failures), "failures,", len(result.errors), "errors")
```

```output
4 tests, 0 failures, 0 errors
```

The same idea with **pytest** and a fixture (the code and the test are written to files, then pytest runs them):

```python
import contextlib
import io
import pathlib
import pytest

pathlib.Path("bill.py").write_text('''
def total(items, gst_percent=5):
    subtotal = sum(price * qty for price, qty in items)
    return round(subtotal * (1 + gst_percent / 100), 2)
''')

pathlib.Path("test_bill.py").write_text('''
import pytest
from bill import total

@pytest.fixture
def cart():                      # fresh data for every test that asks for it
    return [(320, 1), (160, 2)]

def test_total_with_gst(cart):
    assert total(cart) == 672.0

def test_no_gst(cart):
    assert total(cart, gst_percent=0) == 640

def test_empty_cart():
    assert total([]) == 0
''')

out = io.StringIO()
with contextlib.redirect_stdout(out):
    code = pytest.main(["-q", "-p", "no:cacheprovider", "test_bill.py"])
summary = [line for line in out.getvalue().splitlines() if " passed" in line or " failed" in line][-1]
print("exit code:", int(code), "|", summary.split(" in ")[0])
```

```output
exit code: 0 | 3 passed
```

An integration test of an API, with a **mock** instead of a real payment gateway:

```python
from unittest.mock import Mock
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

def make_app(payments):                      # the payment client is passed in, so tests can fake it
    app = FastAPI()

    @app.post("/checkout")
    def checkout(amount: int):
        if amount <= 0:
            raise HTTPException(400, "amount must be positive")
        receipt = payments.charge(amount)
        return {"paid": amount, "receipt": receipt}

    return app

fake = Mock()
fake.charge.return_value = "R-001"           # no real money moves in a test
client = TestClient(make_app(fake))
r = client.post("/checkout", params={"amount": 250})
print(r.status_code, r.json())
fake.charge.assert_called_once_with(250)     # it was called exactly once, with 250
print(client.post("/checkout", params={"amount": 0}).status_code, fake.charge.call_count)
```

```output
200 {'paid': 250, 'receipt': 'R-001'}
400 1
```

> **Same thing in .NET**: xUnit (`[Fact]`, `Assert.Equal`), Moq or NSubstitute for mocks, and `WebApplicationFactory<Program>` for in-process API integration tests.

## Time and space

| Test type | Speed | How many |
| --- | --- | --- |
| Unit | milliseconds | hundreds |
| Integration (API + test DB) | tens of ms to seconds | dozens |
| End-to-end (browser) | seconds each | a few critical journeys |

A test suite that takes 20 minutes stops being run. Keep most tests fast.

## Common mistakes

- Only testing the happy path.
- Tests that depend on each other's order or shared data.
- Calling real external services in tests (slow, flaky, and sometimes costly).
- Asserting too little ("status 200") or too much (every byte of a long response).
- Tests that pass even when the code is broken (try breaking the code once to see the test fail).

## Patterns that use it

Every project from Phase 2 onwards: your own data structures with tests, the LeetCode tracker, the billing API (85% coverage goal), and CI pipelines. In interviews, "how would you test this?" is a common follow-up.

## Practice

```practice
Write pytest tests for your expense tracker: adding, totals per category, and an empty file.
Write an integration test for one FastAPI endpoint using TestClient and an in-memory SQLite database.
Fix a bug test-first: write a test that fails because of the bug, then fix the code.
Mock time: test a function that says "Good morning" before 12:00 without waiting for the morning.
```

## Explain it back

```explain
What is the difference between a unit test and an integration test?
What are arrange, act and assert?
Why do we mock a payment gateway in tests?
Why is 100% coverage not proof that the code is correct?
```

## Flashcards

```flashcards
Unit vs integration test? :: Unit: one piece alone. Integration: pieces together (API + DB).
Test pyramid? :: Many unit, some integration, few end-to-end.
pytest finds tests how? :: Functions named test_* in files named test_*.py.
What is a fixture? :: Reusable setup data given to tests that ask for it.
Why mock? :: Replace slow or risky dependencies (payments, email, time) with fakes.
TDD for a bug? :: Write a failing test that shows the bug, then fix the code.
```
