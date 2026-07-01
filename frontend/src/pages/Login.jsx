import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../services/api'
import { useAuth } from '../context/AuthContext'

function LoginIllustration() {
  return (
    <svg viewBox="0 0 400 320" style={{ width: '100%', maxWidth: 360 }}>
      <circle cx="200" cy="160" r="140" fill="#1b2230" />
      <rect x="110" y="90" width="180" height="130" rx="14" fill="#222a3a" stroke="#30363d" strokeWidth="2" />
      <rect x="130" y="115" width="140" height="14" rx="7" fill="#6366f1" opacity="0.7" />
      <rect x="130" y="140" width="100" height="10" rx="5" fill="#8b949e" opacity="0.5" />
      <rect x="130" y="160" width="120" height="10" rx="5" fill="#8b949e" opacity="0.5" />
      <circle cx="150" cy="195" r="14" fill="#3fb950" opacity="0.8" />
      <rect x="172" y="190" width="80" height="10" rx="5" fill="#8b949e" opacity="0.5" />
      <circle cx="305" cy="95" r="22" fill="#6366f1" opacity="0.15" />
      <circle cx="95" cy="230" r="16" fill="#3fb950" opacity="0.15" />
      <path d="M260 70 L270 80 L260 90 L250 80 Z" fill="#d29922" opacity="0.5" />
    </svg>
  )
}

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

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

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(circle at 20% 20%, rgba(99,102,241,0.08), transparent 40%), var(--bg)',
      padding: '2rem',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4rem', maxWidth: '920px', width: '100%',
        animation: 'fadeIn 400ms ease',
      }}>
        {/* Illustration side */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }} className="login-illustration">
          <LoginIllustration />
        </div>

        {/* Form side */}
        <div style={{ flex: 1, maxWidth: '380px', width: '100%' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              width: 40, height: 40, background: 'var(--accent)', borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '1.25rem',
            }}>S</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.4rem' }}>Welcome back</h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Sign in to continue to SplitTab</p>
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
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Email</label>
            <input
              type="email" required value={form.email}
              onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle('email')} placeholder="you@example.com"
            />

            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Password</label>
            <input
              type="password" required value={form.password}
              onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={inputStyle('password')} placeholder="••••••••"
            />

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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-illustration { display: none; }
        }
      `}</style>
    </div>
  )
}