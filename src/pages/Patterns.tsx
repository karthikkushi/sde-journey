import { Link, useParams } from 'react-router'
import { NoteMarkdown } from '../components/NoteMarkdown'
import { CheckRow, ProblemMeta } from '../components/TaskRow'
import { GROUPS, PATTERNS, patternById, problemsFor } from '../lib/patterns'
import { useProgress } from '../store/progress'

/** List of all patterns, grouped, with how many of their problems you solved. */
export function Patterns() {
  const done = useProgress().done
  return (
    <section className="page">
      <h1>Patterns</h1>
      <p className="muted" style={{ margin: 0 }}>Most problems are one of these 32 ideas. Learn to spot the clues.</p>
      <Link className="btn primary" to="/patterns/cheatsheet">Cheat sheet: all clues on one screen</Link>
      {GROUPS.map((g) => (
        <div key={g} className="card">
          <h2>{g}</h2>
          <ul className="note-list">
            {PATTERNS.filter((p) => p.group === g).map((p) => {
              const probs = problemsFor(p.id, 100)
              const solved = probs.filter((q) => done[`p:${q.slug}`]).length
              return (
                <li key={p.id}>
                  <Link className="note-row" to={`/patterns/${p.id}`}>
                    <span className="note-title">{p.name}</span>
                    <span className="muted small">{solved}/{probs.length}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}

/** One pattern: clues, idea, template, walkthrough, traps, and its problems. */
export function PatternView() {
  const id = useParams().id ?? ''
  const p = patternById(id)
  const problems = problemsFor(id)

  return (
    <article className="page">
      <div className="row muted small"><Link to="/patterns">Patterns</Link> / {p?.group ?? 'Topic'}</div>
      <h1>{p?.name ?? `Topic: ${id}`}</h1>
      {p ? (
        <>
          <div className="card">
            <h2>When to use it</h2>
            <ul className="clue-list">{p.clues.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>
          <NoteMarkdown noteId={`pattern-${p.id}`} body={p.body} />
        </>
      ) : (
        <p className="muted">This is a topic tag, not one of the 32 patterns. Here are its problems.</p>
      )}
      <div className="card">
        <h2>Problems ({problems.length})</h2>
        {problems.length === 0 && <p className="muted">No problems with this tag yet.</p>}
        {problems.map((q) => (
          <CheckRow key={q.slug} id={`p:${q.slug}`} text={q.title}>
            <ProblemMeta slug={q.slug} />
          </CheckRow>
        ))}
      </div>
    </article>
  )
}

/** Every clue of every pattern on one screen. */
export function CheatSheet() {
  return (
    <section className="page">
      <div className="row muted small"><Link to="/patterns">Patterns</Link> / Cheat sheet</div>
      <h1>Pattern cheat sheet</h1>
      <p className="muted" style={{ margin: 0 }}>Read the problem. Find the clue. Pick the pattern.</p>
      <div className="cheat">
        {PATTERNS.map((p) => (
          <Link key={p.id} to={`/patterns/${p.id}`} className="cheat-item">
            <strong>{p.name}</strong>
            <span className="muted small">{p.clues.join(' · ')}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
