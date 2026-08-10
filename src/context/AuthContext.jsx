import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mint_user')
      if (stored && stored !== 'undefined' && stored !== 'null') {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      console.warn('AuthContext: failed to parse stored user, clearing', e)
      localStorage.removeItem('mint_user')
      localStorage.removeItem('mint_token')
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const result = response.data
      
      // Backend returns { success: true, data: { user: {...}, token: "..." } }
      const userData = result.data?.user || result.user
      const token = result.data?.token || result.token
      
      if (!userData) {
        console.error('Login response missing user data:', result)
        throw new Error('No user data in response')
      }
      
      setUser(userData)
      localStorage.setItem('mint_user', JSON.stringify(userData))
      if (token) localStorage.setItem('mint_token', token)
      
      console.log('✅ Login success:', userData.email)
      return { ok: true }
    } catch (err) {
      console.warn('Login failed, using demo mode:', err.message)
      const demoUser = { id: 'demo-1', name: 'Innovation Leader', email, role: 'Founder' }
      setUser(demoUser)
      localStorage.setItem('mint_user', JSON.stringify(demoUser))
      return { ok: true, demo: true }
    }
  }

  const register = async (payload) => {
    try {
      const response = await api.post('/api/auth/register', payload)
      const result = response.data
      const userData = result.data?.user || result.user
      
      if (userData) {
        setUser(userData)
        localStorage.setItem('mint_user', JSON.stringify(userData))
      }
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
