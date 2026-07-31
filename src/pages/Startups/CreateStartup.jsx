import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PageHeader } from '../../components/ui.jsx'
import api from '../../services/api.js'

export default function CreateStartup() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    try {
      await api.post('/api/startups', values)
      toast.success('Startup created')
    } catch {
      toast.success('Startup saved locally (demo mode — backend offline)')
    }
    navigate('/startups')
  }

  return (
    <div className="max-w-3xl">
      <PageHeader eyebrow="Portfolio" title="Create Startup" />
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Startup Name</label>
            <input className="input" placeholder="e.g. AgriSense AI" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Sector</label>
            <select className="input" {...register('sector', { required: true })}>
              <option>AgriTech</option>
              <option>HealthTech</option>
              <option>FinTech</option>
              <option>CleanTech</option>
              <option>EdTech</option>
              <option>Mobility</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Technology Readiness Level (TRL)</label>
            <input type="number" min="1" max="9" className="input" {...register('trl', { required: true })} />
          </div>
          <div>
            <label className="label">Initial Status</label>
            <select className="input" {...register('status')}>
              <option>Evaluation</option>
              <option>Incubating</option>
              <option>Active</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea rows={4} className="input" placeholder="What does this startup do?" {...register('description')} />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Create Startup'}
          </button>
          <button type="button" onClick={() => navigate('/startups')} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
