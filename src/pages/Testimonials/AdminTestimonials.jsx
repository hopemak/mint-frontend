import React, { useEffect, useState } from 'react'
import { testimonialAPI } from '../../services/api'

export default function AdminTestimonials() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = () => {
    setLoading(true)
    testimonialAPI.adminList()
      .then((r) => setItems(r.data.testimonials || []))
      .catch((ex) => setErr(ex.response?.data?.error || 'Could not load testimonials'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const act = async (fn, id) => {
    try { await fn(id); load() } catch (ex) { setErr(ex.response?.data?.error || 'Action failed') }
  }

  const badge = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }

  return (
    <div className="p-6">
      <h1 className="font-heading text-2xl font-semibold mb-4">Testimonials</h1>
      {err && <p className="text-sm text-red-500 mb-3">{err}</p>}
      {loading ? <p className="text-slate-500">Loading...</p> : items.length === 0 ? (
        <p className="text-slate-500">No testimonials submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{t.name}{t.company ? ` · ${t.company}` : ''}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${badge[t.status] || ''}`}>{t.status}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex gap-2">
                {t.status !== 'approved' && (
                  <button className="btn-primary px-4 py-1.5 text-sm" onClick={() => act(testimonialAPI.approve, t.id)}>Approve</button>
                )}
                {t.status !== 'rejected' && (
                  <button className="btn-outline px-4 py-1.5 text-sm" onClick={() => act(testimonialAPI.reject, t.id)}>Reject</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
