"""Run every Python code block in the notes and patterns, and check what it prints.

Rules (so notes never teach broken code):
  * Each ```python block runs on its own, so it must be self-contained.
  * If the block is followed by an ```output block, the printed text must match it.
    If the expected output contains "Traceback", only the last line (the error) is compared.
  * A block whose first line starts with "# WRONG" must FAIL (it shows a mistake on purpose),
    unless an ```output block with a Traceback says exactly how it fails.
  * input() gets the answers listed in a "# stdin: a | b | c" comment, or empty lines.

Usage:  python3 scripts/check_notes.py            (all notes)
        python3 scripts/check_notes.py a09-lists  (only files matching the words)
"""
import pathlib
import re
import subprocess
import sys
import tempfile

CONTENT = pathlib.Path(__file__).resolve().parent.parent / "content"
ROOTS = [CONTENT / "notes", CONTENT / "patterns"]
FENCE = re.compile(r"^```(\w[\w-]*)?[^\n]*\n(.*?)^```\s*$", re.M | re.S)


def blocks(text):
    """Yield (language, code, end_position) for every fenced block."""
    for m in FENCE.finditer(text):
        yield (m.group(1) or ""), m.group(2), m.start(), m.end()


def normalize(text):
    """Ignore file names and trailing spaces when comparing tracebacks."""
    text = re.sub(r'File "[^"]*"', 'File "..."', text)
    return "\n".join(line.rstrip() for line in text.strip().splitlines())


def run(code):
    stdin_match = re.search(r"#\s*stdin:\s*(.*)", code)
    stdin = "\n".join(s.strip() for s in stdin_match.group(1).split("|")) + "\n" if stdin_match else "\n" * 20
    # -E -s: ignore env vars and the user's site-packages (the script folder stays importable).
    # Run inside an empty temp folder, so file examples never touch the repo.
    # The code is saved as a real file, so tracebacks show the source lines like they do for you.
    with tempfile.TemporaryDirectory() as tmp:
        pathlib.Path(tmp, "snippet.py").write_text(code, encoding="utf-8")
        p = subprocess.run([sys.executable, "-E", "-s", "snippet.py"], input=stdin, capture_output=True, text=True, timeout=20, cwd=tmp)
    return p.returncode, p.stdout, p.stderr


def check_file(path):
    text = path.read_text(encoding="utf-8")
    found = list(blocks(text))
    failures, count = [], 0
    for i, (lang, code, start, end) in enumerate(found):
        if lang != "python":
            continue
        count += 1
        line_no = text[:start].count("\n") + 1
        expected = None
        if i + 1 < len(found) and found[i + 1][0] == "output" and text[end:found[i + 1][2]].strip() == "":
            expected = found[i + 1][1].rstrip("\n")
        wrong = code.lstrip().startswith("# WRONG")
        rc, out, err = run(code)

        if expected is not None and ("Traceback" in expected or re.search(r"^\w+Error: ", expected, re.M)):
            want, got = normalize(expected), normalize(err)
            if got != want:
                failures.append(f"{path.name}:{line_no}: error differs\n--- expected\n{want}\n--- got\n{got}")
        elif wrong:
            if rc == 0 and expected is None:
                failures.append(f"{path.name}:{line_no}: '# WRONG' block ran without an error")
            elif expected is not None and out.rstrip() != expected:
                failures.append(f"{path.name}:{line_no}: output differs\n--- expected\n{expected}\n--- got\n{out.rstrip()}")
        elif rc != 0:
            failures.append(f"{path.name}:{line_no}: crashed\n{err.strip()}")
        elif expected is not None and "\n".join(l.rstrip() for l in out.rstrip().splitlines()) != "\n".join(l.rstrip() for l in expected.splitlines()):
            failures.append(f"{path.name}:{line_no}: output differs\n--- expected\n{expected}\n--- got\n{out.rstrip()}")
    return count, failures


def main():
    words = sys.argv[1:]
    files = sorted(p for root in ROOTS for p in root.rglob("*.md") if not p.name.startswith("_") and all(w in p.name for w in words))
    total, all_failures = 0, []
    for f in files:
        n, fails = check_file(f)
        total += n
        all_failures += fails
    for f in all_failures:
        print("FAIL", f, "\n")
    print(f"{total} Python blocks in {len(files)} files, {len(all_failures)} failures.")
    sys.exit(1 if all_failures else 0)


if __name__ == "__main__":
    main()
