import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  BanknotesIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, StatCard } from '../../components/ui.jsx'
import { grantAPI, fundingAPI, startupAPI } from '../../services/api.js'

const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

function DiscoverTab() {
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [startup, setStartup] = useState(null)
  const [applyingId, setApplyingId] = useState(null)
  const [appliedIds, setAppliedIds] = useState([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: grantsRes } = await grantAPI.getAll()
        setGrants((grantsRes && grantsRes.data) ? grantsRes.data : [])
      } catch {
        setGrants([])
      }
      try {
        const { data: startupsRes } = await startupAPI.getMyStartups()
        const list = (startupsRes && startupsRes.data) ? startupsRes.data : startupsRes
        setStartup(Array.isArray(list) ? list[0] : null)
      } catch {
        setStartup(null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = grants.filter((g) =>
    query.trim() === '' || (g.grant_name || '').toLowerCase().includes(query.toLowerCase())
  )

  const applyNow = async (grant) => {
    if (!startup) {
      toast.error('Create a startup first before applying.')
      return
    }
    setApplyingId(grant.grant_id)
    try {
      await grantAPI.apply(grant.grant_id, startup.startup_id, grant.max_amount)
      setAppliedIds((prev) => [...prev, grant.grant_id])
      toast.success(`Application submitted for "${grant.grant_name}"`)
    } catch (err) {
      if (err.response?.status === 409) {
        setAppliedIds((prev) => [...prev, grant.grant_id])
        toast('Already applied to this grant')
      } else {
        toast.error(err.response?.data?.error || 'Failed to submit application')
      }
    } finally {
      setApplyingId(null)
    }
  }

  if (loading) return <LoadingBlock />

  return (
    <div>
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search grants..."
          className="input pl-10"
        />
      </div>

      {!startup && (
        <div className="card p-4 mb-4 text-sm text-amber-700 bg-amber-50 dark:bg-amber-900/20">
          Create a startup first to apply for grants.
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
            No grants found.
          </div>
        )}
        {filtered.map((g) => (
          <div key={g.grant_id} className="card p-5 flex flex-col">
            <h3 className="font-heading font-semibold text-ink dark:text-white leading-snug mb-2">{g.grant_name}</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(g.sectors || []).map((s) => (
                <span key={s} className="badge bg-slate-100 dark:bg-primary-700 text-slate-500 dark:text-slate-300">{s}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> Deadline: {g.deadline}</span>
              <span className="flex items-center gap-1"><BanknotesIcon className="h-4 w-4" /> ${(g.max_amount || 0).toLocaleString()} max</span>
            </div>
            <button
              onClick={() => applyNow(g)}
              disabled={applyingId === g.grant_id || appliedIds.includes(g.grant_id) || !startup}
              className="btn-primary w-full py-2 text-sm mt-auto disabled:opacity-50"
            >
              {appliedIds.includes(g.grant_id) ? 'Applied' : applyingId === g.grant_id ? 'Applying...' : 'Apply Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function RequestsTab() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actingId, setActingId] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data: res } = await fundingAPI.mine()
      setRequests((res && res.data) ? res.data : [])
    } catch {
      setRequests([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, action) => {
    setActingId(id)
    try {
      if (action === 'approved') {
        await fundingAPI.approve(id)
      } else {
        await fundingAPI.reject(id, 'Reviewed and declined')
      }
      toast.success(`Request ${action}`)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update request')
    } finally {
      setActingId(null)
    }
  }

  const totalRequested = requests.reduce((s, r) => s + (r.amount || 0), 0)
  const approved = requests.filter((r) => r.status === 'approved').reduce((s, r) => s + (r.amount || 0), 0)

  if (loading) return <LoadingBlock />

  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <StatCard icon={BanknotesIcon} label="Total Requested" value={`$${totalRequested.toLocaleString()}`} />
        <StatCard icon={CheckCircleIcon} label="Approved" value={`$${approved.toLocaleString()}`} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700">
              <th className="px-5 py-3 font-medium">Request ID</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">No requests found.</td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.request_id} className="border-b border-slate-50 dark:border-primary-700 last:border-0">
                <td className="px-5 py-3.5 font-medium text-ink dark:text-white">{r.request_id}</td>
                <td className="px-5 py-3.5 text-slate-500">${(r.amount || 0).toLocaleString()}</td>
                <td className="px-5 py-3.5"><span className={`badge ${statusColor[r.status] || 'bg-slate-100 text-slate-600'}`}>{r.status}</span></td>
                <td className="px-5 py-3.5">
                  {r.status === 'pending' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button disabled={actingId === r.request_id} onClick={() => updateStatus(r.request_id, 'approved')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button disabled={actingId === r.request_id} onClick={() => updateStatus(r.request_id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50">
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 block text-right">No action needed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Funding() {
  const [tab, setTab] = useState('discover')

  return (
    <div>
      <PageHeader
        eyebrow="Finance"
        title={tab === 'discover' ? 'Funding & Grant Opportunities' : 'Funding Requests'}
        action={
          <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-primary-700 p-1">
            {[
              { id: 'discover', label: 'Discover' },
              { id: 'requests', label: 'My Requests' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id ? 'bg-white dark:bg-primary-600 text-primary dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />
      {tab === 'discover' ? <DiscoverTab /> : <RequestsTab />}
    </div>
  )
}
