// Only the NAMES of the note files, not their text. Pages like Today use this to know
// whether a note exists, without downloading every note. (A note's file name is its id.)
const paths = Object.keys(import.meta.glob(['/content/notes/**/*.md', '!**/_*.md'], { query: '?raw' }))

export const NOTE_IDS = new Set(paths.map((p) => (p.split('/').pop() ?? '').replace(/\.md$/, '')))

export const noteExists = (id: string) => NOTE_IDS.has(id)

// Same for patterns: only the file names.
const patternPaths = Object.keys(import.meta.glob('/content/patterns/*.md', { query: '?raw' }))
export const PATTERN_IDS = new Set(patternPaths.map((p) => (p.split('/').pop() ?? '').replace(/\.md$/, '')))
