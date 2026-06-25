import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBalances } from '../services/api'

export default function Balances() {
  const { id } = useParams()
  const [balances, setBalances] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getBalances(id).then(r => setBalances(r.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2 style={{ marginBottom:'1.5rem' }}>Group Balances</h2>
      <div style={{ background:'#fff', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
        {balances.map(b => {
          const amt = Number(b.balance)
          const color = amt > 0 ? '#16a34a' : amt < 0 ? '#e94560' : '#888'
          const label = amt > 0 ? 'gets back' : amt < 0 ? 'owes' : 'settled'
          return (
            <div key={b.user_id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.8rem 0', borderBottom:'1px solid #f0f0f0' }}>
              <div>
                <span style={{ fontWeight:600 }}>{b.display_name}</span>
                <span style={{ color:'#aaa', fontSize:'0.85rem', marginLeft:'0.5rem' }}>@{b.username}</span>
              </div>
              <div style={{ textAlign:'right' }}>
                <span style={{ color, fontWeight:700 }}>₹{Math.abs(amt).toFixed(2)}</span>
                <span style={{ color:'#aaa', fontSize:'0.8rem', marginLeft:'0.4rem' }}>{label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}