import React from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Restricted() {
  const { user } = useAuth()
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-ink dark:text-white mb-2">Access restricted</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Your account role ({user?.role || 'unknown'}) doesn't have access to this page yet.
        </p>
      </div>
    </div>
  )
}
