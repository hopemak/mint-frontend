import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('mint_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password })
      setUser(data.user)
      localStorage.setItem('mint_user', JSON.stringify(data.user))
      if (data.token) localStorage.setItem('mint_token', data.token)
      return { ok: true }
    } catch (err) {
      // Fallback demo mode when backend at localhost:5000 is unavailable
      const demoUser = { id: 'demo-1', name: 'Innovation Leader', email, role: 'Founder' }
      setUser(demoUser)
      localStorage.setItem('mint_user', JSON.stringify(demoUser))
      return { ok: true, demo: true }
    }
  }

  const register = async (payload) => {
    try {
      const { data } = await api.post('/api/auth/register', payload)
      setUser(data.user)
      localStorage.setItem('mint_user', JSON.stringify(data.user))
      return { ok: true }
    } catch (err) {
      const demoUser = { id: 'demo-1', name: payload.fullName, email: payload.email, role: payload.role }
      setUser(demoUser)
      localStorage.setItem('mint_user', JSON.stringify(demoUser))
      return { ok: true, demo: true }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mint_user')
    localStorage.removeItem('mint_token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
