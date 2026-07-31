import React, { useState } from 'react'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  RocketLaunchIcon,
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
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { PageHeader } from '../../components/ui.jsx'

const techStack = [
  { name: 'React', tone: 'bg-sky-100 text-sky-600' },
  { name: 'Node.js', tone: 'bg-emerald-100 text-emerald-600' },
  { name: 'PostgreSQL', tone: 'bg-primary/10 text-primary' },
  { name: 'Python', tone: 'bg-amber-100 text-amber-600', recommended: true },
  { name: 'Django', tone: 'bg-emerald-100 text-emerald-700' },
  { name: 'AWS', tone: 'bg-orange-100 text-orange-600', recommended: true },
]

const apiLibrary = [
  { method: 'GET', path: '/api/users' },
  { method: 'POST', path: '/api/auth' },
  { method: 'POST', path: '/api/auth' },
  { method: 'POST', path: '/api/users' },
  { method: 'POST', path: '/api/auth' },
  { method: 'POST', path: '/api/users' },
]

const methodColor = { GET: 'bg-primary/10 text-primary', POST: 'bg-rose-100 text-rose-600' }

const componentLibrary = [
  { label: 'Buttons', preview: <div className="btn-primary !py-1.5 !px-4 !text-xs pointer-events-none">Button</div> },
  { label: 'Inputs', preview: <div className="input !py-1.5 !text-xs pointer-events-none">&nbsp;</div> },
  { label: 'Cards', preview: <div className="h-9 w-full rounded-lg border border-slate-200 dark:border-primary-600 bg-white dark:bg-primary-700" /> },
  { label: 'Badges', preview: <span className="badge bg-emerald-100 text-emerald-700">Badge</span> },
  { label: 'Forms', preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200 dark:bg-primary-600" /><div className="h-1.5 w-2/3 rounded bg-slate-200 dark:bg-primary-600" /></div> },
  { label: 'Tables', preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200 dark:bg-primary-600" /><div className="h-1.5 w-full rounded bg-slate-100 dark:bg-primary-700" /></div> },
]

const deployments = [
  { label: 'Deploy to Staging', status: 'ready' },
  { label: 'Deploy to Production', status: 'live' },
  { label: 'Deploy to Development', status: 'ready' },
]

const commits = [
  { title: 'Initial commit', date: 'Jan 17, 2026' },
  { title: 'Added database layer', date: 'Jan 19, 2026' },
  { title: 'Feature: UI update', date: 'Jan 22, 2026' },
  { title: 'Improved API performance', date: 'Jan 25, 2026' },
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

  const generateMvp = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      toast.success('MVP scaffold generated')
    }, 1400)
  }

  const nodeByKey = Object.fromEntries(diagramNodes.map((n) => [n.key, n]))

  return (
    <div>
      <PageHeader
        eyebrow="Innovation Incubator"
        title="Prototype Development Center"
        action={
          <button className="btn-primary">
            <PlusIcon className="h-4 w-4" /> New Prototype
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-12">
        {/* Left rail */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card p-4 bg-primary/5 border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <CloudIcon className="h-5 w-5 text-primary" />
              <p className="font-heading font-semibold text-sm text-ink dark:text-white">Cloud Sandbox</p>
            </div>
            <p className="text-xs text-slate-500">Sandbox Environment Active</p>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-sm text-ink dark:text-white">API Library</h2>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </div>
            <ul className="space-y-2">
              {apiLibrary.map((a, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <span className={`badge w-12 justify-center shrink-0 ${methodColor[a.method]}`}>{a.method}</span>
                  <span className="text-slate-500 font-mono truncate">{a.path}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center-left: Create Prototype / Tech Recommendations / Architecture */}
        <div className="xl:col-span-5 space-y-4">
          <div className="card p-6 bg-gradient-to-br from-accent-50 to-primary/5">
            <h2 className="font-heading text-2xl font-semibold text-ink dark:text-white mb-2">Create Prototype</h2>
            <p className="text-sm text-slate-500 mb-5 max-w-md">
              Create a prototype that can modernize your idea into a working product design.
            </p>
            <button onClick={generateMvp} disabled={generating} className="btn-accent">
              <SparklesIcon className="h-5 w-5" /> {generating ? 'Generating...' : 'Generate MVP'}
            </button>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Technology Recommendations</h2>
              <span className="badge bg-emerald-100 text-emerald-700">Recommended</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {techStack.map((t) => (
                <div key={t.name} className="rounded-xl border border-slate-100 dark:border-primary-700 p-3 flex flex-col items-center gap-2 text-center">
                  <span className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold ${t.tone}`}>
                    {t.name.slice(0, 2)}
                  </span>
                  <p className="text-xs font-medium text-ink dark:text-white">{t.name}</p>
                  {t.recommended && <span className="badge bg-emerald-100 text-emerald-700 !px-1.5 !text-[10px]">Recommended</span>}
                </div>
              ))}
            </div>
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
          </div>
        </div>

        {/* Center-right: AI Code Assistant / Live Preview */}
        <div className="xl:col-span-3 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-ink dark:text-white">AI Code Assistant</h2>
              <EllipsisHorizontalIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex gap-2 mb-3">
              <button className="btn-outline !py-1.5 !px-2.5 !text-xs"><CodeBracketIcon className="h-3.5 w-3.5" /> Explain Code</button>
              <button className="btn-outline !py-1.5 !px-2.5 !text-xs"><ArrowPathIcon className="h-3.5 w-3.5" /> Refactor</button>
              <button className="btn-outline !py-1.5 !px-2.5 !text-xs"><BoltIcon className="h-3.5 w-3.5" /> Optimize</button>
            </div>
            <div className="rounded-xl bg-primary-800 text-slate-200 p-3.5 font-mono text-[11px] leading-relaxed mb-3 overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <ClipboardDocumentIcon className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p><span className="text-accent-300">import</span> express <span className="text-accent-300">from</span> <span className="text-emerald-300">'express'</span>;</p>
              <p className="mt-2"><span className="text-accent-300">router</span>.post(<span className="text-emerald-300">'/api/ideas'</span>, <span className="text-accent-300">async</span> (req, res) =&gt; {'{'}</p>
              <p className="pl-3">&nbsp;&nbsp;<span className="text-accent-300">const</span> idea = <span className="text-accent-300">await</span> Idea.create(req.body);</p>
              <p className="pl-3">&nbsp;&nbsp;<span className="text-accent-300">return</span> res.json(idea);</p>
              <p>{'}'});</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary flex-1 !text-xs">Explain Code</button>
              <button className="btn-outline flex-1 !text-xs">Refactor</button>
              <button className="btn-outline flex-1 !text-xs">Optimize</button>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Live Preview</h2>
              <div className="flex items-center gap-2">
                <span className="badge bg-emerald-100 text-emerald-700">Live update</span>
                <EllipsisHorizontalIcon className="h-4 w-4 text-slate-400" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-primary-700 overflow-hidden">
              <div className="h-6 bg-slate-50 dark:bg-primary-700 flex items-center gap-1.5 px-2.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                <div className="h-2.5 flex-1 rounded bg-white dark:bg-primary-600 ml-2" />
              </div>
              <div className="p-3 space-y-2">
                <div className="h-2 w-1/3 rounded bg-slate-200 dark:bg-primary-600" />
                <div className="h-20 rounded-lg bg-slate-50 dark:bg-primary-700 border border-dashed border-slate-200 dark:border-primary-600" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-2 rounded bg-slate-200 dark:bg-primary-600" />
                  <div className="h-2 rounded bg-slate-200 dark:bg-primary-600" />
                  <div className="h-2 rounded bg-slate-200 dark:bg-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail: Component Library / Deployment / Version Control */}
        <div className="xl:col-span-2 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-sm text-ink dark:text-white">Component Library</h2>
              <ChevronDownIcon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {componentLibrary.map((c) => (
                <div key={c.label} className="rounded-lg border border-slate-100 dark:border-primary-700 p-2 flex flex-col items-center gap-1.5">
                  <div className="h-8 w-full flex items-center justify-center">{c.preview}</div>
                  <p className="text-[10px] text-slate-500">{c.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-heading font-semibold text-sm text-ink dark:text-white mb-3">Deployment Panel</h2>
            <div className="space-y-2">
              {deployments.map((d) => (
                <div
                  key={d.label}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs ${
                    d.status === 'live' ? 'bg-emerald-600 text-white' : 'bg-slate-50 dark:bg-primary-700 text-ink dark:text-white'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <RocketLaunchIcon className={`h-3.5 w-3.5 ${d.status === 'live' ? 'text-white' : 'text-primary'}`} />
                    {d.label}
                  </span>
                  <CheckCircleIcon className={`h-4 w-4 ${d.status === 'live' ? 'text-white' : 'text-emerald-500'}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h2 className="font-heading font-semibold text-sm text-ink dark:text-white mb-3">Version Control</h2>
            <div className="space-y-3">
              {commits.map((c, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="flex flex-col items-center pt-0.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-slate-200 dark:bg-primary-600'}`} />
                    {i < commits.length - 1 && <span className="w-px flex-1 bg-slate-200 dark:bg-primary-600 mt-1" />}
                  </div>
                  <div className="pb-2">
                    <p className="text-xs font-medium text-ink dark:text-white">{c.title}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1"><ClockIcon className="h-3 w-3" /> {c.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
