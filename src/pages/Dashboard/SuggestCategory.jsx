import React, { useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
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

export default function SuggestCategory({ title, problem, solution, industries = [], onPick }) {
  const [state, setState] = useState({ status: 'idle', result: null, applied: null })
  const text = `${title || ''} ${problem || ''} ${solution || ''}`.trim()

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
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-primary-700">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={run} disabled={text.length < 10 || state.status === 'loading'} className="btn btn-primary text-xs">
          <SparklesIcon className="mr-1 inline h-4 w-4" />
          {state.status === 'loading' ? 'Checking...' : 'Suggest industry'}
        </button>
        {state.status === 'idle' && (
          <span className="text-xs text-slate-500 dark:text-slate-400">Write a title and problem first, then let the AI suggest an industry.</span>
        )}
        {state.status === 'error' && (
          <span className="text-xs text-slate-500 dark:text-slate-400">Suggestion unavailable right now. Please choose manually.</span>
        )}
        {state.status === 'done' && r && (
          <span className="text-xs text-slate-600 dark:text-slate-300">
            {r.low_confidence
              ? `Not sure (best guess: ${LABELS[r.raw_prediction] || r.raw_prediction}, ${Math.round(r.confidence * 100)}%). Please choose manually.`
              : `Suggested: ${LABELS[r.category] || r.category} (${Math.round(r.confidence * 100)}% sure)${state.applied ? ` - set Industry to "${state.applied}"` : ' - choose the matching industry yourself'}. You can change it.`}
          </span>
        )}
      </div>
    </div>
  )
}
