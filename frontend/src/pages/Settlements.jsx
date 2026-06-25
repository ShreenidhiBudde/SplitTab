import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSettlements, getSuggestions } from '../services/api'

export default function Settlements() {
  const { id } = useParams()
  const [settlements, setSettlements] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    Promise.all([getSettlements(id), getSuggestions(id)]).then(([s, sg]) => {
      setSettlements(s.data)
      setSuggestions(sg.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <p>Loading...</p>

  const card = { background:'#fff', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)', marginBottom:'1.5rem' }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2>Settlements</h2>
        <Link to={`/groups/${id}/settlements/new`}
          style={{ background:'#16a34a', color:'#fff', padding:'8px 18px', borderRadius:'8px', fontWeight:600 }}>
          + Record Settlement
        </Link>
      </div>

      <div style={card}>
        <h3 style={{ marginBottom:'1rem' }}>Suggested Settlements</h3>
        {suggestions.length === 0
          ? <p style={{ color:'#aaa' }}>All settled up! 🎉</p>
          : suggestions.map((s, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.6rem 0', borderBottom:'1px solid #f0f0f0' }}>
              <span>
                <strong>{s.from_username}</strong>
                <span style={{ color:'#888', margin:'0 0.5rem' }}>→</span>
                <strong>{s.to_username}</strong>
              </span>
              <span style={{ color:'#e94560', fontWeight:700 }}>₹{Number(s.amount).toFixed(2)}</span>
            </div>
          ))
        }
      </div>

      <div style={card}>
        <h3 style={{ marginBottom:'1rem' }}>Settlement History</h3>
        {settlements.length === 0
          ? <p style={{ color:'#aaa' }}>No settlements recorded yet.</p>
          : settlements.map(s => (
            <div key={s.id} style={{ display:'flex', justifyContent:'space-between', padding:'0.6rem 0', borderBottom:'1px solid #f0f0f0' }}>
              <span>
                <strong>{s.paid_by_username}</strong>
                <span style={{ color:'#888', margin:'0 0.5rem' }}>paid</span>
                <strong>{s.paid_to_username}</strong>
                {s.note && <span style={{ color:'#aaa', fontSize:'0.8rem', marginLeft:'0.5rem' }}>· {s.note}</span>}
              </span>
              <span style={{ color:'#16a34a', fontWeight:700 }}>₹{Number(s.amount).toFixed(2)}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}