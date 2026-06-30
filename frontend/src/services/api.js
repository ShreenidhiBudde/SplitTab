import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser   = (data) => api.post('/users/register', data)
export const loginUser      = (data) => api.post('/users/login', data)
export const getMe          = ()     => api.get('/users/me')

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard   = ()     => api.get('/dashboard/summary')

// ── Groups ────────────────────────────────────────────────────────────────────
export const getGroups      = ()           => api.get('/groups/')
export const createGroup    = (data)       => api.post('/groups/', data)
export const getGroup       = (id)         => api.get(`/groups/${id}`)
export const addMember      = (id, data)   => api.post(`/groups/${id}/members`, data)
export const removeMember   = (id, uid)    => api.delete(`/groups/${id}/members/${uid}`)

// ── Expenses ──────────────────────────────────────────────────────────────────
export const getExpenses    = (gid)        => api.get(`/groups/${gid}/expenses`)
export const createExpense  = (gid, data)  => api.post(`/groups/${gid}/expenses`, data)

// ── Balances ──────────────────────────────────────────────────────────────────
export const getBalances    = (gid)        => api.get(`/groups/${gid}/balances`)

// ── Settlements ───────────────────────────────────────────────────────────────
export const getSuggestions     = (gid)       => api.get(`/groups/${gid}/settlements/suggestions`)
export const getSettlements     = (gid)       => api.get(`/groups/${gid}/settlements`)
export const recordSettlement   = (gid, data) => api.post(`/groups/${gid}/settlements`, data)

export const searchUsers = (q)        => api.get(`/users/search?q=${encodeURIComponent(q)}`)

export default api