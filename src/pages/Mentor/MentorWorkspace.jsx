import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../services/api.js'

const BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-slate-200 text-slate-600',
}
const BASE = '/api/mentor-workspace'

function Thread({ founderId, canReply }) {
  const [msgs, setMsgs] = useState([])
  const [text, setText] = useState('')

  const load = async () => {
    try {
      const r = await api.get(BASE + '/thread/' + founderId)
      setMsgs(r.data.data || [])
    } catch (e) {
      toast.error('Could not load messages')
    }
  }
  useEffect(() => { load() }, [founderId])

  const send = async () => {
    if (!text.trim()) return
    try {
      await api.post(BASE + '/thread/' + founderId, { text: text.trim() })
      setText('')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not send')
    }
  }

  return (
    <div className="mt-3 rounded-xl bg-slate-50 p-3">
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {msgs.length === 0 && <p className="text-xs text-slate-500">No messages yet.</p>}
        {msgs.map((m) => (
          <div key={m.message_id} className={m.from === 'mentor' ? 'text-right' : 'text-left'}>
            <span className={'inline-block rounded-lg px-3 py-1.5 text-sm ' +
              (m.from === 'mentor' ? 'bg-[#1D4241] text-white' : 'bg-white text-ink border border-slate-200')}>
              {m.text}
            </span>
          </div>
        ))}
      </div>
      {canReply && (
        <div className="mt-3 flex gap-2">
          <input className="input flex-1 text-sm" value={text} placeholder="Write a reply..."
            onChange={(e) => setText(e.target.value)} />
          <button type="button" onClick={send} className="btn-primary px-4 text-sm">Send</button>
        </div>
      )}
    </div>
  )
}

export default function MentorWorkspace() {
  const [state, setState] = useState({ loading: true, linked: true, items: [], error: '' })
  const [notes, setNotes] = useState({})
  const [open, setOpen] = useState(null)

  const load = async () => {
    try {
      const r = await api.get(BASE + '/requests')
      setState({ loading: false, linked: r.data.linked, items: r.data.data || [], error: '' })
    } catch (e) {
      setState({ loading: false, linked: true, items: [], error: e.response?.data?.error || 'Could not load requests' })
    }
  }
  useEffect(() => { load() }, [])

  const respond = async (id, action) => {
    try {
      await api.post(BASE + '/requests/' + id + '/respond', { action, note: notes[id] || '' })
      toast.success(action === 'accept' ? 'Request accepted' : 'Request declined')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not save')
    }
  }

  const pending = state.items.filter((r) => r.status === 'pending').length

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="font-heading text-2xl font-semibold text-ink">Mentor workspace</h1>
      <p className="mt-1 text-sm text-slate-500">
        Founders who asked you for a session. Accept or decline, then guide them in the chat.
      </p>

      {state.loading && <p className="mt-6 text-sm text-slate-500">Loading...</p>}
      {state.error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</p>}
      {!state.loading && !state.linked && (
        <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Your account is not linked to a mentor profile yet. Ask an admin to link it.
        </p>
      )}
      {!state.loading && state.linked && !state.error && (
        <p className="mt-4 text-sm text-slate-600">{pending} waiting for your answer</p>
      )}

      <div className="mt-4 space-y-4">
        {state.items.map((r) => (
          <div key={r.request_id} className="card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{r.founder_name}</p>
                <p className="text-xs text-slate-400">
                  {r.request_id} - {(r.created_at || '').slice(0, 10)}
                </p>
              </div>
              <span className={'rounded-full px-2.5 py-1 text-xs font-semibold ' + (BADGE[r.status] || BADGE.pending)}>
                {r.status}
              </span>
            </div>

            {r.status === 'pending' && (
              <div className="mt-3">
                <textarea className="input w-full text-sm" rows={2} placeholder="Optional note to the founder..."
                  value={notes[r.request_id] || ''}
                  onChange={(e) => setNotes({ ...notes, [r.request_id]: e.target.value })} />
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => respond(r.request_id, 'accept')} className="btn-primary px-4 text-sm">Accept</button>
                  <button type="button" onClick={() => respond(r.request_id, 'decline')} className="btn btn-outline text-sm">Decline</button>
                </div>
              </div>
            )}

            {r.status !== 'pending' && r.mentor_note && (
              <p className="mt-2 text-sm text-slate-600">Your note: {r.mentor_note}</p>
            )}

            {r.status !== 'declined' && (
              <button type="button" className="mt-3 text-xs text-slate-500 underline"
                onClick={() => setOpen(open === r.request_id ? null : r.request_id)}>
                {open === r.request_id ? 'Hide chat' : 'Open chat'}
              </button>
            )}
            {open === r.request_id && <Thread founderId={r.user_id} canReply={r.status === 'accepted'} />}
          </div>
        ))}
        {!state.loading && state.linked && !state.error && state.items.length === 0 && (
          <p className="text-sm text-slate-500">No session requests yet.</p>
        )}
      </div>
    </div>
  )
}
