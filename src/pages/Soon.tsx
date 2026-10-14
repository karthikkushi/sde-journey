// Placeholder for pages that are not built yet.
export function Soon({ title, hint }: { title: string; hint: string }) {
  return (
    <section className="page">
      <h1>{title}</h1>
      <div className="card">
        <p className="muted">{hint}</p>
        <p>Coming soon.</p>
      </div>
    </section>
  )
}
