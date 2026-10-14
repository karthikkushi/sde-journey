import { useState, type DragEvent, type ReactNode } from 'react'
import { Link } from 'react-router'
import { BIG_O_QUESTIONS, ORDER_PUZZLES, PATTERN_QUESTIONS } from '../../content/data/games'
import { PATTERNS, patternById } from '../lib/patterns'
import { update, useProgress } from '../store/progress'

/** A new shuffled copy of a list (Fisher–Yates). */
function shuffle<T>(items: T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Save a best score if it beats the old one. */
function saveBest(game: string, score: number) {
  update((d) => {
    if (score > (d.games[game] ?? 0)) d.games[game] = score
  })
}

export function Games() {
  const g = useProgress().games
  const solvedOrder = ORDER_PUZZLES.filter((_, i) => g[`order:${i}`]).length
  const games = [
    { to: '/games/pattern', name: 'Pattern Guess', text: 'Read a problem. Pick its pattern.', best: `Best streak: ${g.pattern ?? 0}` },
    { to: '/games/bigo', name: 'Big-O Quiz', text: 'Read the code. Pick its time complexity.', best: `Best streak: ${g.bigo ?? 0}` },
    { to: '/games/order', name: 'Code Order', text: 'Put the shuffled lines of a solution in order.', best: `Solved: ${solvedOrder} / ${ORDER_PUZZLES.length}` },
  ]
  return (
    <section className="page">
      <h1>Games</h1>
      <p className="muted" style={{ margin: 0 }}>Short, fun practice for tired evenings.</p>
      <div className="tiles">
        {games.map((x) => (
          <Link key={x.to} to={x.to} className="tile">
            <strong>{x.name}</strong>
            <span className="small">{x.text}</span>
            <span className="muted small">{x.best}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------------ Quiz engine (Pattern Guess and Big-O)

type QuizItem = { prompt: ReactNode; options: string[]; answer: string; explain: ReactNode }

function Quiz({ title, game, makeItem }: { title: string; game: string; makeItem: () => QuizItem }) {
  const best = useProgress().games[game] ?? 0
  const [item, setItem] = useState(makeItem)
  const [picked, setPicked] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)

  function pick(option: string) {
    if (picked) return
    setPicked(option)
    if (option === item.answer) {
      const s = streak + 1
      setStreak(s)
      saveBest(game, s)
    } else setStreak(0)
  }

  function next() {
    setItem(makeItem())
    setPicked(null)
  }

  return (
    <section className="page">
      <div className="row muted small"><Link to="/games">Games</Link> / {title}</div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <span className="chip is-accent">Streak {streak} · best {best}</span>
      </div>
      <div className="card">{item.prompt}</div>
      <div className="stack">
        {item.options.map((o) => {
          const state = !picked ? '' : o === item.answer ? ' is-right' : o === picked ? ' is-wrong' : ''
          return (
            <button key={o} className={`btn option${state}`} onClick={() => pick(o)} disabled={!!picked && o !== picked && o !== item.answer}>
              {o}
            </button>
          )
        })}
      </div>
      {picked && (
        <div className="card" role="status">
          <p><strong>{picked === item.answer ? 'Correct!' : 'Not quite.'}</strong> {item.explain}</p>
          <button className="btn primary" onClick={next}>Next</button>
        </div>
      )}
    </section>
  )
}

export function PatternGuess() {
  const makeItem = (): QuizItem => {
    const [id, text] = PATTERN_QUESTIONS[Math.floor(Math.random() * PATTERN_QUESTIONS.length)]
    const answer = patternById(id)!.name
    const others = shuffle(PATTERNS.filter((p) => p.id !== id)).slice(0, 3).map((p) => p.name)
    return {
      prompt: <p style={{ margin: 0, fontSize: '1.1rem' }}>{text}</p>,
      options: shuffle([answer, ...others]),
      answer,
      explain: <>It is <Link to={`/patterns/${id}`}>{answer}</Link>. Clue: {patternById(id)!.clues[0]}.</>,
    }
  }
  return <Quiz title="Pattern Guess" game="pattern" makeItem={makeItem} />
}

export function BigOQuiz() {
  const makeItem = (): QuizItem => {
    const q = BIG_O_QUESTIONS[Math.floor(Math.random() * BIG_O_QUESTIONS.length)]
    return {
      prompt: <pre className="quiz-code">{q.code}</pre>,
      options: shuffle(q.options),
      answer: q.answer,
      explain: <>It is <strong>{q.answer}</strong>. {q.why}</>,
    }
  }
  return <Quiz title="Big-O Quiz" game="bigo" makeItem={makeItem} />
}

// ------------------------------------------------------------------ Code Order

export function CodeOrder() {
  const g = useProgress().games
  const [puzzle, setPuzzle] = useState<number | null>(null)

  if (puzzle === null) {
    return (
      <section className="page">
        <div className="row muted small"><Link to="/games">Games</Link> / Code Order</div>
        <h1>Code Order</h1>
        <p className="muted" style={{ margin: 0 }}>Tap a line, then tap where it should go. On a laptop you can also drag.</p>
        <div className="stack">
          {ORDER_PUZZLES.map((p, i) => (
            <button key={p.title} className="btn option" onClick={() => setPuzzle(i)}>
              {g[`order:${i}`] ? '✓ ' : ''}{p.title}
            </button>
          ))}
        </div>
      </section>
    )
  }
  return <OrderBoard key={puzzle} index={puzzle} onBack={() => setPuzzle(null)} />
}

function OrderBoard({ index, onBack }: { index: number; onBack: () => void }) {
  const puzzle = ORDER_PUZZLES[index]
  const [lines, setLines] = useState(() => {
    let s = shuffle(puzzle.lines)
    while (s.join('\n') === puzzle.lines.join('\n')) s = shuffle(puzzle.lines) // never start solved
    return s
  })
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<'right' | 'wrong' | null>(null)

  /** Move the line at `from` so it ends up at position `to`. */
  function move(from: number, to: number) {
    setLines((ls) => {
      const next = [...ls]
      const [line] = next.splice(from, 1)
      next.splice(to, 0, line)
      return next
    })
    setResult(null)
  }

  function tap(i: number) {
    if (selected === null) setSelected(i)
    else {
      if (selected !== i) move(selected, i)
      setSelected(null)
    }
  }

  function check() {
    const ok = lines.join('\n') === puzzle.lines.join('\n')
    setResult(ok ? 'right' : 'wrong')
    if (ok) update((d) => { d.games[`order:${index}`] = 1 })
  }

  const onDrop = (e: DragEvent, to: number) => {
    e.preventDefault()
    move(Number(e.dataTransfer.getData('text/plain')), to)
  }

  return (
    <section className="page">
      <div className="row muted small"><button className="link-btn" onClick={onBack}>← Code Order</button></div>
      <h1>{puzzle.title}</h1>
      <ol className="order-list">
        {lines.map((line, i) => (
          <li
            key={`${line}-${i}`}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, i)}
          >
            <button className={`order-line${selected === i ? ' is-selected' : ''}`} onClick={() => tap(i)} aria-pressed={selected === i}>
              <code>{line}</code>
            </button>
          </li>
        ))}
      </ol>
      <div className="row">
        <button className="btn primary" onClick={check}>Check</button>
        <button className="btn" onClick={() => { setLines(puzzle.lines); setResult(null) }}>Show answer</button>
      </div>
      {result && (
        <div className="card" role="status">
          {result === 'right' ? <strong>Correct! 🎉 Now type it from memory on LeetCode.</strong> : <span>Not yet. Read it top to bottom: can each line run with what came before it?</span>}
        </div>
      )}
    </section>
  )
}
