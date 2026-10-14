import { useMemo } from 'react'
import { Link } from 'react-router'
import { Bar } from '../components/Bar'
import { BarChart, BarRows, LineChart } from '../components/Charts'
import { formatLong, todayIST } from '../lib/dates'
import {
  cardStats, energyStats, gameStats, habitStats, insights, problemStats, problemsVsPlan, projectedEnd, tagName,
  weekdayActivity, weeklyTrend, type Insight,
} from '../lib/performance'
import { paceOf, planEnd, planStartOf, type Pace } from '../lib/plan'
import { keptDays, streakOf } from '../lib/streak'
import { useProgress } from '../store/progress'

const paceText = (pace: Pace) =>
  pace.status === 'behind' ? `${pace.days} ${pace.days === 1 ? 'day' : 'days'} behind`
    : pace.status === 'ahead' ? `${pace.days} ${pace.days === 1 ? 'day' : 'days'} ahead`
      : pace.status === 'finished' ? 'Finished' : pace.status === 'not-started' ? 'Not started' : 'On track'

// Everything here is worked out from what you tick, time and check in. Nothing leaves this device.
export function Performance() {
  const p = useProgress()
  const today = todayIST()
  const start = planStartOf(p)

  const data = useMemo(() => ({
    pace: paceOf(p.done, start, today),
    end: projectedEnd(p, today),
    trend: weeklyTrend(p, today),
    weekdays: weekdayActivity(p, today),
    problems: problemStats(p),
    vsPlan: problemsVsPlan(p, today),
    habits: habitStats(p, today),
    energy: energyStats(p, today),
    cards: cardStats(p),
    patternGame: gameStats(p, 'pattern'),
    bigoGame: gameStats(p, 'bigo'),
    advice: insights(p, today),
  }), [p, start, today])

  const { pace, end, trend, weekdays, problems, vsPlan, habits, energy, cards, patternGame, bigoGame, advice } = data
  const focusHours = Math.round(Object.values(p.focus).reduce((a, b) => a + b, 0) / 6) / 10
  const late = end && end > planEnd(start)
  const noAdvice = !advice.strengths.length && !advice.weaknesses.length && !advice.actions.length

  return (
    <section className="page">
      <h1>Performance</h1>
      <p className="muted" style={{ margin: 0 }}>
        Worked out from what you tick, the minutes you log for problems, focus time and energy check-ins. It gets sharper every week.
      </p>

      {/* Overview */}
      <div className="perf-grid">
        <div className="stat"><strong>{Math.round((pace.done / pace.total) * 100)}%</strong><span className="muted small">of the plan done</span></div>
        <div className="stat"><strong className={pace.status === 'behind' && pace.days >= 3 ? 'warn-text' : ''}>{paceText(pace)}</strong><span className="muted small">pace</span></div>
        <div className="stat"><strong>{problems.solved}</strong><span className="muted small">problems solved</span></div>
        <div className="stat"><strong>{focusHours}</strong><span className="muted small">focus hours</span></div>
        <div className="stat"><strong>{keptDays(p).size}</strong><span className="muted small">study days</span></div>
        <div className="stat"><strong>{streakOf(p, today)}</strong><span className="muted small">day streak</span></div>
      </div>
      <div className="card">
        <Bar share={pace.done / pace.total} label="Whole plan progress" />
        <p className="small" style={{ margin: 0 }}>
          Plan: {formatLong(start)} to {formatLong(planEnd(start))}.{' '}
          {end ? <>At your speed over the last 4 weeks you finish around <strong className={late ? 'warn-text' : ''}>{formatLong(end)}</strong>.</> : 'Tick a few tasks to see your projected finish date.'}
        </p>
      </div>

      {/* Advice */}
      {noAdvice ? (
        <div className="card">
          <h2>Strengths and weak spots</h2>
          <p className="muted small" style={{ margin: 0 }}>
            Not enough data yet. Keep ticking tasks, type the minutes you took for each solved problem, use the focus timer and check in your energy.
            After about a week this section shows what you are good at and what needs care.
          </p>
        </div>
      ) : (
        <>
          <InsightCard title="Strengths" items={advice.strengths} empty="Strengths show up as the weeks go by." />
          <InsightCard title="Weak spots" items={advice.weaknesses} empty="No weak spots found right now. Nice." warn />
          <InsightCard title="What to do next" items={advice.actions} empty="Keep following the plan." />
        </>
      )}

      {/* Weekly trend */}
      <div className="card">
        <h2>Last {trend.length} {trend.length === 1 ? 'week' : 'weeks'}</h2>
        {trend.length ? (
          <>
            <h3 className="small muted">Tasks and problems ticked</h3>
            <BarChart data={trend.map((w) => ({ label: `W${w.week}`, value: w.tasks }))} label="Tasks ticked per week" />
            <h3 className="small muted">Focus minutes</h3>
            <BarChart data={trend.map((w) => ({ label: `W${w.week}`, value: w.focusMin }))} label="Focus minutes per week" />
          </>
        ) : <p className="muted small">The plan has not started yet.</p>}
      </div>

      {/* Problems vs plan */}
      <div className="card">
        <h2>Problems: solved vs planned</h2>
        {vsPlan.some((w) => w.planned || w.solved) ? (
          <LineChart
            label="Problems solved and planned, by week"
            labels={vsPlan.map((w) => `W${w.week}`)}
            series={[
              { name: 'Planned', values: vsPlan.map((w) => w.planned), className: 'series-planned' },
              { name: 'Solved', values: vsPlan.map((w) => w.solved), className: 'series-actual' },
            ]}
          />
        ) : <p className="muted small" style={{ margin: 0 }}>LeetCode problems start in phase 2 (week 7). This chart fills in from then.</p>}
      </div>

      {/* Problems by pattern */}
      <div className="card">
        <h2>Problems by pattern</h2>
        {problems.solved ? (
          <>
            <p className="small muted">
              {problems.byDifficulty.map((d) => `${d.level} ${d.solved}${d.timed ? ` (${d.avgMin} min)` : ''}`).join(' · ')}
              {' · '}written by me: {Math.round(problems.honestShare * 100)}%
            </p>
            <BarRows
              rows={problems.tags.map((t) => {
                const slow = problems.timed >= 5 && t.timed >= 2 && t.avgMin >= problems.avgMin * 1.4
                return {
                  label: t.name,
                  share: t.solved / Math.max(...problems.tags.map((x) => x.solved)),
                  value: `${t.solved} solved${t.timed ? ` · ${t.avgMin} min` : ''}`,
                  warn: slow,
                }
              })}
            />
            {problems.timed < problems.solved && (
              <p className="muted small" style={{ marginBottom: 0 }}>Tip: type the minutes for each solved problem (on its row) to find slow patterns.</p>
            )}
          </>
        ) : <p className="muted small" style={{ margin: 0 }}>No problems ticked yet.</p>}
      </div>

      {/* Weekdays */}
      <div className="card">
        <h2>Which days you study</h2>
        {weekdays.some((d) => d.total) ? (
          <BarRows rows={weekdays.map((d) => ({
            label: d.name,
            share: d.total ? d.active / d.total : 0,
            value: `${d.active} of ${d.total}`,
            warn: d.total >= 2 && d.active / d.total < 0.5,
          }))} />
        ) : <p className="muted small" style={{ margin: 0 }}>Shows up after your first day.</p>}
      </div>

      {/* Habits and energy */}
      <div className="card">
        <h2>Habits (last {habits.days} {habits.days === 1 ? 'day' : 'days'})</h2>
        <BarRows rows={habits.habits.map((h) => ({
          label: h.text,
          share: habits.days ? h.done / habits.days : 0,
          value: `${h.done} of ${habits.days}`,
          warn: habits.days >= 7 && h.done / habits.days < 0.5,
        }))} />
        <p className="muted small" style={{ marginBottom: 0 }}>Minimum days: {habits.minimumDays}</p>
      </div>
      <div className="card">
        <h2>Energy (last 4 weeks)</h2>
        {energy.checkIns ? (
          <BarRows rows={(['fresh', 'tired', 'low'] as const).map((e) => ({
            label: e === 'low' ? 'Very low' : e[0].toUpperCase() + e.slice(1),
            share: energy.counts[e] / energy.checkIns,
            value: `${energy.counts[e]} days · ${energy.tasksPerDay[e]} tasks/day`,
          }))} />
        ) : <p className="muted small" style={{ margin: 0 }}>Use the energy check-in on the Today page to see this.</p>}
      </div>

      {/* Flashcards */}
      <div className="card">
        <h2>Flashcards by topic</h2>
        {cards.length ? (
          <BarRows rows={cards.map((c) => ({
            label: c.name,
            share: (c.avgEase - 1.3) / (2.8 - 1.3),
            value: `${c.cards} cards${c.weak ? ` · ${c.weak} hard` : ''}`,
            warn: c.cards >= 3 && c.avgEase < 2.2,
          }))} />
        ) : <p className="muted small" style={{ margin: 0 }}>Review a few <Link to="/cards">flashcards</Link> to see which topics stick.</p>}
      </div>

      {/* Games */}
      <div className="card">
        <h2>Pattern spotting and Big-O</h2>
        {patternGame.length || bigoGame.length ? (
          <BarRows rows={[
            ...patternGame.map((g) => ({ label: tagName(g.topic), share: g.accuracy, value: `${g.hit} of ${g.hit + g.miss} right`, warn: g.hit + g.miss >= 3 && g.accuracy < 0.6 })),
            ...bigoGame.map((g) => ({ label: g.topic, share: g.accuracy, value: `${g.hit} of ${g.hit + g.miss} right`, warn: g.hit + g.miss >= 3 && g.accuracy < 0.6 })),
          ].slice(0, 12)} />
        ) : <p className="muted small" style={{ margin: 0 }}>Play <Link to="/games">Pattern Guess and the Big-O quiz</Link> to see which ones you mix up.</p>}
      </div>
    </section>
  )
}

function InsightCard({ title, items, empty, warn }: { title: string; items: Insight[]; empty: string; warn?: boolean }) {
  return (
    <div className={`card${warn && items.length ? ' notice' : ''}`}>
      <h2>{title}</h2>
      {items.length ? (
        <ul className="insights">
          {items.map((i) => <li key={i.text}>{i.to ? <Link to={i.to}>{i.text}</Link> : i.text}</li>)}
        </ul>
      ) : <p className="muted small" style={{ margin: 0 }}>{empty}</p>}
    </div>
  )
}
