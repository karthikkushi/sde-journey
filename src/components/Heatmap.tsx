import { useEffect, useRef } from 'react'
import { TOTAL_WEEKS } from '../../content/data/roadmap'
import { addDays, DAY_NAMES, dayOfWeek, daysBetween, formatDate, todayIST } from '../lib/dates'
import { heatLevel } from '../lib/focus'

const CELL = 12 // 10px square + 2px gap
const TOP = 16 // room for month labels
const LEFT = 26 // room for day labels

/**
 * GitHub-style heatmap of focus minutes for the whole plan.
 * One column per plan week, one square per day. If you logged focus before the plan
 * start (for example after moving the plan later), the map starts early enough to show it.
 */
export function Heatmap({ minutes, start }: { minutes: Record<string, number>; start: string }) {
  const earliest = Object.keys(minutes).sort()[0]
  const earlyWeeks = earliest && earliest < start ? Math.ceil(daysBetween(earliest, start) / 7) : 0
  const from = addDays(start, -7 * earlyWeeks)
  const weeks = TOTAL_WEEKS + earlyWeeks
  const rowNames = Array.from({ length: 7 }, (_, d) => (d % 2 ? '' : DAY_NAMES[(dayOfWeek(from) + d) % 7]))
  const today = todayIST()
  const scroller = useRef<HTMLDivElement>(null)

  // Scroll the map (not the page) so this week is in the middle. The map is wider than a phone.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = LEFT + Math.floor(daysBetween(from, today) / 7) * CELL - el.clientWidth / 2
  }, [from, today])

  const cells = []
  const monthLabels = []
  for (let w = 0; w < weeks; w++) {
    const first = addDays(from, w * 7)
    // Label a column when a new calendar month starts inside it.
    if (w === 0 || first.slice(5, 7) !== addDays(first, -7).slice(5, 7)) {
      const name = new Date(first + 'T00:00:00Z').toLocaleDateString('en-IN', { month: 'short', timeZone: 'UTC' })
      monthLabels.push(<text key={w} x={LEFT + w * CELL} y={10} className="hm-label">{name}</text>)
    }
    for (let d = 0; d < 7; d++) {
      const date = addDays(first, d)
      const min = minutes[date] ?? 0
      cells.push(
        <rect
          key={date}
          x={LEFT + w * CELL}
          y={TOP + d * CELL}
          width={10}
          height={10}
          rx={2}
          className={`hm-${heatLevel(min)}${date === today ? ' hm-today' : ''}`}
        >
          <title>{`${formatDate(date)}: ${min} min`}</title>
        </rect>,
      )
    }
  }

  return (
    <div className="heatmap" ref={scroller}>
      <svg width={LEFT + weeks * CELL} height={TOP + 7 * CELL} role="img" aria-label="Focus minutes per day heatmap">
        {monthLabels}
        {rowNames.map((n, d) => n && <text key={n} x={0} y={TOP + d * CELL + 9} className="hm-label">{n}</text>)}
        {cells}
      </svg>
    </div>
  )
}
