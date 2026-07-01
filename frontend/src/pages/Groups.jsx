import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getGroups } from '../services/api'

function GroupCard({ group }) {
  const nav = useNavigate()
  return (
    <div
      onClick={() => nav(`/groups/${group.id}`)}
      style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        padding: '1.1rem 1.4rem', cursor: 'pointer', transition: 'all 150ms ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 'var(--radius)', background: 'var(--accent-soft)',
          color: 'var(--accent-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1rem', flexShrink: 0,
        }}>
          {group.name[0].toUpperCase()}
        </div>
        <div>
          <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{group.name}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{group.description || 'No description'}</p>
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
        {new Date(group.created_at).toLocaleDateString()}
      </span>
    </div>
  )
}

function EmptyGroups() {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      padding: '3rem 2rem', textAlign: 'center',
    }}>
      <svg viewBox="0 0 160 120" style={{ width: 140, margin: '0 auto 1.25rem' }}>
        <circle cx="60" cy="55" r="22" fill="var(--bg-elev)" stroke="var(--border)" strokeWidth="2" />
        <circle cx="60" cy="46" r="9" fill="var(--accent-soft)" />
        <path d="M44 70 Q60 58 76 70 L76 80 L44 80 Z" fill="var(--accent-soft)" />
        <circle cx="105" cy="65" r="18" fill="var(--bg-elev)" stroke="var(--border)" strokeWidth="2" />
        <circle cx="105" cy="58" r="7" fill="var(--success-soft)" />
        <path d="M92 80 Q105 71 118 80 L118 88 L92 88 Z" fill="var(--success-soft)" />
      </svg>
      <h3 style={{ fontWeight: 600, marginBottom: '0.4rem' }}>No groups yet</h3>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        Create a group to start splitting expenses with friends
      </p>
      <Link to="/groups/new" style={{
        display: 'inline-block', background: 'var(--accent)', color: '#fff', padding: '10px 20px',
        borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.875rem',
      }}>
        + Create your first group
      </Link>
    </div>
  )
}

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGroups().then(r => setGroups(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>My Groups</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginTop: '3px' }}>
            {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/groups/new" style={{
          background: 'var(--accent)', color: '#fff', padding: '9px 18px', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: '0.875rem', transition: 'background 150ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          + New Group
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 70, background: 'var(--bg-elev)', borderRadius: 'var(--radius-lg)', opacity: 0.5 }} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyGroups />
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {groups.map(g => <GroupCard key={g.id} group={g} />)}
        </div>
      )}
    </div>
  )
}