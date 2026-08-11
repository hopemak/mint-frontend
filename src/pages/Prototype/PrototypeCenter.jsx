import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  ClockIcon,
  CloudIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  BoltIcon,
  ClipboardDocumentIcon,
  CircleStackIcon,
  ServerIcon,
  UserIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { PageHeader } from '../../components/ui.jsx'
import { startupAPI, mlAPI, versionControlAPI, systemAPI } from '../../services/api.js'

const methodColor = {
  GET: 'bg-primary/10 text-primary',
  POST: 'bg-rose-100 text-rose-600',
  PUT: 'bg-amber-100 text-amber-700',
  DELETE: 'bg-red-100 text-red-700',
}

const componentLibrary = [
  { label: 'Buttons', preview: <div className="btn-primary !py-1.5 !px-4 !text-xs pointer-events-none">Button</div>, code: '<button className="btn-primary">Click me</button>\n<button className="btn-outline">Cancel</button>' },
  { label: 'Inputs', preview: <div className="input !py-1.5 !text-xs pointer-events-none">&nbsp;</div>, code: '<input className="input" placeholder="Enter text..." />' },
  { label: 'Cards', preview: <div className="h-9 w-full rounded-lg border border-slate-200 dark:border-primary-600 bg-white dark:bg-primary-700" />, code: '<div className="card p-5">\n  Card content here\n</div>' },
  { label: 'Badges', preview: <span className="badge bg-emerald-100 text-emerald-700">Badge</span>, code: '<span className="badge bg-emerald-100 text-emerald-700">Active</span>' },
  { label: 'Forms', preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200 dark:bg-primary-600"/><div className="h-1.5 w-2/3 rounded bg-slate-200 dark:bg-primary-600" /></div>, code: '<div>\n  <label className="label">Name</label>\n  <input className="input" {...register(\'name\')} />\n</div>' },
  { label: 'Tables', preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200 dark:bg-primary-600"/><div className="h-1.5 w-full rounded bg-slate-100 dark:bg-primary-700" /></div>, code: '<table className="w-full text-sm">\n  <thead>\n    <tr><th className="px-5 py-3 font-medium">Name</th></tr>\n  </thead>\n  <tbody>\n    <tr><td className="px-5 py-3.5">Row value</td></tr>\n  </tbody>\n</table>' },
]

const diagramNodes = [
  { key: 'db', label: 'Database', icon: CircleStackIcon, x: 8, y: 50 },
  { key: 'server', label: 'Server', icon: ServerIcon, x: 34, y: 50 },
  { key: 'web1', label: 'Web', icon: CloudIcon, x: 62, y: 16 },
  { key: 'web2', label: 'Web', icon: CloudIcon, x: 62, y: 84 },
  { key: 'user', label: 'User', icon: UserIcon, x: 90, y: 50 },
]
const diagramLines = [
  ['db', 'server'], ['server', 'web1'], ['server', 'web2'], ['web1', 'user'], ['web2', 'user'],
]

export default function PrototypeCenter() {
  const [generating, setGenerating] = useState(false)
  const [mvpPlan, setMvpPlan] = useState('')
  const [mvpError, setMvpError] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [codeResult, setCodeResult] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeActionLoading, setCodeActionLoading] = useState(null)
  const [commits, setCommits] = useState([])
  const [apiLibrary, setApiLibrary] = useState([])
  const [apiLibraryError, setApiLibraryError] = useState('')
  const [selectedComponent, setSelectedComponent] = useState(null)

  useEffect(() => {
    systemAPI.listRoutes()
      .then((res) => {
        const data = (res.data && res.data.data) || []
        setApiLibrary(Array.isArray(data) ? data : [])
      })
      .catch(() => setApiLibraryError('Could not load API routes.'))
  }, [])

  useEffect(() => {
    versionControlAPI.getAll()
      .then((res) => {
        const data = (res.data && res.data.data) || []
        setCommits(Array.isArray(data) ? data : [])
      })
      .catch(() => setCommits([]))
  }, [])

  const [techRecs, setTechRecs] = useState([])
  const [techRecsLoading, setTechRecsLoading] = useState(true)
  const [techRecsError, setTechRecsError] = useState('')

  useEffect(() => {
    async function loadTechRecs() {
      setTechRecsLoading(true)
      setTechRecsError('')
      try {
        const { data: startupsRes } = await startupAPI.getMyStartups()
        const startups = (startupsRes && startupsRes.data) ? startupsRes.data : startupsRes
        const startup = Array.isArray(startups) ? startups[0] : null
        if (!startup) {
          setTechRecsError('Create a startup first to get tailored tech recommendations.')
          setTechRecsLoading(false)
          return
        }
        const prompt = `Given this startup: "${startup.business_name?.trim()}" in the ${startup.sector} sector. Description: ${startup.description?.slice(0, 300) || 'No description provided.'}\n\nRecommend exactly 6 technologies for building this. Respond ONLY with a valid JSON array, no other text, in this exact format: [{"name": "React", "reason": "short reason under 10 words", "recommended": true}]. Mark the 2 most important ones as recommended: true, others false.`
        const res = await mlAPI.chat(prompt, {})
        const reply = res?.data?.data?.reply || ''
        const jsonMatch = reply.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setTechRecs(Array.isArray(parsed) ? parsed : [])
        } else {
          setTechRecsError("Couldn't parse AI response. Try refreshing.")
        }
      } catch (err) {
        setTechRecsError('Could not reach the AI service.')
      } finally {
        setTechRecsLoading(false)
      }
    }
    loadTechRecs()
  }, [])

  const [archExplanation, setArchExplanation] = useState('')
  const [archLoading, setArchLoading] = useState(true)
  const [archError, setArchError] = useState('')

  useEffect(() => {
    async function loadArchExplanation() {
      setArchLoading(true)
      setArchError('')
      try {
        const { data: startupsRes } = await startupAPI.getMyStartups()
        const startups = (startupsRes && startupsRes.data) ? startupsRes.data : startupsRes
        const startup = Array.isArray(startups) ? startups[0] : null
        if (!startup) {
          setArchError('Create a startup first to get a tailored architecture explanation.')
          setArchLoading(false)
          return
        }
        const prompt = `Given this startup: "${startup.business_name?.trim()}" in the ${startup.sector} sector. Description: ${startup.description?.slice(0, 300) || 'No description provided.'}\n\nBriefly describe an appropriate system architecture for this product: main components (e.g. frontend, backend, database, third-party services) and how data flows between them. Keep it under 150 words, plain text, no markdown headers.`
        const res = await mlAPI.chat(prompt, {})
        const reply = res?.data?.data?.reply
        if (reply) {
          setArchExplanation(reply)
        } else {
          setArchError("Didn't get a usable response from the AI.")
        }
      } catch (err) {
        setArchError('Could not reach the AI service.')
      } finally {
        setArchLoading(false)
      }
    }
    loadArchExplanation()
  }, [])

  const CODE_PROMPTS = {
    explain: 'Explain what this code does, step by step, in plain language:',
    refactor: 'Refactor this code for readability and best practices. Return the improved code with a brief note on what changed:',
    optimize: 'Optimize this code for performance. Return the improved code with a brief note on what changed:',
  }

  const runCodeAction = async (action) => {
    if (!codeInput.trim()) return
    setCodeActionLoading(action)
    setCodeError('')
    try {
      const prompt = `${CODE_PROMPTS[action]}\n\n${codeInput}`
      const res = await mlAPI.chat(prompt, {})
      const reply = res?.data?.data?.reply
      if (reply) {
        setCodeResult(reply)
      } else {
        setCodeError("Didn't get a usable response from the AI. Try again.")
      }
    } catch (err) {
      setCodeError('Could not reach the AI service. Please try again.')
    } finally {
      setCodeActionLoading(null)
    }
  }

  const generateMvp = async () => {
    setGenerating(true)
    setMvpError('')
    try {
      const { data: startupsRes } = await startupAPI.getMyStartups()
      const startups = (startupsRes && startupsRes.data) ? startupsRes.data : startupsRes
      const startup = Array.isArray(startups) ? startups[0] : null

      if (!startup) {
        setMvpError('Create a startup first so the AI has something to scaffold a plan for.')
        setGenerating(false)
        return
      }

      const prompt = `Given this startup: "${startup.business_name?.trim()}" in the ${startup.sector} sector. Description: ${startup.description?.slice(0, 400) || 'No description provided.'}\n\nSuggest a concrete MVP build plan: recommended tech stack (2-3 items with a one-line reason each), 4-5 core features to build first, and a suggested folder/architecture outline. Keep it concise and actionable, under 250 words.`

      const res = await mlAPI.chat(prompt, { title: startup.business_name, sector: startup.sector })
      const reply = res?.data?.data?.reply
      if (reply) {
        setMvpPlan(reply)
        toast.success('MVP plan generated')
      } else {
        setMvpError("Didn't get a usable response from the AI. Try again.")
      }
    } catch (err) {
      setMvpError('Could not reach the AI service. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const nodeByKey = Object.fromEntries(diagramNodes.map((n) => [n.key, n]))

  return (
    <div>
      <PageHeader
        eyebrow="Innovation Incubator"
        title="Prototype Development Center"
        action={
          <button onClick={() => window.location.reload()} className="btn-primary">
            <PlusIcon className="h-4 w-4" /> New Prototype
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-2 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-sm text-ink dark:text-white">API Library</h2>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </div>
            {apiLibraryError && <p className="text-xs text-rose-600">{apiLibraryError}</p>}
            {!apiLibraryError && apiLibrary.length === 0 && (
              <p className="text-xs text-slate-400">Loading routes...</p>
            )}
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {apiLibrary.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span className={`badge w-14 justify-center shrink-0 ${methodColor[a.method] || 'bg-slate-100 text-slate-600'}`}>{a.method}</span>
                  <span className="text-slate-500 font-mono break-all">{a.path}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="xl:col-span-5 space-y-4">
          <div className="card p-6 bg-gradient-to-br from-accent-50 to-primary/5">
            <h2 className="font-heading text-2xl font-semibold text-ink dark:text-white mb-2">Create Prototype</h2>
            <p className="text-sm text-slate-500 mb-5 max-w-md">
              Create a prototype that can modernize your idea into a working product design.
            </p>
            <button onClick={generateMvp} disabled={generating} className="btn-accent">
              <SparklesIcon className="h-5 w-5" /> {generating ? 'Generating...' : 'Generate MVP'}
            </button>
            {mvpError && <p className="text-sm text-rose-600 mt-3">{mvpError}</p>}
            {mvpPlan && (
              <div className="mt-4 rounded-xl bg-white/70 dark:bg-primary-800/60 border border-primary/10 p-4 text-sm text-ink dark:text-slate-100 whitespace-pre-wrap max-h-80 overflow-y-auto">
                {mvpPlan}
              </div>
            )}
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Technology Recommendations</h2>
              <span className="badge bg-emerald-100 text-emerald-700">AI Generated</span>
            </div>
            {techRecsLoading && <p className="text-sm text-slate-400">Loading recommendations...</p>}
            {techRecsError && <p className="text-sm text-rose-600">{techRecsError}</p>}
            {!techRecsLoading && !techRecsError && techRecs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {techRecs.map((t, i) => {
                  const tones = ['bg-sky-100 text-sky-600', 'bg-emerald-100 text-emerald-600', 'bg-primary/10 text-primary', 'bg-amber-100 text-amber-600', 'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-600']
                  const tone = tones[i % tones.length]
                  return (
                    <div key={t.name || i} className="rounded-xl border border-slate-100 dark:border-primary-700 p-3 flex flex-col items-center gap-2 text-center">
                      <span className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold ${tone}`}>
                        {(t.name || '?').slice(0, 2)}
                      </span>
                      <p className="text-xs font-medium text-ink dark:text-white">{t.name}</p>
                      {t.reason && <p className="text-[10px] text-slate-400">{t.reason}</p>}
                      {t.recommended && <span className="badge bg-emerald-100 text-emerald-700 !px-1.5 !text-[10px]">Recommended</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Architecture Diagram</h2>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="relative h-44">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {diagramLines.map(([from, to], i) => {
                  const a = nodeByKey[from], b = nodeByKey[to]
                  return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C7DAD8" strokeWidth="0.6" />
                })}
              </svg>
              {diagramNodes.map((n) => (
                <div
                  key={n.key}
                  className="absolute flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <span className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <n.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[11px] text-slate-500 whitespace-nowrap">{n.label}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic mt-2">Illustrative example architecture</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-primary-700">
              <p className="text-xs font-medium text-ink dark:text-white mb-2">Recommended for your startup</p>
              {archLoading && <p className="text-sm text-slate-400">Generating explanation...</p>}
              {archError && <p className="text-sm text-rose-600">{archError}</p>}
              {!archLoading && !archError && archExplanation && (
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{archExplanation}</p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-ink dark:text-white">AI Code Assistant</h2>
            </div>
            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Paste code here..."
              className="input font-mono text-xs mb-3 h-28 resize-none"
            />
            <div className="flex gap-2 mb-3">
              <button onClick={() => runCodeAction('explain')} disabled={codeActionLoading || !codeInput.trim()} className="btn-outline flex-1 !py-1.5 !px-2.5 !text-xs disabled:opacity-50">
                <CodeBracketIcon className="h-3.5 w-3.5" /> {codeActionLoading === 'explain' ? '...' : 'Explain'}
              </button>
              <button onClick={() => runCodeAction('refactor')} disabled={codeActionLoading || !codeInput.trim()} className="btn-outline flex-1 !py-1.5 !px-2.5 !text-xs disabled:opacity-50">
                <ArrowPathIcon className="h-3.5 w-3.5" /> {codeActionLoading === 'refactor' ? '...' : 'Refactor'}
              </button>
              <button onClick={() => runCodeAction('optimize')} disabled={codeActionLoading || !codeInput.trim()} className="btn-outline flex-1 !py-1.5 !px-2.5 !text-xs disabled:opacity-50">
                <BoltIcon className="h-3.5 w-3.5" /> {codeActionLoading === 'optimize' ? '...' : 'Optimize'}
              </button>
            </div>
            {codeError && <p className="text-xs text-rose-600 mb-2">{codeError}</p>}
            {codeResult && (
              <div className="rounded-xl bg-primary-800 text-slate-200 p-3.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                {codeResult}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-sm text-ink dark:text-white">Component Library</h2>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {componentLibrary.map((c) => (
                <button
                  key={c.label}
                  onClick={() => setSelectedComponent(c)}
                  className="rounded-lg border border-slate-100 dark:border-primary-700 p-2 flex flex-col items-center gap-1.5 hover:border-primary/40 transition-colors text-left"
                >
                  <div className="h-8 w-full flex items-center justify-center">{c.preview}</div>
                  <p className="text-[10px] text-slate-500">{c.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-heading font-semibold text-sm text-ink dark:text-white mb-3">Version Control</h2>
            {commits.length === 0 ? (
              <p className="text-xs text-slate-400">No commit history available.</p>
            ) : (
              <div className="space-y-3">
                {commits.map((c, i) => (
                  <div key={c.sha} className="flex gap-2.5 min-w-0">
                    <div className="flex flex-col items-center pt-0.5 shrink-0">
                      <span className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-slate-200 dark:bg-primary-600'}`} />
                      {i < commits.length - 1 && <span className="w-px flex-1 bg-slate-200 dark:bg-primary-600 mt-1" />}
                    </div>
                    <div className="pb-2 min-w-0 flex-1">
                      <p className="text-xs font-medium text-ink dark:text-white break-words">{c.message}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 flex-wrap">
                        <ClockIcon className="h-3 w-3 shrink-0" /> <span>{c.date} · {c.author} · {c.sha}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedComponent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedComponent(null)}>
          <div className="card p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-ink dark:text-white">{selectedComponent.label}</h3>
              <button onClick={() => setSelectedComponent(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-primary-700 p-4 flex items-center justify-center mb-4">
              {selectedComponent.preview}
            </div>
            <div className="relative">
              <pre className="rounded-xl bg-primary-800 text-slate-200 p-3.5 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {selectedComponent.code}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedComponent.code)
                  toast.success('Copied to clipboard')
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-primary-700 text-slate-300 hover:text-white"
                title="Copy code"
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
