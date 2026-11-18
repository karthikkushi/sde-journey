import { PAPER_STEPS, PAPERS } from '../../content/data/papers'
import { PAPER_STATUSES, type PaperState } from '../lib/progress'
import { setText, update, useProgress } from '../store/progress'
import { NotebookButton } from '../components/NotebookButton'

const fresh = (): PaperState => ({ status: 'Not started', steps: [] })

// The 6 AI papers. Read one every other Sunday from week 10, with the same 5-step checklist.
export function Papers() {
  const p = useProgress()
  const doneCount = PAPERS.filter((paper) => p.papers[paper.id]?.status === 'Done').length

  const setStatus = (id: string, status: PaperState['status']) =>
    update((d) => { d.papers[id] = { ...(d.papers[id] ?? fresh()), status } })

  function toggleStep(id: string, step: string) {
    update((d) => {
      const state = d.papers[id] ?? fresh()
      const steps = state.steps.includes(step) ? state.steps.filter((s) => s !== step) : [...state.steps, step]
      // Ticking a step means you have started; ticking all 5 marks the paper done.
      const status = steps.length === PAPER_STEPS.length ? 'Done' : steps.length ? 'Reading' : state.status
      d.papers[id] = { status, steps }
    })
  }

  return (
    <section className="page">
      <div className="page-heading">
        <h1>Papers</h1>
        <p>Six papers, in order. One every other Sunday from week 10. {doneCount} of 6 done.</p>
      </div>
      <div className="row"><NotebookButton subject="papers" /></div>
      {PAPERS.map((paper, i) => {
        const state = p.papers[paper.id] ?? fresh()
        return (
          <article key={paper.id} className="card paper-card">
            <span className="muted small">Paper {i + 1} · {paper.authors}, {paper.year}</span>
            <h2><a href={paper.url} target="_blank" rel="noreferrer">{paper.title} ↗</a></h2>
            <p className="muted small">{paper.why}</p>
            <label className="row small">
              Status
              <select className="input" style={{ width: 'auto' }} value={state.status} onChange={(e) => setStatus(paper.id, e.target.value as PaperState['status'])}>
                {PAPER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <div className="stack" style={{ gap: 0, marginTop: 8 }}>
              {PAPER_STEPS.map((step) => (
                <label key={step.id} className="task-main">
                  <input type="checkbox" className="tick" checked={state.steps.includes(step.id)} onChange={() => toggleStep(paper.id, step.id)} />
                  <span className="task-text">{step.text}</span>
                </label>
              ))}
            </div>
            <label className="stack small" style={{ gap: 6, marginTop: 8 }}>
              My 5 lines
              <textarea className="input" rows={5} placeholder="What problem, what idea, how it works, what it showed, why it matters to me"
                value={p.texts[`paper:${paper.id}`] ?? ''} onChange={(e) => setText(`paper:${paper.id}`, e.target.value)} />
            </label>
          </article>
        )
      })}
    </section>
  )
}

