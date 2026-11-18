// Loads every note's FULL text at build time. Only tests and full-text search use this module;
// pages use notesIndex.ts (small index + one note at a time).
// To add a note: create a .md file with frontmatter. Nothing else to change.
import { byLearningOrder, cardsOf, toNote, type Flashcard, type Note } from './noteParse'
export { fencedBlocks, parseFrontmatter } from './markdown'
export { cardsOf, SECTIONS, type Flashcard, type Note, type NoteMeta } from './noteParse'

// Vite reads all the files and bundles their text (eager = no extra network request).
// Files starting with _ (like _template.md) are skipped.
const files = import.meta.glob(['/content/notes/**/*.md', '!**/_*.md'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>

export const NOTES: Note[] = Object.entries(files).map(([path, text]) => toNote(path, text)).sort(byLearningOrder)

const byId = new Map(NOTES.map((n) => [n.id, n]))
export const noteById = (id: string) => byId.get(id)

export const ALL_CARDS: Flashcard[] = NOTES.flatMap(cardsOf)
