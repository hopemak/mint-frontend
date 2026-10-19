import React, { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import {
  SparklesIcon,
  ClockIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  BoltIcon,
  ClipboardDocumentIcon,
  CircleStackIcon,
  ServerIcon,
  CloudIcon,
  UserIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  BuildingOffice2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  FlagIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  ArrowsRightLeftIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import { PageHeader } from '../../components/ui.jsx'
import {
  startupAPI,
  mlAPI,
  versionControlAPI,
  taskAPI,
  milestoneAPI,
  documentAPI,
} from '../../services/api.js'

// ─── Constants ──────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'todo',     label: 'To Do',       color: 'bg-slate-100 dark:bg-primary-700' },
  { key: 'progress', label: 'In Progress',  color: 'bg-amber-50  dark:bg-amber-900/20' },
  { key: 'review',   label: 'In Review',    color: 'bg-sky-50    dark:bg-sky-900/20'   },
  { key: 'done',     label: 'Done',         color: 'bg-emerald-50 dark:bg-emerald-900/20' },
]

const PRIORITY_STYLE = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-slate-100 text-slate-600',
}

const componentLibrary = [
  { label: 'Buttons',
    preview: <div className="btn-primary !py-1.5 !px-4 !text-xs pointer-events-none">Button</div>,
    code: '<button className="btn-primary">Click me</button>\n<button className="btn-outline">Cancel</button>' },
  { label: 'Inputs',
    preview: <div className="input !py-1.5 !text-xs pointer-events-none">&nbsp;</div>,
    code: '<input className="input" placeholder="Enter text..." />' },
  { label: 'Cards',
    preview: <div className="h-9 w-full rounded-lg border border-slate-200 dark:border-primary-600 bg-white dark:bg-primary-700" />,
    code: '<div className="card p-5">\n  Card content here\n</div>' },
  { label: 'Badges',
    preview: <span className="badge bg-emerald-100 text-emerald-700">Badge</span>,
    code: '<span className="badge bg-emerald-100 text-emerald-700">Active</span>' },
  { label: 'Forms',
    preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200 dark:bg-primary-600"/><div className="h-1.5 w-2/3 rounded bg-slate-200 dark:bg-primary-600" /></div>,
    code: '<div>\n  <label className="label">Name</label>\n  <input className="input" {...register(\'name\')} />\n</div>' },
  { label: 'Tables',
    preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200 dark:bg-primary-600"/><div className="h-1.5 w-full rounded bg-slate-100 dark:bg-primary-700" /></div>,
    code: '<table className="w-full text-sm">\n  <thead><tr><th className="px-5 py-3 font-medium">Name</th></tr></thead>\n  <tbody><tr><td className="px-5 py-3.5">Value</td></tr></tbody>\n</table>' },
]

const diagramNodes = [
  { key: 'db',     label: 'Database', Icon: CircleStackIcon, x: 8,  y: 50 },
  { key: 'server', label: 'Server',   Icon: ServerIcon,      x: 34, y: 50 },
  { key: 'web1',   label: 'Web',      Icon: CloudIcon,       x: 62, y: 16 },
  { key: 'web2',   label: 'Mobile',   Icon: CpuChipIcon,     x: 62, y: 84 },
  { key: 'user',   label: 'User',     Icon: UserIcon,        x: 90, y: 50 },
]
const diagramLines = [['db','server'],['server','web1'],['server','web2'],['web1','user'],['web2','user']]

function formatBytes(b) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}
function formatDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return iso }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PrototypeCenter() {
  // ── Startup selector ─────────────────────────────────────────────────────────
  const [myStartups, setMyStartups]           = useState([])
  const [selectedStartup, setSelectedStartup] = useState(null)
  const [startupsLoading, setStartupsLoading] = useState(true)

  // ── Kanban board ─────────────────────────────────────────────────────────────
  const [tasks, setTasks]               = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCol, setNewTaskCol]     = useState('todo')
  const [newTaskPri, setNewTaskPri]     = useState('Medium')
  const [addingTask, setAddingTask]     = useState(false)
  const [dragging, setDragging]         = useState(null)   // { taskId }

  // ── Milestones ───────────────────────────────────────────────────────────────
  const [milestones, setMilestones]           = useState([])
  const [msLoading, setMsLoading]             = useState(false)
  const [newMsTitle, setNewMsTitle]           = useState('')
  const [newMsDate, setNewMsDate]             = useState('')
  const [addingMs, setAddingMs]               = useState(false)

  // ── Burndown ─────────────────────────────────────────────────────────────────
  const [burndown, setBurndown]               = useState([])

  // ── Documents ────────────────────────────────────────────────────────────────
  const [docs, setDocs]                       = useState([])
  const [docsLoading, setDocsLoading]         = useState(false)
  const [uploading, setUploading]             = useState(false)
  const fileInputRef                          = useRef(null)

  // ── AI panels ────────────────────────────────────────────────────────────────
  const [mvpPlan, setMvpPlan]                 = useState('')
  const [mvpLoading, setMvpLoading]           = useState(false)
  const [mvpError, setMvpError]               = useState('')
  const [techRecs, setTechRecs]               = useState([])
  const [techLoading, setTechLoading]         = useState(false)
  const [techError, setTechError]             = useState('')
  const [archText, setArchText]               = useState('')
  const [archLoading, setArchLoading]         = useState(false)
  const [archError, setArchError]             = useState('')
  const [codeInput, setCodeInput]             = useState('')
  const [codeResult, setCodeResult]           = useState('')
  const [codeError, setCodeError]             = useState('')
  const [codeActionLoading, setCodeActionLoading] = useState(null)

  // ── Version control ──────────────────────────────────────────────────────────
  const [commits, setCommits]                 = useState([])

  // ── Component library modal ──────────────────────────────────────────────────
  const [selectedComponent, setSelectedComponent] = useState(null)

  // ── Active tab ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('board')   // 'board' | 'milestones' | 'docs' | 'ai' | 'vcs'

  // ── Load startups ─────────────────────────────────────────────────────────────
  useEffect(() => {
    startupAPI.getMyStartups()
      .then((res) => {
        const list = res.data?.data || []
        setMyStartups(list)
        if (list.length > 0) setSelectedStartup(list[0])
      })
      .catch(() => {})
      .finally(() => setStartupsLoading(false))
  }, [])

  // ── Load commits ──────────────────────────────────────────────────────────────
  useEffect(() => {
    versionControlAPI.getAll()
      .then((res) => setCommits(res.data?.data || []))
      .catch(() => setCommits([]))
  }, [])

  // ── Load data when startup selected ──────────────────────────────────────────
  useEffect(() => {
    if (!selectedStartup) return
    loadTasks()
    loadMilestones()
    loadBurndown()
    loadDocs()
    loadTechRecs()
    loadArch()
  }, [selectedStartup])

  const loadTasks = useCallback(async () => {
    if (!selectedStartup) return
    setTasksLoading(true)
    try {
      const res = await taskAPI.getAll(selectedStartup.startup_id)
      setTasks(res.data?.data || [])
    } catch { setTasks([]) }
    finally { setTasksLoading(false) }
  }, [selectedStartup])

  const loadMilestones = useCallback(async () => {
    if (!selectedStartup) return
    setMsLoading(true)
    try {
      const res = await milestoneAPI.list(selectedStartup.startup_id)
      setMilestones(res.data?.milestones || [])
    } catch { setMilestones([]) }
    finally { setMsLoading(false) }
  }, [selectedStartup])

  const loadBurndown = useCallback(async () => {
    if (!selectedStartup) return
    try {
      const res = await taskAPI.getBurndown(selectedStartup.startup_id, 14)
      setBurndown(res.data?.data || [])
    } catch { setBurndown([]) }
  }, [selectedStartup])

  const loadDocs = useCallback(async () => {
    if (!selectedStartup) return
    setDocsLoading(true)
    try {
      const res = await documentAPI.getAll()
      // filter by startup_id
      const all = res.data?.data || []
      setDocs(all.filter(d => d.startup_id === selectedStartup.startup_id || !d.startup_id))
    } catch { setDocs([]) }
    finally { setDocsLoading(false) }
  }, [selectedStartup])

  const loadTechRecs = useCallback(async () => {
    if (!selectedStartup) return
    setTechLoading(true)
    setTechError('')
    try {
      const s = selectedStartup
      const prompt = `Given this startup: "${s.business_name?.trim()}" in the ${s.sector} sector. Description: ${s.description?.slice(0, 300) || 'No description provided.'}\n\nRecommend exactly 6 technologies for building this product. Respond ONLY with a valid JSON array, no other text:\n[{"name": "React", "reason": "short reason under 12 words", "recommended": true}]\nMark the 2 most important as recommended: true, others false.`
      const res = await mlAPI.chat(prompt, {})
      const raw = (res?.data?.data?.reply || '').replace(/```(?:json)?/gi, '').trim()
      const match = raw.match(/\[[\s\S]*\]/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setTechRecs(Array.isArray(parsed) ? parsed : [])
      } else {
        setTechError("Couldn't parse AI response.")
      }
    } catch { setTechError('Could not reach the AI service.') }
    finally { setTechLoading(false) }
  }, [selectedStartup])

  const loadArch = useCallback(async () => {
    if (!selectedStartup) return
    setArchLoading(true)
    setArchError('')
    try {
      const s = selectedStartup
      const prompt = `Startup: "${s.business_name?.trim()}" in ${s.sector}. Description: ${s.description?.slice(0, 300) || 'No description.'}.\n\nDescribe a suitable system architecture under 120 words: key components (frontend, backend, database, integrations) and how data flows between them. Plain text only.`
      const res = await mlAPI.chat(prompt, {})
      const reply = res?.data?.data?.reply
      if (reply) setArchText(reply)
      else setArchError("No response from AI.")
    } catch { setArchError('Could not reach the AI service.') }
    finally { setArchLoading(false) }
  }, [selectedStartup])

  const generateMvp = async () => {
    if (!selectedStartup) { toast.error('Select a startup first'); return }
    setMvpLoading(true)
    setMvpError('')
    try {
      const s = selectedStartup
      const prompt = `Startup: "${s.business_name?.trim()}" in ${s.sector}. Description: ${s.description?.slice(0, 400) || 'No description.'}.\n\nCreate a concrete MVP build plan under 250 words:\n1. Recommended tech stack (3 items, one-line reason each)\n2. 5 core features to ship first\n3. Suggested folder/architecture outline`
      const res = await mlAPI.chat(prompt, { title: s.business_name, sector: s.sector })
      const reply = res?.data?.data?.reply
      if (reply) { setMvpPlan(reply); toast.success('MVP plan generated') }
      else setMvpError("No response from AI. Try again.")
    } catch { setMvpError('Could not reach the AI service.') }
    finally { setMvpLoading(false) }
  }

  // ── Kanban ─────────────────────────────────────────────────────────────────
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedStartup) return
    setAddingTask(true)
    try {
      const res = await taskAPI.create({
        title: newTaskTitle.trim(),
        startup_id: selectedStartup.startup_id,
        column: newTaskCol,
        priority: newTaskPri,
      })
      setTasks(prev => [...prev, res.data.data])
      setNewTaskTitle('')
      toast.success('Task added')
      loadBurndown()
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to add task') }
    finally { setAddingTask(false) }
  }

  const handleMoveTask = async (taskId, targetCol) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.column === targetCol) return
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: targetCol } : t))
    try {
      await taskAPI.update(taskId, { column: targetCol })
      loadBurndown()
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: task.column } : t))
      toast.error('Failed to move task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try { await taskAPI.delete(taskId); loadBurndown() }
    catch { toast.error('Failed to delete task'); loadTasks() }
  }

  // DnD handlers
  const onDragStart = (e, taskId) => { setDragging(taskId); e.dataTransfer.effectAllowed = 'move' }
  const onDragOver  = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
  const onDrop      = (e, col) => { e.preventDefault(); if (dragging) handleMoveTask(dragging, col); setDragging(null) }

  // ── Milestones ─────────────────────────────────────────────────────────────
  const handleAddMilestone = async () => {
    if (!newMsTitle.trim() || !newMsDate || !selectedStartup) return
    setAddingMs(true)
    try {
      const res = await milestoneAPI.create({
        title: newMsTitle.trim(),
        date: newMsDate,
        startup_id: selectedStartup.startup_id,
      })
      setMilestones(prev => [...prev, res.data.milestone])
      setNewMsTitle(''); setNewMsDate('')
      toast.success('Milestone added')
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to add milestone') }
    finally { setAddingMs(false) }
  }

  const handleToggleMilestone = async (ms) => {
    const next = !ms.completed
    setMilestones(prev => prev.map(m => m.id === ms.id ? { ...m, completed: next } : m))
    try { await milestoneAPI.setDone(ms.id, next) }
    catch { setMilestones(prev => prev.map(m => m.id === ms.id ? { ...m, completed: ms.completed } : m)); toast.error('Failed to update') }
  }

  const handleDeleteMilestone = async (id) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
    try { await milestoneAPI.remove(id) }
    catch { toast.error('Failed to delete milestone'); loadMilestones() }
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedStartup) return
    setUploading(true)
    try {
      await documentAPI.upload(file, {
        document_type: 'prototype',
        startup_id: selectedStartup.startup_id,
      })
      toast.success(`${file.name} uploaded`)
      loadDocs()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return
    try {
      await documentAPI.delete(docId)
      setDocs(prev => prev.filter(d => d.document_id !== docId))
      toast.success('Document deleted')
    } catch { toast.error('Failed to delete document') }
  }

  // ── Code assistant ─────────────────────────────────────────────────────────
  const CODE_PROMPTS = {
    explain:  'Explain what this code does, step by step, in plain language:',
    refactor: 'Refactor this code for readability and best practices. Return improved code with a brief note on what changed:',
    optimize: 'Optimize this code for performance. Return improved code with a brief note on what changed:',
  }
  const runCodeAction = async (action) => {
    if (!codeInput.trim()) return
    setCodeActionLoading(action); setCodeError('')
    try {
      const res = await mlAPI.chat(`${CODE_PROMPTS[action]}\n\n${codeInput}`, {})
      const reply = res?.data?.data?.reply
      if (reply) setCodeResult(reply)
      else setCodeError("No response from AI. Try again.")
    } catch { setCodeError('Could not reach the AI service.') }
    finally { setCodeActionLoading(null) }
  }

  const nodeByKey = Object.fromEntries(diagramNodes.map(n => [n.key, n]))
  const tasksByCol = (col) => tasks.filter(t => t.column === col)
  const donePct = tasks.length ? Math.round((tasks.filter(t => t.column === 'done').length / tasks.length) * 100) : 0

  // ─── No startup state ──────────────────────────────────────────────────────
  if (!startupsLoading && myStartups.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Innovation Incubator" title="Prototype Development Center" />
        <div className="card p-12 text-center max-w-md mx-auto">
          <BuildingOffice2Icon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-heading font-semibold text-ink dark:text-white mb-1">No startup found</p>
          <p className="text-sm text-slate-500 mb-4">Create a startup profile first to use the Prototype Development Center.</p>
          <a href="/startups/create" className="btn-primary">Create Startup</a>
        </div>
      </div>
    )
  }

  const TABS = [
    { key: 'board',      label: 'Kanban Board',    Icon: Squares2X2Icon       },
    { key: 'milestones', label: 'Milestones',      Icon: FlagIcon             },
    { key: 'docs',       label: 'Documents',       Icon: DocumentTextIcon     },
    { key: 'ai',         label: 'AI Tools',        Icon: SparklesIcon         },
    { key: 'vcs',        label: 'Version Control', Icon: ArrowsRightLeftIcon  },
  ]

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Innovation Incubator"
        title="Prototype Development Center"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Startup selector */}
            {myStartups.length > 1 && (
              <div className="relative">
                <select
                  value={selectedStartup?.startup_id || ''}
                  onChange={(e) => {
                    const s = myStartups.find(x => x.startup_id === e.target.value)
                    setSelectedStartup(s || null)
                  }}
                  className="input pr-8 py-2 text-sm min-w-[180px]"
                >
                  {myStartups.map(s => (
                    <option key={s.startup_id} value={s.startup_id}>
                      {s.business_name || s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {tab === 'board' && selectedStartup && (
              <button type="button" className="btn-primary gap-2"
                onClick={() => { setNewTaskCol('todo'); document.getElementById('add-task-input')?.focus() }}>
                <PlusIcon className="h-4 w-4" /> Add Task
              </button>
            )}
            {tab === 'docs' && selectedStartup && (
              <button type="button" className="btn-primary gap-2" onClick={() => fileInputRef.current?.click()}
                disabled={uploading}>
                <DocumentArrowUpIcon className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload File'}
              </button>
            )}
          </div>
        }
      />

      {/* Startup identity bar */}
      {selectedStartup && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-2xl border border-slate-100 dark:border-primary-700 bg-white dark:bg-primary-800">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <LightBulbIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-semibold text-ink dark:text-white text-sm truncate">{selectedStartup.business_name}</p>
              <p className="text-xs text-slate-500">{selectedStartup.sector} · TRL {selectedStartup.trl_level || selectedStartup.trl || 'N/A'}</p>
            </div>
          </div>
          {/* Progress stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Squares2X2Icon className="h-3.5 w-3.5" />
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
              {donePct}% done
            </span>
            <span className="flex items-center gap-1.5">
              <FlagIcon className="h-3.5 w-3.5" />
              {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Overall progress bar */}
          <div className="w-full mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${donePct}%` }} />
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-primary-800 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white dark:bg-primary-700 text-ink dark:text-white shadow-card'
                : 'text-slate-500 hover:text-ink dark:hover:text-white'
            }`}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB: KANBAN BOARD
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'board' && (
        <div>
          {/* Add task form */}
          <div className="card p-4 mb-6 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="label">Task title</label>
              <input
                id="add-task-input"
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                className="input"
                placeholder="e.g. Set up CI/CD pipeline"
              />
            </div>
            <div className="w-36">
              <label className="label">Column</label>
              <select value={newTaskCol} onChange={e => setNewTaskCol(e.target.value)} className="input">
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div className="w-32">
              <label className="label">Priority</label>
              <select value={newTaskPri} onChange={e => setNewTaskPri(e.target.value)} className="input">
                {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <button type="button" onClick={handleAddTask}
              disabled={addingTask || !newTaskTitle.trim()}
              className="btn-primary gap-2 disabled:opacity-50">
              <PlusIcon className="h-4 w-4" />
              {addingTask ? 'Adding…' : 'Add Task'}
            </button>
          </div>

          {/* Board columns */}
          {tasksLoading ? (
            <div className="card p-10 text-center text-slate-400 text-sm">Loading tasks…</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {COLUMNS.map(col => (
                <div key={col.key}
                  className={`rounded-2xl border border-slate-100 dark:border-primary-700 min-h-[300px] flex flex-col ${col.color}`}
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, col.key)}>
                  {/* Column header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-primary-700/60">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{col.label}</p>
                    <span className="badge bg-white dark:bg-primary-700 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                      {tasksByCol(col.key).length}
                    </span>
                  </div>
                  {/* Task cards */}
                  <div className="flex-1 p-3 space-y-2.5">
                    {tasksByCol(col.key).map(task => (
                      <div key={task.id}
                        draggable
                        onDragStart={e => onDragStart(e, task.id)}
                        className={`bg-white dark:bg-primary-800 rounded-xl border border-slate-100 dark:border-primary-700 p-3 shadow-card cursor-grab active:cursor-grabbing hover:shadow-soft transition-shadow ${dragging === task.id ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-ink dark:text-white leading-relaxed flex-1">{task.title}</p>
                          <button type="button" onClick={() => handleDeleteTask(task.id)}
                            className="shrink-0 h-5 w-5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                            <XMarkIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className={`badge text-[10px] font-semibold ${PRIORITY_STYLE[task.priority] || ''}`}>
                            {task.priority}
                          </span>
                          {/* Quick-move select */}
                          <select
                            value={task.column}
                            onChange={e => handleMoveTask(task.id, e.target.value)}
                            className="text-[10px] text-slate-500 bg-transparent border-none outline-none cursor-pointer"
                            onClick={e => e.stopPropagation()}>
                            {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                          </select>
                        </div>
                        {col.key === 'done' && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <CheckCircleSolid className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span className="text-[10px] text-emerald-600">Done {task.completed_at ? formatDate(task.completed_at) : ''}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {tasksByCol(col.key).length === 0 && (
                      <div className="flex items-center justify-center h-16 rounded-xl border-2 border-dashed border-slate-200 dark:border-primary-700">
                        <p className="text-xs text-slate-400">Drop tasks here</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Burndown chart */}
          {burndown.length > 0 && (
            <div className="card p-5">
              <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">Burndown Chart</h2>
              <p className="text-xs text-slate-400 mb-4">Ideal vs actual remaining tasks over the last 14 days</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={burndown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ideal"  stroke="#C7DAD8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ideal" />
                  <Line type="monotone" dataKey="actual" stroke="#1D4241" strokeWidth={2} dot={false} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: MILESTONES
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'milestones' && (
        <div>
          {/* Add milestone form */}
          <div className="card p-5 mb-6">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Add Milestone</h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="label">Title</label>
                <input type="text" value={newMsTitle} onChange={e => setNewMsTitle(e.target.value)}
                  className="input" placeholder="e.g. MVP Launch" />
              </div>
              <div className="w-44">
                <label className="label">Target Date</label>
                <input type="date" value={newMsDate} onChange={e => setNewMsDate(e.target.value)} className="input" />
              </div>
              <button type="button" onClick={handleAddMilestone}
                disabled={addingMs || !newMsTitle.trim() || !newMsDate}
                className="btn-primary gap-2 disabled:opacity-50">
                <PlusIcon className="h-4 w-4" />
                {addingMs ? 'Adding…' : 'Add'}
              </button>
            </div>
          </div>

          {msLoading ? (
            <div className="card p-10 text-center text-slate-400 text-sm">Loading milestones…</div>
          ) : milestones.length === 0 ? (
            <div className="card p-12 text-center">
              <FlagIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-ink dark:text-white">No milestones yet</p>
              <p className="text-xs text-slate-500 mt-1">Add a milestone above to track your key dates.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Timeline */}
              <div className="divide-y divide-slate-100 dark:divide-primary-700">
                {[...milestones]
                  .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                  .map((ms, i, arr) => (
                    <div key={ms.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-primary-700/30 transition-colors">
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center self-stretch shrink-0 w-5">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${ms.completed ? 'bg-emerald-500' : 'border-2 border-slate-300 dark:border-primary-500 bg-white dark:bg-primary-800'}`}>
                          {ms.completed && <CheckIcon className="h-3 w-3 text-white" />}
                        </div>
                        {i < arr.length - 1 && <div className="flex-1 w-px bg-slate-200 dark:bg-primary-600 mt-1" />}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${ms.completed ? 'line-through text-slate-400' : 'text-ink dark:text-white'}`}>
                          {ms.title}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0" />
                          {ms.date ? new Date(ms.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No date'}
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => handleToggleMilestone(ms)}
                          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${ms.completed ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                          title={ms.completed ? 'Mark incomplete' : 'Mark done'}>
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDeleteMilestone(ms.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete milestone">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: DOCUMENTS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'docs' && (
        <div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv" />

          <div className="card p-5 mb-6 border-2 border-dashed border-slate-200 dark:border-primary-700 text-center">
            <DocumentArrowUpIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-ink dark:text-white mb-1">Upload a file</p>
            <p className="text-xs text-slate-500 mb-3">PDF, Word, PowerPoint, Excel, images, CSV — max 10 MB</p>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              disabled={uploading} className="btn-outline gap-2">
              <DocumentArrowUpIcon className="h-4 w-4" />
              {uploading ? 'Uploading…' : 'Choose File'}
            </button>
          </div>

          {docsLoading ? (
            <div className="card p-10 text-center text-slate-400 text-sm">Loading documents…</div>
          ) : docs.length === 0 ? (
            <div className="card p-12 text-center">
              <DocumentTextIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-ink dark:text-white">No documents yet</p>
              <p className="text-xs text-slate-500 mt-1">Upload prototyping documents, design files, or specs.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700">
                    <th className="px-5 py-3 font-medium">File</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Size</th>
                    <th className="px-5 py-3 font-medium">Uploaded</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map(doc => (
                    <tr key={doc.document_id} className="border-b border-slate-50 dark:border-primary-700 last:border-0 hover:bg-slate-50 dark:hover:bg-primary-700/30">
                      <td className="px-5 py-3.5 font-medium text-ink dark:text-white flex items-center gap-2">
                        <DocumentTextIcon className="h-4 w-4 text-slate-400 shrink-0" />
                        {doc.filename}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 uppercase text-xs">{doc.file_type}</td>
                      <td className="px-5 py-3.5 text-slate-500">{formatBytes(doc.file_size)}</td>
                      <td className="px-5 py-3.5 text-slate-500">{formatDate(doc.uploaded_at)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button type="button" onClick={() => handleDeleteDoc(doc.document_id)}
                          className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: AI TOOLS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'ai' && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* MVP Plan */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-ink dark:text-white">AI MVP Plan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Generate a concrete build plan for your startup</p>
              </div>
              <span className="badge bg-accent/10 text-accent-600 border border-accent/20">AI</span>
            </div>
            <button onClick={generateMvp} disabled={mvpLoading || !selectedStartup}
              className="btn-accent gap-2 mb-4 disabled:opacity-50">
              <SparklesIcon className="h-4 w-4" />
              {mvpLoading ? 'Generating…' : 'Generate MVP Plan'}
            </button>
            {mvpError && <p className="text-sm text-red-600 mb-3 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4" />{mvpError}</p>}
            {mvpPlan && (
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm text-ink dark:text-slate-100 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                {mvpPlan}
              </div>
            )}
          </div>

          {/* Tech Recommendations */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-ink dark:text-white">Technology Recommendations</h2>
                <p className="text-xs text-slate-400 mt-0.5">AI-suggested tech stack for your startup</p>
              </div>
              <button type="button" onClick={loadTechRecs} disabled={techLoading}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-primary-700 transition-colors" title="Refresh">
                <ArrowPathIcon className={`h-4 w-4 text-slate-400 ${techLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {techLoading && <p className="text-sm text-slate-400">Loading recommendations…</p>}
            {techError && <p className="text-sm text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4" />{techError}</p>}
            {!techLoading && !techError && techRecs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {techRecs.map((t, i) => {
                  const tones = ['bg-sky-100 text-sky-600','bg-emerald-100 text-emerald-600','bg-primary/10 text-primary','bg-amber-100 text-amber-600','bg-violet-100 text-violet-600','bg-orange-100 text-orange-600']
                  return (
                    <div key={t.name || i} className="rounded-xl border border-slate-100 dark:border-primary-700 p-3 flex flex-col items-center gap-2 text-center">
                      <span className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold ${tones[i % tones.length]}`}>
                        {(t.name || '?').slice(0, 2)}
                      </span>
                      <p className="text-xs font-semibold text-ink dark:text-white">{t.name}</p>
                      {t.reason && <p className="text-[10px] text-slate-400 leading-relaxed">{t.reason}</p>}
                      {t.recommended && <span className="badge bg-emerald-50 text-emerald-700 !px-1.5 !text-[10px]">⭐ Top pick</span>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Architecture */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-ink dark:text-white">System Architecture</h2>
                <p className="text-xs text-slate-400 mt-0.5">Recommended architecture for your product</p>
              </div>
              <button type="button" onClick={loadArch} disabled={archLoading}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-primary-700 transition-colors" title="Refresh">
                <ArrowPathIcon className={`h-4 w-4 text-slate-400 ${archLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {/* Diagram */}
            <div className="relative h-44 mb-4 bg-slate-50 dark:bg-primary-700/30 rounded-xl overflow-hidden">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {diagramLines.map(([from, to], i) => {
                  const a = nodeByKey[from], b = nodeByKey[to]
                  return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#C7DAD8" strokeWidth="0.8" />
                })}
              </svg>
              {diagramNodes.map(n => (
                <div key={n.key} className="absolute flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}>
                  <span className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-card">
                    <n.Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{n.label}</span>
                </div>
              ))}
            </div>
            {archLoading && <p className="text-sm text-slate-400">Generating explanation…</p>}
            {archError && <p className="text-sm text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4" />{archError}</p>}
            {!archLoading && !archError && archText && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{archText}</p>
            )}
          </div>

          {/* AI Code Assistant */}
          <div className="card p-6">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">AI Code Assistant</h2>
            <p className="text-xs text-slate-400 mb-4">Paste any code snippet — explain, refactor, or optimize it</p>
            <textarea value={codeInput} onChange={e => setCodeInput(e.target.value)}
              placeholder="Paste code here…"
              className="input font-mono text-xs mb-3 h-28 resize-none" />
            <div className="flex gap-2 mb-3 flex-wrap">
              {[
                { key: 'explain',  label: 'Explain',  Icon: CodeBracketIcon },
                { key: 'refactor', label: 'Refactor', Icon: ArrowPathIcon   },
                { key: 'optimize', label: 'Optimize', Icon: BoltIcon        },
              ].map(({ key, label, Icon }) => (
                <button key={key} type="button" onClick={() => runCodeAction(key)}
                  disabled={!!codeActionLoading || !codeInput.trim()}
                  className="btn-outline gap-1.5 !py-1.5 !px-3 !text-xs disabled:opacity-50">
                  <Icon className="h-3.5 w-3.5" />
                  {codeActionLoading === key ? '…' : label}
                </button>
              ))}
              {codeResult && (
                <button type="button"
                  onClick={() => { navigator.clipboard.writeText(codeResult); toast.success('Copied') }}
                  className="btn-outline gap-1.5 !py-1.5 !px-3 !text-xs ml-auto">
                  <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy
                </button>
              )}
            </div>
            {codeError && <p className="text-xs text-red-600 mb-2">{codeError}</p>}
            {codeResult && (
              <div className="rounded-xl bg-primary-800 text-slate-200 p-3.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                {codeResult}
              </div>
            )}
          </div>

          {/* Component Library */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">UI Component Library</h2>
            <p className="text-xs text-slate-400 mb-4">Click any component to view and copy its code</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {componentLibrary.map(c => (
                <button key={c.label} type="button" onClick={() => setSelectedComponent(c)}
                  className="rounded-xl border border-slate-100 dark:border-primary-700 p-3 flex flex-col items-center gap-2 hover:border-primary/40 hover:shadow-soft transition-all text-center">
                  <div className="h-9 w-full flex items-center justify-center">{c.preview}</div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{c.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: VERSION CONTROL
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'vcs' && (
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-1 flex items-center gap-2">
            <ArrowsRightLeftIcon className="h-5 w-5 text-slate-400" />
            Git Commit History
          </h2>
          <p className="text-xs text-slate-400 mb-5">Last 10 commits from the backend repository</p>

          {commits.length === 0 ? (
            <div className="text-center py-10">
              <ArrowsRightLeftIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No commit history available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {commits.map((c, i) => (
                <div key={c.sha} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0 w-5">
                    <span className={`h-3 w-3 rounded-full mt-1 shrink-0 ${i === 0 ? 'bg-primary' : 'bg-slate-300 dark:bg-primary-600'}`} />
                    {i < commits.length - 1 && <span className="w-px flex-1 bg-slate-200 dark:bg-primary-600 mt-1" />}
                  </div>
                  <div className="pb-4 min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink dark:text-white break-words">{c.message}</p>
                    <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 mt-1">
                      <span className="font-mono bg-slate-100 dark:bg-primary-700 px-1.5 py-0.5 rounded text-[10px]">{c.sha}</span>
                      <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />{c.date}</span>
                      <span>by {c.author}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Component library modal ────────────────────────────────────── */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedComponent(null)}>
          <div className="card p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-ink dark:text-white">{selectedComponent.label}</h3>
              <button type="button" onClick={() => setSelectedComponent(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700 flex items-center justify-center transition-colors">
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-primary-700 p-5 flex items-center justify-center mb-4 bg-slate-50 dark:bg-primary-700/30">
              {selectedComponent.preview}
            </div>
            <div className="relative">
              <pre className="rounded-xl bg-primary-800 text-slate-200 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto">
                {selectedComponent.code}
              </pre>
              <button type="button"
                onClick={() => { navigator.clipboard.writeText(selectedComponent.code); toast.success('Copied!') }}
                className="absolute top-2 right-2 p-2 rounded-lg bg-primary-700 text-slate-300 hover:text-white hover:bg-primary-600 transition-colors"
                title="Copy code">
                <ClipboardDocumentIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
