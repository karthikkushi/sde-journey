import { Bar } from '../components/Bar'
import { BADGES, earned } from '../lib/badges'
import { LEVELS, levelOf, totalXp } from '../lib/xp'
import { useProgress } from '../store/progress'

// Levels and badges in one place.
export function Badges() {
  const p = useProgress()
  const xp = totalXp(p)
  const level = levelOf(xp)

  return (
    <section className="page">
      <h1>Levels and badges</h1>

      <div className="card">
        <h2>Level {level.index + 1}: {level.name}</h2>
        <Bar share={level.share} label="Progress to next level" />
        <p className="muted small" style={{ margin: 0 }}>
          {xp.toLocaleString('en-IN')} XP. {level.next ? `${level.toNext.toLocaleString('en-IN')} XP to ${level.next.name}.` : 'Top level reached.'}
        </p>
        <ol className="levels">
          {LEVELS.map((l, i) => (
            <li key={l.name} className={i <= level.index ? 'is-reached' : ''}>
              <span>{l.name}</span>
              <span className="muted small">{l.xp.toLocaleString('en-IN')} XP</span>
            </li>
          ))}
        </ol>
        <p className="muted small" style={{ margin: 0 }}>
          XP: task 10, habit 5, problem 20, focus block 15, note 25, flashcard 2, weekly review 30, mock interview 50.
        </p>
      </div>

      <div className="badge-grid">
        {BADGES.map((b) => {
          const [have, need] = b.progress(p)
          const got = earned(b, p)
          return (
            <div key={b.id} className={`card badge-card${got ? ' is-earned' : ''}`}>
              <div className="badge-medal" aria-hidden="true">{got ? '🏅' : '🔒'}</div>
              <strong>{b.name}</strong>
              <span className="muted small">{b.how}</span>
              {need > 1 && <Bar share={have / need} label={`${b.name} progress`} />}
              {need > 1 && <span className="muted small">{have} / {need}</span>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
