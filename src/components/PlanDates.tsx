import { addDays, formatLong } from '../lib/dates'
import { planEnd, planStartOf } from '../lib/plan'
import { update, useProgress } from '../store/progress'

// Your plan's dates. Day 1 is the day you first opened the app; change it any time.
// Moving the plan keeps every tick, because tasks are saved by name, not by date.
export function PlanDates() {
  const start = planStartOf(useProgress())
  const setStart = (date: string) => update((p) => { p.startDate = date })

  return (
    <div className="card">
      <h2>Plan dates</h2>
      <p className="muted small">
        Started {formatLong(start)}, ends {formatLong(planEnd(start))}. Lost days to an emergency, or racing ahead?
        Move the whole plan. Your ticks stay.
      </p>
      <label className="row small">
        Start date
        <input className="input" type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} />
      </label>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn" onClick={() => setStart(addDays(start, -7))}>1 week earlier</button>
        <button className="btn" onClick={() => setStart(addDays(start, 7))}>1 week later</button>
      </div>
    </div>
  )
}
