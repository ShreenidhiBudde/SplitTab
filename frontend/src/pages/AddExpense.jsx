import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getGroup, createExpense } from '../services/api'

export default function AddExpense() {
  const { id } = useParams()
  const nav = useNavigate()
  const [members, setMembers] = useState([])
  const [selected, setSelected] = useState([])
  const [form, setForm] = useState({ description: '', total_amount: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

  useEffect(() => {
    getGroup(id).then(r => {
      setMembers(r.data.members)
      setSelected(r.data.members.map(m => m.user_id))
    })
  }, [id])

  function toggle(uid) {
    setSelected(p => p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selected.length === 0) return setError('Select at least one member')
    setLoading(true)
    setError('')
    try {
      await createExpense(id, { ...form, total_amount: parseFloat(form.total_amount), split_among: selected })
      nav(`/groups/${id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const perPerson = selected.length > 0 && form.total_amount
    ? (parseFloat(form.total_amount) / selected.length).toFixed(2)
    : null

  const inputStyle = (key) => ({
    width: '100%', padding: '11px 14px', borderRadius: 'var(--radius)',
    border: `1.5px solid ${focused === key ? 'var(--accent)' : 'var(--border)'}`,
    background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
    marginBottom: '1.1rem', transition: 'border-color 150ms ease',
  })

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', animation: 'fadeIn 300ms ease' }}>
      <Link to={`/groups/${id}`} style={{ color: 'var(--text-faint)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '1rem' }}>← Back to group</Link>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.3rem' }}>Add Expense</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Split a new cost with your group</p>

        {error && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid rgba(248,81,73,0.3)', color: '#ff8782', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Description</label>
          <input required value={form.description} onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={inputStyle('desc')} placeholder="Hotel, Dinner, Taxi..." />

          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Total Amount (₹)</label>
          <input type="number" step="0.01" min="0.01" required value={form.total_amount}
            onFocus={() => setFocused('amount')} onBlur={() => setFocused('')}
            onChange={e => setForm({ ...form, total_amount: e.target.value })}
            style={inputStyle('amount')} placeholder="0.00" />

          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
              Split among
              {perPerson && <span style={{ color: 'var(--accent-hover)', fontWeight: 600, marginLeft: '8px' }}>₹{perPerson} each</span>}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {members.map(m => {
                const isSelected = selected.includes(m.user_id)
                return (
                  <label key={m.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '10px 14px',
                    borderRadius: 'var(--radius)', border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent-soft)' : 'var(--bg)', cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}>
                    <input type="checkbox" style={{ display: 'none' }} checked={isSelected} onChange={() => toggle(m.user_id)} />
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      background: isSelected ? 'var(--accent)' : 'var(--bg-elev)',
                      border: isSelected ? 'none' : '1.5px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem',
                    }}>
                      {isSelected && '✓'}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{m.display_name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)', marginLeft: 'auto' }}>@{m.username}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.95rem',
            opacity: loading ? 0.7 : 1, transition: 'background 150ms ease',
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  )
}