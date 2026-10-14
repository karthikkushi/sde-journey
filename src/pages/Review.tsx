import { useState } from 'react'
import { TOTAL_WEEKS } from '../../content/data/roadmap'
import { formatDate, todayIST } from '../lib/dates'
import { planStartOf, position } from '../lib/plan'
import { REVIEW_FIELDS, weekStats } from '../lib/review'
import { update, useProgress } from '../store/progress'

// Sunday review form. One saved review per plan week, plus a history.
export function Review() {
  const p = useProgress()
  const pos = position(todayIST(), planStartOf(p))
  const current = pos.status === 'during' ? pos.week : pos.status === 'after' ? TOTAL_WEEKS : 1
  const [week, setWeek] = useState(current)
  const stats = weekStats(p, week)
  const answers = p.weekly[String(week)] ?? {}

  // Hints from your logs, shown under the matching question.
  const hints: Record<string, string> = {
    solved: `From your log: ${stats.solved} problems ticked this week.`,
    focus: `From your log: ${stats.focusHours} hours.`,
    exercise: `From your log: ${stats.exerciseDays} days ticked.`,
    energy: `Check-ins: ${stats.energy.fresh} fresh, ${stats.energy.tired} tired, ${stats.energy.low} very low.`,
  }

  function setAnswer(key: string, value: string) {
    update((d) => {
      const w = (d.weekly[String(week)] ??= {})
      if (value) w[key] = value
      else delete w[key]
      if (Object.keys(w).length === 0) delete d.weekly[String(week)]
    })
  }

  const history = Object.keys(p.weekly).map(Number).sort((a, b) => b - a)

  return (
    <section className="page">
      <h1>Weekly review</h1>
      <div className="card row" style={{ justifyContent: 'space-between' }}>
        <button className="btn" onClick={() => setWeek((w) => Math.max(1, w - 1))} disabled={week <= 1} aria-label="Previous week">←</button>
        <div style={{ textAlign: 'center' }}>
          <strong>Week {week}</strong>
          <div className="muted small">{formatDate(stats.first)} – {formatDate(stats.last)}</div>
        </div>
        <button className="btn" onClick={() => setWeek((w) => Math.min(TOTAL_WEEKS, w + 1))} disabled={week >= TOTAL_WEEKS} aria-label="Next week">→</button>
      </div>

      <div className="card stack">
        {REVIEW_FIELDS.map((f) => (
          <label key={f.key} className="stack" style={{ gap: 4 }}>
            <strong>{f.label}</strong>
            {hints[f.key] && <span className="muted small">{hints[f.key]}</span>}
            <textarea className="input" rows={2} value={answers[f.key] ?? ''} onChange={(e) => setAnswer(f.key, e.target.value)} />
          </label>
        ))}
        <p className="muted small" style={{ margin: 0 }}>Saved as you type. A saved review gives +30 XP.</p>
      </div>

      {history.length > 0 && (
        <div className="card">
          <h2>History</h2>
          {history.map((w) => (
            <details key={w} className="history">
              <summary>Week {w}{p.weekly[String(w)].change && <span className="muted"> · change: {p.weekly[String(w)].change}</span>}</summary>
              <dl>
                {REVIEW_FIELDS.filter((f) => p.weekly[String(w)][f.key]).map((f) => (
                  <div key={f.key}>
                    <dt className="muted small">{f.label}</dt>
                    <dd>{p.weekly[String(w)][f.key]}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      )}
    </section>
  )
}
