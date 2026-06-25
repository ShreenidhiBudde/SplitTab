import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'
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

export default function Register() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm]   = useState({ email:'', username:'', display_name:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await registerUser(form)
      login(res.data.access_token, res.data.user)
      nav('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type='text') => (
    <>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} required value={form[key]}
        onChange={e => setForm({...form, [key]: e.target.value})} />
    </>
  )

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.title}>Create Account</h1>
        {error && <p style={s.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          {field('display_name', 'Full Name')}
          {field('username',     'Username')}
          {field('email',        'Email', 'email')}
          {field('password',     'Password', 'password')}
          <button style={s.btn} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </form>
        <p style={s.link}>Have an account? <Link to="/login" style={{color:'#e94560'}}>Sign in</Link></p>
      </div>
    </div>
  )
}