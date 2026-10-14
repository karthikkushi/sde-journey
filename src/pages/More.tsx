import { Link } from 'react-router'
import { NAV_GROUPS } from '../app/nav'
import { Icon } from '../components/Icon'

// Phone-only menu with every section as a big tile.
export function More() {
  return (
    <section className="page">
      <header className="page-heading"><span className="eyebrow">Your workspace</span><h1>All sections</h1><p>Everything you need for the next step.</p></header>
      {NAV_GROUPS.map((group) => (
        <section key={group.label} className="section-group">
          <h2>{group.label}</h2>
          <div className="tiles">
        {group.items.map((n) => (
          <Link key={n.to} to={n.to} className="tile">
            <Icon name={n.icon} size={26} />
            <strong>{n.label}</strong>
            <span className="muted small">{n.hint}</span>
          </Link>
        ))}
      </div>
        </section>
      ))}
    </section>
  )
}
