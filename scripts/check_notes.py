"""Run every code block in the notes and patterns, and check what it prints.

Rules (so notes never teach broken code):
  * Each ```python block runs on its own, so it must be self-contained.
  * If a block is followed by an ```output block, the printed text must match it.
    If the expected output is an error ("Traceback" or "SomethingError: ..."), the whole
    error is compared (file names are ignored, so a note may call the file bill.py).
  * A python block whose first line starts with "# WRONG" must fail (it shows a mistake),
    unless its ```output block shows exactly what it prints.
  * input() gets the answers listed in a "# stdin: a | b | c" comment, or empty lines.
  * ```sql blocks run in order against one in-memory SQLite database per note. The last
    statement's rows are printed as "col | col" lines and compared with the ```output block.
  * ```python norun  /  ```sql norun  is only for code that cannot run here (it needs a
    server, Docker, an API key, or Postgres-only syntax). Use it rarely; it is counted.
  * Extra packages for the backend notes (FastAPI, SQLAlchemy...) are listed in
    scripts/requirements-notes.txt. Locally they live in .venv (see README).

Usage:  python3 scripts/check_notes.py            (all files)
        python3 scripts/check_notes.py e-joins    (only files whose name contains the words)
"""
import pathlib
import re
import sqlite3
import subprocess
import sys
import tempfile

REPO = pathlib.Path(__file__).resolve().parent.parent
CONTENT = REPO / "content"
ROOTS = [CONTENT / "notes", CONTENT / "patterns"]
FENCE = re.compile(r"^```(\w[\w-]*)?([^\n]*)\n(.*?)^```\s*$", re.M | re.S)

# Use the project's .venv (with FastAPI etc.) if it exists; otherwise the current Python.
VENV_PY = REPO / ".venv" / "bin" / "python"
PYTHON = str(VENV_PY) if VENV_PY.exists() else sys.executable


def blocks(text):
    """Yield (language, meta, code, start, end) for every fenced block."""
    for m in FENCE.finditer(text):
        yield (m.group(1) or ""), m.group(2).strip(), m.group(3), m.start(), m.end()


def normalize(text):
    """Ignore file names and trailing spaces when comparing errors."""
    text = re.sub(r'File "[^"]*"', 'File "..."', text)
    return "\n".join(line.rstrip() for line in text.strip().splitlines())


def same(a, b):
    return "\n".join(l.rstrip() for l in a.rstrip().splitlines()) == "\n".join(l.rstrip() for l in b.rstrip().splitlines())


def is_error(expected):
    return "Traceback" in expected or re.search(r"^\w+Error: ", expected, re.M)


def run_python(code):
    stdin_match = re.search(r"#\s*stdin:\s*(.*)", code)
    stdin = "\n".join(s.strip() for s in stdin_match.group(1).split("|")) + "\n" if stdin_match else "\n" * 20
    # -E -s: ignore env vars and user site-packages. Run as a real file in an empty temp folder,
    # so tracebacks look like yours and file examples never touch the repo.
    with tempfile.TemporaryDirectory() as tmp:
        pathlib.Path(tmp, "snippet.py").write_text(code, encoding="utf-8")
        p = subprocess.run([PYTHON, "-E", "-s", "snippet.py"], input=stdin, capture_output=True, text=True, timeout=60, cwd=tmp)
    return p.returncode, p.stdout, p.stderr


def run_sql(conn, code):
    """Run statements in order; return the last statement's rows as text (or None)."""
    cur = None
    for stmt in (s.strip() for s in code.split(";")):
        if stmt and not all(line.strip().startswith("--") for line in stmt.splitlines()):
            cur = conn.execute(stmt)
    if cur is None or cur.description is None:
        return None
    lines = [" | ".join(d[0] for d in cur.description)]
    lines += [" | ".join("NULL" if v is None else str(v) for v in row) for row in cur.fetchall()]
    return "\n".join(lines)


def check_file(path):
    text = path.read_text(encoding="utf-8")
    found = list(blocks(text))
    failures, counts = [], {"python": 0, "sql": 0, "norun": 0}
    conn = sqlite3.connect(":memory:", isolation_level=None)   # autocommit: SQL behaves like a SQL shell (BEGIN/ROLLBACK work)
    for i, (lang, meta, code, start, end) in enumerate(found):
        if lang not in ("python", "sql"):
            continue
        where = f"{path.name}:{text[:start].count(chr(10)) + 1}"
        if "norun" in meta.split():
            counts["norun"] += 1
            continue
        counts[lang] += 1
        expected = None
        if i + 1 < len(found) and found[i + 1][0] == "output" and text[end:found[i + 1][3]].strip() == "":
            expected = found[i + 1][2].rstrip("\n")

        if lang == "sql":
            try:
                got = run_sql(conn, code)
            except sqlite3.Error as e:
                failures.append(f"{where}: SQL error: {e}")
                continue
            if expected is not None and (got is None or not same(got, expected)):
                failures.append(f"{where}: SQL output differs\n--- expected\n{expected}\n--- got\n{got}")
            continue

        wrong = code.lstrip().startswith("# WRONG")
        rc, out, err = run_python(code)
        if expected is not None and is_error(expected):
            if normalize(err) != normalize(expected):
                failures.append(f"{where}: error differs\n--- expected\n{normalize(expected)}\n--- got\n{normalize(err)}")
        elif wrong:
            if rc == 0 and expected is None:
                failures.append(f"{where}: '# WRONG' block ran without an error")
            elif expected is not None and not same(out, expected):
                failures.append(f"{where}: output differs\n--- expected\n{expected}\n--- got\n{out.rstrip()}")
        elif rc != 0:
            failures.append(f"{where}: crashed\n{err.strip()}")
        elif expected is not None and not same(out, expected):
            failures.append(f"{where}: output differs\n--- expected\n{expected}\n--- got\n{out.rstrip()}")
    return counts, failures


def main():
    words = sys.argv[1:]
    files = sorted(p for root in ROOTS for p in root.rglob("*.md") if not p.name.startswith("_") and all(w in p.name for w in words))
    total, all_failures = {"python": 0, "sql": 0, "norun": 0}, []
    for f in files:
        counts, fails = check_file(f)
        for k in total:
            total[k] += counts[k]
        all_failures += fails
    for f in all_failures:
        print("FAIL", f, "\n")
    print(f"{total['python']} Python and {total['sql']} SQL blocks checked in {len(files)} files "
          f"({total['norun']} marked norun), {len(all_failures)} failures.")
    sys.exit(1 if all_failures else 0)


if __name__ == "__main__":
    main()
