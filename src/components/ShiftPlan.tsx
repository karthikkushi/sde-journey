import { TOTAL_WEEKS } from '../../content/data/roadmap'
import { addDays, formatLong } from '../lib/dates'
import { weekStart } from '../lib/plan'
import { update, useProgress } from '../store/progress'

// "Add a few weeks, don't rush." Moves the whole plan later by N weeks.
export function ShiftPlan() {
  const shift = useProgress().shiftWeeks
  const end = addDays(weekStart(TOTAL_WEEKS, shift), 6)
  const set = (n: number) => update((p) => { p.shiftWeeks = Math.max(0, n) })

  return (
    <div className="card">
      <h2>Behind? Add a few weeks, don’t rush.</h2>
      <p className="muted small">
        This moves the whole plan later. Your ticks stay. Now: {shift} {shift === 1 ? 'week' : 'weeks'} added, plan ends {formatLong(end)}.
      </p>
      <div className="row">
        <button className="btn" onClick={() => set(shift - 1)} disabled={shift === 0}>− 1 week</button>
        <button className="btn" onClick={() => set(shift + 1)}>+ 1 week</button>
      </div>
    </div>
  )
}
