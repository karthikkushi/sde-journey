import { describe, expect, it } from 'vitest'
import { ALL_CARDS as FULL_CARDS, NOTES } from './notes'
import { ALL_CARDS, loadNote, NOTE_LIST } from './notesIndex'

// The small index (built at build time) must match what the full notes contain.
describe('notes index', () => {
  it('lists every note, in the same order, with the same details', () => {
    expect(NOTE_LIST.map((n) => n.id)).toEqual(NOTES.map((n) => n.id))
    for (const [i, n] of NOTES.entries()) {
      const { body: _body, ...meta } = n
      expect(NOTE_LIST[i]).toMatchObject(meta)
    }
  })
  it('has the same flashcards', () => {
    expect(ALL_CARDS).toEqual(FULL_CARDS)
  })
  it('loads one note with its full text, and nothing for an unknown id', async () => {
    expect((await loadNote('m-loss'))?.body).toContain('## What it is')
    expect(await loadNote('no-such-note')).toBeUndefined()
  })
})
