import React, { useState } from 'react'
import { SparklesIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { classifyAPI } from '../../services/api.js'

// Suggests an industry from the idea text (TF-IDF + Naive Bayes). Advisory only:
// the founder can change the dropdown at any time.
const LABELS = {
  ai_ml: 'AI / Machine learning',
  biotech: 'Biotech / Health',
  fintech: 'Fintech',
  cleantech: 'Clean energy / Environment',
  edtech: 'Education',
  general: 'General',
}
const KEYWORDS = {
  ai_ml: /\b(ai|artificial|machine|data|software|ict|technology)/i,
  biotech: /(bio|health|medic|pharma|life)/i,
  fintech: /(fin|bank|payment|money)/i,
  cleantech: /(clean|energy|environment|green|climate|renew)/i,
  edtech: /(edu|learn|school|train)/i,
}

export default function IndustrySuggestion({ title, problem, solution, industries = [], onPick }) {
  const [state, setState] = useState({ status: 'idle', result: null, applied: null })
  const text = `${title || ''} ${problem || ''} ${solution || ''}`.trim()
  const loading = state.status === 'loading'

  const run = async () => {
    setState({ status: 'loading', result: null, applied: null })
    try {
      const res = await classifyAPI.classify({ title: title || '', description: `${problem || ''}\n${solution || ''}` })
      const r = res.data
      if (!r || !r.category) throw new Error('no result')
      let applied = null
      if (!r.low_confidence && KEYWORDS[r.category]) {
        applied = industries.find((o) => KEYWORDS[r.category].test(String(o))) || null
        if (applied && onPick) onPick('industry', applied)
      }
      setState({ status: 'done', result: r, applied })
    } catch (e) {
      setState({ status: 'error', result: null, applied: null })
    }
  }

  const r = state.result
  const pct = r ? Math.round((r.confidence || 0) * 100) : 0
  const others = r ? (r.top3 || []).filter((t) => t.category !== (r.raw_prediction || r.category)).slice(0, 2) : []

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-4 shadow-sm dark:border-primary-700 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white">AI industry suggestion</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {text.length < 10 ? 'Write a title and the problem first.' : 'Let the AI suggest an industry from your idea.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={text.length < 10 || loading}
          className="btn btn-primary text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2"><ArrowPathIcon className="h-4 w-4 animate-spin" /> Checking...</span>
          ) : (
            <span className="inline-flex items-center gap-2"><SparklesIcon className="h-4 w-4" /> {state.status === 'done' ? 'Suggest again' : 'Suggest industry'}</span>
          )}
        </button>
      </div>

      {state.status === 'error' && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-primary-800/60 dark:text-slate-300">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>The suggestion is not available right now. Please choose the industry yourself.</span>
        </div>
      )}

      {state.status === 'done' && r && r.low_confidence && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            The AI is not sure yet (best guess: {LABELS[r.raw_prediction] || r.raw_prediction}, {pct}%).
            Add more detail to the problem and solution, then try again, or choose the industry yourself.
          </span>
        </div>
      )}

      {state.status === 'done' && r && !r.low_confidence && (
        <div className="mt-4 rounded-xl bg-white/70 p-4 dark:bg-primary-800/40">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary dark:text-primary-200">
              <CheckCircleIcon className="h-4 w-4" /> {LABELS[r.category] || r.category}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{pct}% sure</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-primary-700">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
            {state.applied
              ? <>Industry set to <span className="font-semibold">{state.applied}</span>. You can change it any time.</>
              : <>Choose the matching industry yourself. You can change it any time.</>}
          </p>
          {others.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <span>Other possibilities:</span>
              {others.map((t) => (
                <span key={t.category} className="rounded-full border border-slate-200 px-2 py-0.5 text-slate-500 dark:border-primary-700 dark:text-slate-300">
                  {LABELS[t.category] || t.category} {Math.round(t.probability * 100)}%
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
