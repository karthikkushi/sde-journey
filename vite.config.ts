/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'
import { byLearningOrder, cardsOf, toNote } from './src/lib/noteParse.ts'

// A small index of every note (title, level, week, tags, headings for search, flashcards),
// built from content/notes at build time. Pages use it instead of downloading every note;
// a note's full text loads only when you open it (src/lib/notesIndex.ts).
function notesIndex(): Plugin {
  const ID = 'virtual:notes-index'
  const dir = resolve(import.meta.dirname, 'content/notes')
  return {
    name: 'notes-index',
    resolveId: (id) => (id === ID ? `\0${ID}` : undefined),
    load(id) {
      if (id !== `\0${ID}`) return
      const files = (readdirSync(dir, { recursive: true }) as string[])
        .filter((f) => f.endsWith('.md') && !f.split('/').pop()!.startsWith('_'))
      for (const f of files) this.addWatchFile(resolve(dir, f)) // rebuild the index when a note changes (dev)
      const notes = files.map((f) => toNote(`/content/notes/${f}`, readFileSync(resolve(dir, f), 'utf8'))).sort(byLearningOrder)
      const list = notes.map(({ body, ...meta }) => ({
        ...meta,
        search: [meta.title, ...meta.tags, ...body.split('\n').filter((l: string) => l.startsWith('#'))].join(' ').toLowerCase(),
      }))
      return `export default ${JSON.stringify({ notes: list, cards: notes.flatMap(cardsOf) })}`
    },
  }
}

// The site lives at https://karthikkushi.github.io/sde-journey/
// so every file path must start with /sde-journey/.
export default defineConfig({
  base: '/sde-journey/',
  plugins: [
    react(),
    notesIndex(),
    // Makes the site installable on a phone and usable offline.
    // The service worker caches every built file, so all pages and notes work without internet.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'SDE Journey',
        short_name: 'SDE Journey',
        description: '15-month study plan: Python, DSA, backend, interviews.',
        theme_color: '#090b0c',
        background_color: '#090b0c',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Notes are bundled into JS, so the bundle can be big. Allow up to 5 MB per file.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  build: {
    // The "notes" chunk is the text of every note (for search and offline use). It loads only
    // on note pages and is cached once, so its size is expected. Code chunks stay far below this.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
