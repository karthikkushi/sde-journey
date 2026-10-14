import bash from 'highlight.js/lib/languages/bash'
import csharp from 'highlight.js/lib/languages/csharp'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { problemBySlug } from '../lib/problems'
import { setText, useProgress } from '../store/progress'
import { CheckRow, ProblemMeta } from './TaskRow'

// Only the languages we use, so the app stays small.
const LANGUAGES = { python, sql, bash, csharp, dockerfile, json, yaml }
// Our own block types. The highlighter leaves them as plain text.
const CUSTOM = ['practice', 'explain', 'flashcards', 'output', 'svg', 'text']

/** Renders a note's Markdown, including our special ``` blocks. */
export function NoteMarkdown({ noteId, body }: { noteId: string; body: string }) {
  const components: Components = {
    pre({ children }) {
      const code = Children.toArray(children)[0]
      if (!isValidElement(code)) return <pre>{children}</pre>
      const props = (code as ReactElement<{ className?: string; children?: ReactNode }>).props
      const lang = /language-(\S+)/.exec(props.className ?? '')?.[1]
      const text = typeof props.children === 'string' ? props.children.replace(/\n$/, '') : ''

      switch (lang) {
        case 'practice':
          return <Practice lines={text.split('\n')} />
        case 'explain':
          return <Explain noteId={noteId} questions={text.split('\n').filter(Boolean)} />
        case 'flashcards':
          return <Cards lines={text.split('\n')} />
        case 'output':
          return (
            <pre className="output" aria-label="Output">
              <span className="output-label">Output</span>
              {text}
            </pre>
          )
        case 'svg':
          // Pictures are written by us in the repo (trusted), so inserting them is safe.
          return <div className="note-svg" dangerouslySetInnerHTML={{ __html: text }} />
        default:
          return <pre className={lang ? `code lang-${lang}` : 'code'}>{children}</pre>
      }
    },
    // Tables scroll sideways on a phone instead of breaking the page.
    table: ({ children }) => (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    ),
    a: ({ href, children }) =>
      href?.startsWith('http') ? <a href={href} target="_blank" rel="noreferrer">{children}</a> : <a href={href}>{children}</a>,
  }

  return (
    <div className="prose">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { languages: LANGUAGES, detect: false, plainText: CUSTOM }]]}
        components={components}
      >
        {body}
      </Markdown>
    </div>
  )
}

/** ```practice: a LeetCode slug per line (shown as a problem), or any other text (an exercise). */
function Practice({ lines }: { lines: string[] }) {
  return (
    <div className="practice">
      {lines.filter(Boolean).map((line) => {
        const p = problemBySlug(line.trim())
        return p ? (
          <CheckRow key={line} id={`p:${p.slug}`} text={p.title}>
            <ProblemMeta slug={p.slug} />
          </CheckRow>
        ) : (
          <div key={line} className="exercise">✏️ {line}</div>
        )
      })}
    </div>
  )
}

/** ```explain: one question per line, each with a box to answer in your own words. */
function Explain({ noteId, questions }: { noteId: string; questions: string[] }) {
  const texts = useProgress().texts
  return (
    <div className="stack">
      {questions.map((q, i) => {
        const key = `explain:${noteId}:${i}`
        return (
          <label key={key} className="stack" style={{ gap: 6 }}>
            <strong>{q}</strong>
            <textarea className="input" rows={2} value={texts[key] ?? ''} onChange={(e) => setText(key, e.target.value)} placeholder="Answer in your own words" />
          </label>
        )
      })}
    </div>
  )
}

/** ```flashcards: "front :: back" per line. Tap a card to see the answer. */
function Cards({ lines }: { lines: string[] }) {
  return (
    <div className="cards">
      {lines
        .filter((l) => l.includes('::'))
        .map((line) => {
          const [front, back] = line.split('::').map((s) => s.trim())
          return (
            <details key={front} className="flashcard">
              <summary>{front}</summary>
              <p>{back}</p>
            </details>
          )
        })}
    </div>
  )
}
