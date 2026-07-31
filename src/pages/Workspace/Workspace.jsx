import React, { useState } from 'react'
import {
  ArrowUpTrayIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  PencilIcon,
  EllipsisHorizontalIcon,
  ArrowTopRightOnSquareIcon,
  CodeBracketSquareIcon,
  DocumentIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const initialColumns = {
  'To Do': [
    { id: 't1', title: 'Define onboarding flow', assignee: 'SJ', priority: 'bg-primary-600' },
    { id: 't2', title: 'Set up CI pipeline', assignee: 'SS', priority: 'bg-primary-400' },
  ],
  'In Progress': [
    { id: 't3', title: 'Build auth screens', assignee: 'DK', priority: 'bg-primary-400' },
  ],
  'Code Review': [
    { id: 't4', title: 'Fix bug in user authentication', assignee: 'SB', priority: 'bg-accent-500' },
  ],
  'QA Testing': [
    { id: 't5', title: 'Regression test payments flow', assignee: 'MH', priority: 'bg-accent-500' },
  ],
  Done: [
    { id: 't6', title: 'Landing page redesign', assignee: 'KH', priority: 'bg-emerald-500' },
  ],
}

const burndown = [
  { day: 'Mon', ideal: 40, actual: 40 },
  { day: 'Tue', ideal: 32, actual: 36 },
  { day: 'Wed', ideal: 24, actual: 28 },
  { day: 'Thu', ideal: 16, actual: 20 },
  { day: 'Fri', ideal: 8, actual: 10 },
  { day: 'Mon', ideal: 0, actual: 3 },
]

const milestones = [
  { label: 'Ideation', status: 'done', date: 'May 28, 2023', tone: 'bg-primary-300' },
  { label: 'Validation', status: 'done', date: 'Jun 12, 2023', tone: 'bg-primary-500' },
  { label: 'MVP Development', status: 'active', date: 'Jul 30, 2023', tone: 'bg-accent-500' },
  { label: 'Beta Launch', status: 'upcoming', date: 'Sep 15, 2023', tone: 'bg-emerald-500' },
  { label: 'Market Entry', status: 'upcoming', date: 'Nov 1, 2023', tone: 'bg-slate-300' },
]

const taskPoints = [
  { id: 'tp1', title: 'Task point 1', subtasks: [
    { name: 'Fixed bug in user progress', progress: 70, assignee: 'SJ' },
    { name: 'Fixed bug in progress', progress: 45, assignee: 'SJ' },
  ] },
  { id: 'tp2', title: 'Task point 2', subtasks: [
    { name: 'Quantum Hn progress', progress: 85, assignee: 'SJ' },
    { name: 'Fixed bug-in progress', progress: 55, assignee: 'SJ' },
  ] },
]

const githubActivity = [
  { icon: ArrowPathIcon, label: 'Recent activity', detail: 'Fixed bug in user authentication', time: 'now' },
  { icon: CodeBracketSquareIcon, label: 'Commits', detail: 'Fixed bug in user authentication', time: '2h ago' },
  { icon: ArrowTopRightOnSquareIcon, label: 'Pull requests', detail: 'Fixed bug in user authentication', time: '5h ago' },
]

const files = [
  { icon: DocumentTextIcon, name: 'Comment File', type: '.txt', date: 'Apr 18, 2023' },
  { icon: DocumentIcon, name: 'Document', type: '.xml', date: 'Apr 18, 2023' },
  { icon: DocumentTextIcon, name: 'Permanent File', type: '.pdf', date: 'Apr 18, 2023' },
]

const sharedFiles = [
  { icon: DocumentIcon, name: 'File Files', type: '.zip', date: 'Apr 21, 2023' },
  { icon: DocumentTextIcon, name: 'Permanent File', type: '.pdf', date: 'Apr 31, 2023' },
  { icon: DocumentTextIcon, name: 'Sprint Notes', type: '.docx', date: 'Apr 21, 2023' },
]

const milestoneTimeline = [
  { label: 'Upcoming Milestone', date: 'Jun 18, 2023', progress: 30, status: 'upcoming' },
  { label: 'Upcoming Milestone', date: 'Jun 3, 2023', progress: 65, status: 'upcoming' },
  { label: 'Completed Milestone', date: 'Dec 5, 2023', progress: 100, status: 'done' },
]

export default function Workspace() {
  const [columns] = useState(initialColumns)
  const [aiMessages, setAiMessages] = useState([
    { id: 1, from: 'ai', text: 'Sprint is on track. Want a summary of blockers in Code Review?' },
  ])
  const [aiInput, setAiInput] = useState('')

  const sendAi = (e) => {
    e.preventDefault()
    if (!aiInput.trim()) return
    setAiMessages((m) => [...m, { id: Date.now(), from: 'me', text: aiInput }])
    setAiInput('')
  }

  const totalTasks = Object.values(columns).flat().length
  const doneTasks = columns.Done.length

  return (
    <div>
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-ink dark:text-white">Quantum AI Accelerator</h1>
          <button className="text-slate-400 hover:text-primary" aria-label="Edit project name"><PencilIcon className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline text-sm"><ArrowPathIcon className="h-4 w-4" /> Refresh</button>
          <button className="btn-primary text-sm">Status <ChevronDownIcon className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Milestone stepper */}
      <div className="card p-4 mb-4 overflow-x-auto">
        <div className="flex min-w-[700px]">
          {milestones.map((m, i) => (
            <div
              key={m.label}
              className={`flex-1 px-5 py-3 text-sm text-white ${m.tone} ${i === 0 ? 'rounded-l-xl' : ''} ${i === milestones.length - 1 ? 'rounded-r-xl' : ''}`}
              style={{ marginLeft: i === 0 ? 0 : '-10px', clipPath: i === 0 ? 'polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%)' : i === milestones.length - 1 ? 'polygon(14px 0,100% 0,100% 100%,14px 100%,0 50%)' : 'polygon(0 0,calc(100% - 14px) 0,100% 50%,calc(100% - 14px) 100%,0 100%,14px 50%)' }}
            >
              <p className="font-medium truncate">{m.label}</p>
              <p className="text-xs opacity-80">{m.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 space-y-4">
          <div className="card p-5 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Project Board</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-primary-600">Directory <ChevronDownIcon className="h-3.5 w-3.5" /></button>
                <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-primary-600">Priority <ChevronDownIcon className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="flex gap-4 min-w-[900px]">
              {Object.entries(columns).map(([col, tasks]) => (
                <div key={col} className="flex-1 min-w-[180px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-500">{col} <span className="text-slate-400">({tasks.length})</span></p>
                    <EllipsisHorizontalIcon className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="space-y-2.5">
                    {tasks.map((t) => (
                      <div key={t.id} className="rounded-xl border border-slate-100 dark:border-primary-700 p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium text-ink dark:text-white pr-2">{t.title}</p>
                          <EllipsisHorizontalIcon className="h-4 w-4 text-slate-300 shrink-0" />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="badge bg-slate-100 dark:bg-primary-700 text-slate-500 text-[11px] flex items-center gap-1">
                            <span className={`h-1.5 w-1.5 rounded-full ${t.priority}`} /> Priority
                          </span>
                          <span className="h-6 w-6 rounded-full bg-accent-100 text-accent-600 text-[11px] flex items-center justify-center font-medium">
                            {t.assignee}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Sprint Board</h2>
              <button className="flex items-center gap-1 badge bg-slate-100 dark:bg-primary-700 text-slate-500">
                Current Sprint <ChevronDownIcon className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-100 dark:border-primary-700 p-4">
                <p className="text-sm font-medium text-ink dark:text-white mb-3">Current Sprint</p>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between"><span>Story Points</span><span className="font-medium text-ink dark:text-white">40</span></div>
                  <div className="flex justify-between"><span>Tasks Completed</span><span className="font-medium text-ink dark:text-white">{doneTasks} / {totalTasks}</span></div>
                  <div className="flex justify-between"><span>Sprint Progress</span><span className="font-medium text-ink dark:text-white">62%</span></div>
                </div>
              </div>

              {taskPoints.map((tp) => (
                <div key={tp.id} className="rounded-xl border border-slate-100 dark:border-primary-700 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-ink dark:text-white">{tp.title}</p>
                    <EllipsisHorizontalIcon className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="space-y-3">
                    {tp.subtasks.map((s) => (
                      <div key={s.name}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-500 truncate pr-2">{s.name}</p>
                          <span className="h-5 w-5 rounded-full bg-accent-100 text-accent-600 text-[9px] flex items-center justify-center font-medium shrink-0">{s.assignee}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${s.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-slate-100 dark:border-primary-700 p-4">
                <p className="text-sm font-medium text-ink dark:text-white mb-2">Sprint Burndown</p>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={burndown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={22} />
                    <Tooltip />
                    <Area type="monotone" dataKey="ideal" stroke="#C7DAD8" fill="#C7DAD8" fillOpacity={0.3} name="Ideal" />
                    <Area type="monotone" dataKey="actual" stroke="#1D4241" fill="#1D4241" fillOpacity={0.2} name="Actual" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <CodeBracketIcon className="h-5 w-5 text-primary" />
              <h2 className="font-heading font-semibold text-ink dark:text-white">GitHub Integration</h2>
            </div>
            <p className="text-xs text-slate-500 mb-2">Recent repository activity</p>
            <ul className="text-sm space-y-3">
              {githubActivity.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <a.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-ink dark:text-white text-xs font-medium">{a.label} <span className="text-slate-400 font-normal">{a.time}</span></p>
                    <p className="text-xs text-slate-500">{a.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Files &amp; Documents</h2>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>File</span><span>Upload</span>
            </div>
            <ul className="text-sm space-y-2.5 mb-3">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink dark:text-white">
                    <f.icon className="h-4 w-4 text-primary" /> {f.name} <span className="text-slate-400 text-xs">{f.type}</span>
                  </span>
                  <span className="text-xs text-slate-400">{f.date}</span>
                </li>
              ))}
            </ul>
            <button className="btn-primary w-full text-sm">
              <ArrowUpTrayIcon className="h-4 w-4" /> Upload New File
            </button>
          </div>

          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Files &amp; Documents</h2>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>File</span><span>Upload</span>
            </div>
            <ul className="text-sm space-y-2.5 mb-3">
              {sharedFiles.map((f, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-ink dark:text-white">
                    <f.icon className="h-4 w-4 text-primary" /> {f.name} <span className="text-slate-400 text-xs">{f.type}</span>
                  </span>
                  <span className="text-xs text-slate-400">{f.date}</span>
                </li>
              ))}
            </ul>
            <button className="btn-primary w-full text-sm">
              <ArrowUpTrayIcon className="h-4 w-4" /> Upload New File
            </button>
          </div>

          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Milestones Timeline</h2>
            <div className="space-y-4">
              {milestoneTimeline.map((m, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`h-2.5 w-2.5 rounded-full ${m.status === 'done' ? 'bg-emerald-500' : 'bg-primary'}`} />
                    <p className="text-sm text-ink dark:text-white">{m.label}</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-1.5 ml-4">{m.date}</p>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden ml-4">
                    <div className={`h-full ${m.status === 'done' ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${m.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Comments &amp; Activity</h2>
            <div className="space-y-3 text-sm mb-3">
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-full bg-primary text-white text-[11px] flex items-center justify-center shrink-0">SJ</div>
                <div><p className="text-ink dark:text-white">Fixed bug in user authentication at commit.</p><p className="text-xs text-slate-400">2h ago</p></div>
              </div>
              <div className="flex gap-2.5">
                <div className="h-7 w-7 rounded-full bg-accent-100 text-accent-600 text-[11px] flex items-center justify-center shrink-0">DK</div>
                <div><p className="text-ink dark:text-white">Team discussion updated for QA testing.</p><p className="text-xs text-slate-400">4h ago</p></div>
              </div>
            </div>
            <input placeholder="Add a comment..." className="input text-sm" />
          </div>

          <div className="card p-0 overflow-hidden bg-primary-800 text-white">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <SparklesIcon className="h-4 w-4 text-accent" />
              <h2 className="font-heading font-semibold text-sm">AI Assistant</h2>
            </div>
            <div className="p-4 space-y-2 max-h-40 overflow-y-auto">
              {aiMessages.map((m) => (
                <div key={m.id} className={`text-xs rounded-xl px-3 py-2 max-w-[85%] ${m.from === 'me' ? 'bg-accent text-primary-800 ml-auto' : 'bg-white/10'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendAi} className="flex gap-1.5 p-3 pt-0">
              <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs placeholder-slate-400 focus:outline-none" placeholder="Type a message..." />
              <button className="bg-accent text-primary-800 rounded-lg px-2.5"><PaperAirplaneIcon className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
