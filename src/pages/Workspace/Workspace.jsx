import React, { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  DocumentIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, EmptyState } from '../../components/ui.jsx'
import { startupAPI, taskAPI, documentAPI, mentorAPI, sessionAPI } from '../../services/api.js'
import WorkspaceExtras from './WorkspaceExtras.jsx'

const COLUMNS = [
  { key: 'todo', label: 'To Do', bar: 'bg-slate-400' },
  { key: 'progress', label: 'In Progress', bar: 'bg-blue-500' },
  { key: 'done', label: 'Done', bar: 'bg-emerald-500' },
]

const PRIORITY = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'board', label: 'Board' },
  { key: 'mentors', label: 'Mentors' },
  { key: 'files', label: 'Files' },
]

const pidOf = (p) => p?.startup_id || p?.id || p?._id
const taskId = (t) => t.id || t.task_id || t._id
const colOf = (t) => {
  const c = String(t.column || t.status || 'todo').toLowerCase()
  if (c === 'done' || c === 'completed') return 'done'
  if (['progress', 'in_progress', 'review', 'qa'].includes(c)) return 'progress'
  return 'todo'
}
const listOf = (v) =>
  Array.isArray(v) ? v : v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []
const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '-')

function Ring({ percent }) {
  const r = 28
  const c = 2 * Math.PI * r
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
      <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" className="stroke-slate-200 dark:stroke-primary-600" />
      <circle
        cx="36" cy="36" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * percent) / 100}
        transform="rotate(-90 36 36)" className="stroke-emerald-500"
      />
      <text x="36" y="41" textAnchor="middle" className="fill-current text-sm font-bold">{percent}%</text>
    </svg>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="card p-4">
      <p className={`text-3xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}

export default function Workspace() {
  const [projects, setProjects] = useState([])
  const [project, setProject] = useState(null)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [tab, setTab] = useState('overview')

  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', column: 'todo' })

  const [docs, setDocs] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [mentors, setMentors] = useState([])
  const [mentorsLoading, setMentorsLoading] = useState(false)

  const [milestones, setMilestones] = useState([])
  const [showMs, setShowMs] = useState(false)
  const [msForm, setMsForm] = useState({ title: '', date: '' })

  const pid = pidOf(project)

  // Projects
  useEffect(() => {
    startupAPI.getMyStartups()
      .then((res) => {
        const items = res.data?.data || res.data || []
        setProjects(items)
        if (items.length) setProject(items[0])
      })
      .catch(() => toast.error('Could not load projects'))
      .finally(() => setLoadingProjects(false))
  }, [])

  // Tasks + milestones for the selected project
  useEffect(() => {
    if (!pid) return
    setTasksLoading(true)
    taskAPI.getAll(pid)
      .then((res) => {
        const all = res.data?.data || res.data || []
        setTasks(all.filter((t) => t.startup_id == pid))
      })
      .catch(() => toast.error('Could not load tasks'))
      .finally(() => setTasksLoading(false))
    try {
      setMilestones(JSON.parse(localStorage.getItem('milestones_' + pid) || '[]'))
    } catch {
      setMilestones([])
    }
  }, [pid])

  // Files + mentors
  useEffect(() => {
    setDocsLoading(true)
    documentAPI.getAll()
      .then((res) => setDocs(res.data?.data || res.data || []))
      .catch(() => setDocs([]))
      .finally(() => setDocsLoading(false))
    setMentorsLoading(true)
    mentorAPI.getAll()
      .then((res) => setMentors(res.data?.data || res.data || []))
      .catch(() => setMentors([]))
      .finally(() => setMentorsLoading(false))
  }, [])

  const stats = useMemo(() => {
    const done = tasks.filter((t) => colOf(t) === 'done').length
    const doing = tasks.filter((t) => colOf(t) === 'progress').length
    return {
      total: tasks.length,
      done,
      doing,
      percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    }
  }, [tasks])

  const trl = useMemo(() => {
    const n = parseInt(project?.trl_level || project?.trl, 10)
    return Number.isFinite(n) ? Math.max(0, Math.min(9, n)) : 0
  }, [project])

  const matchedMentors = useMemo(() => {
    const sector = String(project?.sector || '').toLowerCase()
    if (!sector) return []
    return mentors.filter((m) =>
      [...listOf(m.preferred_sectors), ...listOf(m.expertise_areas)].some((s) => {
        const v = s.toLowerCase()
        return v.includes(sector) || sector.includes(v)
      })
    )
  }, [mentors, project])

  const nextSteps = useMemo(() => {
    if (!project) return []
    const s = []
    if (String(project.description || '').trim().length < 30) s.push('Write a full description of your startup (at least a few sentences).')
    if (!trl) s.push('Set your Technology Readiness Level (TRL) on the startup page.')
    if (tasks.length === 0) s.push('Create your first task on the Board.')
    if (milestones.length === 0) s.push('Add a milestone with a target date.')
    if (docs.length === 0) s.push('Upload a pitch deck or business plan under Files.')
    if (matchedMentors.length > 0) s.push('Review mentors that match your sector under Mentors.')
    return s
  }, [project, trl, tasks, milestones, docs, matchedMentors])

  const reloadTasks = async () => {
    const res = await taskAPI.getAll(pid)
    const all = res.data?.data || res.data || []
    setTasks(all.filter((t) => t.startup_id == pid))
  }

  const createTask = async (e) => {
    e.preventDefault()
    if (!taskForm.title.trim() || !pid) return
    try {
      await taskAPI.create({
        title: taskForm.title.trim(),
        description: taskForm.description || '',
        priority: taskForm.priority,
        column: taskForm.column,
        status: taskForm.column,
        startup_id: pid,
        story_points: 0,
      })
      toast.success('Task created')
      setTaskForm({ title: '', description: '', priority: 'Medium', column: 'todo' })
      setShowTaskForm(false)
      await reloadTasks()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task')
    }
  }

  const moveTask = async (task, col) => {
    const id = taskId(task)
    const before = tasks
    setTasks((prev) => prev.map((t) => (taskId(t) === id ? { ...t, column: col, status: col } : t)))
    try {
      await taskAPI.update(id, { column: col, status: col })
    } catch {
      setTasks(before)
      toast.error('Failed to move task')
    }
  }

  const deleteTask = async (task) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await taskAPI.delete(taskId(task))
      setTasks((prev) => prev.filter((t) => taskId(t) !== taskId(task)))
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const saveMilestones = (list) => {
    setMilestones(list)
    localStorage.setItem('milestones_' + pid, JSON.stringify(list))
  }

  const addMilestone = (e) => {
    e.preventDefault()
    if (!msForm.title.trim() || !msForm.date) return
    saveMilestones([...milestones, { title: msForm.title.trim(), date: msForm.date, completed: false }])
    setMsForm({ title: '', date: '' })
    setShowMs(false)
  }

  const upload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      await documentAPI.upload(file, { project_id: pid })
      toast.success('File uploaded')
      const res = await documentAPI.getAll()
      setDocs(res.data?.data || res.data || [])
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const deleteDoc = async (d) => {
    if (!window.confirm('Delete this file?')) return
    const id = d.id || d.document_id
    try {
      await documentAPI.delete(id)
      setDocs((prev) => prev.filter((x) => (x.id || x.document_id) !== id))
      toast.success('File deleted')
    } catch {
      toast.error('Failed to delete file')
    }
  }

  const requestSession = async (m) => {
    try {
      await sessionAPI.request(m.mentor_id || m.id || m._id)
      toast.success('Session requested')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not request a session')
    }
  }

  if (loadingProjects) return <div className="p-8"><LoadingBlock /></div>

  if (!project) {
    return (
      <div className="p-8">
        <PageHeader eyebrow="Workspace" title="Project Workspace" />
        <EmptyState title="No startup yet" subtitle="Create a startup to start using your workspace." />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-primary-800 text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-slate-300">Workspace</p>
          <h1 className="font-heading text-2xl font-semibold truncate">{project.business_name || project.name || 'Unnamed startup'}</h1>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            {project.sector && <span className="px-2 py-0.5 rounded-full bg-white/10">{project.sector}</span>}
            {project.region && <span className="px-2 py-0.5 rounded-full bg-white/10">{project.region}</span>}
            <span className="px-2 py-0.5 rounded-full bg-white/10 capitalize">{project.status || 'submitted'}</span>
          </div>
        </div>
        {projects.length > 1 && (
          <select
            className="input text-sm text-ink max-w-xs"
            value={pid}
            onChange={(e) => setProject(projects.find((p) => pidOf(p) === e.target.value) || project)}
          >
            {projects.map((p) => (
              <option key={pidOf(p)} value={pidOf(p)}>{p.business_name || p.name || 'Unnamed'}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 dark:border-primary-700">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-primary text-primary font-medium' : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Total tasks" value={stats.total} tone="text-primary" />
            <Stat label="Completed" value={stats.done} tone="text-emerald-500" />
            <Stat label="In progress" value={stats.doing} tone="text-blue-500" />
            <div className="card p-4 flex items-center gap-3">
              <Ring percent={stats.percent} />
              <p className="text-xs text-slate-500">Task completion</p>
            </div>
          </div>

          <WorkspaceExtras project={project} />
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-semibold">Technology Readiness (TRL)</h2>
                <span className="text-sm text-slate-500">{trl ? `Level ${trl} of 9` : 'Not set'}</span>
              </div>
              <div className="grid grid-cols-9 gap-1.5">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="text-center">
                    <div className={`h-3 rounded-full ${i < trl ? 'bg-primary' : 'bg-slate-200 dark:bg-primary-600'}`} />
                    <span className="text-[10px] text-slate-400">{i + 1}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 text-[11px] text-slate-400 mt-1 text-center">
                <span>Research (1-3)</span><span>Development (4-6)</span><span>Deployment (7-9)</span>
              </div>

              <h2 className="font-heading font-semibold mt-6 mb-3">Next steps</h2>
              {nextSteps.length === 0 ? (
                <p className="text-sm text-emerald-600">You are all set. Keep your board up to date.</p>
              ) : (
                <ul className="space-y-2">
                  {nextSteps.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-400 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading font-semibold">Milestones</h2>
                <button onClick={() => setShowMs(!showMs)} className="text-xs text-primary">{showMs ? 'Cancel' : '+ Add'}</button>
              </div>
              {showMs && (
                <form onSubmit={addMilestone} className="space-y-2 mb-3">
                  <input required placeholder="Milestone title" className="input text-sm" value={msForm.title} onChange={(e) => setMsForm({ ...msForm, title: e.target.value })} />
                  <input required type="date" className="input text-sm" value={msForm.date} onChange={(e) => setMsForm({ ...msForm, date: e.target.value })} />
                  <button className="btn btn-primary text-sm w-full">Add milestone</button>
                </form>
              )}
              {milestones.length === 0 ? (
                <p className="text-sm text-slate-400">No milestones yet.</p>
              ) : (
                <div className="space-y-2">
                  {[...milestones].map((m, i) => (
                    <div key={i} className="flex items-start gap-2 group">
                      <button onClick={() => saveMilestones(milestones.map((x, j) => (j === i ? { ...x, completed: !x.completed } : x)))} className="mt-0.5 shrink-0">
                        {m.completed
                          ? <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                          : <span className="block h-5 w-5 rounded-full border-2 border-amber-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${m.completed ? 'line-through text-slate-400' : ''}`}>{m.title}</p>
                        <p className="text-xs text-slate-400">{fmtDate(m.date)}</p>
                      </div>
                      <button onClick={() => saveMilestones(milestones.filter((_, j) => j !== i))} className="sm:opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-400 mt-3">Milestones are saved in this browser only.</p>
            </div>
          </div>
        </div>
      )}

      {/* BOARD */}
      {tab === 'board' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg">Project board</h2>
            <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn btn-primary text-sm flex items-center gap-1">
              <PlusIcon className="h-4 w-4" /> New task
            </button>
          </div>
          {showTaskForm && (
            <form onSubmit={createTask} className="card p-4 mb-4 grid sm:grid-cols-4 gap-3">
              <input required placeholder="Task title" className="input text-sm sm:col-span-2" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
              <select className="input text-sm" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                <option value="Low">Low priority</option>
                <option value="Medium">Medium priority</option>
                <option value="High">High priority</option>
              </select>
              <select className="input text-sm" value={taskForm.column} onChange={(e) => setTaskForm({ ...taskForm, column: e.target.value })}>
                {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <input placeholder="Description (optional)" className="input text-sm sm:col-span-3" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowTaskForm(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary text-sm flex-1">Create</button>
              </div>
            </form>
          )}
          {tasksLoading ? <LoadingBlock /> : (
            <div className="grid md:grid-cols-3 gap-4">
              {COLUMNS.map((col) => {
                const items = tasks.filter((t) => colOf(t) === col.key)
                return (
                  <div key={col.key} className="rounded-xl bg-slate-50 dark:bg-primary-800/50 p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${col.bar}`} />
                      <h3 className="font-medium text-sm">{col.label}</h3>
                      <span className="ml-auto text-xs text-slate-400">{items.length}</span>
                    </div>
                    <div className="space-y-2">
                      {items.length === 0 && <p className="text-xs text-slate-400 py-4 text-center">No tasks</p>}
                      {items.map((task) => {
                        const pr = String(task.priority || 'medium').toLowerCase()
                        return (
                          <div key={taskId(task)} className="bg-white dark:bg-primary-700 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-primary-600">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium">{task.title}</p>
                              <button onClick={() => deleteTask(task)} className="text-slate-300 hover:text-red-400 shrink-0">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                            {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${PRIORITY[pr] || PRIORITY.medium}`}>{pr}</span>
                              <div className="flex gap-1">
                                {COLUMNS.filter((c) => c.key !== col.key).map((c) => (
                                  <button key={c.key} onClick={() => moveTask(task, c.key)} className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-primary-500 text-slate-500 hover:bg-slate-50 dark:hover:bg-primary-600">
                                    {c.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* MENTORS */}
      {tab === 'mentors' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg">Mentors</h2>
            <span className="text-xs text-slate-400">{matchedMentors.length} match your sector - {mentors.length} total</span>
          </div>
          {mentorsLoading ? <LoadingBlock /> : mentors.length === 0 ? (
            <EmptyState title="No mentors yet" subtitle="Mentors will appear here when available." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...mentors].sort((a, b) => matchedMentors.includes(b) - matchedMentors.includes(a)).map((m) => {
                const match = matchedMentors.includes(m)
                const name = m.full_name || m.name || 'Unnamed'
                return (
                  <div key={m.mentor_id || m.id || m._id} className={`card p-4 ${match ? 'ring-1 ring-primary/40' : ''}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-11 w-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">{name.charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{name}</p>
                        <p className="text-xs text-slate-400">{m.years_experience ? `${m.years_experience} years experience` : 'Mentor'}</p>
                        {match && <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Matches {project.sector}</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {listOf(m.expertise_areas).map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-primary-700 text-slate-600 dark:text-slate-300">{a}</span>
                      ))}
                    </div>
                    <button onClick={() => requestSession(m)} className="btn btn-primary text-xs px-3 py-1.5 mb-2">Request a session</button>
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <EnvelopeIcon className="h-4 w-4" /> Contact by email
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* FILES */}
      {tab === 'files' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg">Files and documents</h2>
            <label className="btn btn-primary text-sm flex items-center gap-1 cursor-pointer">
              <PlusIcon className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" className="hidden" onChange={upload} disabled={uploading} />
            </label>
          </div>
          {docsLoading ? <LoadingBlock /> : docs.length === 0 ? (
            <EmptyState title="No files yet" subtitle="Upload your pitch deck, business plan or prototype documents." />
          ) : (
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.id || d.document_id} className="card p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <DocumentIcon className="h-5 w-5 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.filename || d.name || 'Untitled'}</p>
                      <p className="text-xs text-slate-400">{d.file_type || 'file'} - {fmtDate(d.uploaded_at || d.created_at)}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteDoc(d)} className="text-slate-300 hover:text-red-400 p-1 shrink-0">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
