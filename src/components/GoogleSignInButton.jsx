import React, { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext.jsx'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth()
  const ref = useRef(null)

  useEffect(() => {
    if (!CLIENT_ID) return
    const init = () => {
      if (!window.google || !ref.current) return
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (resp) => {
          const res = await loginWithGoogle(resp.credential)
          if (res.ok) {
            toast.success('Login successful!')
            window.location.href = '/dashboard'
          } else {
            toast.error(res.error || 'Google sign-in failed')
          }
        },
      })
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
      })
    }
    if (window.google) {
      init()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = init
    document.head.appendChild(script)
  }, [])

  // Hidden until a Google Client ID is configured, so there is never a dead button.
  if (!CLIENT_ID) return null

  return (
    <div>
      <div className="relative py-2 text-center">
        <span className="bg-white dark:bg-primary-900 px-3 text-xs text-slate-400 relative z-10">
          Or continue with
        </span>
        <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 dark:border-primary-700" />
      </div>
      <div ref={ref} className="flex justify-center mt-3" />
    </div>
  )
}
