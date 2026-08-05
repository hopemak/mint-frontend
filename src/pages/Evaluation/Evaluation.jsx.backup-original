import React, { useState } from 'react'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChatBubbleLeftIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { useApiData } from '../../services/useApiData.js'
import { evaluation as sampleEvaluation } from '../../data/sampleData.js'

const riskColor = { Low: 'text-emerald-600', Medium: 'text-amber-600', High: 'text-red-600' }

const scoreLabels = [
  ['innovation', 'Innovation Score'],
  ['feasibility', 'Feasibility'],
  ['marketPotential', 'Market Potential'],
  ['technicalComplexity', 'Technical Complexity'],
  ['socialImpact', 'Social Impact'],
  ['financialViability', 'Financial Viability'],
]

function scoreTone(score) {
  if (score >= 90) return { label: 'Success', bar: 'bg-emerald-500', text: 'text-emerald-600' }
  if (score >= 75) return { label: 'Primary', bar: 'bg-primary', text: 'text-primary' }
  if (score >= 60) return { label: 'Warning', bar: 'bg-amber-500', text: 'text-amber-600' }
  return { label: 'Critical', bar: 'bg-red-500', text: 'text-red-600' }
}

const aiSuggestions = [
  'Your idea scores well on innovation and market potential — consider tightening the go-to-market plan before submission.',
  'Adding a competitor comparison could strengthen the feasibility score further.',
]

const improvementIcons = [Squares2X2Icon, AdjustmentsHorizontalIcon, SparklesIcon, ArrowTrendingUpIcon]

export default function Evaluation() {
  const { data, loading, isFallback } = useApiData('/api/ideas/latest/evaluation', sampleEvaluation)
  const [chatDraft, setChatDraft] = useState('')

  if (loading) return <LoadingBlock label="Running AI evaluation..." />

  return (
    <div>
      <PageHeader
        eyebrow="AI Evaluation"
        title="AI Idea Evaluation"
        action={
          <div className="flex items-center gap-2">
            <button type="button" className="btn-outline">Preview</button>
            <button type="button" className="btn-primary">+ New</button>
          </div>
        }
      />
      {isFallback && <ErrorNotice />}

      <div className="card p-6 mb-6 bg-gradient-to-r from-primary via-primary-600 to-accent-500 text-white">
        <p className="text-sm opacity-80 mb-1 flex items-center gap-1.5">
          AI Overall Score
          <InformationCircleIcon className="h-4 w-4 opacity-80" title="Composite score across all evaluation dimensions" />
        </p>
        <div className="flex items-center gap-4">
          <span className="font-heading text-5xl font-bold">{data.overallScore}</span>
          <span className="badge bg-white/20 text-white">{data.rating}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {scoreLabels.map(([key, label]) => {
          const tone = scoreTone(data.scores[key])
          return (
            <div key={key} className="card p-4">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="font-heading text-2xl font-semibold text-ink dark:text-white mb-2">{data.scores[key]}</p>
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden mb-1.5">
                <div className={`h-full ${tone.bar}`} style={{ width: `${data.scores[key]}%` }} />
              </div>
              <span className={`text-xs font-medium ${tone.text}`}>{tone.label}</span>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <div className="card p-5">
              <h2 className="font-heading font-semibold text-ink dark:text-white mb-2">Multi-Dimensional Analysis</h2>
              <p className="text-sm text-slate-500 mb-2">Visualizes the overall balance of this idea.</p>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={data.radar}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#1D4241" fill="#1D4241" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Risk Analysis</h2>
              <p className="text-sm text-slate-500 mb-4">Identified risks with:</p>
              <div className="space-y-3">
                {data.risks.map((r) => (
                  <div key={r.name} className="rounded-xl border border-slate-100 dark:border-primary-700 p-3.5">
                    <p className="text-sm font-medium text-ink dark:text-white">{r.name}</p>
                    <span className={`text-xs font-medium ${riskColor[r.level]}`}>{r.level} Risk</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">SWOT Analysis</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
                  <p className="flex items-center gap-1.5 font-medium text-emerald-700 mb-1.5"><HandThumbUpIcon className="h-4 w-4" /> Strengths</p>
                  <ul className="text-emerald-700/80 space-y-1 list-disc list-inside">
                    {data.swot.strengths.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-100 p-3.5">
                  <p className="flex items-center gap-1.5 font-medium text-red-600 mb-1.5"><HandThumbDownIcon className="h-4 w-4" /> Weaknesses</p>
                  <ul className="text-red-600/80 space-y-1 list-disc list-inside">
                    {data.swot.weaknesses.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5">
                  <p className="flex items-center gap-1.5 font-medium text-primary mb-1.5"><MegaphoneIcon className="h-4 w-4" /> Opportunities</p>
                  <ul className="text-primary/80 space-y-1 list-disc list-inside">
                    {data.swot.opportunities.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div className="rounded-xl bg-accent-50 border border-accent-200 p-3.5">
                  <p className="flex items-center gap-1.5 font-medium text-accent-600 mb-1.5"><ExclamationTriangleIcon className="h-4 w-4" /> Threats</p>
                  <ul className="text-accent-600/80 space-y-1 list-disc list-inside">
                    {data.swot.threats.map((s) => <li key={s}>{s}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Approval Status</h2>
            <span className="badge bg-emerald-100 text-emerald-700 text-sm">{data.approvalStatus}</span>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-6 h-fit lg:sticky lg:top-20">
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">AI Generated Feedback</h2>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-ink dark:text-white">Smart Suggestions</p>
              <button type="button" aria-label="More options" className="text-slate-400 hover:text-slate-600">
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2.5 mb-3">
              {aiSuggestions.map((msg) => (
                <div key={msg} className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                    <ChatBubbleLeftIcon className="h-3.5 w-3.5" />
                  </div>
                  <p className="rounded-xl bg-slate-50 dark:bg-primary-700 p-2.5 text-xs text-slate-600 dark:text-slate-200">{msg}</p>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setChatDraft('')
              }}
              className="flex items-center gap-2"
            >
              <input
                value={chatDraft}
                onChange={(e) => setChatDraft(e.target.value)}
                placeholder="Write a message..."
                className="input flex-1 py-2 text-sm"
              />
              <button type="submit" aria-label="Send message" className="btn-primary p-2.5">
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Suggested Improvements</h2>
              <button type="button" aria-label="More options" className="text-slate-400 hover:text-slate-600">
                <EllipsisHorizontalIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {data.suggestedImprovements.map((s, i) => {
                const Icon = improvementIcons[i % improvementIcons.length]
                return (
                  <button
                    key={s.title}
                    type="button"
                    className="w-full flex items-center gap-3 rounded-xl p-2 -mx-2 text-left hover:bg-slate-50 dark:hover:bg-primary-700 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink dark:text-white truncate">{s.title}</p>
                      <p className="text-xs text-slate-500 truncate">{s.detail}</p>
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-slate-300 shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
