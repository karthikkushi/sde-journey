import { Link, useParams } from 'react-router'
import { EARNING_RULES, PROJECTS } from '../../content/data/projects'
import { Bar } from '../components/Bar'
import { CheckRow } from '../components/TaskRow'
import { useProgress } from '../store/progress'

const stepId = (projectId: string, i: number) => `proj:${projectId}:${i}`

/** The project ladder, from small terminal games to a real product. */
export function Projects() {
  const done = useProgress().done
  const tiers = [...new Set(PROJECTS.map((p) => p.tier))]
  return (
    <section className="page">
      <h1>Projects</h1>
      <p className="muted" style={{ margin: 0 }}>Climb one step at a time. Write every line yourself.</p>
      {tiers.map((tier) => (
        <div key={tier} className="card">
          <h2>{tier}. {PROJECTS.find((p) => p.tier === tier)!.tierName}</h2>
          {PROJECTS.filter((p) => p.tier === tier).map((p) => {
            const share = p.steps.filter((_, i) => done[stepId(p.id, i)]).length / p.steps.length
            return (
              <Link key={p.id} to={`/projects/${p.id}`} className="project-row">
                <span className="row" style={{ justifyContent: 'space-between' }}>
                  <strong>{p.name}</strong>
                  <span className="muted small">{Math.round(share * 100)}%</span>
                </span>
                <span className="muted small">{p.phase}</span>
                <Bar share={share} label={`${p.name} progress`} />
              </Link>
            )
          })}
        </div>
      ))}
      <Link className="btn" to="/earning">Earning from skills: honest rules</Link>
    </section>
  )
}

export function ProjectView() {
  const id = useParams().id
  const p = PROJECTS.find((x) => x.id === id)
  if (!p) return <section className="page"><h1>No such project</h1></section>
  return (
    <article className="page">
      <div className="row muted small"><Link to="/projects">Projects</Link> / {p.tierName}</div>
      <h1>{p.name}</h1>
      <span className="chip">{p.phase}</span>
      <div className="card">
        <p><strong>What it does:</strong> {p.what}</p>
        <strong>Skills it proves</strong>
        <ul className="plain-list">{p.proves.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
      <div className="card">
        <h2>Steps</h2>
        {p.steps.map((s, i) => <CheckRow key={i} id={stepId(p.id, i)} text={s} />)}
      </div>
      <div className="card">
        <h2>Done when</h2>
        <ul className="plain-list">{p.doneWhen.map((x) => <li key={x}>{x}</li>)}</ul>
        <h2 style={{ marginTop: 16 }}>Stretch goals</h2>
        <ul className="plain-list">{p.stretch.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>
      <div className="card">
        <h2>On your resume</h2>
        <p style={{ margin: 0 }}>{p.resume}</p>
        <p className="muted small" style={{ margin: '8px 0 0' }}>Replace X, Y and N with your real numbers. Never invent them.</p>
      </div>
    </article>
  )
}

export function Earning() {
  return (
    <article className="page">
      <div className="row muted small"><Link to="/projects">Projects</Link> / Earning</div>
      <h1>Earning from skills</h1>
      <div className="card notice">
        <p style={{ margin: 0 }}><strong>Rule one:</strong> check your current job contract before any paid side work. When in doubt, do not.</p>
      </div>
      <div className="card">
        <ol className="plain-list">{EARNING_RULES.map((r) => <li key={r}>{r}</li>)}</ol>
      </div>
    </article>
  )
}
