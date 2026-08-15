import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RoleRoute({ allow }) {
  const { user } = useAuth()
  const role = String(user?.role || '').toLowerCase()
  const isAdmin = role === 'admin'
  const allowed = isAdmin || allow.map((r) => r.toLowerCase()).includes(role)
  if (!allowed) return <Navigate to="/restricted" replace />
  return <Outlet />
}
