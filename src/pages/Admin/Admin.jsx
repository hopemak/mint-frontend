import React, { useState } from 'react'
import { MagnifyingGlassIcon, PencilSquareIcon, EyeIcon, TrashIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { useApiData } from '../../services/useApiData.js'
import { adminUsers, auditLog, securityAlerts } from '../../data/sampleData.js'

const statusColor = { Active: 'bg-emerald-100 text-emerald-700', Pending: 'bg-amber-100 text-amber-700', Inactive: 'bg-red-100 text-red-700' }
const roleColor = { Admin: 'bg-primary/10 text-primary', Mentor: 'bg-accent-100 text-accent-600', Founder: 'bg-slate-100 text-slate-600' }
const levelColor = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-emerald-500' }

export default function Admin() {
  const { data: users, loading, isFallback } = useApiData('/api/admin/users', adminUsers)
  const [query, setQuery] = useState('')

  const filtered = (users || []).filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Admin Dashboard" />
      {isFallback && <ErrorNotice />}

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {['Platform Health', 'Manage Startups', 'Manage Grants', 'System Analytics', 'Approve Storage', 'System Trust'].map((s) => (
          <div key={s} className="card px-4 py-3 flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {s}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">System Analytics</h2>
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            <div><p className="text-xs text-slate-500">Total Charts</p><p className="font-heading font-semibold text-lg">59</p></div>
            <div><p className="text-xs text-slate-500">Performance</p><p className="font-heading font-semibold text-lg">134K</p></div>
            <div><p className="text-xs text-slate-500">Avg. Score</p><p className="font-heading font-semibold text-lg">20.1K</p></div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Audit Log</h2>
          <div className="space-y-3">
            {auditLog.map((a) => (
              <div key={a.id} className="flex gap-2.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium text-ink dark:text-white">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.detail} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Security Alerts</h2>
          <div className="space-y-3">
            {securityAlerts.map((s) => (
              <div key={s.id} className="flex gap-2.5 text-sm">
                <ShieldExclamationIcon className={`h-5 w-5 mt-0.5 shrink-0 ${levelColor[s.level]}`} />
                <div>
                  <p className="font-medium text-ink dark:text-white">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="font-heading font-semibold text-ink dark:text-white">User Management</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="input pl-9 w-56 text-sm" />
          </div>
        </div>
        {loading ? (
          <div className="p-5"><LoadingBlock /></div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700">
                  <th className="px-5 py-3 font-medium">Full Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 dark:border-primary-700 last:border-0">
                    <td className="px-5 py-3.5 font-medium text-ink dark:text-white">{u.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3.5"><span className={`badge ${roleColor[u.role]}`}>{u.role}</span></td>
                    <td className="px-5 py-3.5"><span className={`badge ${statusColor[u.status]}`}>{u.status}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700"><EyeIcon className="h-4 w-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700"><PencilSquareIcon className="h-4 w-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
