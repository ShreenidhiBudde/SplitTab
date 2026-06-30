import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { searchUsers, addMember } from '../services/api'

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
    <div style={{ maxWidth: '520px' }}>
      <Link to={`/groups/${id}`} style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'inline-block' }}>
        ← Back to group
      </Link>

      <h2 style={{ marginBottom: '0.4rem' }}>Add Member</h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>Search by username or email to add someone to this group.</p>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder="Type a username or email..."
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '0.95rem', outline: 'none', marginBottom: '1rem' }}
        />

        {searching && <p style={{ color: '#888', fontSize: '0.85rem' }}>Searching...</p>}

        {!searching && results.length > 0 && results.map((u, i) => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < results.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
            <span>{u.display_name} <span style={{ color: '#aaa', fontSize: '0.85rem' }}>@{u.username} · {u.email}</span></span>
            <button
              onClick={() => handleAdd(u)}
              disabled={adding === u.id}
              style={{ background: '#0891b2', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: adding === u.id ? 0.6 : 1 }}
            >
              {adding === u.id ? '...' : 'Add'}
            </button>
          </div>
        ))}

        {!searching && query.length >= 2 && results.length === 0 && (
          <p style={{ color: '#aaa', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No users found.</p>
        )}

        {query.length < 2 && (
          <p style={{ color: '#aaa', fontSize: '0.8rem', textAlign: 'center' }}>Type at least 2 characters to search</p>
        )}
      </div>
    </div>
  )
}