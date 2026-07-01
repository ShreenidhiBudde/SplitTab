import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSettlements, getSuggestions } from '../services/api'

export default function Settlements() {
  const { id } = useParams()
  const [settlements, setSettlements] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSettlements(id), getSuggestions(id)]).then(([s, sg]) => {
      setSettlements(s.data)
      setSuggestions(sg.data)
    }).finally(() => setLoading(false))
  }, [id])

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 300ms ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <Link to={`/groups/${id}`} style={{ color: 'var(--text-faint)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '0.5rem' }}>← Back to group</Link>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Settlements</h1>
        </div>
        <Link to={`/groups/${id}/settlements/new`} style={{
          background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: '0.82rem', transition: 'background 150ms ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          + Record
        </Link>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem' }}>Suggested Settlements</h2>
        {loading ? (
          [...Array(2)].map((_, i) => <div key={i} style={{ height: 42, background: 'var(--bg-elev)', borderRadius: 'var(--radius)', marginBottom: '0.5rem', opacity: 0.5 }} />)
        ) : suggestions.length === 0 ? (
          <p style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem' }}>All settled up</p>
        ) : (
          suggestions.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.7rem 0.9rem', borderRadius: 'var(--radius)', background: 'var(--bg-elev)',
              marginBottom: '0.5rem', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ fontWeight: 600 }}>{s.from_username}</span>
                <span style={{ color: 'var(--text-faint)' }}>→</span>
                <span style={{ fontWeight: 600 }}>{s.to_username}</span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem' }}>₹{Number(s.amount).toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '1rem' }}>History</h2>
        {loading ? (
          [...Array(2)].map((_, i) => <div key={i} style={{ height: 50, background: 'var(--bg-elev)', borderRadius: 'var(--radius)', marginBottom: '0.5rem', opacity: 0.5 }} />)
        ) : settlements.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>No settlements recorded yet</p>
        ) : (
          settlements.map((s, i) => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 0',
              borderBottom: i < settlements.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600 }}>{s.paid_by_username}</span>
                  <span style={{ color: 'var(--text-faint)' }}>paid</span>
                  <span style={{ fontWeight: 600 }}>{s.paid_to_username}</span>
                </div>
                {s.note && <p style={{ fontSize: '0.76rem', color: 'var(--text-faint)' }}>{s.note}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 700, color: 'var(--success)', fontSize: '0.9rem' }}>₹{Number(s.amount).toFixed(2)}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{new Date(s.settled_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}