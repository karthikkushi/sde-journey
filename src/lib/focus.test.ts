import { describe, expect, it } from 'vitest'
import { breakMinutes, clock, heatLevel, minutesSpent, msLeft, presetById, type Session } from './focus'

const base: Session = { phase: 'focus', preset: '45/10', endsAt: 1_000_000, blocks: 0, task: 'x', activity: 0 }

describe('focus timer', () => {
  it('short break after blocks 1 and 2, long break after block 3', () => {
    const p = presetById('45/10')
    expect(breakMinutes(1, p)).toBe(10)
    expect(breakMinutes(2, p)).toBe(10)
    expect(breakMinutes(3, p)).toBe(20)
    expect(breakMinutes(4, p)).toBe(10)
    expect(breakMinutes(6, p)).toBe(20)
  })
  it('falls back to 45/10 for an unknown preset', () => {
    expect(presetById('nope').id).toBe('45/10')
  })
  it('time left comes from the end time, or the paused value', () => {
    expect(msLeft(base, 1_000_000 - 5000)).toBe(5000)
    expect(msLeft(base, 2_000_000)).toBe(0) // never negative
    expect(msLeft({ ...base, pausedLeft: 1234 }, 0)).toBe(1234)
  })
  it('counts whole minutes spent when a block is stopped early', () => {
    // 45 min block with 30 min 30 s left -> 14 full minutes spent
    expect(minutesSpent({ ...base, pausedLeft: 30.5 * 60_000 }, 0)).toBe(14)
  })
  it('formats the clock', () => {
    expect(clock(45 * 60_000)).toBe('45:00')
    expect(clock(125_000)).toBe('02:05')
    expect(clock(400)).toBe('00:01') // round up so it never shows 00:00 early
  })
  it('heatmap levels', () => {
    expect([0, 10, 45, 90, 135, 300].map(heatLevel)).toEqual([0, 1, 2, 3, 4, 4])
  })
})
