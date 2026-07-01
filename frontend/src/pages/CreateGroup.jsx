import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createGroup } from '../services/api'

function GroupIllustration() {
  return (
    <svg viewBox="0 0 200 140" style={{ width: 160, margin: '0 auto 1.5rem' }}>
      <circle cx="70" cy="60" r="26" fill="var(--bg-elev)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="70" cy="50" r="11" fill="var(--accent-soft)" />
      <path d="M50 78 Q70 64 90 78 L90 90 L50 90 Z" fill="var(--accent-soft)" />
      <circle cx="130" cy="68" r="22" fill="var(--bg-elev)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="130" cy="60" r="9" fill="var(--success-soft)" />
      <path d="M113 84 Q130 74 147 84 L147 94 L113 94 Z" fill="var(--success-soft)" />
      <circle cx="170" cy="30" r="10" fill="var(--warning-soft)" />
    </svg>
  )
}

export default function CreateGroup() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

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

  const inputStyle = (key) => ({
    width: '100%', padding: '11px 14px', borderRadius: 'var(--radius)',
    border: `1.5px solid ${focused === key ? 'var(--accent)' : 'var(--border)'}`,
    background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
    marginBottom: '1.1rem', transition: 'border-color 150ms ease',
  })

  return (
    <div style={{ maxWidth: '460px', margin: '0 auto', animation: 'fadeIn 300ms ease' }}>
      <Link to="/groups" style={{ color: 'var(--text-faint)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '1rem' }}>← Back to groups</Link>

      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem',
      }}>
        <GroupIllustration />
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.3rem' }}>New Group</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.75rem' }}>
          Create a space to track shared expenses
        </p>

        {error && (
          <div style={{
            background: 'var(--danger-soft)', border: '1px solid rgba(248,81,73,0.3)', color: '#ff8782',
            padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Group name</label>
          <input required value={form.name} onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={inputStyle('name')} placeholder="Goa Trip, Flat 4B..." />

          <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>Description <span style={{ color: 'var(--text-faint)' }}>(optional)</span></label>
          <input value={form.description} onFocus={() => setFocused('desc')} onBlur={() => setFocused('')}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={inputStyle('desc')} placeholder="What's this group for?" />

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.95rem', marginTop: '0.4rem',
            opacity: loading ? 0.7 : 1, transition: 'background 150ms ease',
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  )
}