# SDE Journey

A personal 15-month study site: Python basics → DSA → backend → system design → interviews.

Live: https://karthikkushi.github.io/sde-journey/

- Works offline and installs on a phone (PWA).
- All progress is saved in the browser. Use **Settings → Export** to back it up.
- No login, no backend, no paid services.

## Run it on your computer

```bash
npm install
npm run dev
```

## Before you push

```bash
npm run check
```

This runs lint, unit tests, type check and the production build. GitHub Actions runs the same command and deploys to GitHub Pages on every push to `main`.

## Where things live

| What | Where |
| --- | --- |
| Study notes (Markdown) | `content/notes/<section>/*.md` |
| Roadmap, resources, patterns, projects, quizzes, tips | `content/data/*.ts` |
| Pure logic (dates, streaks, XP, flashcards, backup) | `src/lib/` (with `*.test.ts` next to each file) |
| Pages | `src/pages/` |
