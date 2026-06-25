import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGroups } from '../services/api'

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGroups().then(r => setGroups(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2>My Groups</h2>
        <Link to="/groups/new" style={{ background:'#e94560', color:'#fff', padding:'8px 18px', borderRadius:'8px', fontWeight:600 }}>
          + New Group
        </Link>
      </div>

      {groups.length === 0 && <p style={{ color:'#aaa' }}>No groups yet. Create one to get started.</p>}
      <div style={{ display:'grid', gap:'1rem' }}>
        {groups.map(g => (
          <Link key={g.id} to={`/groups/${g.id}`}
            style={{ background:'#fff', borderRadius:'12px', padding:'1.2rem 1.5rem',
              boxShadow:'0 2px 12px rgba(0,0,0,0.06)', display:'block' }}>
            <h3 style={{ marginBottom:'0.3rem' }}>{g.name}</h3>
            <p style={{ color:'#888', fontSize:'0.85rem' }}>{g.description || 'No description'}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}