// What pages use for notes: a small index (built at build time, see vite.config.ts),
// plus one note's full text, downloaded only when you open it.
// @ts-expect-error: a virtual module made by the notes-index plugin in vite.config.ts (typed just below)
import raw from 'virtual:notes-index'
import { toNote, type Flashcard, type Note, type NoteMeta } from './noteParse'
export { SECTIONS } from './noteParse'

const index = raw as { notes: (NoteMeta & { search: string })[]; cards: Flashcard[] }

export const NOTE_LIST = index.notes
const byId = new Map(NOTE_LIST.map((n) => [n.id, n]))
export const noteMeta = (id: string) => byId.get(id)

export const ALL_CARDS: Flashcard[] = index.cards

// Each note is its own small file in the build. Vite makes one loader per note.
const loaders = import.meta.glob(['/content/notes/**/*.md', '!**/_*.md'], { query: '?raw', import: 'default' }) as Record<string, () => Promise<string>>
const pathOf = new Map(Object.keys(loaders).map((p) => [(p.split('/').pop() ?? '').replace(/\.md$/, ''), p]))

/** The full note (with its text), or undefined if there is no such note. */
export async function loadNote(id: string): Promise<Note | undefined> {
  const path = pathOf.get(id)
  return path ? toNote(path, await loaders[path]()) : undefined
}
