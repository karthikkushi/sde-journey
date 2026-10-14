import { useState } from 'react'
import { todayIST } from '../lib/dates'
import { setText, update, useProgress } from '../store/progress'

const HIRING = [
  ['Resume screen', 'A recruiter (or software) reads your resume for under a minute. Clear titles, numbers and the right skills matter.'],
  ['Online test (OA)', '1 to 3 coding problems in 60 to 90 minutes, on a platform like HackerRank. Mostly easy and medium DSA.'],
  ['Coding rounds', '2 to 4 rounds of 45 to 60 minutes. One or two problems each. They watch how you think, not only the final code.'],
  ['System design / LLD', 'For SDE-1 often low-level design (classes) or basic system design. Deeper for senior roles.'],
  ['Behavioural round', 'Stories about teamwork, conflict, failure and ownership. Use STAR.'],
  ['Hiring manager / team match', 'Fit with the team, your interests, sometimes project deep-dives. Then the offer.'],
]

const LEVELS = [
  ['L3', 'Software Engineer II, usually the entry level for new grads and early-career engineers. Solves well-defined tasks with guidance.'],
  ['L4', 'Software Engineer III. Works independently on features. Often 2+ years of experience.'],
  ['L5', 'Senior Software Engineer. Owns larger projects, leads design, mentors others.'],
  ['L6', 'Staff Software Engineer. Sets technical direction across teams.'],
]

const RESUME_RULES = [
  'One page.',
  'Each bullet: what you did + the result, with a number ("cut API response time from 800 ms to 200 ms").',
  'Only skills you can explain in an interview. If you list it, expect a question on it.',
  'Honest dates and job titles. Exactly as in your offer letter.',
  'No fake experience, no fake projects, no copied GitHub repos. Background checks and interviews catch it.',
  'Projects: a link to live demo and GitHub, and one line on the impact.',
  'Simple layout, no photos, no tables that break resume software.',
]

const MOCK_CHECKLIST = [
  ['Before', ['Quiet place, charger, water', 'Editor ready (or a shared doc)', 'Read your STAR stories once']],
  ['During', ['Repeat the problem in your words', 'Ask about input size and edge cases', 'Say the brute force first, then improve', 'Think aloud while coding', 'Test with a small example by hand', 'State time and space complexity']],
  ['After', ['Write what went well and what to fix', 'Redo the problem after 3 days', 'Log it below']],
] as const

const STAR = [
  ['s', 'Situation', 'Where and when? Keep it short.'],
  ['t', 'Task', 'What was your job, or the goal?'],
  ['a', 'Action', 'What did YOU do? Say "I", not "we". Most of the story goes here.'],
  ['r', 'Result', 'What happened? A number if possible. What did you learn?'],
] as const

const STORY_PROMPTS = ['A hard bug I fixed', 'A time I disagreed with someone', 'A mistake I made', 'Learning something fast', 'Going beyond my task', 'Working under a deadline']

export function Career() {
  const p = useProgress()
  const [mock, setMock] = useState({ date: todayIST(), kind: 'Coding', notes: '' })

  function addMock() {
    if (!mock.notes.trim()) return
    update((d) => { d.mocks.unshift({ ...mock, notes: mock.notes.trim() }) })
    setMock({ date: todayIST(), kind: mock.kind, notes: '' })
  }

  return (
    <section className="page">
      <h1>Interviews and career</h1>

      <div className="card notice">
        <p style={{ margin: 0 }}>
          <strong>Never pay anyone for a "referral" or a "guaranteed job".</strong> Real referrals are free and come from people who know your work. Paid "guaranteed placement" offers are scams.
        </p>
      </div>

      <nav className="row" aria-label="On this page">
        {['hiring', 'levels', 'resume', 'stories', 'mocks'].map((a) => <a key={a} className="chip" href={`#${a}`} onClick={(e) => { e.preventDefault(); document.getElementById(a)?.scrollIntoView({ behavior: 'smooth' }) }}>{a}</a>)}
      </nav>

      <div className="card" id="hiring">
        <h2>How SDE hiring works</h2>
        <ol className="plain-list">{HIRING.map(([t, d]) => <li key={t}><strong>{t}.</strong> {d}</li>)}</ol>
      </div>

      <div className="card" id="levels">
        <h2>Google levels, simply</h2>
        <ul className="plain-list">{LEVELS.map(([l, d]) => <li key={l}><strong>{l}</strong>: {d}</li>)}</ul>
        <p className="muted small" style={{ margin: 0 }}>Your level is decided after the interviews, from how you did and your experience. Aim for L3 first. Titles and years are rough guides, not rules.</p>
      </div>

      <div className="card" id="resume">
        <h2>Resume rules</h2>
        <ul className="plain-list">{RESUME_RULES.map((r) => <li key={r}>{r}</li>)}</ul>
      </div>

      <div className="card" id="stories">
        <h2>Behavioural stories (STAR)</h2>
        <p className="muted small">Write 6 true stories. Tell each one aloud in under 2 minutes. Saved on this device.</p>
        {STORY_PROMPTS.map((prompt, i) => {
          const titleKey = `story:${i}:title`
          return (
            <details key={i} className="story">
              <summary>{p.texts[titleKey] || `Story ${i + 1}: ${prompt}`}</summary>
              <div className="stack" style={{ paddingTop: 8 }}>
                <label className="stack" style={{ gap: 4 }}>
                  <strong>Title</strong>
                  <input className="input" value={p.texts[titleKey] ?? ''} placeholder={prompt} onChange={(e) => setText(titleKey, e.target.value)} />
                </label>
                {STAR.map(([k, name, hint]) => {
                  const key = `story:${i}:${k}`
                  return (
                    <label key={k} className="stack" style={{ gap: 4 }}>
                      <strong>{name}</strong>
                      <span className="muted small">{hint}</span>
                      <textarea className="input" rows={k === 'a' ? 4 : 2} value={p.texts[key] ?? ''} onChange={(e) => setText(key, e.target.value)} />
                    </label>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>

      <div className="card" id="mocks">
        <h2>Mock interview checklist</h2>
        {MOCK_CHECKLIST.map(([when, items]) => (
          <div key={when}>
            <strong>{when}</strong>
            <ul className="plain-list">{items.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Mock log ({p.mocks.length})</h2>
        <div className="stack">
          <div className="filters">
            <input className="input" type="date" value={mock.date} onChange={(e) => setMock({ ...mock, date: e.target.value })} aria-label="Date" />
            <select className="input" value={mock.kind} onChange={(e) => setMock({ ...mock, kind: e.target.value })} aria-label="Kind">
              {['Coding', 'System design', 'Behavioural', 'Real interview'].map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <textarea className="input" rows={3} placeholder="What went well? What to fix? Which problem?" value={mock.notes} onChange={(e) => setMock({ ...mock, notes: e.target.value })} aria-label="Notes" />
          <button className="btn primary" onClick={addMock} disabled={!mock.notes.trim()}>Log this mock (+50 XP)</button>
        </div>
        {p.mocks.map((m, i) => (
          <div key={i} className="mock-row">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <strong>{m.kind}</strong>
              <span className="muted small">{m.date}</span>
            </div>
            <p style={{ margin: '4px 0' }}>{m.notes}</p>
            <button className="link-btn small" onClick={() => confirm('Delete this mock?') && update((d) => { d.mocks.splice(i, 1) })}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  )
}
