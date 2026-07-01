import { useEffect, useState } from 'react'
import { getDashboard } from '../services/api'
import { useAuth } from '../context/AuthContext'

function StatCard({ label, value, accent, sub }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      padding: '1.25rem', transition: 'border-color 150ms ease',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>{label}</p>
      <p style={{ fontSize: '1.6rem', fontWeight: 700, color: accent || 'var(--text)' }}>{value}</p>
      {sub && <p style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginTop: '3px' }}>{sub}</p>}
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ height: 52, background: 'var(--bg-elev)', borderRadius: 'var(--radius)', marginBottom: '0.6rem', opacity: 0.5 }} />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  const fmt = n => `₹${Math.abs(Number(n)).toFixed(2)}`

  return (
    <div style={{ animation: 'fadeIn 300ms ease' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 700 }}>
          Welcome back{user?.display_name ? `, ${user.display_name.split(' ')[0]}` : ''}
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '4px' }}>
          Here's what's happening across your groups
        </p>
      </div>

      {loading || !data ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 90, background: 'var(--bg-elev)', borderRadius: 'var(--radius-lg)', opacity: 0.5 }} />
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <ActivitySkeleton />
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
            <StatCard label="Groups" value={data.total_groups} />
            <StatCard label="Expenses" value={data.total_expenses} />
            <StatCard label="Total Spent" value={fmt(data.total_amount_spent)} />
            <StatCard label="You Owe" value={fmt(data.amount_owed)} accent="var(--danger)" sub="to others" />
            <StatCard label="You're Owed" value={fmt(data.amount_to_receive)} accent="var(--success)" sub="by others" />
            <StatCard label="Net Balance" value={fmt(data.net_balance)}
              accent={Number(data.net_balance) >= 0 ? 'var(--success)' : 'var(--danger)'}
              sub={Number(data.net_balance) >= 0 ? "you're ahead" : "you're behind"} />
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Recent Activity</h2>
            {data.recent_activity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <svg viewBox="0 0 120 100" style={{ width: 100, margin: '0 auto 1rem' }}>
                  <rect x="20" y="30" width="80" height="55" rx="8" fill="var(--bg-elev)" stroke="var(--border)" strokeWidth="2" />
                  <rect x="35" y="45" width="50" height="6" rx="3" fill="var(--border-hover)" />
                  <rect x="35" y="58" width="35" height="6" rx="3" fill="var(--border-hover)" />
                  <circle cx="60" cy="20" r="10" fill="var(--accent-soft)" />
                </svg>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No activity yet</p>
                <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginTop: '4px' }}>Add an expense to a group to see it here</p>
              </div>
            ) : (
              data.recent_activity.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 0', borderBottom: i < data.recent_activity.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 'var(--radius)',
                      background: a.type === 'expense' ? 'var(--accent-soft)' : 'var(--success-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem', flexShrink: 0,
                    }}>
                      {a.type === 'expense' ? '💳' : '✓'}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.88rem', fontWeight: 500 }}>{a.description}</p>
                      <p style={{ fontSize: '0.76rem', color: 'var(--text-faint)' }}>{a.group_name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.92rem' }}>₹{Number(a.amount).toFixed(2)}</p>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '1px 8px', borderRadius: '999px',
                      background: a.type === 'expense' ? 'var(--accent-soft)' : 'var(--success-soft)',
                      color: a.type === 'expense' ? 'var(--accent-hover)' : 'var(--success)',
                    }}>
                      {a.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}