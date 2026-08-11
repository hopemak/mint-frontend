import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock } from '../../components/ui.jsx'
import { startupAPI } from '../../services/api.js'

export default function EditStartup() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ business_name: '', sector: '', description: '', trl_level: '', funding_needed: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    startupAPI.getById(id)
      .then((res) => {
        const s = res.data?.data || res.data
        setForm({
          business_name: s.business_name || s.name || '',
          sector: s.sector || '',
          description: s.description || '',
          trl_level: s.trl_level || s.trl || '',
          funding_needed: s.funding_needed || '',
        })
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || 'Failed to load startup')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await startupAPI.update(id, form)
      toast.success('Startup updated')
      navigate('/startups')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update')
    }
  }

  if (loading) return <LoadingBlock />

  return (
    <div>
      <button onClick={() => navigate('/startups')} className="btn btn-outline mb-4 flex items-center gap-2">
        <ArrowLeftIcon className="h-4 w-4" /> Back
      </button>

      <PageHeader eyebrow="Edit Startup" title={form.business_name || 'Edit Startup'} />

      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Business Name</label>
          <input required className="input w-full" value={form.business_name} onChange={(e) => setForm({...form, business_name: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sector</label>
          <input required className="input w-full" value={form.sector} onChange={(e) => setForm({...form, sector: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="input w-full" rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">TRL Level (1-9)</label>
          <input type="number" min="1" max="9" className="input w-full" value={form.trl_level} onChange={(e) => setForm({...form, trl_level: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Funding Needed ($)</label>
          <input type="number" className="input w-full" value={form.funding_needed} onChange={(e) => setForm({...form, funding_needed: e.target.value})} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">Save Changes</button>
          <button type="button" onClick={() => navigate('/startups')} className="btn btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  )
}
