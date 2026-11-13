// Small markdown helpers, kept apart from notes.ts so pages that use them
// don't download every note.

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

/** The text inside every ```name fenced block of a note. */
export function fencedBlocks(body: string, name: string) {
  const re = new RegExp('^```' + name + '\\s*\\n([\\s\\S]*?)^```', 'gm')
  return [...body.matchAll(re)].map((m) => m[1])
}
