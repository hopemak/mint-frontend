import React, { useState } from 'react'
import { testimonialAPI } from '../../services/api'

export default function ShareStory() {
  const [quote, setQuote] = useState('')
  const [company, setCompany] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setMsg(''); setBusy(true)
    try {
      const r = await testimonialAPI.submit({ quote, company })
      setMsg(r.data?.message || 'Submitted for admin approval')
      setQuote(''); setCompany('')
    } catch (ex) {
      setErr(ex.response?.data?.error || 'Could not submit. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-xl p-6">
      <h1 className="font-heading text-2xl font-semibold mb-1">Share your story</h1>
      <p className="text-sm text-slate-500 mb-5">
        Your words will appear on the public landing page under your name after an admin approves them.
      </p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Your startup / company</label>
          <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="label">Your testimonial (20-400 characters)</label>
          <textarea className="input" rows={5} maxLength={400} required
            value={quote} onChange={(e) => setQuote(e.target.value)} />
          <p className="text-xs text-slate-400 mt-1">{quote.length}/400</p>
        </div>
        {msg && <p className="text-sm text-green-600">{msg}</p>}
        {err && <p className="text-sm text-red-500">{err}</p>}
        <button className="btn-primary px-6 py-2.5" disabled={busy || quote.trim().length < 20}>
          {busy ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  )
}
