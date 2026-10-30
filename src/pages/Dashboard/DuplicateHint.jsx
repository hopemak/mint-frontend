import React, { useEffect, useState } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { api } from '../../services/api.js'

// Live, advisory duplicate hint for founders. It never shows other ideas'
// titles, and it never blocks submission.
export default function DuplicateHint({ title, problem, solution }) {
  const [state, setState] = useState({ status: 'idle', similar: false, percent: 0 })
  const text = [title, problem, solution].filter(Boolean).join(' ').trim()

  useEffect(() => {
    if (text.length < 30) {
      setState({ status: 'idle', similar: false, percent: 0 })
      return undefined
    }
    setState((s) => ({ ...s, status: 'loading' }))
    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/api/ml/idea-similar-check', {
          title: title || '', problem: problem || '', solution: solution || '',
        })
        setState({ status: 'ready', similar: !!res.data?.similar, percent: res.data?.percent || 0 })
      } catch (e) {
        setState({ status: 'error', similar: false, percent: 0 })
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [text])

  let tone = 'border-slate-200 bg-slate-50'
  let Icon = DocumentDuplicateIcon
  let heading = 'Live duplicate check'
  let line = 'Keeps checking as you fill in the title, problem and solution.'

  if (state.status === 'loading') {
    line = 'Checking saved ideas...'
  } else if (state.status === 'error') {
    line = 'Could not check right now. You can still submit.'
  } else if (state.status === 'ready' && state.similar) {
    tone = 'border-amber-200 bg-amber-50'
    Icon = ExclamationTriangleIcon
    heading = 'A similar idea may already exist'
    line = 'About ' + state.percent + '% similar wording. Explain what makes yours different before submitting.'
  } else if (state.status === 'ready') {
    tone = 'border-emerald-200 bg-emerald-50'
    Icon = CheckCircleIcon
    heading = 'No similar idea found'
    line = 'Nothing close to this wording was found among saved ideas.'
  }

  return (
    <div className={'rounded-xl border p-4 flex gap-2.5 mb-4 ' + tone}>
      <Icon className="h-5 w-5 shrink-0 text-slate-500" />
      <div>
        <p className="text-sm font-medium text-ink">{heading}</p>
        <p className="text-xs text-slate-500">{line}</p>
      </div>
    </div>
  )
}
