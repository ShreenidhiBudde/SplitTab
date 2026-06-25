import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../services/api'

const card = { background:'#fff', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }
const grid = { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }

function StatCard({ label, value, color='#1a1a2e' }) {
  return (
    <div style={card}>
      <p style={{ fontSize:'0.8rem', color:'#888', marginBottom:'0.4rem' }}>{label}</p>
      <p style={{ fontSize:'1.6rem', fontWeight:700, color }}>{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>
  if (!data)   return <p>Failed to load dashboard.</p>

  return (
    <div>
      <h2 style={{ marginBottom:'1.5rem', fontSize:'1.4rem' }}>Dashboard</h2>

      <div style={grid}>
        <StatCard label="Groups"        value={data.total_groups} />
        <StatCard label="Expenses"      value={data.total_expenses} />
        <StatCard label="Total Spent"   value={`₹${Number(data.total_amount_spent).toFixed(2)}`} />
        <StatCard label="You Owe"       value={`₹${Number(data.amount_owed).toFixed(2)}`}       color="#e94560" />
        <StatCard label="You Receive"   value={`₹${Number(data.amount_to_receive).toFixed(2)}`} color="#22c55e" />
        <StatCard label="Net Balance"   value={`₹${Number(data.net_balance).toFixed(2)}`}
          color={data.net_balance >= 0 ? '#22c55e' : '#e94560'} />
      </div>

      <div style={card}>
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Recent Activity</h3>
        {data.recent_activity.length === 0 && <p style={{ color:'#aaa' }}>No activity yet.</p>}
        {data.recent_activity.map((a, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.6rem 0', borderBottom:'1px solid #f0f0f0' }}>
            <div>
              <span style={{ fontSize:'0.75rem', background: a.type==='expense'?'#eff6ff':'#f0fdf4',
                color: a.type==='expense'?'#3b82f6':'#16a34a', padding:'2px 8px', borderRadius:'12px', marginRight:'0.5rem' }}>
                {a.type}
              </span>
              <span style={{ fontSize:'0.9rem' }}>{a.description}</span>
              <span style={{ fontSize:'0.8rem', color:'#aaa', marginLeft:'0.5rem' }}>· {a.group_name}</span>
            </div>
            <span style={{ fontWeight:600 }}>₹{Number(a.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}