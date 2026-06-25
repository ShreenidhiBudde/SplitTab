import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

const s = {
  wrap:  { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f7fa' },
  card:  { background:'#fff', padding:'2.5rem', borderRadius:'12px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', width:'100%', maxWidth:'400px' },
  title: { marginBottom:'1.5rem', fontSize:'1.5rem', fontWeight:700, color:'#1a1a2e' },
  label: { display:'block', marginBottom:'0.3rem', fontSize:'0.85rem', color:'#555' },
  input: { width:'100%', padding:'10px 12px', borderRadius:'8px', border:'1px solid #ddd', fontSize:'1rem', marginBottom:'1rem', outline:'none' },
  btn:   { width:'100%', padding:'12px', background:'#e94560', color:'#fff', border:'none', borderRadius:'8px', fontSize:'1rem', fontWeight:600, cursor:'pointer' },
  err:   { color:'#e94560', marginBottom:'1rem', fontSize:'0.9rem' },
  link:  { marginTop:'1rem', textAlign:'center', fontSize:'0.9rem', color:'#555' },
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm]   = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await loginUser(form)
      login(res.data.access_token, res.data.user)
      nav('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.title}>Sign in to SplitTab</h1>
        {error && <p style={s.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" required value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" required value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} />
          <button style={s.btn} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={s.link}>No account? <Link to="/register" style={{color:'#e94560'}}>Register</Link></p>
      </div>
    </div>
  )
}