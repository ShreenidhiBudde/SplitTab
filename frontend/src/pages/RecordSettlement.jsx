import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getGroup, recordSettlement } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RecordSettlement() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({ paid_to: '', amount: '', note: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

  useEffect(() => {
    getGroup(id).then(r => setMembers(r.data.members.filter(m => m.user_id !== user?.id)))
  }, [id, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await recordSettlement(id, { ...form, amount: parseFloat(form.amount) })
      nav(`/groups/${id}/settlements`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record settlement')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = (key) => ({
    width: '100%', padding: '11px 14px', borderRadius: 'var(--radius)',
    border: `1.5px solid ${focused === key ? 'var(--accent)' : 'var(--border)'}`,
    background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
    marginBottom: '1.1rem', transition: 'border-color 150ms ease',
  })

  return (
    <div style={{ maxWidth: '440px', margin: '0 auto', animation: 'fadeIn 300ms ease' }}>
      <Link to={`/groups/${id}/settlements`} style={{ color: 'var(--text-faint)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '1rem' }}>← Back to settlements</Link>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.3rem' }}>Record Settlement</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Mark a payment as settled</p>

        {error && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid rgba(248,81,73,0.3)', color: '#ff8782', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Pay to</label>
          <select required value={form.paid_to} onChange={e => setForm({ ...form, paid_to: e.target.value })}
            onFocus={() => setFocused('paid_to')} onBlur={() => setFocused('')}
            style={{ ...inputStyle('paid_to'), appearance: 'none' }}
          >
            <option value="">Select a member...</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>{m.display_name} (@{m.username})</option>
            ))}
          </select>

          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Amount (₹)</label>
          <input type="number" step="0.01" min="0.01" required value={form.amount}
            onFocus={() => setFocused('amount')} onBlur={() => setFocused('')}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            style={inputStyle('amount')} placeholder="0.00" />

          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Note <span style={{ color: 'var(--text-faint)' }}>(optional)</span></label>
          <input value={form.note} onFocus={() => setFocused('note')} onBlur={() => setFocused('')}
            onChange={e => setForm({ ...form, note: e.target.value })}
            style={inputStyle('note')} placeholder="UPI transfer, cash..." />

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: 'var(--success)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.95rem',
            opacity: loading ? 0.7 : 1, transition: 'opacity 150ms ease',
          }}>
            {loading ? 'Recording...' : 'Record Settlement'}
          </button>
        </form>
      </div>
    </div>
  )
}