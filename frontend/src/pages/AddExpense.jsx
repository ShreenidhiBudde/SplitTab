import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroup, createExpense } from '../services/api'

const s = {
  card:  { background:'#fff', borderRadius:'12px', padding:'2rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', maxWidth:'520px' },
  label: { display:'block', marginBottom:'0.3rem', fontSize:'0.85rem', color:'#555' },
  input: { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', marginBottom:'1rem', outline:'none' },
  btn:   { padding:'10px 24px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer' },
  err:   { color:'#e94560', marginBottom:'1rem' },
}

export default function AddExpense() {
  const { id } = useParams()
  const nav = useNavigate()
  const [members, setMembers]   = useState([])
  const [selected, setSelected] = useState([])
  const [form, setForm]         = useState({ description:'', total_amount:'' })
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    getGroup(id).then(r => {
      setMembers(r.data.members)
      setSelected(r.data.members.map(m => m.user_id))
    })
  }, [id])

  function toggleMember(uid) {
    setSelected(prev => prev.includes(uid) ? prev.filter(x => x !== uid) : [...prev, uid])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (selected.length === 0) return setError('Select at least one member to split with')
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

  return (
    <div>
      <h2 style={{ marginBottom:'1.5rem' }}>Add Expense</h2>
      <div style={s.card}>
        {error && <p style={s.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Description</label>
          <input style={s.input} required value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} />
          <label style={s.label}>Total Amount (₹)</label>
          <input style={s.input} type="number" step="0.01" min="0.01" required value={form.total_amount}
            onChange={e => setForm({...form, total_amount: e.target.value})} />
          <label style={s.label}>Split Among</label>
          {members.map(m => (
            <label key={m.user_id} style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem', cursor:'pointer' }}>
              <input type="checkbox" checked={selected.includes(m.user_id)}
                onChange={() => toggleMember(m.user_id)} />
              {m.display_name} (@{m.username})
            </label>
          ))}
          <div style={{ marginTop:'1rem' }}>
            <button style={s.btn} disabled={loading}>{loading ? 'Adding...' : 'Add Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}