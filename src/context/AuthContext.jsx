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

  // Merge fresh profile fields (name, photo...) into the signed-in user and keep the
  // stored copy in sync, so the header updates immediately without signing in again.
  const updateUser = (patch) => {
    setUser((prev) => {
      const next = { ...(prev || {}), ...patch }
      try { localStorage.setItem('mint_user', JSON.stringify(next)) } catch { /* storage blocked or full */ }
      return next
    })
  }

  // The login response does not include the profile photo, so fetch it once per sign-in.
  // This is what makes the photo show up on a new device or after clearing the browser.
  useEffect(() => {
    if (!user?.id) return undefined
    let live = true
    api.get('/api/account/me')
      .then((r) => {
        if (!live) return
        const u = r.data?.user || {}
        const patch = {}
        if ((u.profile_image || '') !== (user.profile_image || '')) patch.profile_image = u.profile_image || ''
        if (u.full_name && u.full_name !== user.full_name) patch.full_name = u.full_name
        if (Object.keys(patch).length) updateUser(patch)
      })
      .catch(() => { /* offline or signed out: keep what we have */ })
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password
      })

      const result = response.data

      if (result.requires_otp) {
        return {
          ok: true,
          requiresOtp: true,
          email: result.data?.email || email
        }
      }

      return {
        ok: false,
        error: 'Unexpected login response'
      }
    } catch (err) {
      if (err.response) {
        const message = err.response.data?.error || 'Login failed'
        return { ok: false, error: message }
      }

      return {
        ok: false,
        error: 'Unable to connect to the backend'
      }
    }
  }

  const verifyOtp = async (email, otp) => {
    try {
      const response = await api.post('/api/auth/verify-otp', {
        email,
        otp
      })

      const result = response.data

      const userData = result.data?.user || result.user
      const token = result.data?.token || result.token

      if (!userData || !token) {
        return {
          ok: false,
          error: 'Invalid server response'
        }
      }

      setUser(userData)
      localStorage.setItem('mint_user', JSON.stringify(userData))
      localStorage.setItem('mint_token', token)

      return { ok: true }
    } catch (err) {
      if (err.response) {
        return {
          ok: false,
          error: err.response.data?.error || 'Invalid verification code'
        }
      }

      return {
        ok: false,
        error: 'Unable to connect to the backend'
      }
    }
  }

  const resendOtp = async (email) => {
    try {
      const response = await api.post('/api/auth/resend-otp', {
        email
      })

      return {
        ok: true,
        message: response.data?.message
      }
    } catch (err) {
      if (err.response) {
        return {
          ok: false,
          error: err.response.data?.error || 'Could not resend code'
        }
      }

      return {
        ok: false,
        error: 'Unable to connect to the backend'
      }
    }
  }

  const resendRegistrationOtp = async (email) => {
    try {
      const response = await api.post(
        '/api/auth/resend-registration-otp',
        { email }
      )

      return {
        ok: true,
        message: response.data?.message
      }
    } catch (err) {
      if (err.response) {
        return {
          ok: false,
          error: err.response.data?.error || 'Could not resend verification code'
        }
      }

      return {
        ok: false,
        error: 'Unable to connect to the backend'
      }
    }
  }

  const register = async (payload) => {
    try {
      const response = await api.post('/api/auth/register', payload)
      const result = response.data

      // New registration requires email verification before login.
      if (result.requires_otp) {
        return {
          ok: true,
          requiresOtp: true,
          email: result.data?.email || payload.email
        }
      }

      // Preserve compatibility with any legacy/demo response.
      const userData = result.data?.user || result.user
      const token = result.data?.token || result.token

      if (userData) {
        setUser(userData)
        localStorage.setItem('mint_user', JSON.stringify(userData))
      }

      if (token) {
        localStorage.setItem('mint_token', token)
      }

      return { ok: true }
    } catch (err) {
      if (err.response) {
        return {
          ok: false,
          error: err.response.data?.error || 'Registration failed'
        }
      }

      return {
        ok: false,
        error: 'Unable to connect to the backend'
      }
    }
  }

  const verifyRegistrationOtp = async (email, otp) => {
    try {
      const response = await api.post(
        '/api/auth/verify-registration-otp',
        { email, otp }
      )

      return {
        ok: true,
        message: response.data?.message
      }
    } catch (err) {
      if (err.response) {
        return {
          ok: false,
          error: err.response.data?.error || 'Verification failed'
        }
      }

      return {
        ok: false,
        error: 'Unable to connect to the backend'
      }
    }
  }

  const loginWithGoogle = async (credential) => {
    try {
      const response = await api.post('/api/auth/google', { credential })
      const result = response.data
      const userData = result.data?.user || result.user
      const token = result.data?.token || result.token
      if (!userData || !token) return { ok: false, error: 'Invalid server response' }
      setUser(userData)
      localStorage.setItem('mint_user', JSON.stringify(userData))
      localStorage.setItem('mint_token', token)
      return { ok: true }
    } catch (err) {
      if (err.response) {
        return { ok: false, error: err.response.data?.error || 'Google sign-in failed' }
      }
      return { ok: false, error: 'Unable to connect to the backend' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mint_user')
    localStorage.removeItem('mint_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyOtp,
        resendOtp,
        register,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        loginWithGoogle,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
