import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/groups', label: 'Groups' },
]

export default function Navbar() {
  const { logout, user } = useAuth()
  const nav = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border)',
      padding: '0 1.75rem', height: '58px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: 28, height: 28, background: 'var(--accent)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.85rem', color: '#fff',
        }}>S</div>
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>SplitTab</span>
      </Link>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {LINKS.map(l => {
          const active = pathname.startsWith(l.to)
          return (
            <Link key={l.to} to={l.to} style={{
              padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: '0.875rem', fontWeight: 500,
              background: active ? 'var(--accent-soft)' : 'transparent',
              color: active ? 'var(--accent-hover)' : 'var(--text-dim)',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              {l.label}
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-soft)',
          color: 'var(--accent-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.8rem',
        }}>
          {user?.display_name?.[0]?.toUpperCase()}
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{user?.display_name}</span>
        <button onClick={handleLogout} style={{
          padding: '6px 13px', borderRadius: 'var(--radius)', background: 'transparent',
          border: '1px solid var(--border)', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 500,
          transition: 'all 150ms ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}