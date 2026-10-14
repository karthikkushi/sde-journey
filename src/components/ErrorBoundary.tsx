import { Component, type ReactNode } from 'react'

// If one page crashes, show a friendly message instead of a blank app.
// React only supports this with a class component.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <section className="page">
        <h1>Something went wrong on this page</h1>
        <p className="muted">Your progress is safe. Try another page, or reload.</p>
        <pre className="prompt">{this.state.error.message}</pre>
        <div className="row">
          <a className="btn primary" href="#/" onClick={() => this.setState({ error: null })}>Go to Today</a>
          <button className="btn" onClick={() => location.reload()}>Reload</button>
        </div>
      </section>
    )
  }
}
