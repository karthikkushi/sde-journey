# SDE Journey

A personal 15-month study site: Python basics → DSA → backend → system design → interviews.

Live: https://karthikkushi.github.io/sde-journey/

- Works offline and installs on a phone (PWA).
- All progress is saved in the browser. Back it up regularly (see below).
- Day 1 is the day you first open it (from the device's date). If you lose days to an emergency or race ahead,
  the Today page shows how far behind or ahead you are, lists tasks to catch up, and offers to move the plan.
- The **Performance** page turns your ticks, solve times, focus time, energy, flashcards and game answers into
  charts, strengths, weak spots and next actions.
- No login, no backend, no paid services.

## Daily study and revision

Today starts with your energy check-in and next main task. Pick a daily budget of 25, 45, 90 or 180 minutes; focus time counts against it. Task durations are rough planning estimates, not measured lesson lengths. The full daily plan and unfinished work remain available in expandable sections. One optional catch-up task is suggested when it fits after today's main work.

After ticking a problem, record the attempt: **Needed help**, **Solved independently**, or **Solved again on a later day**. Today brings these back for revision after 1, 7 or 30 days respectively. Same-day recall is disabled. Older solved problems without an assessment become due after 7 days. Unticking a problem clears its revision assessment.

Failed progress saves show a warning with retry and backup options. Keep the tab open and export before reloading. Today reminds you to back up weekly, and Settings records the last requested backup download; check that the file actually appears in your downloads. Existing version-1 backups remain supported.

## Run it on your computer

```bash
npm install
npm run dev
```

To check the notes' code blocks locally, make a Python virtual environment once (the backend notes need FastAPI, SQLAlchemy and pytest):

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements-notes.txt
```

## Before you push

```bash
npm run check
```

This runs lint, unit tests, the notes checker (runs every Python and SQL block in the notes and compares the output), the type check and the production build. GitHub Actions runs the same command and deploys to GitHub Pages on every push to `main`. A second workflow checks the resource links every week.

## Add a note

1. Copy `content/notes/_template.md` into the right section folder, for example `content/notes/c-data-structures/c-my-topic.md`. The file name must equal the `id`, and the `id` must start with the section letter.
2. Fill in the frontmatter (`id`, `title`, `level`, `phase`, `week`, `tags`, `estMinutes`) and the sections. The template explains the special blocks (`output`, `practice`, `explain`, `flashcards`, `sql`).
3. Put only real LeetCode slugs in `practice` blocks. A new slug must be added to `content/data/problems.json` and checked with `npm run problems`.
4. Run `npm run notes c-my-topic` until it says 0 failures, then `npm run check`.

## Edit the roadmap

Everything is in `content/data/roadmap.ts`:

- `WEEKS` is the list of 65 weeks. Each week has `learn` (spread over the week's days), `problems` (LeetCode slugs), `friday`, optional `extras` and a `checkpoint`.
- Link a note with `N('text', 'note-id')`, a resource with `R('text', 'resource-id')`, a page with `T('text', '/path')`, or plain text with `D('text')`.
- Add new items at the **end** of a list. Task ids come from positions, so inserting in the middle would move your ticks to other tasks.
- Behind schedule or ahead? Use **Plan dates** (Settings or the Roadmap page) to change the start date or move the plan a week. Never edit dates in code.

A test checks that every note the roadmap links to exists.

## Back up your progress

Progress lives only in this browser. Go to **Settings → Export** to download a JSON backup (do it every week, and before clearing the browser or changing phones). **Settings → Import** restores it on any device.

## Where things live

| What | Where |
| --- | --- |
| Study notes (Markdown) | `content/notes/<section>/*.md` |
| Patterns | `content/patterns/*.md` |
| Roadmap, resources, projects, quizzes, tips | `content/data/*.ts` |
| Verified LeetCode problems | `content/data/problems.json` |
| Pure logic (dates, streaks, XP, flashcards, backup) | `src/lib/` (with `*.test.ts` next to each file) |
| Pages | `src/pages/` |
| Notes checker, problem checker | `scripts/` |
