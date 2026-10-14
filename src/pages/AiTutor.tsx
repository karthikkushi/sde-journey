import { useState } from 'react'
import { ProblemMeta } from '../components/TaskRow'
import { problemBySlug } from '../lib/problems'
import { update, useProgress } from '../store/progress'

// Prompts that make AI teach you instead of solving for you.
const PROMPTS = [
  {
    title: 'Critique my approach (no code)',
    text: 'I am practising for coding interviews. Here is a problem and my planned approach in plain words. Do NOT write any code and do NOT give me the solution. Tell me: is my approach correct? What is its time and space complexity? Which edge cases will break it? Ask me one question that would push me in the right direction.\n\nProblem:\n[paste]\n\nMy approach:\n[write it in your own words]',
  },
  {
    title: 'Give me a hint only',
    text: 'I have tried this problem for 25 minutes. Give me ONE small hint, the smallest nudge that could help. No code, no full idea, no pattern name unless I ask again. If I ask for another hint, make it only a little bigger.\n\nProblem:\n[paste]\n\nWhat I tried:\n[write it]',
  },
  {
    title: 'Find the bug, explain, do not fix',
    text: 'My code gives the wrong answer. Do NOT rewrite or fix my code. Point to the line (or lines) where the bug is, and explain in simple words WHY it is wrong, with a small input that shows the problem. I will fix it myself.\n\nProblem:\n[paste]\n\nMy code:\n[paste]\n\nInput where it fails and what I expected:\n[paste]',
  },
  {
    title: 'Quiz me on a topic',
    text: 'Quiz me on [topic, for example: hash maps / sliding window / SQL joins]. Ask ONE question at a time, from easy to hard. Wait for my answer. Then tell me what was right, what was missing, and ask the next question. Stop after 8 questions and give me a short list of what to revise.',
  },
  {
    title: 'Explain it like I am new',
    text: 'Explain [concept] to me like I am new to programming. Use short, simple sentences and an everyday Indian example (like a kirana shop, cricket, auto fares or train coaches). Then give me 3 small questions to check that I understood. Do not give the answers until I reply.',
  },
]

export function AiTutor() {
  const p = useProgress()
  const [copied, setCopied] = useState('')

  async function copy(title: string, text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(title)
      setTimeout(() => setCopied(''), 2000)
    } catch {
      setCopied('') // clipboard blocked: the text is still visible to select by hand
    }
  }

  const solved = Object.keys(p.done).filter((id) => id.startsWith('p:')).map((id) => id.slice(2)).filter((s) => problemBySlug(s))
  const honestCount = solved.filter((s) => p.honest[s]).length

  return (
    <section className="page">
      <h1>AI as a tutor</h1>
      <div className="card notice">
        <p style={{ margin: 0 }}><strong>Rule: AI must not write my solutions.</strong> AI can ask questions, give hints, find bugs and explain. The code is mine.</p>
      </div>

      {PROMPTS.map((pr) => (
        <div key={pr.title} className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0 }}>{pr.title}</h2>
            <button className="btn" onClick={() => copy(pr.title, pr.text)}>{copied === pr.title ? 'Copied ✓' : 'Copy'}</button>
          </div>
          <pre className="prompt">{pr.text}</pre>
        </div>
      ))}

      <div className="card">
        <h2>Did I write this myself?</h2>
        <p className="muted small">
          {solved.length === 0
            ? 'Problems you tick as solved will show up here.'
            : `${honestCount} of ${solved.length} solved problems written by you, without AI code. Be honest: this list is only for you.`}
        </p>
        {solved.map((slug) => (
          <div key={slug} className="task">
            <label className="task-main">
              <input type="checkbox" className="tick" checked={!!p.honest[slug]} onChange={() => update((d) => { if (d.honest[slug]) delete d.honest[slug]; else d.honest[slug] = true })} />
              <span className="task-text">{problemBySlug(slug)!.title}</span>
            </label>
            <div className="task-meta"><ProblemMeta slug={slug} /></div>
          </div>
        ))}
      </div>
    </section>
  )
}
