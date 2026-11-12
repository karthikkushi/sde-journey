import { addDays, formatLong } from '../lib/dates'
import { hasStarted, planEnd, planStartOf } from '../lib/plan'
import { update, useProgress } from '../store/progress'

// Your plan's dates. Day 1 is the day you tick your first task (until then, today); change it any time.
// Moving the plan keeps every tick, because tasks are saved by name, not by date.
export function PlanDates() {
  const progress = useProgress()
  const start = planStartOf(progress)
  const started = hasStarted(progress.done)
  const setStart = (date: string) => update((p) => { p.startDate = date })

  return (
    <div className="card">
      <h2>Plan dates</h2>
      <p className="muted small">
        {started ? (
          <>Started {formatLong(start)}, ends {formatLong(planEnd(start))}. Lost days to an emergency, or racing ahead?
          Move the whole plan. Your ticks stay.</>
        ) : (
          <>Starts {formatLong(start)}, ends {formatLong(planEnd(start))}. You haven’t ticked a task yet. Until you do,
          a start day in the past moves to today, so you can’t fall behind before you begin. Want to start later? Pick the day here.</>
        )}
      </p>
      <label className="row small">
        Start date
        <input className="input" type="date" value={start} onChange={(e) => e.target.value && setStart(e.target.value)} />
      </label>
      <div className="row" style={{ marginTop: 12 }}>
        {started && <button className="btn" onClick={() => setStart(addDays(start, -7))}>1 week earlier</button>}
        <button className="btn" onClick={() => setStart(addDays(start, 7))}>1 week later</button>
      </div>
    </div>
  )
}
