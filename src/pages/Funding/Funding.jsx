import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  HeartIcon,
  GlobeAltIcon,
  SparklesIcon,
  ClockIcon,
  BanknotesIcon,
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice, StatCard } from '../../components/ui.jsx'
import Gauge from '../../components/Gauge.jsx'
import { useApiData } from '../../services/useApiData.js'
import { grants as grantsFallback, fundingRequests } from '../../data/sampleData.js'

const typeConfig = {
  'Government Grants': { icon: BuildingLibraryIcon, key: 'Government' },
  'Private Investors': { icon: UserGroupIcon, key: 'Private Investors' },
  NGOs: { icon: HeartIcon, key: 'NGO' },
  'International Programs': { icon: GlobeAltIcon, key: 'International Programs' },
}

const statusColor = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Disbursed: 'bg-primary/10 text-primary',
  Rejected: 'bg-red-100 text-red-700',
}

function DiscoverTab() {
  const { data, loading, isFallback } = useApiData('/api/funding/opportunities', grantsFallback)
  const [activeType, setActiveType] = useState('Government Grants')
  const [query, setQuery] = useState('')

  const list = data || []
  const topPick = useMemo(() => [...list].sort((a, b) => b.match - a.match)[0], [list])

  const filtered = list.filter((g) => {
    const matchesType = g.type === typeConfig[activeType].key
    const matchesQuery = query.trim() === '' || g.name.toLowerCase().includes(query.toLowerCase())
    return matchesType && matchesQuery
  })

  const counts = Object.fromEntries(
    Object.entries(typeConfig).map(([label, cfg]) => [label, list.filter((g) => g.type === cfg.key).length])
  )

  const applyNow = (name) => toast.success(`Application started for "${name}"`)

  if (loading) return <LoadingBlock />

  return (
    <div className="grid lg:grid-cols-4 gap-4">
      {isFallback && (
        <div className="lg:col-span-4">
          <ErrorNotice />
        </div>
      )}

      {/* Left rail — AI match + readiness */}
      <div className="space-y-4">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <SparklesIcon className="h-5 w-5 text-accent-500" />
            <h2 className="font-heading font-semibold text-ink dark:text-white">AI Funding Match</h2>
          </div>
          {topPick && (
            <div className="rounded-xl bg-primary/5 dark:bg-primary-700 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Top Recommendation</p>
              <p className="font-heading font-semibold text-ink dark:text-white leading-snug mb-1">'{topPick.name}'</p>
              <p className="text-sm font-medium text-emerald-600 mb-3">{topPick.match}% Match</p>
              <button onClick={() => applyNow(topPick.name)} className="btn-primary w-full py-2 text-sm">
                Apply <span aria-hidden>→</span>
              </button>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">Funding Probability</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Overall Match Score</p>
          <Gauge
            value={topPick?.match ?? 0}
            variant="solid"
            color="#10B981"
            centerLabel={`${topPick?.match ?? 0}%`}
            centerSub="High Probability"
          />
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Investment Readiness</h2>
          <Gauge
            value={75}
            variant="segmented"
            centerLabel="75%"
            centerSub="Good"
            legend={[
              { color: '#EF4444', label: '0–40' },
              { color: '#F59E0B', label: '41–70' },
              { color: '#10B981', label: '71–100' },
            ]}
          />
          <button className="btn-outline w-full py-2 text-sm mt-3">Optimize</button>
        </div>
      </div>

      {/* Main — search + filters + grant cards */}
      <div className="lg:col-span-3 space-y-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Discover grants, investors, and programs matched to your startup profile.
        </p>

        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search funding, grants..."
            className="input pl-10"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Search &amp; Filter</p>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(typeConfig).map(([label, cfg]) => (
              <button
                key={label}
                onClick={() => setActiveType(label)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeType === label
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white dark:bg-primary-800 border-slate-200 dark:border-primary-700 text-ink dark:text-white hover:border-primary/40'
                }`}
              >
                {label}
                <span className={`badge ${activeType === label ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-primary-700 text-slate-500'}`}>
                  {counts[label] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 && (
            <div className="card p-8 text-center text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
              No opportunities match your search in this category yet.
            </div>
          )}
          {filtered.map((g) => (
            <div key={g.id} className="card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {React.createElement(typeConfig[activeType].icon, { className: 'h-5 w-5' })}
                </div>
                <button className="text-slate-300 hover:text-slate-500" aria-label="More options">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
              </div>
              <h3 className="font-heading font-semibold text-ink dark:text-white leading-snug mb-2">{g.name}</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {g.tags?.map((t) => (
                  <span key={t} className="badge bg-slate-100 dark:bg-primary-700 text-slate-500 dark:text-slate-300">{t}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1"><ClockIcon className="h-4 w-4" /> {g.daysLeft} Days Left</span>
                <span className="flex items-center gap-1"><BanknotesIcon className="h-4 w-4" /> ${g.amount.toLocaleString()} max</span>
              </div>
              <button onClick={() => applyNow(g.name)} className="btn-primary w-full py-2 text-sm mt-auto">
                Apply Now <span aria-hidden>→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RequestsTab() {
  const { data, loading, isFallback } = useApiData('/api/funding/requests', fundingRequests)
  const [rows, setRows] = useState(null)
  const list = rows || data || []

  const updateStatus = (id, status) => {
    setRows(list.map((r) => (r.id === id ? { ...r, status } : r)))
    toast.success(`Request ${id} marked ${status}`)
  }

  const totalRequested = list.reduce((s, r) => s + r.amount, 0)
  const approved = list.filter((r) => r.status === 'Approved' || r.status === 'Disbursed').reduce((s, r) => s + r.amount, 0)
  const disbursed = list.filter((r) => r.status === 'Disbursed').reduce((s, r) => s + r.amount, 0)

  if (loading) return <LoadingBlock />

  return (
    <div>
      {isFallback && <ErrorNotice />}

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={BanknotesIcon} label="Total Requested" value={`$${totalRequested.toLocaleString()}`} />
        <StatCard icon={CheckCircleIcon} label="Approved" value={`$${approved.toLocaleString()}`} />
        <StatCard icon={ClockIcon} label="Disbursed" value={`$${disbursed.toLocaleString()}`} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700">
              <th className="px-5 py-3 font-medium">Request ID</th>
              <th className="px-5 py-3 font-medium">Startup</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 dark:border-primary-700 last:border-0">
                <td className="px-5 py-3.5 font-medium text-ink dark:text-white">{r.id}</td>
                <td className="px-5 py-3.5 text-slate-500">{r.startup}</td>
                <td className="px-5 py-3.5 text-slate-500">${r.amount.toLocaleString()}</td>
                <td className="px-5 py-3.5"><span className={`badge ${statusColor[r.status]}`}>{r.status}</span></td>
                <td className="px-5 py-3.5 text-slate-500">{r.date}</td>
                <td className="px-5 py-3.5">
                  {r.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => updateStatus(r.id, 'Approved')} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => updateStatus(r.id, 'Rejected')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
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
