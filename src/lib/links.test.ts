// Every link inside the app must open a real page: roadmap links, resource ids,
// visualizer links, problem tag chips, and every page path written in the code.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TOTAL_WEEKS, WEEKS, type Learn } from '../../content/data/roadmap'
import { PROJECTS } from '../../content/data/projects'
import { resourceById } from '../../content/data/resources'
import { NAV } from '../app/nav'
import { NOTE_IDS, PATTERN_IDS } from './noteIndex'
import { PROBLEMS, TOPIC_NOTES, tagLink } from './problems'
import { TOTAL_MONTHS } from './plan'
import { VISUALIZERS } from './viz'
import { NOTES } from './notes'

const ROOT = join(__dirname, '../..')
const appSource = readFileSync(join(ROOT, 'src/app/App.tsx'), 'utf8')

/** True if the app has a page at this path (and the note/pattern/week behind it exists). */
function isPage(path: string) {
  const [, kind, id, extra] = path.split('/')
  if (NAV.some((n) => n.to === path)) return true
  if (['/patterns/cheatsheet', '/earning', '/games/pattern', '/games/bigo', '/games/order', '/more'].includes(path)) return appSource.includes(`path="${path}"`)
  if (kind === 'notes' && id && !extra) return NOTE_IDS.has(id)
  if (kind === 'patterns' && id && !extra) return PATTERN_IDS.has(id)
  if (kind === 'viz' && id && !extra) return VISUALIZERS.some((v) => v.id === id)
  if (kind === 'projects' && id && !extra) return PROJECTS.some((p) => p.id === id)
  if (kind === 'roadmap' && id === 'week') return Number(extra) >= 1 && Number(extra) <= TOTAL_WEEKS
  if (kind === 'checkpoint' && id && !extra) return Number(id) >= 1 && Number(id) <= TOTAL_MONTHS
  return false
}

describe('internal links', () => {
  it('the checker itself rejects broken paths', () => {
    for (const bad of ['/notes/no-such-note', '/patterns/basics', '/viz/nope', '/roadmap/week/66', '/checkpoint/16', '/nowhere']) expect(isPage(bad), bad).toBe(false)
    for (const good of ['/', '/performance', '/notes/l-sleep', '/patterns/graph-bfs', '/roadmap/week/65', '/checkpoint/15', '/games/bigo']) expect(isPage(good), good).toBe(true)
  })

  it('every roadmap item points to a real note, resource or page', () => {
    const items: Learn[] = WEEKS.flatMap((w) => [...w.learn, w.friday, ...(w.extras ?? [])])
    for (const l of items) {
      if (l.note) expect(NOTE_IDS.has(l.note), `note ${l.note}`).toBe(true)
      if (l.res) expect(resourceById(l.res), `resource ${l.res}`).toBeDefined()
      if (l.to) expect(isPage(l.to), `page ${l.to}`).toBe(true)
    }
  })

  it('every visualizer links to a real note or pattern', () => {
    for (const v of VISUALIZERS) {
      if (v.note) expect(NOTE_IDS.has(v.note), `${v.id} -> ${v.note}`).toBe(true)
      if (v.pattern) expect(PATTERN_IDS.has(v.pattern), `${v.id} -> ${v.pattern}`).toBe(true)
    }
  })

  it('every problem tag chip opens a pattern page or a topic note', () => {
    for (const note of Object.values(TOPIC_NOTES)) expect(NOTE_IDS.has(note), note).toBe(true)
    for (const tag of new Set(PROBLEMS.map((p) => p.tag))) {
      const to = tagLink(tag)
      expect(to, `tag "${tag}" has no page`).toBeDefined()
      expect(isPage(to!), to).toBe(true)
    }
  })

  it('every note links to a real roadmap week', () => {
    for (const n of NOTES) expect(n.week >= 1 && n.week <= TOTAL_WEEKS, `${n.id} week ${n.week}`).toBe(true)
  })

  it('every page path written in the code exists', () => {
    // Plain string paths like '/notes/l-sleep' or "/games/bigo" (not template strings with ${...}).
    const files: string[] = []
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f)
        if (statSync(p).isDirectory()) walk(p)
        else if (/\.(tsx?|md)$/.test(f) && !f.endsWith('.test.ts')) files.push(p)
      }
    }
    walk(join(ROOT, 'src'))
    walk(join(ROOT, 'content/data'))
    const found = new Set<string>()
    for (const f of files) {
      const text = readFileSync(f, 'utf8')
      for (const m of text.matchAll(/(?:to=|to: ?|href=)\{?["'`](\/[a-z0-9/-]*)["'`]/g)) found.add(m[1])
      for (const m of text.matchAll(/["'`](\/(?:notes|patterns|viz|projects|roadmap\/week|checkpoint)\/[a-z0-9-]+)["'`]/g)) found.add(m[1])
    }
    expect(found.size).toBeGreaterThan(20)
    for (const path of found) expect(isPage(path), path).toBe(true)
  })
})
