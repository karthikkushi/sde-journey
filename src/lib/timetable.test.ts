import { describe, expect, it } from 'vitest'
import { SATURDAY, SUNDAY, WEEKDAY } from '../../content/data/timetable'
import { blockAt, scheduleFor, toMinutes } from './timetable'

describe('timetable', () => {
  it('turns HH:MM into minutes', () => {
    expect(toMinutes('07:05')).toBe(425)
    expect(toMinutes('24:00')).toBe(1440)
  })
  it('finds the block running now', () => {
    expect(WEEKDAY[blockAt(WEEKDAY, toMinutes('07:30'))].label).toMatch(/DSA session 1/)
    expect(WEEKDAY[blockAt(WEEKDAY, toMinutes('20:25'))].label).toMatch(/DSA session 2/) // start is inclusive
    expect(WEEKDAY[blockAt(WEEKDAY, toMinutes('13:00'))].kind).toBe('work')
    expect(blockAt(WEEKDAY, toMinutes('05:00'))).toBe(-1) // still asleep
  })
  it('picks the right day', () => {
    expect(scheduleFor(6)).toBe(SATURDAY)
    expect(scheduleFor(0)).toBe(SUNDAY)
    expect(scheduleFor(3)).toBe(WEEKDAY)
  })
  it('blocks are in order with no gaps or overlaps', () => {
    for (const day of [WEEKDAY, SATURDAY, SUNDAY]) {
      for (let i = 1; i < day.length; i++) expect(day[i].from).toBe(day[i - 1].to)
    }
  })
})
