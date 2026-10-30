import React, { useState } from 'react'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { duplicateAPI } from '../../services/duplicateAPI.js'

// Read-only duplicate hint for the admin reviewer. It compares wording only
// (TF-IDF cosine + Jaccard), so it can miss ideas described in different words.
// It does not touch the rubric, the total or the decision.
export default function DuplicatePanel({ idea }) {
  const [state, setState] = useState({ status: 'idle', matches: [] })

  const run = async () => {
    setState({ status: 'loading', matches: [] })
    try {
      const response = await duplicateAPI.check(idea)
      const matches = (response.data?.matches || []).filter((m) => m.score > 0)
      setState({ status: 'ready', matches, total: response.data?.compared_with })
    } catch (e) {
      console.error('Duplicate check failed:', e.response?.status, e.response?.data || e)
      setState({ status: 'error', matches: [] })
    }
  }

  const flagged = state.matches.filter((m) => m.possible_duplicate)

  return (
    <div className="mb-4 rounded-xl border border-slate-100 p-4 dark:border-primary-700">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
            <DocumentDuplicateIcon className="h-4 w-4 text-primary" /> Duplicate check (optional)
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Compares this idea with saved ideas by shared wording. Advisory only: you decide.
          </p>
        </div>
        <button type="button" onClick={run} disabled={state.status === 'loading'} className="btn-secondary shrink-0">
          {state.status === 'loading' ? 'Checking...' : state.status === 'idle' ? 'Check duplicates' : 'Check again'}
        </button>
      </div>

      {state.status === 'error' && (
        <p className="mt-3 text-xs text-red-600">The duplicate check could not be completed. You can still review below.</p>
      )}

      {state.status === 'ready' && state.matches.length === 0 && (
        <p className="mt-3 text-xs text-emerald-600">No similar ideas found (compared with {state.total ?? '?'} other saved ideas).</p>
      )}

      {state.status === 'ready' && state.matches.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className={'text-xs font-medium ' + (flagged.length ? 'text-amber-700' : 'text-slate-500')}>
            {flagged.length
              ? flagged.length + ' possible duplicate' + (flagged.length > 1 ? 's' : '') + ' found'
              : 'No likely duplicates. Closest matches:'}
          </p>
          {state.matches.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-primary-700">
              <span className="min-w-0 truncate text-ink dark:text-white">{m.title || 'Untitled'}</span>
              <span className="shrink-0 text-xs text-slate-500 dark:text-slate-300">
                {Math.round(m.score * 100)}% similar
                {m.possible_duplicate && <span className="ml-2 font-semibold text-amber-700">Possible duplicate</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
