// Loads the DSA pattern pages from content/patterns/*.md.
// Each pattern's problem list comes from problems.json (problems tagged with the pattern id),
// so every link is a verified LeetCode problem.
import { fencedBlocks, parseFrontmatter } from './notes'
import { PROBLEMS, type Problem } from './problems'

export type Pattern = { id: string; name: string; group: string; clues: string[]; body: string }

const files = import.meta.glob('/content/patterns/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

// The order of groups on the Patterns page (roughly the order you learn them).
export const GROUPS = [
  'Arrays and hashing', 'Two pointers', 'Sliding window', 'Binary search', 'Stacks and queues', 'Linked lists',
  'Trees', 'Heaps', 'Backtracking', 'Graphs', 'Intervals and greedy', 'Dynamic programming', 'Bits',
]

export const PATTERNS: Pattern[] = Object.values(files)
  .map((text) => {
    const { data, body } = parseFrontmatter(text)
    return {
      id: String(data.id),
      name: String(data.name),
      group: String(data.group),
      clues: (fencedBlocks(body, 'clues')[0] ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
      // The clues are shown as a list by the page, so drop the raw block from the body.
      body: body.replace(/```clues[\s\S]*?```\n?/, ''),
    }
  })
  .sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group))

const byId = new Map(PATTERNS.map((p) => [p.id, p]))
export const patternById = (id: string) => byId.get(id)

const RANK = { Easy: 0, Medium: 1, Hard: 2 }

/** Problems tagged with this pattern (or topic), easy first. */
export const problemsFor = (tag: string, limit = 10): Problem[] =>
  PROBLEMS.filter((p) => p.tag === tag)
    .sort((a, b) => RANK[a.difficulty] - RANK[b.difficulty])
    .slice(0, limit)
