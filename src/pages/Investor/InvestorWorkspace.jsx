import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../../services/api.js'

const BASE = '/api/investor-workspace'
const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Agriculture', 'Education']

export default function InvestorWorkspace() {
  const [items, setItems] = useState([])
  const [state, setState] = useState({ loading: true, error: '' })
  const [q, setQ] = useState('')
  const [industry, setIndustry] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [openId, setOpenId] = useState(null)
  const [note, setNote] = useState('')

  const load = async () => {
    setState({ loading: true, error: '' })
    try {
      const r = await api.get(BASE + '/startups', { params: { q, industry } })
      setItems(r.data.data || [])
      setState({ loading: false, error: '' })
    } catch (e) {
      setState({ loading: false, error: e.response?.data?.error || 'Could not load startups' })
    }
  }
  useEffect(() => { load() }, [industry])

  const toggleWatch = async (id) => {
    try {
      const r = await api.post(BASE + '/watch/' + id)
      setItems(items.map((i) => (i.id === id ? { ...i, watched: r.data.watched } : i)))
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not save')
    }
  }

  const sendInterest = async (id) => {
    try {
      await api.post(BASE + '/interest/' + id, { note })
      toast.success('Interest sent to the founder')
      setItems(items.map((i) => (i.id === id ? { ...i, interested: true } : i)))
      setOpenId(null)
      setNote('')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Could not send')
    }
  }

  const shown = savedOnly ? items.filter((i) => i.watched) : items

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="font-heading text-2xl font-semibold text-ink">Funder workspace</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ideas approved by the review team. Save the ones you like and tell the founder you are interested.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input className="input text-sm" placeholder="Search title, problem or solution" value={q}
          onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
        <select className="input text-sm" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">All industries</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <button type="button" onClick={load} className="btn-secondary text-sm">Search</button>
        <label className="flex items-center gap-1 text-sm text-slate-600">
          <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} /> Saved only
        </label>
      </div>

      {state.loading && <p className="mt-6 text-sm text-slate-500">Loading...</p>}
      {state.error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">{state.error}</p>}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {shown.map((i) => (
          <div key={i.id} className="card p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">{i.industry || 'General'} - Innovation {i.innovation_level || 'N/A'}/10</p>
            <h3 className="mt-1 font-heading font-semibold text-ink">{i.title}</h3>
            <p className="mt-2 text-sm text-slate-600"><span className="font-medium">Problem: </span>{(i.problem || 'Not provided').slice(0, 160)}</p>
            <p className="mt-1 text-sm text-slate-600"><span className="font-medium">Solution: </span>{(i.solution || 'Not provided').slice(0, 160)}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => toggleWatch(i.id)} className="btn btn-outline text-sm">
                {i.watched ? 'Saved' : 'Save'}
              </button>
              {i.interested ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">Interest sent</span>
              ) : (
                <button type="button" className="btn-primary px-4 text-sm"
                  onClick={() => { setOpenId(openId === i.id ? null : i.id); setNote('') }}>
                  Show interest
                </button>
              )}
            </div>

            {openId === i.id && (
              <div className="mt-3">
                <textarea className="input w-full text-sm" rows={3} value={note}
                  placeholder="Introduce yourself and say what interests you (min 10 characters)"
                  onChange={(e) => setNote(e.target.value)} />
                <button type="button" onClick={() => sendInterest(i.id)} className="btn-primary mt-2 px-4 text-sm">Send</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {!state.loading && !state.error && shown.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">No approved ideas match. Ideas appear here after an admin approves them.</p>
      )}
    </div>
  )
}
