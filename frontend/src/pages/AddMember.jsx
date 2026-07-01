import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { searchUsers, addMember } from '../services/api'

function PeopleIllustration() {
  return (
    <svg viewBox="0 0 200 120" style={{ width: 140, margin: '0 auto 1.25rem' }}>
      <circle cx="65" cy="55" r="24" fill="var(--bg-elev)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="65" cy="46" r="10" fill="var(--accent-soft)" />
      <path d="M47 73 Q65 61 83 73 L83 84 L47 84 Z" fill="var(--accent-soft)" />
      <circle cx="130" cy="62" r="20" fill="var(--bg-elev)" stroke="var(--border)" strokeWidth="2" />
      <circle cx="130" cy="54" r="8" fill="var(--success-soft)" />
      <path d="M115 76 Q130 67 145 76 L145 86 L115 86 Z" fill="var(--success-soft)" />
      <path d="M88 50 L105 50 M96 42 L96 58" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export default function AddMember() {
  const { id } = useParams()
  const timerRef = useRef(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [adding, setAdding] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  async function doSearch(q) {
    if (q.trim().length < 2) {
      setResults([])
      setSearching(false)
      return
    }
    setSearching(true)
    try {
      const res = await searchUsers(q)
      setResults(res.data)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  function handleInput(e) {
    const q = e.target.value
    setQuery(q)
    setError('')
    setSuccess('')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => doSearch(q), 350)
  }

  async function handleAdd(user) {
    setAdding(user.id)
    setError('')
    setSuccess('')
    try {
      await addMember(id, { user_id: user.id })
      setSuccess(`${user.display_name} was added to the group.`)
      setResults(prev => prev.filter(u => u.id !== user.id))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add member')
    } finally {
      setAdding(null)
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', animation: 'fadeIn 300ms ease' }}>
      <Link to={`/groups/${id}`} style={{ color: 'var(--text-faint)', fontSize: '0.85rem', display: 'inline-block', marginBottom: '1rem' }}>← Back to group</Link>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.75rem' }}>
        <PeopleIllustration />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.3rem' }}>Add Member</h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          Search by username or email
        </p>

        {success && (
          <div style={{ background: 'var(--success-soft)', border: '1px solid rgba(63,185,80,0.3)', color: '#56d364', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: 'var(--danger-soft)', border: '1px solid rgba(248,81,73,0.3)', color: '#ff8782', padding: '10px 14px', borderRadius: 'var(--radius)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <input
          type="text" value={query} onChange={handleInput}
          placeholder="Type a username or email..."
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text)', fontSize: '0.95rem', outline: 'none', marginBottom: '1rem',
            transition: 'border-color 150ms ease',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        {searching && (
          <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem' }}>Searching...</p>
        )}

        {!searching && results.length > 0 && results.map((u, i) => (
          <div key={u.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0',
            borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
              }}>
                {u.display_name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.display_name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>@{u.username} · {u.email}</p>
              </div>
            </div>
            <button onClick={() => handleAdd(u)} disabled={adding === u.id} style={{
              background: 'var(--accent-soft)', color: 'var(--accent-hover)', border: 'none', padding: '6px 14px',
              borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.8rem', opacity: adding === u.id ? 0.6 : 1,
              transition: 'background 150ms ease',
            }}
            onMouseEnter={e => { if (adding !== u.id) e.currentTarget.style.background = 'var(--accent)'; if (adding !== u.id) e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent-hover)' }}
            >
              {adding === u.id ? '...' : 'Add'}
            </button>
          </div>
        ))}

        {!searching && query.length >= 2 && results.length === 0 && (
          <p style={{ color: 'var(--text-faint)', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem 0' }}>No users found</p>
        )}

        {query.length < 2 && (
          <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', textAlign: 'center', paddingTop: '0.5rem' }}>
            Type at least 2 characters to search
          </p>
        )}
      </div>
    </div>
  )
}