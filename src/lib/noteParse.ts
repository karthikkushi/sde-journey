// Pure note helpers: no Vite features, so both the app and the build step (vite.config.ts) can use them.
import { fencedBlocks, parseFrontmatter } from './markdown.ts'

export type NoteMeta = {
  id: string
  title: string
  level: 'basic' | 'core' | 'advanced'
  section: string // A..M, from the folder name
  phase: number
  week: number
  tags: string[]
  estMinutes: number
}
export type Note = NoteMeta & { body: string }

export function toNote(path: string, text: string): Note {
  const { data, body } = parseFrontmatter(text)
  const str = (k: string) => (typeof data[k] === 'string' ? (data[k] as string) : '')
  const folder = path.split('/').at(-2) ?? '' // e.g. "a-python"
  return {
    id: str('id') || (path.split('/').pop() ?? '').replace(/\.md$/, ''),
    title: str('title'),
    level: (str('level') || 'basic') as Note['level'],
    section: folder.charAt(0).toUpperCase(),
    phase: Number(str('phase')) || 1,
    week: Number(str('week')) || 0,
    tags: Array.isArray(data.tags) ? data.tags : [],
    estMinutes: Number(str('estMinutes')) || 10,
    body,
  }
}

/** Learning order: by section, then by the roadmap week the note belongs to. */
export const byLearningOrder = (a: NoteMeta, b: NoteMeta) => a.section.localeCompare(b.section) || a.week - b.week || a.id.localeCompare(b.id)

export const SECTIONS: Record<string, string> = {
  A: 'Python foundations',
  B: 'Complexity',
  C: 'Data structures',
  D: 'Techniques',
  E: 'SQL',
  F: 'Backend engineering',
  G: 'CS fundamentals',
  H: 'OOP and low-level design',
  I: 'System design',
  J: 'AI engineering',
  K: 'Interview skills',
  L: 'Learning skills',
  M: 'Machine learning basics',
}

export type Flashcard = { id: string; noteId: string; front: string; back: string }

/** Flashcards are written in a note as  ```flashcards  blocks, one "front :: back" per line. */
export function cardsOf(note: Note): Flashcard[] {
  return fencedBlocks(note.body, 'flashcards')
    .flatMap((block) => block.split('\n'))
    .filter((line) => line.includes('::'))
    .map((line, i) => {
      const [front, back] = line.split('::').map((s) => s.trim())
      return { id: `${note.id}:${i}`, noteId: note.id, front, back }
    })
}
