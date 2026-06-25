import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createGroup } from '../services/api'

const s = {
  card:  { background:'#fff', borderRadius:'12px', padding:'2rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', maxWidth:'480px' },
  label: { display:'block', marginBottom:'0.3rem', fontSize:'0.85rem', color:'#555' },
  input: { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', marginBottom:'1rem', outline:'none' },
  btn:   { padding:'10px 24px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontWeight:600, cursor:'pointer' },
  err:   { color:'#e94560', marginBottom:'1rem' },
}

export default function CreateGroup() {
  const nav = useNavigate()
  const [form, setForm]   = useState({ name:'', description:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await createGroup(form)
      nav(`/groups/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom:'1.5rem' }}>Create New Group</h2>
      <div style={s.card}>
        {error && <p style={s.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Group Name</label>
          <input style={s.input} required value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} />
          <label style={s.label}>Description (optional)</label>
          <input style={s.input} value={form.description}
            onChange={e => setForm({...form, description: e.target.value})} />
          <button style={s.btn} disabled={loading}>{loading ? 'Creating...' : 'Create Group'}</button>
        </form>
      </div>
    </div>
  )
}