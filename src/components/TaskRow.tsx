import type { ReactNode } from 'react'
import { Link } from 'react-router'
import type { Learn } from '../../content/data/roadmap'
import { resourceById } from '../../content/data/resources'
import { noteExists } from '../lib/noteIndex'
import type { Task } from '../lib/plan'
import { leetcodeUrl, problemBySlug } from '../lib/problems'
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

/** A roadmap task with its links (resource, note, page or LeetCode). */
export function TaskRow({ task }: { task: Task }) {
  return (
    <CheckRow id={task.id} text={task.text}>
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
  return (
    <>
      <span className={`badge diff-${p.difficulty.toLowerCase()}`}>{p.difficulty}</span>
      {p.premium && <span className="badge" title="Needs LeetCode Premium. NeetCode has a free version.">Premium</span>}
      <Link className="chip" to={`/patterns/${p.tag}`}>{p.tag}</Link>
      <a className="chip" href={leetcodeUrl(slug)} target="_blank" rel="noreferrer">LeetCode ↗</a>
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
