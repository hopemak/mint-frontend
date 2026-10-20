import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellIcon } from '@heroicons/react/24/outline'
import { notificationAPI } from '../services/api.js'

const ago = (iso) => {
  const m = Math.floor((Date.now() - new Date(iso + (iso.endsWith('Z') ? '' : 'Z')).getTime()) / 60000)
  if (!Number.isFinite(m) || m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  if (m < 1440) return `${Math.floor(m / 60)} h ago`
  return `${Math.floor(m / 1440)} d ago`
}

export default function NotificationBell() {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(() => {
    notificationAPI.list()
      .then((r) => { setItems(r.data.notifications || []); setUnread(r.data.unread || 0) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 60000)
    return () => clearInterval(t)
  }, [load])

  const openItem = async (n) => {
    setOpen(false)
    if (!n.read) {
      setItems((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      setUnread((u) => Math.max(0, u - 1))
      notificationAPI.read(n.id).catch(() => {})
    }
    if (n.link) navigate(n.link)
  }

  const readAll = async () => {
    setItems((p) => p.map((x) => ({ ...x, read: true })))
    setUnread(0)
    notificationAPI.readAll().catch(() => {})
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) load() }} aria-label="Notifications"
        className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-primary-700">
        <BellIcon className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] z-50 rounded-xl bg-white dark:bg-primary-800 shadow-xl border border-slate-100 dark:border-primary-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-primary-700">
              <p className="font-medium text-sm">Notifications</p>
              {unread > 0 && <button onClick={readAll} className="text-xs text-primary">Mark all read</button>}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">You are all caught up.</p>
              ) : items.map((n) => (
                <button key={n.id} onClick={() => openItem(n)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 dark:border-primary-700 hover:bg-slate-50 dark:hover:bg-primary-700 ${n.read ? '' : 'bg-primary/5'}`}>
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-accent-500 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.message && <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>}
                      <p className="text-[11px] text-slate-400 mt-1">{ago(n.created_at)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
