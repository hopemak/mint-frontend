import React, { useEffect, useState } from 'react'
import { api } from '../services/api.js'

// Shows a link only to approved mentors and investors. The backend decides.
export default function WorkspaceLinks() {
  const [links, setLinks] = useState([])

  const check = async () => {
    const [m, i] = await Promise.allSettled([
      api.get('/api/mentor-workspace/me'),
      api.get('/api/investor-workspace/me'),
    ])
    const next = []
    if (m.status === 'fulfilled') next.push({ href: '/mentor-workspace', label: 'Open mentor workspace' })
    if (i.status === 'fulfilled') next.push({ href: '/funder-workspace', label: 'Open funder workspace' })
    setLinks(next)
  }

  useEffect(() => {
    check()
    window.addEventListener('focus', check)
    return () => window.removeEventListener('focus', check)
  }, [])

  if (links.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2">
      {links.map((l) => (
        <a key={l.href} href={l.href}
          className="rounded-full bg-[#1D4241] px-4 py-2 text-sm font-medium text-white shadow-lg hover:bg-[#163535]">
          {l.label}
        </a>
      ))}
    </div>
  )
}
