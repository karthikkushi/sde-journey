import { useState } from 'react'
import { Link } from 'react-router'
import { todayIST } from '../lib/dates'
import { ALL_CARDS, noteById } from '../lib/notes'
import { dueCards, schedule, type Grade } from '../lib/srs'
import { getProgress, update, useProgress } from '../store/progress'

const GRADES: { grade: Grade; label: string; hint: string }[] = [
  { grade: 'again', label: 'Again', hint: 'forgot' },
  { grade: 'hard', label: 'Hard', hint: 'slow' },
  { grade: 'good', label: 'Good', hint: 'got it' },
  { grade: 'easy', label: 'Easy', hint: 'instant' },
]

// Flashcard review with spaced repetition. Cards come from the notes you have finished.
export function Cards() {
  const p = useProgress()
  const today = todayIST()
  // Fix the queue when the page opens, so cards do not jump around while you review.
  const [queue] = useState(() => dueCards(ALL_CARDS, getProgress(), today))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = queue[index]
  const learning = Object.keys(p.cards).length

  function answer(grade: Grade) {
    update((d) => {
      d.cards[card.id] = schedule(d.cards[card.id], grade, today)
      d.cardReviews += 1
    })
    setFlipped(false)
    setIndex((i) => i + 1)
  }

  return (
    <section className="page">
      <h1>Flashcards</h1>
      <p className="muted" style={{ margin: 0 }}>
        {learning} cards learning · {p.cardReviews} reviews so far. Finish a note to unlock its cards.
      </p>

      {!card ? (
        <div className="card">
          <h2>{queue.length ? 'Done for today 🎉' : 'Nothing due today'}</h2>
          <p className="muted">{queue.length ? `You reviewed ${queue.length} cards. See you tomorrow.` : 'Open a note, read it, and tap "I finished this note". Its cards will show up here.'}</p>
          <Link className="btn" to="/notes">Go to notes</Link>
        </div>
      ) : (
        <>
          <div className="muted small">Card {index + 1} of {queue.length} · from <Link to={`/notes/${card.noteId}`}>{noteById(card.noteId)?.title}</Link></div>
          <button className={`card study-card${flipped ? ' is-flipped' : ''}`} onClick={() => setFlipped(true)} aria-label={flipped ? 'Answer shown' : 'Show the answer'}>
            <div className="study-front">{card.front}</div>
            {flipped ? <div className="study-back">{card.back}</div> : <div className="muted small">Think of the answer, then tap</div>}
          </button>
          {flipped && (
            <div className="grade-row">
              {GRADES.map((g) => (
                <button key={g.grade} className={`btn grade-${g.grade}`} onClick={() => answer(g.grade)}>
                  {g.label}
                  <span className="small muted">{g.hint}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
