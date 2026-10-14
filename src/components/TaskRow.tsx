import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Learn } from '../../content/data/roadmap'
import { resourceById } from '../../content/data/resources'
import { noteExists } from '../lib/noteIndex'
import type { Task } from '../lib/plan'
import { formatDate, todayIST } from '../lib/dates'
import type { ProblemReview } from '../lib/progress'
import { recordProblemReview, REVIEW_LABELS } from '../lib/study'
import { leetcodeUrl, problemBySlug, tagLink } from '../lib/problems'
import { toggleDone, update, useProgress } from '../store/progress'

/** A checkbox row. The whole row is the tap target. */
export function CheckRow({ id, text, children }: { id: string; text: ReactNode; children?: ReactNode }) {
  const done = !!useProgress().done[id]
  return (
    <div className={`task${done ? ' is-done' : ''}`}>
      <label className="task-main">
        <input type="checkbox" className="tick" checked={done} onChange={() => toggleDone(id)} />
        <span className="task-text">{text}</span>
      </label>
      {children && <div className="task-meta">{children}</div>}
    </div>
  )
}

/** A roadmap task with its links (resource, note, page or LeetCode). `note` is an extra line, like its planned day. */
export function TaskRow({ task, note }: { task: Task; note?: string }) {
  return (
    <CheckRow id={task.id} text={task.text}>
      {note && <span className="muted small">{note}</span>}
      {task.problem && <ProblemMeta slug={task.problem} />}
      {task.learn && <LearnLink learn={task.learn} />}
    </CheckRow>
  )
}

export function ProblemMeta({ slug }: { slug: string }) {
  const progress = useProgress()
  const p = problemBySlug(slug)
  if (!p) return null
  const solved = !!progress.done[`p:${slug}`]
  const honest = !!progress.honest[slug]
  const review = progress.problemReviews[slug]
  const today = todayIST()
  return (
    <>
      <span className={`badge diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
      {p.premium && <span className="badge" title="Needs LeetCode Premium. NeetCode has a free version.">Premium</span>}
      {tagLink(p.tag) ? <Link className="chip" to={tagLink(p.tag)!}>{p.tag}</Link> : <span className="chip">{p.tag}</span>}
      <a className="chip" href={leetcodeUrl(slug)} target="_blank" rel="noreferrer">LeetCode ↗</a>
      {solved && (
        // Minutes it took: used for the "medium in under 30 minutes" badge.
        <label className="chip chip-input">
          ⏱
          <input
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="min"
            aria-label={`Minutes taken for ${p.title}`}
            value={progress.solveMinutes[slug] ?? ''}
            onChange={(e) => update((d) => {
              const m = Math.round(Number(e.target.value))
              if (m > 0) d.solveMinutes[slug] = m
              else delete d.solveMinutes[slug]
            })}
          />
        </label>
      )}
      {solved && (
        <>
          <label className="attempt-control">
            Attempt result
            <select
              className="input"
              aria-label={`Record attempt for ${p.title}`}
              value=""
              onChange={(e) => {
                const level = e.target.value as ProblemReview['level']
                if (level in REVIEW_LABELS) update((d) => { recordProblemReview(d, slug, level, today) })
              }}
            >
              <option value="" disabled>Record this attempt…</option>
              {Object.entries(REVIEW_LABELS).map(([value, label]) => (
                <option key={value} value={value} disabled={value === 'recalled' && (review?.date ?? progress.done[`p:${slug}`]) >= today}>{label}</option>
              ))}
            </select>
          </label>
          {review && <span className="muted small">Last attempt: {REVIEW_LABELS[review.level]} · {formatDate(review.date)}</span>}
        </>
      )}
      {solved && (
        // "Did I write this myself?" — only you see it. Be honest.
        <button
          className={`chip${honest ? ' is-accent' : ''}`}
          aria-pressed={honest}
          onClick={() => update((d) => { if (d.honest[slug]) delete d.honest[slug]; else d.honest[slug] = true })}
        >
          {honest ? '✓ I wrote it myself' : 'I wrote it myself?'}
        </button>
      )}
    </>
  )
}

/** Turns a roadmap "learn" item into a link chip. Notes not written yet show as plain text. */
export function LearnLink({ learn }: { learn: Learn }) {
  if (learn.note) {
    return noteExists(learn.note) ? (
      <Link className="chip" to={`/notes/${learn.note}`}>Open note</Link>
    ) : (
      <span className="chip is-muted" title="This note is not written yet">Note coming soon</span>
    )
  }
  if (learn.res) {
    const r = resourceById(learn.res)
    if (r?.url) return <a className="chip" href={r.url} target="_blank" rel="noreferrer">{r.name} ↗</a>
  }
  if (learn.to) return <Link className="chip" to={learn.to}>Open</Link>
  return null
}
