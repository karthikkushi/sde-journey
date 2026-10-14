// A thin progress bar. share is 0..1.
export function Bar({ share, label }: { share: number; label?: string }) {
  const pct = Math.round(share * 100)
  return (
    <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <span style={{ width: `${pct}%` }} />
    </div>
  )
}
