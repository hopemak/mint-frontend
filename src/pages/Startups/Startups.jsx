import React, { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, PlusIcon, PencilSquareIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice, EmptyState } from '../../components/ui.jsx'
import { startupAPI } from '../../services/api.js'

const statusColor = {
  Active: 'bg-emerald-100 text-emerald-700',
  Incubating: 'bg-accent-100 text-accent-600',
  Funded: 'bg-primary/10 text-primary',
  Evaluation: 'bg-amber-100 text-amber-700',
}

const PAGE_SIZE = 5

export default function Startups() {
  const navigate = useNavigate()
  const location = useLocation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    startupAPI.getAll()
      .then((res) => {
        const items = res.data?.data || res.data || []
        setData(items)
        setError(null)
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message)
        setData(null)
      })
      .finally(() => setLoading(false))
  }, [location.key])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return (data || [])
      .filter((s) => (s.business_name || s.name || '').toLowerCase().includes(query.toLowerCase()))
      .filter((s) => status === 'All' || (s.status || 'submitted') === status)
  }, [data, query, status])

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const handleDeleteStartup = async (id) => {
    if (!window.confirm('Delete this startup?')) return
    try {
      await startupAPI.deleteById(id)
      toast.success('Startup deleted')
      setData(data.filter((s) => (s.startup_id || s.id) !== id))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Startups"
        action={
          <Link to="/startups/create" className="btn-primary">
            <PlusIcon className="h-5 w-5" /> Create Startup
          </Link>
        }
      />

            <div className="card p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder="Search startups..."
            className="input pl-10"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="input w-auto"
        >
          {['All', 'Active', 'Incubating', 'Funded', 'Evaluation'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No startups match your filters" subtitle="Try clearing your search or filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Sector</th>
                <th className="px-5 py-3 font-medium">TRL</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Funding</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((s) => (
                <tr key={s.startup_id || s.id} className="border-b border-slate-50 dark:border-primary-700 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-ink dark:text-white">{s.business_name || s.name || 'Unnamed'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{s.sector || 'Unspecified'}</td>
                  <td className="px-5 py-3.5 text-slate-500">{s.trl_level || s.trl || 'N/A'}/9</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${statusColor[s.status] || 'bg-slate-100 text-slate-600'}`}>{s.status || 'submitted'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">
                    {s.funding || s.funding_needed ? `$${(s.funding || s.funding_needed).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5 text-slate-400">
                      <button onClick={() => navigate('/startups/' + (s.startup_id || s.id))} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700" title="View"><EyeIcon className="h-4 w-4" /></button>
                      <button onClick={() => navigate('/startups/' + (s.startup_id || s.id) + '/edit')} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700" title="Edit"><PencilSquareIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteStartup(s.startup_id || s.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500" title="Delete"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-primary-700 text-sm text-slate-500">
            <span>Page {page} of {pageCount}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn-outline px-3 py-1.5 text-xs"
              >
                Previous
              </button>
              <button
                disabled={page === pageCount}
                onClick={() => setPage((p) => p + 1)}
                className="btn-outline px-3 py-1.5 text-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
