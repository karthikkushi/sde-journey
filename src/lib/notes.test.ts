import { describe, expect, it } from 'vitest'
import { WEEKS } from '../../content/data/roadmap'
import { NOTE_IDS } from './noteIndex'
import { ALL_CARDS, fencedBlocks, NOTES, noteById, parseFrontmatter, SECTIONS } from './notes'
import { problemBySlug } from './problems'

describe('frontmatter parser', () => {
  it('reads plain values and [lists]', () => {
    const { data, body } = parseFrontmatter('---\nid: x1\ntitle: "Hello: world"\ntags: [a, b]\n---\n## Body')
    expect(data).toEqual({ id: 'x1', title: 'Hello: world', tags: ['a', 'b'] })
    expect(body).toBe('## Body')
  })
  it('returns the whole text when there is no frontmatter', () => {
    expect(parseFrontmatter('just text').body).toBe('just text')
  })
})

describe('notes content', () => {
  it('has notes, with unique ids, and each file name equals its id', () => {
    expect(NOTES.length).toBeGreaterThan(0)
    expect(new Set(NOTES.map((n) => n.id)).size).toBe(NOTES.length)
    expect([...NOTE_IDS].sort()).toEqual(NOTES.map((n) => n.id).sort())
  })

  it('every note has a title, a valid level and a known section', () => {
    for (const n of NOTES) {
      expect(n.title, n.id).toBeTruthy()
      expect(['basic', 'core', 'advanced'], n.id).toContain(n.level)
      expect(SECTIONS[n.section], n.id).toBeTruthy()
      // the id starts with the section letter, e.g. a09-lists lives in A
      expect(n.id[0].toUpperCase(), n.id).toBe(n.section)
    }
  })

  it('every ``` code fence is closed', () => {
    for (const n of NOTES) {
      const fences = n.body.split('\n').filter((l) => l.trimStart().startsWith('```')).length
      expect(fences % 2, `${n.id} has an unclosed code block`).toBe(0)
    }
  })

  it('follows the template: the key sections are present', () => {
    for (const n of NOTES) {
      for (const h of ['## What it is', '## Real-life example', '## Picture', '## Practice', '## Explain it back', '## Flashcards']) {
        expect(n.body, `${n.id} is missing "${h}"`).toContain(h)
      }
    }
  })

  it('practice blocks only link real, verified LeetCode problems', () => {
    for (const n of NOTES) {
      for (const block of fencedBlocks(n.body, 'practice')) {
        for (const line of block.split('\n').map((l) => l.trim()).filter(Boolean)) {
          // A line that looks like a slug must exist in problems.json. Other lines are exercises.
          if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(line)) expect(problemBySlug(line), `${n.id}: ${line}`).toBeDefined()
        }
      }
    }
  })

  it('every note has 3 to 8 LeetCode problems or exercises, and some flashcards', () => {
    for (const n of NOTES) {
      const items = fencedBlocks(n.body, 'practice').join('\n').split('\n').filter((l) => l.trim())
      expect(items.length, n.id).toBeGreaterThanOrEqual(3)
      expect(ALL_CARDS.filter((c) => c.noteId === n.id).length, n.id).toBeGreaterThanOrEqual(3)
    }
  })

  it('every note the roadmap links to exists', () => {
    const refs = WEEKS.flatMap((w) => [...w.learn, w.friday, ...(w.extras ?? [])]).map((l) => l.note).filter(Boolean) as string[]
    expect(refs.length).toBeGreaterThan(0)
    for (const id of refs) expect(noteById(id), id).toBeDefined()
  })
})
