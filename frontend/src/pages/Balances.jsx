import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getBalances } from '../services/api'

export default function Balances() {
  const { id } = useParams()
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBalances(id).then(r => setBalances(r.data)).finally(() => setLoading(false))
  }, [id])

  const max = Math.max(...balances.map(b => Math.abs(Number(b.balance))), 1)

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', animation: 'fadeIn 300ms ease' }}>
      <Link to={`/groups/${id}`} style={{ color: 'var(--text-faint)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '1rem' }}>← Back to group</Link>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>Balances</h1>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 50, background: 'var(--bg-elev)', borderRadius: 'var(--radius)', marginBottom: '0.75rem', opacity: 0.5 }} />
          ))
        ) : balances.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '2rem 0' }}>No balances to show yet</p>
        ) : (
          balances.map((b, i) => {
            const amt = Number(b.balance)
            const positive = amt > 0
            const pct = Math.round((Math.abs(amt) / max) * 100)
            return (
              <div key={b.user_id} style={{
                padding: '0.9rem 0', borderBottom: i < balances.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-hover)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem',
                    }}>
                      {b.display_name[0].toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontWeight: 500, fontSize: '0.88rem' }}>{b.display_name}</span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-faint)', marginLeft: '6px' }}>@{b.username}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: amt === 0 ? 'var(--text-faint)' : positive ? 'var(--success)' : 'var(--danger)' }}>
                      {amt === 0 ? 'settled' : `${positive ? '+' : ''}₹${Math.abs(amt).toFixed(2)}`}
                    </span>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{amt > 0 ? 'gets back' : amt < 0 ? 'owes' : ''}</p>
                  </div>
                </div>
                <div style={{ height: 4, background: 'var(--bg-elev)', borderRadius: 2 }}>
                  <div style={{
                    height: '100%', borderRadius: 2, width: `${pct}%`,
                    background: positive ? 'var(--success)' : amt < 0 ? 'var(--danger)' : 'var(--border)',
                    transition: 'width 400ms ease',
                  }} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}