// A thin progress bar. share is 0..1. tone="warn" colours it as a weak spot.
export function Bar({ share, label, tone }: { share: number; label?: string; tone?: 'warn' }) {
  const pct = Math.round(Math.min(1, Math.max(0, share)) * 100)
  return (
    <div className={`bar${tone ? ` is-${tone}` : ''}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}
