import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar        from './components/Navbar'
import { useAuth }   from './context/AuthContext'

import Login            from './pages/Login'
import Register         from './pages/Register'
import Dashboard        from './pages/Dashboard'
import Groups           from './pages/Groups'
import GroupDetail      from './pages/GroupDetail'
import CreateGroup      from './pages/CreateGroup'
import AddExpense       from './pages/AddExpense'
import Balances         from './pages/Balances'
import Settlements      from './pages/Settlements'
import RecordSettlement from './pages/RecordSettlement'
import AddMember        from './pages/AddMember'

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth:'960px', margin:'2rem auto', padding:'0 1rem' }}>
        {children}
      </main>
    </>
  )
}

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups" element={
        <ProtectedRoute><Layout><Groups /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups/new" element={
        <ProtectedRoute><Layout><CreateGroup /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups/:id" element={
        <ProtectedRoute><Layout><GroupDetail /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups/:id/expenses/new" element={
        <ProtectedRoute><Layout><AddExpense /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups/:id/balances" element={
        <ProtectedRoute><Layout><Balances /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups/:id/settlements" element={
        <ProtectedRoute><Layout><Settlements /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups/:id/settlements/new" element={
        <ProtectedRoute><Layout><RecordSettlement /></Layout></ProtectedRoute>
      }/>
      <Route path="/groups/:id/members/add" element={
        <ProtectedRoute><Layout><AddMember /></Layout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  )
}