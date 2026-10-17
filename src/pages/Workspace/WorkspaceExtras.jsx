import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { fundingAPI, sessionAPI } from '../../services/api.js'

const unwrap = (res) => {
  const d = res?.data?.data ?? res?.data
  return Array.isArray(d) ? d : d && typeof d === 'object' ? [d] : []
}
const money = (n) => '$' + Number(n || 0).toLocaleString()
const BADGE = {
  approved: 'bg-green-100 text-green-700',
  accepted: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  requested: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  declined: 'bg-red-100 text-red-700',
}
const Badge = ({ s }) => (
  <span className={`text-[11px] px-2 py-0.5 rounded-full capitalize ${BADGE[String(s).toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>{s || 'pending'}</span>
)

export default function WorkspaceExtras({ project }) {
  const pid = project?.startup_id || project?.id || project?._id
  const [funding, setFunding] = useState([])
  const [sessions, setSessions] = useState([])
  const [evals, setEvals] = useState([])

  useEffect(() => {
    if (!pid) return
    fundingAPI.mine().then((r) => setFunding(unwrap(r).filter((f) => !f.startup_id || f.startup_id === pid))).catch(() => setFunding([]))
    sessionAPI.mine().then((r) => setSessions(unwrap(r))).catch(() => setSessions([]))
    api.get(`/api/evaluations/${pid}`).then((r) => setEvals(unwrap(r))).catch(() => setEvals([]))
  }, [pid])

  const latest = evals.length ? evals[evals.length - 1] : null
  const scores = latest
    ? Object.entries(latest).filter(([k, v]) => /score|rating/i.test(k) && typeof v === 'number')
    : []
  const recs = latest
    ? [].concat(latest.recommendations || latest.suggestions || []).filter((x) => typeof x === 'string').slice(0, 4)
    : []
  const approved = funding.filter((f) => f.status === 'approved').reduce((s, f) => s + Number(f.approved_amount || 0), 0)

  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold">Funding</h2>
          <Link to="/funding" className="text-xs text-primary">Request funding</Link>
        </div>
        {funding.length === 0 ? (
          <p className="text-sm text-slate-400">No funding requests yet.</p>
        ) : (
          <>
            <p className="text-xs text-slate-500 mb-2">Approved so far: <b>{money(approved)}</b></p>
            <ul className="space-y-2">
              {funding.slice(0, 4).map((f, i) => (
                <li key={f._id || f.request_id || i} className="flex items-center justify-between text-sm">
                  <span>{money(f.amount)} <span className="text-xs text-slate-400">{f.stage || ''}</span></span>
                  <Badge s={f.status} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-heading font-semibold mb-3">AI evaluation</h2>
        {!latest ? (
          <p className="text-sm text-slate-400">No evaluation yet. Run one from AI Evaluation.</p>
        ) : (
          <>
            {scores.slice(0, 4).map(([k, v]) => (
              <div key={k} className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 capitalize"><span>{k.replace(/_/g, ' ')}</span><span>{v}</span></div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-primary-600 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, v <= 10 ? v * 10 : v)}%` }} />
                </div>
              </div>
            ))}
            {recs.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                {recs.map((r) => <li key={r}>{r}</li>)}
              </ul>
            )}
          </>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-heading font-semibold mb-3">Mentor sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-slate-400">No session requests yet. Request one under Mentors.</p>
        ) : (
          <ul className="space-y-2">
            {sessions.slice(0, 5).map((s, i) => (
              <li key={s._id || s.session_id || i} className="flex items-center justify-between text-sm">
                <span className="truncate">{s.mentor_name || s.mentor_id || 'Mentor'}</span>
                <Badge s={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
