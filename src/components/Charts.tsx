// Small SVG charts drawn by hand: a few rectangles and lines are all this page needs.
// Sizes are in viewBox units, so the charts scale to the card width.
import { Bar } from './Bar'

const W = 320
const H = 150
const TOP = 18 // room for value labels
const BOTTOM = 22 // room for x labels

/** Vertical bars, one per item, with the value above each bar. */
export function BarChart({ data, label }: { data: { label: string; value: number }[]; label: string }) {
  if (!data.length) return null
  const gap = 6
  const max = Math.max(1, ...data.map((d) => d.value))
  const bw = (W - gap * (data.length - 1)) / data.length
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`${label}: ${data.map((d) => `${d.label} ${d.value}`).join(', ')}`}>
      {data.map((d, i) => {
        const h = (d.value / max) * (H - TOP - BOTTOM)
        const x = i * (bw + gap)
        return (
          <g key={d.label}>
            <rect x={x} y={H - BOTTOM - h} width={bw} height={d.value ? Math.max(h, 2) : 0} rx={3} className="chart-bar" />
            <text x={x + bw / 2} y={H - BOTTOM - h - 4} textAnchor="middle" className="chart-value">{d.value}</text>
            <text x={x + bw / 2} y={H - 6} textAnchor="middle" className="chart-label">{d.label}</text>
          </g>
        )
      })}
      <line x1={0} x2={W} y1={H - BOTTOM} y2={H - BOTTOM} className="chart-axis" />
    </svg>
  )
}

export type Series = { name: string; values: number[]; className: string }

/** Lines over the same x labels (for example "planned" and "solved" per week). */
export function LineChart({ labels, series, label }: { labels: string[]; series: Series[]; label: string }) {
  if (!labels.length) return null
  const LEFT = 26
  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const x = (i: number) => (labels.length === 1 ? (LEFT + W) / 2 : LEFT + (i / (labels.length - 1)) * (W - LEFT - 6))
  const y = (v: number) => H - BOTTOM - (v / max) * (H - TOP - BOTTOM)
  const every = Math.ceil(labels.length / 8) // at most ~8 x labels
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"
        aria-label={`${label}. ${series.map((s) => `${s.name}: ${s.values.at(-1)}`).join(', ')} at ${labels.at(-1)}`}>
        <text x={0} y={TOP} className="chart-label">{max}</text>
        <text x={0} y={H - BOTTOM} className="chart-label">0</text>
        <line x1={LEFT} x2={W} y1={H - BOTTOM} y2={H - BOTTOM} className="chart-axis" />
        {labels.map((l, i) => (i % every === 0 || i === labels.length - 1) && (
          <text key={l} x={x(i)} y={H - 6} textAnchor="middle" className="chart-label">{l}</text>
        ))}
        {series.map((s) => (
          <g key={s.name} className={s.className}>
            <polyline points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')} className="chart-line" />
            <circle cx={x(s.values.length - 1)} cy={y(s.values.at(-1) ?? 0)} r={3} className="chart-dot" />
          </g>
        ))}
      </svg>
      <div className="row small chart-legend">
        {series.map((s) => <span key={s.name} className={s.className}><span className="chart-swatch" /> {s.name}</span>)}
      </div>
    </>
  )
}

export type BarRow = { label: string; share: number; value: string; warn?: boolean }

/** Horizontal rows: label, bar, value. Good for "per weekday" or "per pattern" lists. */
export function BarRows({ rows }: { rows: BarRow[] }) {
  return (
    <div className="bar-rows">
      {rows.map((r) => (
        <div key={r.label} className="bar-row">
          <span className="small">{r.label}</span>
          <Bar share={r.share} label={`${r.label}: ${r.value}`} tone={r.warn ? 'warn' : undefined} />
          <span className={`small${r.warn ? ' warn-text' : ' muted'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}
