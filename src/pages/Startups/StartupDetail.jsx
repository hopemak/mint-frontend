import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock } from '../../components/ui.jsx'
import { startupAPI } from '../../services/api.js'

export default function StartupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [startup, setStartup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    startupAPI.getById(id)
      .then((res) => {
        const item = res.data?.data || res.data
        setStartup(item)
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || 'Failed to load startup')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <LoadingBlock />
  if (!startup) return <div className="p-8 text-center">Startup not found</div>

  return (
    <div>
      <button onClick={() => navigate('/startups')} className="btn btn-outline mb-4 flex items-center gap-2">
        <ArrowLeftIcon className="h-4 w-4" /> Back to Startups
      </button>

      <PageHeader eyebrow="Startup Profile" title={startup.business_name || startup.name || 'Unnamed'} />

      <div className="card p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Sector</p>
            <p className="font-medium">{startup.sector || 'Unspecified'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="font-medium">{startup.status || 'submitted'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">TRL Level</p>
            <p className="font-medium">{startup.trl_level || startup.trl || 'N/A'}/9</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Funding Needed</p>
            <p className="font-medium">{startup.funding_needed ? `$${startup.funding_needed.toLocaleString()}` : '—'}</p>
          </div>
        </div>

        {startup.description && (
          <div>
            <p className="text-sm text-slate-500">Description</p>
            <p className="mt-1">{startup.description}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button onClick={() => navigate(`/startups/${id}/edit`)} className="btn btn-primary">Edit</button>
          <button onClick={() => navigate('/startups')} className="btn btn-outline">Back</button>
        </div>
      </div>
    </div>
  )
}
