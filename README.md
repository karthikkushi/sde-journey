# SDE Journey

A personal 15-month study site: Python basics → DSA → backend → system design → interviews.

Live: https://karthikkushi.github.io/sde-journey/

- Works offline and installs on a phone (PWA).
- All progress is saved in the browser. Back it up regularly (see below).
- No login, no backend, no paid services.

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
- Behind schedule? Use **Shift plan** on the Roadmap page instead of editing dates.

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
