import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

function RegisterIllustration() {
  return (
    <svg viewBox="0 0 400 320" style={{ width: '100%', maxWidth: 360 }}>
      <circle cx="200" cy="160" r="140" fill="#1b2230" />
      <circle cx="160" cy="130" r="34" fill="#222a3a" stroke="#30363d" strokeWidth="2" />
      <circle cx="160" cy="120" r="14" fill="#6366f1" opacity="0.7" />
      <path d="M138 150 Q160 135 182 150 L182 162 L138 162 Z" fill="#6366f1" opacity="0.5" />
      <circle cx="250" cy="170" r="30" fill="#222a3a" stroke="#30363d" strokeWidth="2" />
      <circle cx="250" cy="161" r="12" fill="#3fb950" opacity="0.7" />
      <path d="M230 188 Q250 175 270 188 L270 198 L230 198 Z" fill="#3fb950" opacity="0.5" />
      <rect x="120" y="220" width="160" height="10" rx="5" fill="#8b949e" opacity="0.4" />
      <circle cx="305" cy="100" r="18" fill="#d29922" opacity="0.15" />
      <circle cx="100" cy="220" r="14" fill="#6366f1" opacity="0.15" />
    </svg>
  )
}

export default function Register() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', username: '', display_name: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

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

  const set = key => e => setForm({ ...form, [key]: e.target.value })

  const inputStyle = (key) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: `1.5px solid ${focused === key ? 'var(--accent)' : 'var(--border)'}`,
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '0.95rem',
    outline: 'none',
    marginBottom: '1.1rem',
    transition: 'border-color 150ms ease',
  })

  const labelStyle = { fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }

  const field = (key, label, type = 'text', placeholder = '') => (
    <>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} required value={form[key]}
        onFocus={() => setFocused(key)} onBlur={() => setFocused('')}
        onChange={set(key)} style={inputStyle(key)} placeholder={placeholder}
      />
    </>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 80% 20%, rgba(99,102,241,0.08), transparent 40%), var(--bg)',
      padding: '2rem',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4rem', maxWidth: '920px', width: '100%',
        animation: 'fadeIn 400ms ease',
      }}>
        <div style={{ flex: 1, maxWidth: '380px', width: '100%' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              width: 40, height: 40, background: 'var(--accent)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem',
            }}>S</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>Create your account</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Start splitting expenses with friends</p>
          </div>

          {error && (
            <div style={{
              background: 'var(--danger-soft)', border: '1px solid rgba(248,81,73,0.3)',
              color: '#ff8782', padding: '10px 14px', borderRadius: 'var(--radius)',
              fontSize: '0.85rem', marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {field('display_name', 'Full Name', 'text', 'Alex Johnson')}
            {field('username', 'Username', 'text', 'alexj')}
            {field('email', 'Email', 'email', 'alex@example.com')}
            {field('password', 'Password', 'password', '••••••••')}

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.95rem',
                marginTop: '0.5rem', opacity: loading ? 0.7 : 1, transition: 'background 150ms ease',
              }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="register-illustration">
          <RegisterIllustration />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .register-illustration { display: none; }
        }
      `}</style>
    </div>
  )
}