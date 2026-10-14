import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { BIG_O_QUESTIONS, ORDER_PUZZLES, PATTERN_QUESTIONS } from '../../content/data/games'
import { PATTERNS } from './patterns'

describe('game content', () => {
  it('Pattern Guess covers every pattern, and only real ones', () => {
    const ids = new Set(PATTERNS.map((p) => p.id))
    for (const [id] of PATTERN_QUESTIONS) expect(ids.has(id), id).toBe(true)
    for (const id of ids) expect(PATTERN_QUESTIONS.some(([q]) => q === id), `no question for ${id}`).toBe(true)
  })

  it('every Big-O answer is one of its options', () => {
    for (const q of BIG_O_QUESTIONS) expect(q.options).toContain(q.answer)
  })

  it('every Code Order solution is correct Python (run for real)', () => {
    for (const p of ORDER_PUZZLES) {
      const code = `${p.lines.join('\n')}\n${p.check}\n`
      // Throws (and fails the test) if Python exits with an error or an assert fails.
      expect(() => execFileSync('python3', ['-c', code], { stdio: 'pipe' }), p.title).not.toThrow()
    }
  })
})
