import { Link } from 'react-router'
import { PHASES, TOTAL_WEEKS, WEEKS } from '../../content/data/roadmap'
import { Bar } from '../components/Bar'
import { PlanDates } from '../components/PlanDates'
import { addDays, formatDate, todayIST } from '../lib/dates'
import { buildWeek, doneShare, monthOfWeek, planStartOf, position, TOTAL_MONTHS, weekStart, type Task } from '../lib/plan'
import { useProgress } from '../store/progress'

// Timeline: phases at the top, then months, then weeks. Days are on each week's page.
export function Roadmap() {
  const p = useProgress()
  const start = planStartOf(p)
  const pos = position(todayIST(), start)
  const currentWeek = pos.status === 'during' ? pos.week : 0
  const currentMonth = currentWeek ? monthOfWeek(currentWeek) : 1

  // Tasks of every week, built once per render.
  const tasksByWeek = new Map<number, Task[]>(WEEKS.map((w) => [w.n, buildWeek(w, start).flatMap((d) => d.tasks)]))
  const share = (weeks: number[]) => doneShare(weeks.flatMap((n) => tasksByWeek.get(n) ?? []), p.done)
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
  const allWeeks = range(1, TOTAL_WEEKS)

  return (
    <section className="page">
      <h1>Roadmap</h1>
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong>Whole plan</strong>
          <span className="muted small">{Math.round(share(allWeeks) * 100)}%</span>
        </div>
        <Bar share={share(allWeeks)} label="Whole plan progress" />
        {currentWeek > 0 && (
          <Link className="btn primary" style={{ marginTop: 12 }} to={`/roadmap/week/${currentWeek}`}>Go to this week (week {currentWeek})</Link>
        )}
      </div>

      <h2>Phases</h2>
      <div className="stack">
        {PHASES.map((ph) => (
          <div key={ph.n} className="card">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>Phase {ph.n} · {ph.name}</strong>
              <span className="muted small">Weeks {ph.from}–{ph.to}</span>
            </div>
            <p className="muted small" style={{ margin: '4px 0 8px' }}>{ph.summary}</p>
            <Bar share={share(range(ph.from, ph.to))} label={`Phase ${ph.n} progress`} />
          </div>
        ))}
      </div>

      <h2>Months and weeks</h2>
      <div className="stack">
        {range(1, TOTAL_MONTHS).map((m) => {
          const weeks = allWeeks.filter((n) => monthOfWeek(n) === m)
          return (
            <details key={m} className="card month" open={m === currentMonth}>
              <summary>
                <div className="row" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <strong>Month {m}</strong>
                  <span className="muted small">Weeks {weeks[0]}–{weeks.at(-1)} · {Math.round(share(weeks) * 100)}%</span>
                </div>
                <Bar share={share(weeks)} label={`Month ${m} progress`} />
              </summary>
              <ul className="week-list">
                {weeks.map((n) => {
                  const first = weekStart(n, start)
                  const s = doneShare(tasksByWeek.get(n) ?? [], p.done)
                  return (
                    <li key={n}>
                      <Link to={`/roadmap/week/${n}`} className={`week-row${n === currentWeek ? ' is-now' : ''}`}>
                        <span className="week-n">W{n}</span>
                        <span className="week-body">
                          <span>{WEEKS[n - 1].title}</span>
                          <span className="muted small">
                            {formatDate(first)} – {formatDate(addDays(first, 6))}
                            {n === currentWeek && ' · this week'}
                          </span>
                          <Bar share={s} label={`Week ${n} progress`} />
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
              <Link className="btn" to={`/checkpoint/${m}`}>Month {m} checkpoint</Link>
            </details>
          )
        })}
      </div>

      <PlanDates />
    </section>
  )
}
