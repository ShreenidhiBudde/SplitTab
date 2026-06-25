import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroup, recordSettlement } from '../services/api'
import { useAuth } from '../context/AuthContext'

const s = {
  card:   { background:'#fff', borderRadius:'12px', padding:'2rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', maxWidth:'480px' },
  label:  { display:'block', marginBottom:'0.3rem', fontSize:'0.85rem', color:'#555' },
  input:  { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', marginBottom:'1rem', outline:'none' },
  select: { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', marginBottom:'1rem', outline:'none' },
  btn:    { padding:'10px 24px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer' },
  err:    { color:'#e94560', marginBottom:'1rem' },
}

export default function RecordSettlement() {
  const { id } = useParams()
  const { user } = useAuth()
  const nav = useNavigate()
  const [members, setMembers] = useState([])
  const [form, setForm]       = useState({ paid_to:'', amount:'', note:'' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getGroup(id).then(r => {
      setMembers(r.data.members.filter(m => m.user_id !== user?.id))
    })
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

  return (
    <div>
      <h2 style={{ marginBottom:'1.5rem' }}>Record Settlement</h2>
      <div style={s.card}>
        {error && <p style={s.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Pay To</label>
          <select style={s.select} required value={form.paid_to}
            onChange={e => setForm({...form, paid_to: e.target.value})}>
            <option value="">Select member...</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>{m.display_name} (@{m.username})</option>
            ))}
          </select>
          <label style={s.label}>Amount (₹)</label>
          <input style={s.input} type="number" step="0.01" min="0.01" required value={form.amount}
            onChange={e => setForm({...form, amount: e.target.value})} />
          <label style={s.label}>Note (optional)</label>
          <input style={s.input} value={form.note}
            onChange={e => setForm({...form, note: e.target.value})} />
          <button style={s.btn} disabled={loading}>{loading ? 'Recording...' : 'Record Settlement'}</button>
        </form>
      </div>
    </div>
  )
}