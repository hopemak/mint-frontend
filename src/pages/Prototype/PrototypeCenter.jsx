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
  DocumentArrowUpIcon,
  DocumentTextIcon,
  FlagIcon,
  CalendarDaysIcon,
  Squares2X2Icon,
  ArrowsRightLeftIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  CpuChipIcon,
  PhotoIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
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
  { key: 'todo',     label: 'To Do',      color: 'bg-slate-50 dark:bg-primary-800/60',         header: 'bg-slate-100 dark:bg-primary-700',      dot: 'bg-slate-400'   },
  { key: 'progress', label: 'In Progress', color: 'bg-amber-50/80 dark:bg-amber-900/10',         header: 'bg-amber-100 dark:bg-amber-900/30',      dot: 'bg-amber-500'   },
  { key: 'review',   label: 'In Review',   color: 'bg-sky-50/80 dark:bg-sky-900/10',             header: 'bg-sky-100 dark:bg-sky-900/30',          dot: 'bg-sky-500'     },
  { key: 'done',     label: 'Done',        color: 'bg-emerald-50/80 dark:bg-emerald-900/10',     header: 'bg-emerald-100 dark:bg-emerald-900/30',  dot: 'bg-emerald-500' },
]

const PRIORITY_CONFIG = {
  High:   { style: 'bg-red-100 text-red-700 border border-red-200',       dot: 'bg-red-500'    },
  Medium: { style: 'bg-amber-100 text-amber-700 border border-amber-200', dot: 'bg-amber-400'  },
  Low:    { style: 'bg-slate-100 text-slate-600 border border-slate-200', dot: 'bg-slate-400'  },
}

// File-type → icon + color
function fileTypeConfig(ext) {
  const e = (ext || '').toLowerCase()
  if (['pdf'].includes(e))                       return { Icon: DocumentTextIcon,          color: 'bg-red-100 text-red-600'     }
  if (['doc','docx'].includes(e))                return { Icon: DocumentTextIcon,          color: 'bg-blue-100 text-blue-600'   }
  if (['ppt','pptx'].includes(e))                return { Icon: PresentationChartLineIcon, color: 'bg-orange-100 text-orange-600'}
  if (['xls','xlsx','csv'].includes(e))          return { Icon: TableCellsIcon,            color: 'bg-emerald-100 text-emerald-600'}
  if (['png','jpg','jpeg','gif','webp'].includes(e)) return { Icon: PhotoIcon,             color: 'bg-violet-100 text-violet-600'}
  return                                                { Icon: DocumentTextIcon,          color: 'bg-slate-100 text-slate-600' }
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
    preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200"/><div className="h-1.5 w-2/3 rounded bg-slate-200" /></div>,
    code: '<div>\n  <label className="label">Name</label>\n  <input className="input" {...register(\'name\')} />\n</div>' },
  { label: 'Tables',
    preview: <div className="space-y-1 w-full"><div className="h-1.5 w-full rounded bg-slate-200"/><div className="h-1.5 w-full rounded bg-slate-100" /></div>,
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(b) {
  if (!b) return '—'
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}
function formatDate(iso) {
  if (!iso) return ''
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
  catch { return iso }
}
function isOverdue(dateStr) {
  if (!dateStr) return false
  try { return new Date(dateStr) < new Date(new Date().toDateString()) }
  catch { return false }
}
function daysUntil(dateStr) {
  if (!dateStr) return null
  try {
    const diff = Math.round((new Date(dateStr) - new Date(new Date().toDateString())) / 86400000)
    return diff
  } catch { return null }
}

// ─── Skeleton shimmer ──────────────────────────────────────────────────────────
function SkeletonBlock({ className = '' }) {
  return <div className={`rounded-lg bg-slate-100 dark:bg-primary-700 animate-pulse ${className}`} />
}
function TechRecsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-100 dark:border-primary-700 p-3 flex flex-col items-center gap-2">
          <SkeletonBlock className="h-9 w-9 rounded-lg" />
          <SkeletonBlock className="h-3 w-16" />
          <SkeletonBlock className="h-2 w-20" />
        </div>
      ))}
    </div>
  )
}
function ArchSkeleton() {
  return (
    <div className="space-y-2">
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-5/6" />
      <SkeletonBlock className="h-3 w-4/6" />
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-3/6" />
    </div>
  )
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
  const [dragging, setDragging]         = useState(null)
  const [dragOver, setDragOver]         = useState(null)   // column key being hovered

  // ── Milestones ───────────────────────────────────────────────────────────────
  const [milestones, setMilestones]     = useState([])
  const [msLoading, setMsLoading]       = useState(false)
  const [newMsTitle, setNewMsTitle]     = useState('')
  const [newMsDate, setNewMsDate]       = useState('')
  const [addingMs, setAddingMs]         = useState(false)

  // ── Burndown ─────────────────────────────────────────────────────────────────
  const [burndown, setBurndown]         = useState([])

  // ── Documents ────────────────────────────────────────────────────────────────
  const [docs, setDocs]                 = useState([])
  const [docsLoading, setDocsLoading]   = useState(false)
  const [uploading, setUploading]       = useState(false)
  const [dropActive, setDropActive]     = useState(false)
  const fileInputRef                    = useRef(null)

  // ── AI panels ────────────────────────────────────────────────────────────────
  const [mvpPlan, setMvpPlan]                     = useState('')
  const [mvpLoading, setMvpLoading]               = useState(false)
  const [mvpError, setMvpError]                   = useState('')
  const [techRecs, setTechRecs]                   = useState([])
  const [techLoading, setTechLoading]             = useState(false)
  const [techError, setTechError]                 = useState('')
  const [archText, setArchText]                   = useState('')
  const [archLoading, setArchLoading]             = useState(false)
  const [archError, setArchError]                 = useState('')
  const [codeInput, setCodeInput]                 = useState('')
  const [codeResult, setCodeResult]               = useState('')
  const [codeError, setCodeError]                 = useState('')
  const [codeActionLoading, setCodeActionLoading] = useState(null)

  // ── Version control ──────────────────────────────────────────────────────────
  const [commits, setCommits]           = useState([])

  // ── Component library modal ──────────────────────────────────────────────────
  const [selectedComponent, setSelectedComponent] = useState(null)

  // ── Active tab ───────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('board')

  // ── Load startups ─────────────────────────────────────────────────────────────
  useEffect(() => {
    startupAPI.getMyStartups()
      .then(res => {
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
      .then(res => setCommits(res.data?.data || []))
      .catch(() => setCommits([]))
  }, [])

  // ── Load data whenever startup changes ────────────────────────────────────────
  useEffect(() => {
    if (!selectedStartup) return
    loadTasks(); loadMilestones(); loadBurndown(); loadDocs()
    loadTechRecs(); loadArch()
  }, [selectedStartup])

  const loadTasks = useCallback(async () => {
    if (!selectedStartup) return
    setTasksLoading(true)
    try { const r = await taskAPI.getAll(selectedStartup.startup_id); setTasks(r.data?.data || []) }
    catch { setTasks([]) }
    finally { setTasksLoading(false) }
  }, [selectedStartup])

  const loadMilestones = useCallback(async () => {
    if (!selectedStartup) return
    setMsLoading(true)
    try { const r = await milestoneAPI.list(selectedStartup.startup_id); setMilestones(r.data?.milestones || []) }
    catch { setMilestones([]) }
    finally { setMsLoading(false) }
  }, [selectedStartup])

  const loadBurndown = useCallback(async () => {
    if (!selectedStartup) return
    try { const r = await taskAPI.getBurndown(selectedStartup.startup_id, 14); setBurndown(r.data?.data || []) }
    catch { setBurndown([]) }
  }, [selectedStartup])

  const loadDocs = useCallback(async () => {
    if (!selectedStartup) return
    setDocsLoading(true)
    try {
      const r = await documentAPI.getAll()
      const all = r.data?.data || []
      setDocs(all.filter(d => d.startup_id === selectedStartup.startup_id || !d.startup_id))
    }
    catch { setDocs([]) }
    finally { setDocsLoading(false) }
  }, [selectedStartup])

  const loadTechRecs = useCallback(async () => {
    if (!selectedStartup) return
    setTechLoading(true); setTechError('')
    try {
      const s = selectedStartup
      const prompt = `Given this startup: "${s.business_name?.trim()}" in the ${s.sector} sector. Description: ${s.description?.slice(0,300) || 'No description.'}

Recommend exactly 6 technologies for building this product. Respond ONLY with a valid JSON array:
[{"name":"React","reason":"short reason under 12 words","recommended":true}]
Mark the 2 most important as recommended: true, others false.`
      const r = await mlAPI.chat(prompt, {})
      const raw = (r?.data?.data?.reply || '').replace(/```(?:json)?/gi, '').trim()
      const m = raw.match(/\[[\s\S]*\]/)
      if (m) { const p = JSON.parse(m[0]); setTechRecs(Array.isArray(p) ? p : []) }
      else setTechError("Couldn't parse AI response.")
    } catch { setTechError('Could not reach the AI service.') }
    finally { setTechLoading(false) }
  }, [selectedStartup])

  const loadArch = useCallback(async () => {
    if (!selectedStartup) return
    setArchLoading(true); setArchError('')
    try {
      const s = selectedStartup
      const prompt = `Startup: "${s.business_name?.trim()}" in ${s.sector}. Description: ${s.description?.slice(0,300) || 'No description.'}.

Describe a suitable system architecture under 120 words: key components (frontend, backend, database, integrations) and data flow. Plain text only.`
      const r = await mlAPI.chat(prompt, {})
      const reply = r?.data?.data?.reply
      if (reply) setArchText(reply)
      else setArchError('No response from AI.')
    } catch { setArchError('Could not reach the AI service.') }
    finally { setArchLoading(false) }
  }, [selectedStartup])

  const generateMvp = async () => {
    if (!selectedStartup) { toast.error('Select a startup first'); return }
    setMvpLoading(true); setMvpError('')
    try {
      const s = selectedStartup
      const prompt = `Startup: "${s.business_name?.trim()}" in ${s.sector}. Description: ${s.description?.slice(0,400) || 'No description.'}.

Create a concrete MVP build plan under 250 words:
1. Recommended tech stack (3 items, one-line reason each)
2. 5 core features to ship first
3. Suggested folder/architecture outline`
      const r = await mlAPI.chat(prompt, { title: s.business_name, sector: s.sector })
      const reply = r?.data?.data?.reply
      if (reply) { setMvpPlan(reply); toast.success('MVP plan generated') }
      else setMvpError('No response from AI. Try again.')
    } catch { setMvpError('Could not reach the AI service.') }
    finally { setMvpLoading(false) }
  }

  // ── Kanban handlers ────────────────────────────────────────────────────────
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedStartup) return
    setAddingTask(true)
    try {
      const r = await taskAPI.create({ title: newTaskTitle.trim(), startup_id: selectedStartup.startup_id, column: newTaskCol, priority: newTaskPri })
      setTasks(prev => [...prev, r.data.data])
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
    try { await taskAPI.update(taskId, { column: targetCol }); loadBurndown() }
    catch { setTasks(prev => prev.map(t => t.id === taskId ? { ...t, column: task.column } : t)); toast.error('Failed to move task') }
  }

  const handleDeleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    try { await taskAPI.delete(taskId); loadBurndown() }
    catch { toast.error('Failed to delete task'); loadTasks() }
  }

  const onDragStart  = (e, taskId) => { setDragging(taskId); e.dataTransfer.effectAllowed = 'move' }
  const onDragEnd    = () => { setDragging(null); setDragOver(null) }
  const onDragOver   = (e, col) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOver(col) }
  const onDragLeave  = () => setDragOver(null)
  const onDrop       = (e, col) => { e.preventDefault(); if (dragging) handleMoveTask(dragging, col); setDragging(null); setDragOver(null) }

  // ── Milestone handlers ─────────────────────────────────────────────────────
  const handleAddMilestone = async () => {
    if (!newMsTitle.trim() || !newMsDate || !selectedStartup) return
    setAddingMs(true)
    try {
      const r = await milestoneAPI.create({ title: newMsTitle.trim(), date: newMsDate, startup_id: selectedStartup.startup_id })
      setMilestones(prev => [...prev, r.data.milestone])
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

  // ── Document handlers ──────────────────────────────────────────────────────
  const uploadFile = async (file) => {
    if (!file || !selectedStartup) return
    setUploading(true)
    try {
      await documentAPI.upload(file, { document_type: 'prototype', startup_id: selectedStartup.startup_id })
      toast.success(`${file.name} uploaded`)
      loadDocs()
    } catch (err) { toast.error(err.response?.data?.error || 'Upload failed') }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
  }

  const handleFileInput  = (e) => uploadFile(e.target.files?.[0])
  const handleDropUpload = (e) => { e.preventDefault(); setDropActive(false); uploadFile(e.dataTransfer.files?.[0]) }
  const handleDragEnterUpload = (e) => { e.preventDefault(); setDropActive(true) }
  const handleDragLeaveUpload = () => setDropActive(false)

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return
    try { await documentAPI.delete(docId); setDocs(prev => prev.filter(d => d.document_id !== docId)); toast.success('Deleted') }
    catch { toast.error('Failed to delete document') }
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
      const r = await mlAPI.chat(`${CODE_PROMPTS[action]}\n\n${codeInput}`, {})
      const reply = r?.data?.data?.reply
      if (reply) setCodeResult(reply)
      else setCodeError('No response from AI. Try again.')
    } catch { setCodeError('Could not reach the AI service.') }
    finally { setCodeActionLoading(null) }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const nodeByKey  = Object.fromEntries(diagramNodes.map(n => [n.key, n]))
  const tasksByCol = (col) => tasks.filter(t => t.column === col)
  const doneCount  = tasks.filter(t => t.column === 'done').length
  const donePct    = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0
  const overdueMilestones = milestones.filter(m => !m.completed && isOverdue(m.date)).length

  // ── No startup ─────────────────────────────────────────────────────────────
  if (!startupsLoading && myStartups.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="Innovation Incubator" title="Prototype Development Center" />
        <div className="card p-12 text-center max-w-md mx-auto mt-12">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BuildingOffice2Icon className="h-8 w-8 text-primary" />
          </div>
          <p className="font-heading text-lg font-semibold text-ink dark:text-white mb-1">No startup found</p>
          <p className="text-sm text-slate-500 mb-5">Create a startup profile first to use the Prototype Development Center.</p>
          <a href="/startups/create" className="btn-primary">Create Startup</a>
        </div>
      </div>
    )
  }

  const TABS = [
    { key: 'board',      label: 'Kanban Board',    Icon: Squares2X2Icon,      badge: tasks.length || null          },
    { key: 'milestones', label: 'Milestones',      Icon: FlagIcon,            badge: overdueMilestones || null, badgeTone: 'red' },
    { key: 'docs',       label: 'Documents',       Icon: DocumentTextIcon,    badge: docs.length || null           },
    { key: 'ai',         label: 'AI Tools',        Icon: SparklesIcon,        badge: null                          },
    { key: 'vcs',        label: 'Version Control', Icon: ArrowsRightLeftIcon, badge: commits.length || null        },
  ]

  return (
    <div>
      {/* ── Page header ────────────────────────────────────────────────── */}
      <PageHeader
        eyebrow="Innovation Incubator"
        title="Prototype Development Center"
        action={
          <div className="flex items-center gap-2 flex-wrap">
            {myStartups.length > 1 && (
              <select
                value={selectedStartup?.startup_id || ''}
                onChange={e => setSelectedStartup(myStartups.find(x => x.startup_id === e.target.value) || null)}
                className="input py-2 text-sm min-w-[180px]"
              >
                {myStartups.map(s => (
                  <option key={s.startup_id} value={s.startup_id}>{s.business_name || s.name}</option>
                ))}
              </select>
            )}
            {tab === 'board' && selectedStartup && (
              <button type="button" className="btn-primary gap-2"
                onClick={() => { setNewTaskCol('todo'); document.getElementById('add-task-input')?.focus() }}>
                <PlusIcon className="h-4 w-4" /> Add Task
              </button>
            )}
            {tab === 'docs' && selectedStartup && (
              <button type="button" className="btn-primary gap-2"
                onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <DocumentArrowUpIcon className="h-4 w-4" />
                {uploading ? 'Uploading…' : 'Upload File'}
              </button>
            )}
          </div>
        }
      />

      {/* ── Startup identity + stat bar ────────────────────────────────── */}
      {selectedStartup && (
        <div className="card mb-6 overflow-hidden">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-primary-700">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <LightBulbIcon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-heading font-semibold text-ink dark:text-white truncate">{selectedStartup.business_name}</p>
                <p className="text-xs text-slate-500">{selectedStartup.sector} · TRL {selectedStartup.trl_level || selectedStartup.trl || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-ink dark:text-white">{donePct}%</span> complete
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-primary-700">
            {[
              { label: 'Total Tasks',    value: tasks.length,                                      sub: `${doneCount} done`,         Icon: Squares2X2Icon,   tone: 'text-primary'       },
              { label: 'In Progress',    value: tasksByCol('progress').length + tasksByCol('review').length, sub: 'active tasks', Icon: ArrowPathIcon,    tone: 'text-amber-600'    },
              { label: 'Milestones',     value: milestones.length,                                 sub: overdueMilestones > 0 ? `${overdueMilestones} overdue` : 'on track', Icon: FlagIcon, tone: overdueMilestones > 0 ? 'text-red-600' : 'text-emerald-600' },
              { label: 'Documents',      value: docs.length,                                        sub: 'files uploaded',            Icon: DocumentTextIcon, tone: 'text-sky-600'      },
            ].map(({ label, value, sub, Icon, tone }) => (
              <div key={label} className="flex items-center gap-3 px-5 py-4">
                <div className={`h-9 w-9 rounded-xl bg-slate-50 dark:bg-primary-700 flex items-center justify-center shrink-0 ${tone}`}>
                  <Icon className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} />
                </div>
                <div>
                  <p className={`font-heading text-xl font-bold ${tone}`}>{value}</p>
                  <p className="text-xs text-slate-500 leading-tight">{label}</p>
                  <p className="text-[10px] text-slate-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-4 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Build progress</span>
              <span className="font-semibold text-ink dark:text-white">{doneCount} / {tasks.length} tasks done</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${donePct >= 80 ? 'bg-emerald-500' : donePct >= 40 ? 'bg-primary' : 'bg-amber-400'}`}
                style={{ width: `${donePct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tab bar — scrollable on mobile ─────────────────────────────── */}
      <div className="overflow-x-auto mb-6 -mx-1 px-1">
        <div className="flex gap-1 bg-slate-100 dark:bg-primary-800 p-1 rounded-xl w-max min-w-full sm:w-fit">
          {TABS.map(({ key, label, Icon, badge, badgeTone }) => {
            const active = tab === key
            return (
              <button key={key} type="button" onClick={() => setTab(key)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-primary-700 text-primary dark:text-white shadow-card'
                    : 'text-slate-500 hover:text-ink dark:hover:text-white hover:bg-white/60 dark:hover:bg-primary-700/50'
                }`}>
                {/* Colored icon when active */}
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-slate-400'}`} />
                {label}
                {/* Badge */}
                {badge != null && (
                  <span className={`ml-0.5 h-4.5 min-w-[1.125rem] inline-flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                    badgeTone === 'red'
                      ? 'bg-red-500 text-white'
                      : active
                        ? 'bg-primary/15 text-primary dark:bg-white/20 dark:text-white'
                        : 'bg-slate-200 dark:bg-primary-600 text-slate-600 dark:text-slate-300'
                  }`}
                    style={{ height: '1.125rem', minWidth: '1.125rem' }}>
                    {badge}
                  </span>
                )}
                {/* Active underline indicator */}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
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

          {tasksLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {COLUMNS.map(col => (
                <div key={col.key} className="rounded-2xl border border-slate-100 dark:border-primary-700 min-h-[200px] flex flex-col">
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-t-2xl ${col.header}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{col.label}</p>
                  </div>
                  <div className="p-3 space-y-2.5 flex-1">
                    {[1,2].map(i => <SkeletonBlock key={i} className="h-16 w-full rounded-xl" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {COLUMNS.map(col => {
                const colTasks   = tasksByCol(col.key)
                const isDropZone = dragOver === col.key
                return (
                  <div key={col.key}
                    className={`rounded-2xl border-2 min-h-[320px] flex flex-col transition-colors ${
                      isDropZone
                        ? 'border-primary/60 bg-primary/5 dark:bg-primary/10'
                        : `border-transparent ${col.color}`
                    }`}
                    onDragOver={e => onDragOver(e, col.key)}
                    onDragLeave={onDragLeave}
                    onDrop={e => onDrop(e, col.key)}>

                    {/* Column header */}
                    <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.header}`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{col.label}</p>
                      </div>
                      <span className="h-5 min-w-[1.25rem] flex items-center justify-center rounded-full bg-white dark:bg-primary-700 text-slate-600 dark:text-slate-300 text-[11px] font-bold px-1 shadow-sm">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Task cards */}
                    <div className="flex-1 p-3 space-y-2.5">
                      {colTasks.map(task => {
                        const pri = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium
                        return (
                          <div key={task.id}
                            draggable
                            onDragStart={e => onDragStart(e, task.id)}
                            onDragEnd={onDragEnd}
                            className={`bg-white dark:bg-primary-800 rounded-xl border border-slate-100 dark:border-primary-700 p-3 shadow-card cursor-grab active:cursor-grabbing hover:shadow-soft transition-all group ${dragging === task.id ? 'opacity-40 scale-95' : ''}`}>

                            {/* Priority stripe */}
                            <div className={`-mx-3 -mt-3 mb-3 h-1 rounded-t-xl ${
                              task.priority === 'High' ? 'bg-red-400' : task.priority === 'Low' ? 'bg-slate-300' : 'bg-amber-400'
                            }`} />

                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-ink dark:text-white leading-relaxed flex-1">{task.title}</p>
                              <button type="button" onClick={() => handleDeleteTask(task.id)}
                                className="shrink-0 h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                                <XMarkIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-2.5 gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${pri.style}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${pri.dot}`} />
                                {task.priority}
                              </span>
                              <select
                                value={task.column}
                                onChange={e => handleMoveTask(task.id, e.target.value)}
                                onClick={e => e.stopPropagation()}
                                className="text-[10px] text-slate-400 bg-transparent border-none outline-none cursor-pointer hover:text-primary transition-colors">
                                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                              </select>
                            </div>

                            {col.key === 'done' && (
                              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 dark:border-primary-700">
                                <CheckCircleSolid className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                <span className="text-[10px] text-emerald-600 font-medium">
                                  Completed {task.completed_at ? formatDate(task.completed_at) : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}

                      {/* Drop zone placeholder */}
                      <div className={`flex items-center justify-center h-14 rounded-xl border-2 border-dashed transition-colors ${
                        isDropZone
                          ? 'border-primary/50 bg-primary/5 text-primary'
                          : 'border-slate-200/80 dark:border-primary-600 text-slate-400'
                      }`}>
                        <p className="text-xs font-medium">
                          {isDropZone ? 'Drop here' : colTasks.length === 0 ? 'No tasks yet' : '+ Drop here'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Burndown chart */}
          {burndown.length > 0 ? (
            <div className="card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-heading font-semibold text-ink dark:text-white">Burndown Chart</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Ideal vs actual remaining tasks — last 14 days</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400"><span className="inline-block w-5 border-t-2 border-dashed border-slate-300" />Ideal</span>
                  <span className="flex items-center gap-1.5 text-primary"><span className="inline-block w-5 border-t-2 border-primary" />Actual</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={burndown} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="ideal"  stroke="#C7DAD8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ideal"  />
                  <Line type="monotone" dataKey="actual" stroke="#1D4241" strokeWidth={2.5} dot={{ r: 3, fill: '#1D4241' }} name="Actual" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            tasks.length > 0 ? null : (
              <div className="card p-8 text-center border-2 border-dashed border-slate-200 dark:border-primary-700">
                <Squares2X2Icon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-ink dark:text-white">No task history yet</p>
                <p className="text-xs text-slate-500 mt-1">Add tasks above to start tracking build progress.</p>
              </div>
            )
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: MILESTONES
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'milestones' && (
        <div>
          <div className="card p-5 mb-6">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-4 flex items-center gap-2">
              <FlagIcon className="h-5 w-5 text-slate-400" /> Add Milestone
            </h2>
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
            <div className="card p-6 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <SkeletonBlock className="h-5 w-5 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-48" />
                    <SkeletonBlock className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : milestones.length === 0 ? (
            <div className="card p-12 text-center">
              <FlagIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink dark:text-white">No milestones yet</p>
              <p className="text-xs text-slate-500 mt-1">Add a milestone above to track your key dates.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {[...milestones]
                .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
                .map((ms, i, arr) => {
                  const overdue  = !ms.completed && isOverdue(ms.date)
                  const days     = daysUntil(ms.date)
                  const daysLabel =
                    ms.completed        ? null :
                    overdue             ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue` :
                    days === 0          ? 'Due today' :
                    days != null        ? `${days} day${days !== 1 ? 's' : ''} away` : null
                  return (
                    <div key={ms.id}
                      className={`flex items-center gap-4 px-5 py-4 border-b border-slate-100 dark:border-primary-700 last:border-0 hover:bg-slate-50 dark:hover:bg-primary-700/20 transition-colors ${overdue ? 'bg-red-50/40 dark:bg-red-900/10' : ''}`}>

                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center self-stretch shrink-0 w-6">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                          ms.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : overdue
                              ? 'bg-red-50 border-red-400'
                              : 'bg-white dark:bg-primary-800 border-slate-300 dark:border-primary-500'
                        }`}>
                          {ms.completed
                            ? <CheckIcon className="h-3.5 w-3.5 text-white" />
                            : overdue
                              ? <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                              : <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-primary-400" />}
                        </div>
                        {i < arr.length - 1 && <div className="flex-1 w-px bg-slate-200 dark:bg-primary-600 mt-1" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${ms.completed ? 'line-through text-slate-400' : overdue ? 'text-red-700 dark:text-red-400' : 'text-ink dark:text-white'}`}>
                            {ms.title}
                          </p>
                          {daysLabel && (
                            <span className={`badge text-[10px] font-semibold ${overdue ? 'bg-red-100 text-red-700' : days === 0 ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                              {daysLabel}
                            </span>
                          )}
                        </div>
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
                          title="Delete">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB: DOCUMENTS
      ══════════════════════════════════════════════════════════════════ */}
      {tab === 'docs' && (
        <div>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileInput}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv" />

          {/* Drop zone */}
          <div
            onDrop={handleDropUpload}
            onDragOver={handleDragEnterUpload}
            onDragEnter={handleDragEnterUpload}
            onDragLeave={handleDragLeaveUpload}
            onClick={() => fileInputRef.current?.click()}
            className={`card mb-6 p-8 text-center cursor-pointer border-2 border-dashed transition-all ${
              dropActive
                ? 'border-primary bg-primary/5 scale-[1.01] shadow-soft'
                : 'border-slate-200 dark:border-primary-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-primary-700/30'
            }`}>
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors ${dropActive ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-primary-700 text-slate-400'}`}>
              <DocumentArrowUpIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-ink dark:text-white mb-1">
              {uploading ? 'Uploading…' : dropActive ? 'Release to upload' : 'Click to upload or drag & drop'}
            </p>
            <p className="text-xs text-slate-500">PDF, Word, PowerPoint, Excel, images, CSV — max 10 MB</p>
          </div>

          {docsLoading ? (
            <div className="card p-5 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="h-9 w-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-40" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                  <SkeletonBlock className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="card p-12 text-center">
              <DocumentTextIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-ink dark:text-white">No documents yet</p>
              <p className="text-xs text-slate-500 mt-1">Upload design files, specs, presentations, or any project file.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100 dark:border-primary-700 bg-slate-50 dark:bg-primary-700/50">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">File</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Size</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Uploaded</th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-primary-700">
                  {docs.map(doc => {
                    const { Icon: FileIcon, color } = fileTypeConfig(doc.file_type)
                    return (
                      <tr key={doc.document_id} className="hover:bg-slate-50 dark:hover:bg-primary-700/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                              <FileIcon className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} />
                            </div>
                            <div>
                              <p className="font-medium text-ink dark:text-white text-sm leading-tight">{doc.filename}</p>
                              <p className="text-[11px] text-slate-400 uppercase font-medium mt-0.5">{doc.file_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{formatBytes(doc.file_size)}</td>
                        <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{formatDate(doc.uploaded_at)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button type="button" onClick={() => handleDeleteDoc(doc.document_id)}
                            className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
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
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-ink dark:text-white">AI MVP Plan</h2>
                <p className="text-xs text-slate-400 mt-0.5">Concrete build plan tailored to your startup</p>
              </div>
              <span className="badge bg-accent/10 text-accent-600 border border-accent/20 shrink-0">AI</span>
            </div>
            <button onClick={generateMvp} disabled={mvpLoading || !selectedStartup}
              className="btn-accent gap-2 mb-4 disabled:opacity-50">
              <SparklesIcon className="h-4 w-4" />
              {mvpLoading ? 'Generating…' : 'Generate MVP Plan'}
            </button>
            {mvpLoading && (
              <div className="space-y-2 mt-2">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-5/6" />
                <SkeletonBlock className="h-3 w-4/6" />
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-3/6" />
              </div>
            )}
            {mvpError && <p className="text-sm text-red-600 flex items-center gap-1.5 mt-1"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{mvpError}</p>}
            {mvpPlan && !mvpLoading && (
              <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-sm text-ink dark:text-slate-100 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                {mvpPlan}
              </div>
            )}
          </div>

          {/* Tech Recommendations */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-ink dark:text-white">Technology Recommendations</h2>
                <p className="text-xs text-slate-400 mt-0.5">AI-suggested tech stack for your startup</p>
              </div>
              <button type="button" onClick={loadTechRecs} disabled={techLoading}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-primary-700 transition-colors shrink-0" title="Refresh">
                <ArrowPathIcon className={`h-4 w-4 text-slate-400 ${techLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            {techLoading && <TechRecsSkeleton />}
            {techError && <p className="text-sm text-red-600 flex items-center gap-1.5"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{techError}</p>}
            {!techLoading && !techError && techRecs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {techRecs.map((t, i) => {
                  const tones = [
                    'bg-sky-100 text-sky-700', 'bg-emerald-100 text-emerald-700',
                    'bg-primary/10 text-primary','bg-amber-100 text-amber-700',
                    'bg-violet-100 text-violet-700','bg-orange-100 text-orange-700',
                  ]
                  return (
                    <div key={t.name || i} className={`rounded-xl border p-3 flex flex-col items-center gap-2 text-center transition-shadow hover:shadow-soft ${t.recommended ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-primary-700'}`}>
                      <span className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold ${tones[i % tones.length]}`}>
                        {(t.name || '?').slice(0, 2)}
                      </span>
                      <p className="text-xs font-bold text-ink dark:text-white">{t.name}</p>
                      {t.reason && <p className="text-[10px] text-slate-500 leading-relaxed">{t.reason}</p>}
                      {t.recommended && (
                        <span className="inline-flex items-center gap-1 badge bg-emerald-100 text-emerald-700 !text-[10px] !px-2">
                          <CheckCircleSolid className="h-3 w-3" /> Top pick
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Architecture */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-ink dark:text-white">System Architecture</h2>
                <p className="text-xs text-slate-400 mt-0.5">Recommended architecture for your product</p>
              </div>
              <button type="button" onClick={loadArch} disabled={archLoading}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-primary-700 transition-colors shrink-0" title="Refresh">
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
            {archLoading && <ArchSkeleton />}
            {archError && <p className="text-sm text-red-600 flex items-center gap-1.5"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{archError}</p>}
            {!archLoading && !archError && archText && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{archText}</p>
            )}
          </div>

          {/* AI Code Assistant */}
          <div className="card p-6">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">AI Code Assistant</h2>
            <p className="text-xs text-slate-400 mb-4">Paste any code — explain, refactor, or optimize it</p>
            <textarea value={codeInput} onChange={e => setCodeInput(e.target.value)}
              placeholder="Paste your code here…"
              className="input font-mono text-xs mb-3 h-28 resize-none" />
            <div className="flex gap-2 mb-3 flex-wrap">
              {[
                { key: 'explain',  label: 'Explain',  Icon: CodeBracketIcon },
                { key: 'refactor', label: 'Refactor', Icon: ArrowPathIcon   },
                { key: 'optimize', label: 'Optimize', Icon: BoltIcon        },
              ].map(({ key, label, Icon }) => (
                <button key={key} type="button" onClick={() => runCodeAction(key)}
                  disabled={!!codeActionLoading || !codeInput.trim()}
                  className={`btn-outline gap-1.5 !py-1.5 !px-3 !text-xs disabled:opacity-50 ${codeActionLoading === key ? 'bg-primary/5 border-primary/30 text-primary' : ''}`}>
                  <Icon className={`h-3.5 w-3.5 ${codeActionLoading === key ? 'animate-spin' : ''}`} />
                  {codeActionLoading === key ? 'Working…' : label}
                </button>
              ))}
              {codeResult && (
                <button type="button"
                  onClick={() => { navigator.clipboard.writeText(codeResult); toast.success('Copied') }}
                  className="btn-outline gap-1.5 !py-1.5 !px-3 !text-xs ml-auto">
                  <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy result
                </button>
              )}
            </div>
            {codeError && <p className="text-xs text-red-600 mb-2 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4 shrink-0" />{codeError}</p>}
            {codeActionLoading && !codeResult && (
              <div className="space-y-2">
                <SkeletonBlock className="h-3 w-full" />
                <SkeletonBlock className="h-3 w-4/6" />
                <SkeletonBlock className="h-3 w-5/6" />
              </div>
            )}
            {codeResult && (
              /* Syntax-highlighted output: keywords colored, strings in amber, comments muted */
              <div className="rounded-xl bg-[#0F2422] border border-primary-700 p-4 font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto">
                {codeResult.split('\n').map((line, i) => {
                  // Light token colorization
                  const colored = line
                    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    // strings
                    .replace(/(["'`])(.*?)\1/g, '<span style="color:#EF9C82">$1$2$1</span>')
                    // line comments
                    .replace(/(\/\/.*$)/, '<span style="color:#4C8884;font-style:italic">$1</span>')
                    // keywords
                    .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|default|from|class|async|await|try|catch|def|self|print|True|False|None)\b/g,
                      '<span style="color:#75A3A0;font-weight:600">$1</span>')
                    // numbers
                    .replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#C7DAD8">$1</span>')
                  return (
                    <div key={i} className="flex gap-3">
                      <span className="text-primary-600 select-none w-6 shrink-0 text-right">{i + 1}</span>
                      <span className="text-slate-200 flex-1" dangerouslySetInnerHTML={{ __html: colored }} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Component Library */}
          <div className="card p-6 lg:col-span-2">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">UI Component Library</h2>
            <p className="text-xs text-slate-400 mb-4">Click any component to view and copy its Tailwind code</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {componentLibrary.map(c => (
                <button key={c.label} type="button" onClick={() => setSelectedComponent(c)}
                  className="rounded-xl border border-slate-100 dark:border-primary-700 bg-white dark:bg-primary-800 p-4 flex flex-col items-center gap-3 hover:border-primary/50 hover:shadow-soft transition-all group text-center">
                  <div className="h-10 w-full flex items-center justify-center">{c.preview}</div>
                  <div>
                    <p className="text-xs font-semibold text-ink dark:text-white group-hover:text-primary transition-colors">{c.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-center gap-0.5">
                      View code <ChevronRightIcon className="h-2.5 w-2.5" />
                    </p>
                  </div>
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
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-heading font-semibold text-ink dark:text-white flex items-center gap-2">
                <ArrowsRightLeftIcon className="h-5 w-5 text-slate-400" />
                Git Commit History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Last 10 commits from the backend repository</p>
            </div>
            {commits.length > 0 && (
              <span className="badge bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                {commits.length} commits
              </span>
            )}
          </div>

          {commits.length === 0 ? (
            <div className="text-center py-10">
              <ArrowsRightLeftIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-ink dark:text-white">No commit history available</p>
              <p className="text-xs text-slate-500 mt-1">Make sure the backend git repository is accessible.</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-primary-700">
              {commits.map((c, i) => (
                <div key={c.sha} className={`flex gap-4 py-4 hover:bg-slate-50 dark:hover:bg-primary-700/20 transition-colors -mx-2 px-2 rounded-xl ${i === 0 ? 'bg-primary/3' : ''}`}>
                  {/* Timeline */}
                  <div className="flex flex-col items-center shrink-0 w-5 pt-1">
                    <span className={`h-3.5 w-3.5 rounded-full border-2 shrink-0 ${
                      i === 0
                        ? 'bg-primary border-primary'
                        : 'bg-white dark:bg-primary-800 border-slate-300 dark:border-primary-500'
                    }`} />
                    {i < commits.length - 1 && <span className="w-px flex-1 bg-slate-200 dark:bg-primary-600 mt-1" />}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pb-1">
                    {/* Commit message — primary text */}
                    <p className={`text-sm font-semibold break-words leading-snug ${i === 0 ? 'text-ink dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                      {c.message}
                    </p>
                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <code className="inline-block font-mono text-[10px] font-bold bg-slate-100 dark:bg-primary-700 text-primary dark:text-slate-300 px-1.5 py-0.5 rounded">
                        {c.sha}
                      </code>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <ClockIcon className="h-3.5 w-3.5 shrink-0" />{c.date}
                      </span>
                      <span className="text-xs text-slate-400">by <span className="font-medium text-slate-600 dark:text-slate-300">{c.author}</span></span>
                    </div>
                  </div>

                  {/* Latest badge */}
                  {i === 0 && (
                    <div className="shrink-0">
                      <span className="badge bg-primary text-white text-[10px] font-bold">latest</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Component library modal ────────────────────────────────────── */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedComponent(null)}>
          <div className="card p-6 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-ink dark:text-white">{selectedComponent.label}</h3>
              <button type="button" onClick={() => setSelectedComponent(null)}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700 flex items-center justify-center transition-colors">
                <XMarkIcon className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="rounded-xl border border-slate-100 dark:border-primary-700 p-5 flex items-center justify-center mb-4 bg-slate-50 dark:bg-primary-700/30 min-h-[64px]">
              {selectedComponent.preview}
            </div>
            <div className="relative">
              <pre className="rounded-xl bg-[#0F2422] text-slate-200 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-x-auto">
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
