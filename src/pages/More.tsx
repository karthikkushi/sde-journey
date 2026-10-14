import { Link } from 'react-router'
import { NAV } from '../app/nav'
import { Icon } from '../components/Icon'

// Phone-only menu with every section as a big tile.
export function More() {
  return (
    <section className="page">
      <h1>All sections</h1>
      <div className="tiles">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="tile">
            <Icon name={n.icon} size={26} />
            <strong>{n.label}</strong>
            <span className="muted small">{n.hint}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
