import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { arenaAPI } from '../../services/api.js'

const ROUNDS = 4
const PERSONAS = [
  { key: 'vc', title: 'Skeptical VC', desc: 'Market, traction, returns' },
  { key: 'grant', title: 'Ministry grant officer', desc: 'Impact, feasibility, public money' },
  { key: 'mentor', title: 'Tough mentor', desc: 'Assumptions and execution risks' },
]
const LABEL = { clarity: 'Clarity', evidence: 'Evidence', confidence: 'Confidence', handling: 'Handling questions' }
const KEY = 'arena_history'

export default function InvestorArena() {
  const [step, setStep] = useState('setup') // setup | live | done
  const [pitch, setPitch] = useState('')
  const [persona, setPersona] = useState('vc')
  const [language, setLanguage] = useState('en')
  const [history, setHistory] = useState([])
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [past, setPast] = useState([])
  const end = useRef(null)

  useEffect(() => {
    try { setPast(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { setPast([]) }
  }, [])
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [history, busy])

  const call = (action, hist) => arenaAPI.call({ action, pitch, persona, language, history: hist })
  const fail = (err) => toast.error(err.response?.data?.error || 'Something went wrong')

  const start = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const r = await call('question', [])
      setHistory([{ role: 'investor', text: r.data.question }])
      setStep('live')
    } catch (err) { fail(err) } finally { setBusy(false) }
  }

  const send = async (e) => {
    e.preventDefault()
    const hist = [...history, { role: 'founder', text: answer.trim() }]
    setHistory(hist); setAnswer(''); setBusy(true)
    const answered = hist.filter((h) => h.role === 'founder').length
    try {
      if (answered >= ROUNDS) {
        const r = await call('debrief', hist)
        setResult(r.data); setStep('done')
        const avg = Math.round((Object.values(r.data.scores).reduce((a, b) => a + b, 0) / 4) * 10) / 10
        const next = [...past, { date: new Date().toISOString(), persona, avg }].slice(-8)
        setPast(next); localStorage.setItem(KEY, JSON.stringify(next))
      } else {
        const r = await call('question', hist)
        setHistory([...hist, { role: 'investor', text: r.data.question }])
      }
    } catch (err) { fail(err) } finally { setBusy(false) }
  }

  const reset = () => { setStep('setup'); setHistory([]); setResult(null) }
  const answered = history.filter((h) => h.role === 'founder').length

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">
      <div className="rounded-2xl bg-primary-800 text-white p-5 sm:p-6">
        <p className="text-xs uppercase tracking-wide text-slate-300">Investor Arena</p>
        <h1 className="font-heading text-2xl font-semibold">Defend your startup in {ROUNDS} rounds</h1>
        <p className="text-sm text-slate-300 mt-1">An AI investor questions your pitch. Practise before the real meeting.</p>
      </div>

      {step === 'setup' && (
        <form onSubmit={start} className="card p-5 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            {PERSONAS.map((p) => (
              <button type="button" key={p.key} onClick={() => setPersona(p.key)}
                className={`text-left rounded-xl border p-3 transition ${persona === p.key ? 'border-primary ring-2 ring-primary/30' : 'border-slate-200 dark:border-primary-600'}`}>
                <p className="font-medium text-sm">{p.title}</p>
                <p className="text-xs text-slate-500">{p.desc}</p>
              </button>
            ))}
          </div>
          <textarea className="input text-sm" rows={6} maxLength={3000} required value={pitch}
            onChange={(e) => setPitch(e.target.value)} placeholder="Summarise your startup: problem, solution, market, team (80+ characters)..." />
          <div className="flex items-center justify-between gap-3">
            <select className="input text-sm" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
              <option value="om">Afaan Oromo</option>
            </select>
            <button className="btn btn-primary text-sm px-5 py-2" disabled={busy || pitch.trim().length < 80}>
              {busy ? 'Entering...' : 'Enter the arena'}
            </button>
          </div>
          {past.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Your recent results (this browser)</p>
              <div className="flex items-end gap-1.5 h-12">
                {past.map((p, i) => (
                  <div key={i} title={`${p.avg}/10`} className="flex-1 bg-primary/70 rounded-t" style={{ height: `${p.avg * 10}%` }} />
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      {step === 'live' && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Round {Math.min(answered + 1, ROUNDS)} of {ROUNDS}</span>
            <div className="flex gap-1">{Array.from({ length: ROUNDS }, (_, i) => (
              <span key={i} className={`h-1.5 w-8 rounded-full ${i < answered ? 'bg-primary' : 'bg-slate-200 dark:bg-primary-600'}`} />
            ))}</div>
          </div>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {history.map((h, i) => (
              <div key={i} className={`flex ${h.role === 'founder' ? 'justify-end' : ''}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${h.role === 'founder' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-primary-700'}`}>
                  {h.text}
                </div>
              </div>
            ))}
            {busy && <p className="text-xs text-slate-400">The investor is thinking...</p>}
            <div ref={end} />
          </div>
          <form onSubmit={send} className="flex gap-2">
            <textarea className="input text-sm flex-1" rows={2} maxLength={800} required value={answer}
              onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer..." disabled={busy} />
            <button className="btn btn-primary text-sm px-4" disabled={busy || answer.trim().length < 5}>Answer</button>
          </form>
        </div>
      )}

      {step === 'done' && result && (
        <div className="space-y-4">
          <div className="card p-5">
            <p className="text-xs uppercase text-slate-400">Verdict</p>
            <p className="font-heading text-lg">{result.verdict}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.keys(LABEL).map((k) => (
              <div key={k} className="card p-4">
                <div className="flex justify-between text-sm"><span>{LABEL[k]}</span><span>{result.scores[k]}/10</span></div>
                <div className="h-2 mt-1 rounded-full bg-slate-200 dark:bg-primary-600 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${result.scores[k] * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="card p-4"><h3 className="font-medium text-emerald-600 mb-1">Strongest answer</h3><p className="text-sm">{result.best_answer}</p></div>
            <div className="card p-4"><h3 className="font-medium text-amber-600 mb-1">Weakest answer</h3><p className="text-sm">{result.weakest_answer}</p></div>
          </div>
          <div className="card p-4">
            <h3 className="font-medium mb-1">Next steps</h3>
            <ul className="list-disc pl-5 text-sm space-y-1">{result.next_steps.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
          <button onClick={reset} className="btn btn-primary text-sm px-5 py-2">Try again</button>
          <p className="text-xs text-slate-400">AI feedback is guidance only. Your text is processed by an AI provider.</p>
        </div>
      )}
    </div>
  )
}
