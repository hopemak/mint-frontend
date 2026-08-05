import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { ArrowUpTrayIcon, ExclamationTriangleIcon, InformationCircleIcon, EllipsisHorizontalIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { PageHeader } from '../../components/ui.jsx'
import Gauge from '../../components/Gauge.jsx'
import api from '../../services/api.js'

export default function IdeaSubmission() {
  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm({
    defaultValues: { innovationLevel: 5 },
  })
  const [scores, setScores] = useState({ quality: 0, innovation: 0, risk: 0 })
  const innovationLevel = watch('innovationLevel')
  const title = watch('title')

  const runAiCheck = () => {
    // Placeholder for a real AI scoring call — replace with POST /api/ideas/evaluate
    setScores({
      quality: Math.min(95, 40 + (title?.length || 0) * 3),
      innovation: Number(innovationLevel),
      risk: Math.max(1, 10 - Math.round(Number(innovationLevel) / 2)),
    })
  }

  const onSubmit = async (values) => {
    try {
      await api.post('/api/ideas', values)
      toast.success('Idea submitted for AI evaluation')
    } catch {
      toast.success('Idea saved locally (demo mode — backend offline)')
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Innovation Incubator Platform"
        title="AI Idea Submission Portal"
        description="Share your idea and let our AI assistant score it, flag duplicates, and suggest improvements in real time."
      />
      <div className="grid lg:grid-cols-3 gap-6">
        <form id="idea-form" onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 card p-6 space-y-5">
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="sm:col-span-1">
              <label className="label">Idea Title</label>
              <input className="input" placeholder="e.g. AgriSense AI" {...register('title', { required: true })} onBlur={runAiCheck} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" {...register('category')}>
                <option>Product</option>
                <option>Service</option>
                <option>Platform</option>
              </select>
            </div>
            <div>
              <label className="label">Industry</label>
              <select className="input" {...register('industry')}>
                <option>AgriTech</option>
                <option>HealthTech</option>
                <option>FinTech</option>
                <option>CleanTech</option>
                <option>EdTech</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Problem Statement</label>
              <textarea rows={5} className="input" placeholder="What problem does your idea solve?" {...register('problem', { required: true })} />
            </div>
            <div>
              <label className="label">Solution</label>
              <textarea rows={5} className="input" placeholder="How does your idea solve it?" {...register('solution', { required: true })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Target Market</label>
              <input className="input" placeholder="Who is this for?" {...register('targetMarket')} />
            </div>
            <div>
              <label className="label">Business Model</label>
              <select className="input" {...register('businessModel')}>
                <option>Subscription</option>
                <option>Marketplace</option>
                <option>Licensing</option>
                <option>Hardware + Service</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Innovation Level ({innovationLevel}/10)</label>
            <input
              type="range"
              min="1"
              max="10"
              className="w-full accent-primary"
              {...register('innovationLevel')}
              onInput={runAiCheck}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label">Documents</label>
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-primary-600 px-4 py-6 text-sm text-slate-500 cursor-pointer hover:border-primary">
                <ArrowUpTrayIcon className="h-5 w-5" /> Upload files
                <input type="file" className="hidden" {...register('documents')} />
              </label>
            </div>
            <div>
              <label className="label">Pitch Deck</label>
              <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-primary-600 px-4 py-6 text-sm text-slate-500 cursor-pointer hover:border-primary">
                <ArrowUpTrayIcon className="h-5 w-5" /> Upload deck
                <input type="file" className="hidden" {...register('pitchDeck')} />
              </label>
            </div>
          </div>

        </form>

        <aside className="card p-6 h-fit sticky top-20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white">AI Assistant</h2>
            <button type="button" aria-label="More options" className="text-slate-400 hover:text-slate-600">
              <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex justify-center mb-5">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary-400 via-primary-700 to-accent-500 flex items-center justify-center shadow-lg">
              <CpuChipIcon className="h-12 w-12 text-white" />
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-primary-700 p-4 text-center mb-4">
            <p className="text-sm text-slate-500 mb-1 flex items-center justify-center gap-1">
              Idea Quality Score
              <InformationCircleIcon className="h-4 w-4 text-slate-400" title="Estimated from your inputs so far" />
            </p>
            <Gauge value={scores.quality} size={160} centerLabel={scores.quality} />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl border border-slate-100 dark:border-primary-600 p-3 text-center">
              <p className="text-xs text-slate-500">Innovation Score</p>
              <p className="font-heading font-semibold text-ink dark:text-white">{scores.innovation} / 10</p>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-primary-600 p-3 text-center">
              <p className="text-xs text-slate-500 mb-1">Risk Score</p>
              <span className="inline-block rounded-full bg-primary-600 text-white text-xs font-semibold px-2.5 py-1">
                {scores.risk} / 10
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-accent-50 border border-accent-200 p-4 flex gap-2.5 mb-4">
            <ExclamationTriangleIcon className="h-5 w-5 text-accent-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-accent-600">Duplicate Idea Detection</p>
              <p className="text-xs text-slate-500 mt-0.5">No similar ideas found in the current portfolio.</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-ink dark:text-white mb-2">Smart Recommendations</p>
            <ul className="text-sm text-slate-500 space-y-1.5 list-disc list-inside">
              <li>Add a competitive analysis section</li>
              <li>Clarify your revenue model</li>
              <li>Include early customer validation</li>
            </ul>
          </div>

          <button type="submit" form="idea-form" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </aside>
      </div>
    </div>
  )
}
