import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGroup } from '../services/api'

function ActionButton({ to, label, icon, variant = 'ghost' }) {
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    ghost: { background: 'var(--bg-elev)', color: 'var(--text)', border: '1px solid var(--border)' },
  }
  return (
    <Link to={to} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '8px 16px', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.85rem',
      transition: 'all 150ms ease', ...variants[variant],
    }}
    onMouseEnter={e => {
      if (variant === 'primary') e.currentTarget.style.background = 'var(--accent-hover)'
      else { e.currentTarget.style.borderColor = 'var(--border-hover)' }
    }}
    onMouseLeave={e => {
      if (variant === 'primary') e.currentTarget.style.background = 'var(--accent)'
      else { e.currentTarget.style.borderColor = 'var(--border)' }
    }}
    >
      {icon && <span>{icon}</span>}{label}
    </Link>
  )
}

export default function GroupDetail() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGroup(id).then(r => setGroup(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div>
      <div style={{ height: 32, width: 220, background: 'var(--bg-elev)', borderRadius: 8, marginBottom: '0.5rem', opacity: 0.5 }} />
      <div style={{ height: 18, width: 160, background: 'var(--bg-elev)', borderRadius: 8, marginBottom: '2rem', opacity: 0.5 }} />
      <div style={{ height: 200, background: 'var(--bg-elev)', borderRadius: 'var(--radius-lg)', opacity: 0.5 }} />
    </div>
  )
  if (!group) return <p style={{ color: 'var(--text-dim)' }}>Group not found.</p>

  return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{group.name}</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px' }}>
          {group.description || 'No description'}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
        <ActionButton to={`/groups/${id}/expenses/new`} label="Add Expense" icon="+" variant="primary" />
        <ActionButton to={`/groups/${id}/members/add`} label="Add Member" icon="+" />
        <ActionButton to={`/groups/${id}/balances`} label="Balances" />
        <ActionButton to={`/groups/${id}/settlements`} label="Settlements" />
        <ActionButton to={`/groups/${id}/settlements/new`} label="Record Settlement" />
      </div>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Members</h2>
          <span style={{
            fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: '999px',
            background: 'var(--bg-elev)', color: 'var(--text-dim)',
          }}>
            {group.members.length}
          </span>
        </div>
        {group.members.map((m, i) => (
          <div key={m.user_id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 0', borderBottom: i < group.members.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-soft)',
                color: 'var(--accent-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem',
              }}>
                {m.display_name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{m.display_name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>@{m.username}</p>
              </div>
            </div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '999px',
              background: m.role === 'admin' ? 'var(--warning-soft)' : 'var(--bg-elev)',
              color: m.role === 'admin' ? 'var(--warning)' : 'var(--text-dim)',
            }}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}