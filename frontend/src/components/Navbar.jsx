import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const s = {
  nav:  { background:'#1a1a2e', padding:'0 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', height:'56px' },
  logo: { color:'#e94560', fontWeight:700, fontSize:'1.2rem' },
  links:{ display:'flex', gap:'1.5rem' },
  link: { color:'#ccc', fontSize:'0.9rem' },
  btn:  { background:'#e94560', color:'#fff', border:'none', padding:'6px 16px', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
}

export default function Navbar() {
  const { logout, user } = useAuth()
  const nav = useNavigate()

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <nav style={s.nav}>
      <Link to="/dashboard" style={s.logo}>SplitTab</Link>
      <div style={s.links}>
        <Link to="/dashboard" style={s.link}>Dashboard</Link>
        <Link to="/groups"    style={s.link}>Groups</Link>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        <span style={{ color:'#aaa', fontSize:'0.85rem' }}>{user?.display_name}</span>
        <button onClick={handleLogout} style={s.btn}>Logout</button>
      </div>
    </nav>
  )
}