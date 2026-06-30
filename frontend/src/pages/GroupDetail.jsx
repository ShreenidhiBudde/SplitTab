import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getGroup } from '../services/api'

export default function GroupDetail() {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGroup(id).then(r => setGroup(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <p>Loading...</p>
  if (!group)  return <p>Group not found.</p>

  const btnRow = { display:'flex', flexWrap:'wrap', gap:'0.75rem', marginBottom:'2rem' }
  const btn    = (to, label, color='#1a1a2e') => (
    <Link to={to} style={{ background:color, color:'#fff', padding:'8px 18px', borderRadius:'8px', fontWeight:600, fontSize:'0.9rem' }}>
      {label}
    </Link>
  )

  return (
    <div>
      <h2 style={{ marginBottom:'0.4rem' }}>{group.name}</h2>
      <p style={{ color:'#888', marginBottom:'1.5rem' }}>{group.description}</p>

      <div style={btnRow}>
        {btn(`/groups/${id}/expenses/new`,   '+ Add Expense',       '#e94560')}
        {btn(`/groups/${id}/members/add`,    '+ Add Member',        '#0891b2')}
        {btn(`/groups/${id}/balances`,        'View Balances',       '#3b82f6')}
        {btn(`/groups/${id}/settlements`,     'Settlements',         '#7c3aed')}
        {btn(`/groups/${id}/settlements/new`, 'Record Settlement',   '#16a34a')}
      </div>

      <div style={{ background:'#fff', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginBottom:'1rem' }}>Members ({group.members.length})</h3>
        {group.members.map(m => (
          <div key={m.user_id} style={{ display:'flex', justifyContent:'space-between', padding:'0.6rem 0', borderBottom:'1px solid #f0f0f0' }}>
            <span>{m.display_name} <span style={{ color:'#aaa', fontSize:'0.85rem' }}>@{m.username}</span></span>
            <span style={{ fontSize:'0.75rem', background: m.role==='admin'?'#fef3c7':'#f1f5f9',
              color: m.role==='admin'?'#d97706':'#64780b', padding:'2px 10px', borderRadius:'12px' }}>
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}