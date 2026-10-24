import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ideaAPI } from '../../services/api.js'

// The server recalculates everything. These values only power the live preview.
const CRITERIA = [
  { key: 'problem', label: 'Problem clarity', weight: 20, hint: 'Is a real, specific problem described?' },
  { key: 'innovation', label: 'Innovation', weight: 20, hint: 'Is it new, or clearly better than what exists?' },
  { key: 'feasibility', label: 'Feasibility', weight: 20, hint: 'Can it be built with realistic resources and time?' },
  { key: 'impact', label: 'Market / social impact', weight: 20, hint: 'Who benefits, and how many people?' },
  { key: 'team', label: 'Team capability', weight: 10, hint: 'Does the team have the skills to deliver?' },
  { key: 'alignment', label: 'Alignment with MInT priorities', weight: 10, hint: 'Does it fit national innovation and technology goals?' },
]

const REJECT_CODES = [
  ['duplicate', 'Duplicate idea'],
  ['plagiarism', 'Plagiarism'],
  ['harmful_content', 'Illegal or harmful content'],
  ['incomplete', 'Incomplete submission'],
  ['not_feasible', 'Not feasible'],
  ['out_of_scope', 'Out of scope'],
  ['low_impact', 'Low impact'],
  ['other', 'Other'],
]
const HARD_REJECT = ['duplicate', 'plagiarism', 'harmful_content', 'incomplete']
const DECISIONS = [
  ['approved', 'Approve'],
  ['revision_requested', 'Request revision'],
  ['rejected', 'Reject'],
]
const APPROVE_MIN = 75
const REVISION_MIN = 50
const MIN_TEXT = 30

const labelFor = { approved: 'Approve', revision_requested: 'Request revision', rejected: 'Reject' }

export default function IdeaReviewModal({ idea, onClose, onDone }) {
  const [scores, setScores] = useState({})
  const [decision, setDecision] = useState('')
  const [reasonCode, setReasonCode] = useState('')
  const [comment, setComment] = useState('')
  const [override, setOverride] = useState('')
  const [saving, setSaving] = useState(false)

  const allScored = CRITERIA.every((c) => scores[c.key])
  const total = allScored
    ? Math.round(CRITERIA.reduce((sum, c) => sum + (scores[c.key] / 5) * c.weight, 0))
    : null
  const suggested = total === null ? null : total >= APPROVE_MIN ? 'approved' : total >= REVISION_MIN ? 'revision_requested' : 'rejected'

  const needsOverride =
    total !== null &&
    ((decision === 'approved' && total < APPROVE_MIN) ||
      (decision === 'rejected' && total >= REVISION_MIN && reasonCode && !HARD_REJECT.includes(reasonCode)))

  const valid =
    allScored &&
    decision &&
    comment.trim().length >= MIN_TEXT &&
    (decision !== 'rejected' || reasonCode) &&
    (!needsOverride || override.trim().length >= MIN_TEXT)

  const submit = async () => {
    setSaving(true)
    try {
      await ideaAPI.review(idea.id || idea._id, {
        scores,
        decision,
        comment: comment.trim(),
        reason_code: decision === 'rejected' ? reasonCode : null,
        override_reason: needsOverride ? override.trim() : null,
      })
      toast.success('Decision saved')
      onDone()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save decision')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-primary-800 p-6 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Review idea</p>
            <h3 className="font-heading text-xl font-semibold text-ink dark:text-white">{idea.title || 'Untitled'}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><XMarkIcon className="h-5 w-5" /></button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p><span className="font-medium text-ink dark:text-white">Problem: </span>{idea.problem || 'Not provided'}</p>
          <p><span className="font-medium text-ink dark:text-white">Solution: </span>{idea.solution || 'Not provided'}</p>
          <p className="text-xs text-slate-400">{idea.industry || 'General'} - Innovation level {idea.innovation_level || 'N/A'}/10</p>
        </div>

        <h4 className="font-heading font-semibold text-ink dark:text-white mt-6 mb-2">1. Score each criterion (1 = weak, 5 = excellent)</h4>
        <div className="space-y-3">
          {CRITERIA.map((c) => (
            <div key={c.key} className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink dark:text-white">{c.label} <span className="text-xs text-slate-400">({c.weight}%)</span></p>
                <p className="text-xs text-slate-500">{c.hint}</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScores({ ...scores, [c.key]: n })}
                    className={'h-8 w-8 rounded-lg text-sm font-medium border ' + (scores[c.key] === n ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-primary-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-primary-600 hover:border-primary')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 dark:bg-primary-700 p-4 text-sm">
          {total === null ? (
            <p className="text-slate-500">Score all six criteria to see the total.</p>
          ) : (
            <p className="text-ink dark:text-white">
              Total: <span className="font-heading text-2xl font-semibold">{total}</span>/100 - the score suggests <span className="font-semibold">{labelFor[suggested]}</span>
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">75+ can be approved. 50 to 74 should go back for revision. Below 50 can be rejected.</p>
        </div>

        <h4 className="font-heading font-semibold text-ink dark:text-white mt-6 mb-2">2. Decision</h4>
        <div className="flex flex-wrap gap-2">
          {DECISIONS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={!allScored}
              onClick={() => setDecision(value)}
              className={'px-4 py-2 rounded-xl text-sm font-medium border disabled:opacity-40 ' + (decision === value ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-primary-700 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-primary-600')}
            >
              {label}
            </button>
          ))}
        </div>

        {decision === 'rejected' && (
          <select className="input text-sm mt-3 w-full" value={reasonCode} onChange={(e) => setReasonCode(e.target.value)}>
            <option value="">Select a reject reason...</option>
            {REJECT_CODES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        )}

        <h4 className="font-heading font-semibold text-ink dark:text-white mt-6 mb-2">3. Written reason (the innovator will see this)</h4>
        <textarea
          className="input text-sm w-full"
          rows={3}
          placeholder="Explain your decision and what the innovator should improve..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <p className={'text-xs mt-1 ' + (comment.trim().length >= MIN_TEXT ? 'text-emerald-600' : 'text-slate-400')}>
          {comment.trim().length}/{MIN_TEXT} characters minimum
        </p>

        {needsOverride && (
          <div className="mt-4">
            <p className="text-sm font-medium text-amber-700">This decision goes against the score. Add a justification.</p>
            <textarea
              className="input text-sm w-full mt-1"
              rows={2}
              placeholder="Why does this decision differ from the score?"
              value={override}
              onChange={(e) => setOverride(e.target.value)}
            />
            <p className={'text-xs mt-1 ' + (override.trim().length >= MIN_TEXT ? 'text-emerald-600' : 'text-slate-400')}>
              {override.trim().length}/{MIN_TEXT} characters minimum
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="btn btn-outline text-sm">Cancel</button>
          <button type="button" onClick={submit} disabled={!valid || saving} className="btn btn-primary text-sm disabled:opacity-40">
            {saving ? 'Saving...' : 'Save decision'}
          </button>
        </div>
      </div>
    </div>
  )
}
