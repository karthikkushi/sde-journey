import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { GRAPH, GRAPH_POS, VISUALIZERS, type Cell, type Frame, type Row } from '../lib/viz'

/** List of all visualizers. */
export function VizList() {
  return (
    <section className="page">
      <h1>Visualizers</h1>
      <p className="muted" style={{ margin: 0 }}>Watch data structures work, one step at a time. Press Step and read each caption.</p>
      <div className="tiles">
        {VISUALIZERS.map((v) => (
          <Link key={v.id} to={`/viz/${v.id}`} className="tile">
            <strong>{v.name}</strong>
            <span className="muted small">{v.about}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** One visualizer with Play, Step, Back and Reset. */
export function VizView() {
  const id = useParams().id
  const viz = VISUALIZERS.find((v) => v.id === id)
  if (!viz) return <section className="page"><h1>No such visualizer</h1></section>
  // key = id: switching to another visualizer starts a fresh player at step 1.
  return <Player key={viz.id} viz={viz} />
}

function Player({ viz }: { viz: (typeof VISUALIZERS)[number] }) {
  const frames = useMemo(() => viz.make(), [viz])
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(false)

  // While playing, move one step every 1.4 seconds (enough time to read the caption).
  // Playing stops by itself at the last frame.
  const running = playing && i < frames.length - 1
  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setI((x) => x + 1), 1400)
    return () => clearTimeout(t)
  }, [running, i])

  const frame = frames[i]
  const atEnd = i === frames.length - 1

  return (
    <section className="page">
      <div className="row muted small"><Link to="/viz">Visualizers</Link> / {viz.name}</div>
      <h1>{viz.name}</h1>

      <div className="card viz-stage">
        <FrameView frame={frame} />
      </div>
      <p className="viz-caption" aria-live="polite">{frame.caption}</p>
      {'stats' in frame && frame.stats && <p className="muted small" style={{ margin: 0 }}>{frame.stats}</p>}

      <div className="viz-controls">
        <button className="btn" onClick={() => { setPlaying(false); setI(0) }}>Reset</button>
        <button className="btn" onClick={() => { setPlaying(false); setI((x) => Math.max(0, x - 1)) }} disabled={i === 0}>Back</button>
        <button className="btn" onClick={() => { setPlaying(false); setI((x) => Math.min(frames.length - 1, x + 1)) }} disabled={atEnd}>Step</button>
        <button className="btn primary" onClick={() => (atEnd ? (setI(0), setPlaying(true)) : setPlaying(!running))}>
          {running ? 'Pause' : atEnd ? 'Replay' : 'Play'}
        </button>
      </div>
      <div className="muted small">Step {i + 1} of {frames.length}</div>

      <div className="row">
        {viz.note && <Link className="chip" to={`/notes/${viz.note}`}>Read the note</Link>}
        {viz.pattern && <Link className="chip" to={`/patterns/${viz.pattern}`}>See the pattern</Link>}
      </div>
    </section>
  )
}

function FrameView({ frame }: { frame: Frame }) {
  switch (frame.kind) {
    case 'rows':
      return <div className="stack">{frame.rows.map((r, k) => <RowView key={k} row={r} />)}</div>
    case 'buckets':
      return (
        <div className="buckets">
          {frame.buckets.map((b, k) => (
            <div key={k} className={`bucket${k === frame.active ? ' is-active' : ''}`}>
              <span className="bucket-index">{k}</span>
              <span className="bucket-items">{b.length ? b.map((c, j) => <Box key={j} cell={c} wide />) : <span className="muted small">empty</span>}</span>
            </div>
          ))}
        </div>
      )
    case 'list':
      return <ListView frame={frame} />
    case 'graph':
      return <GraphView frame={frame} />
  }
}

function Box({ cell, wide }: { cell: Cell; wide?: boolean }) {
  return <span className={`vbox${cell.tone ? ` tone-${cell.tone}` : ''}${cell.v === '' ? ' is-empty' : ''}${wide ? ' is-wide' : ''}`}>{cell.v}</span>
}

function RowView({ row }: { row: Row }) {
  return (
    <div>
      {row.label && <div className="muted small">{row.label}</div>}
      <div className={`vrow${row.vertical ? ' is-vertical' : ''}`}>
        {row.cells.length === 0 && <span className="muted small">(empty)</span>}
        {row.cells.map((c, k) => (
          <div key={k} className="vcol">
            <Box cell={c} />
            {!row.vertical && <span className="vindex">{k}</span>}
            <span className="vpointer">{row.pointers?.[k] ?? ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ListView({ frame }: { frame: Extract<Frame, { kind: 'list' }> }) {
  const { nodes, links, pointers } = frame
  return (
    <div className="stack">
      <div className="vrow list-row">
        {links[0] === 'null' && links.length > 1 && links[1] === 'prev' && <span className="arrow-text">None ←</span>}
        {nodes.map((n, k) => (
          <div key={k} className="list-item">
            <div className="vcol">
              <Box cell={n} />
              <span className="vpointer">{pointers[k] ?? ''}</span>
            </div>
            {k < nodes.length - 1 && (
              <span className="arrow-text">{links[k] === 'next' ? '→' : links[k + 1] === 'prev' ? '←' : ' '}</span>
            )}
          </div>
        ))}
        {links[links.length - 1] === 'null' && links[0] !== 'null' && <span className="arrow-text">→ None</span>}
      </div>
      {frame.side && <div className="chip is-accent" style={{ alignSelf: 'flex-start' }}>{frame.side}</div>}
    </div>
  )
}

function GraphView({ frame }: { frame: Extract<Frame, { kind: 'graph' }> }) {
  const edges = Object.entries(GRAPH).flatMap(([a, ns]) => ns.filter((b) => a < b).map((b) => [a, b] as const))
  return (
    <div className="stack">
      <svg viewBox="0 0 270 240" className="graph-svg" role="img" aria-label="Graph">
        {edges.map(([a, b]) => (
          <line key={a + b} x1={GRAPH_POS[a][0]} y1={GRAPH_POS[a][1]} x2={GRAPH_POS[b][0]} y2={GRAPH_POS[b][1]} className="g-edge" />
        ))}
        {Object.entries(GRAPH_POS).map(([n, [x, y]]) => (
          <g key={n}>
            <circle cx={x} cy={y} r={17} className={`g-node${frame.tones[n] ? ` tone-${frame.tones[n]}` : ''}`} />
            <text x={x} y={y + 5} textAnchor="middle" className="g-label">{n}</text>
          </g>
        ))}
      </svg>
      <div className="row small">
        <span className="muted">{frame.holder.name}:</span>
        {frame.holder.items.length ? frame.holder.items.map((x, k) => <span key={k} className="vbox is-small">{x}</span>) : <span className="muted">empty</span>}
      </div>
      <div className="row small">
        <span className="muted">Visit order:</span> <strong>{frame.order.join(' → ') || '—'}</strong>
      </div>
      <div className="row small muted">
        <span className="vbox is-small tone-hi"> </span> waiting
        <span className="vbox is-small tone-new"> </span> visiting now
        <span className="vbox is-small tone-found"> </span> done
      </div>
    </div>
  )
}
