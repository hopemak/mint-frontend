import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { pitchAPI } from '../../services/api.js'

const LABELS = { problem: 'Problem', market: 'Market', solution: 'Solution', team: 'Team' }

export default function PitchCoach() {
  const [pitch, setPitch] = useState('')
  const [language, setLanguage] = useState('en')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)

  const analyse = async (e) => {
    e.preventDefault()
    setBusy(true)
    setResult(null)
    try {
      const res = await pitchAPI.coach(pitch, language)
      setResult(res.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not analyse the pitch')
    } finally {
      setBusy(false)
    }
  }

  const copy = () => navigator.clipboard?.writeText(result.rewrite).then(() => toast.success('Copied'))

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-5">
      <div className="rounded-2xl bg-primary-800 text-white p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wide text-slate-300">AI Pitch Coach</p>
        <h1 className="font-heading text-2xl font-semibold">Sharpen your pitch before investors see it</h1>
        <p className="text-sm text-slate-300 mt-1">Paste your pitch. You get scores, honest feedback and a stronger rewrite, in English, Amharic or Afaan Oromo.</p>
      </div>

      <form onSubmit={analyse} className="card p-5 space-y-3">
        <textarea
          className="input text-sm" rows={8} maxLength={3000} required
          placeholder="Describe the problem, your solution, your market and your team..."
          value={pitch} onChange={(e) => setPitch(e.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select className="input text-sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="om">Afaan Oromo</option>
            </select>
            <span className="text-xs text-slate-400">{pitch.length}/3000</span>
          </div>
          <button className="btn btn-primary text-sm px-5 py-2" disabled={busy || pitch.trim().length < 80}>
            {busy ? 'Analysing...' : 'Analyse my pitch'}
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.keys(LABELS).map((k) => {
              const s = result.scores[k]
              return (
                <div key={k} className="card p-4">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{LABELS[k]}</span><span>{s.score ? `${s.score}/10` : '-'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-primary-600 overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${s.score * 10}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{s.comment}</p>
                </div>
              )
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-4">
              <h2 className="font-heading font-semibold mb-2 text-emerald-600">Strengths</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm">{result.strengths.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div className="card p-4">
              <h2 className="font-heading font-semibold mb-2 text-amber-600">To improve</h2>
              <ul className="list-disc pl-5 space-y-1 text-sm">{result.improvements.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </div>

          {result.rewrite && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-heading font-semibold">Stronger version</h2>
                <button onClick={copy} className="text-xs text-primary">Copy</button>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line">{result.rewrite}</p>
            </div>
          )}
          <p className="text-xs text-slate-400">AI feedback is guidance, not a guarantee. Check every fact before you share your pitch.</p>
        </div>
      )}
    </div>
  )
}
