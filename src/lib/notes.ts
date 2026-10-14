// Loads every note from content/notes/**/*.md at build time.
// To add a note: create a .md file with frontmatter. Nothing else to change.

export type NoteMeta = {
  id: string
  title: string
  level: 'basic' | 'core' | 'advanced'
  section: string // A..L, from the folder name
  phase: number
  week: number
  tags: string[]
  estMinutes: number
}
export type Note = NoteMeta & { body: string }

// Vite reads all the files and bundles their text (eager = no extra network request).
// Files starting with _ (like _template.md) are skipped.
const files = import.meta.glob(['/content/notes/**/*.md', '!**/_*.md'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>

/**
 * Split "---\nkey: value\n---\nbody" into fields and body.
 * Supports `key: value` and `key: [a, b, c]`, which is all our notes use.
 */
export function parseFrontmatter(text: string): { data: Record<string, string | string[]>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) return { data: {}, body: text }
  const data: Record<string, string | string[]> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(':')
    if (i < 0) continue
    const key = line.slice(0, i).trim()
    const raw = line.slice(i + 1).trim()
    data[key] = raw.startsWith('[') && raw.endsWith(']')
      ? raw.slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean)
      : raw.replace(/^["']|["']$/g, '')
  }
  return { data, body: text.slice(match[0].length) }
}

function toNote(path: string, text: string): Note {
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

export const NOTES: Note[] = Object.entries(files)
  .map(([path, text]) => toNote(path, text))
  .sort((a, b) => a.id.localeCompare(b.id))

const byId = new Map(NOTES.map((n) => [n.id, n]))
export const noteById = (id: string) => byId.get(id)

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
}

/** The text inside every ```name fenced block of a note. */
export function fencedBlocks(body: string, name: string) {
  const re = new RegExp('^```' + name + '\\s*\\n([\\s\\S]*?)^```', 'gm')
  return [...body.matchAll(re)].map((m) => m[1])
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

export const ALL_CARDS: Flashcard[] = NOTES.flatMap(cardsOf)
