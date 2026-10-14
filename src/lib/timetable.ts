import { SATURDAY, SUNDAY, WEEKDAY, type Block } from '../../content/data/timetable'

/** "07:05" -> 425 (minutes since midnight). */
export const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))

/** Index of the block running at `minutes`, or -1 if none (for example, before waking up). */
export const blockAt = (blocks: Block[], minutes: number) =>
  blocks.findIndex((b) => minutes >= toMinutes(b.from) && minutes < toMinutes(b.to))

/** Which plan to show for a day of the week (0 = Sunday). */
export const scheduleFor = (dow: number) => (dow === 6 ? SATURDAY : dow === 0 ? SUNDAY : WEEKDAY)
