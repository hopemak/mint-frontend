import React, { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  DocumentIcon,
  DocumentTextIcon,
  FolderIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  ArrowUturnRightIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline'
import { mlAPI, documentAPI, workspaceAPI } from '../../services/api.js'
import toast from 'react-hot-toast'

// --- Sample data (this page's structure is real; the content below is
// realistic placeholder data — GitHub activity, sprint burndown, and file
// lists are not wired to a live GitHub API or real file storage yet) ---

const STAGES = [
  { label: 'Ideation', date: 'May 28, 2023', status: 'done' },
  { label: 'Validation', date: 'Jan 28, 2023', status: 'done' },
  { label: 'MVP Development', date: 'Nov 25, 2023', status: 'active' },
  { label: 'Beta Launch', date: 'Nov 15, 2023', status: 'upcoming' },
  { label: 'Market Entry', date: 'Jan 13, 2023', status: 'upcoming' },
]

const BOARD_COLUMNS = [
  {
    id: 'todo',
    title: 'To Do',
    cards: [
      { id: 1, title: 'AI Model Architecture Design', priority: 'High', color: 'primary' },
      { id: 2, title: 'Fix bug in user authentication', priority: 'Medium', color: 'emerald' },
      { id: 3, title: 'AI Model Data Pipeline', priority: 'Low', color: 'amber' },
    ],
  },
  {
    id: 'progress',
    title: 'In Progress',
    cards: [
      { id: 4, title: 'AI Model Training Infrastructure', priority: 'High', color: 'primary' },
      { id: 5, title: 'Data Validation Pipeline', priority: 'Medium', color: 'primary' },
      { id: 6, title: 'Fix bug in user permissions', priority: 'Medium', color: 'accent' },
    ],
  },
  {
    id: 'review',
    title: 'Code Review',
    cards: [
      { id: 7, title: 'Fix bug in user session handling', priority: 'High', color: 'accent' },
      { id: 8, title: 'QA Testing setup accelerator', priority: 'Medium', color: 'accent' },
    ],
  },
  {
    id: 'qa',
    title: 'QA Testing',
    cards: [
      { id: 9, title: 'QA Testing environment setup', priority: 'Medium', color: 'accent' },
      { id: 10, title: 'QA Testing regression pass', priority: 'Low', color: 'emerald' },
    ],
  },
  {
    id: 'done',
    title: 'Done',
    cards: [
      { id: 11, title: 'Model Accuracy Benchmarking', priority: 'Low', color: 'emerald' },
      { id: 12, title: 'Model Deployment Pipeline', priority: 'Low', color: 'emerald' },
    ],
  },
]

const GITHUB_ACTIVITY = [
  { icon: CodeBracketIcon, title: 'Recent activity', detail: 'Fixed bug in user authentication', time: 'just now' },
  { icon: ArrowUturnRightIcon, title: 'Commit', detail: 'Fixed bug in user authentication', time: '2h ago' },
  { icon: DocumentTextIcon, title: 'Pull request', detail: 'Fixed bug in user authentication', time: '4h ago' },
  { icon: DocumentTextIcon, title: 'Pull request', detail: 'Fixed bug in user authentication', time: '1d ago' },
]

// FILES was previously hardcoded sample data — now fetched for real from
// documentAPI below. A file-type icon is picked at render time.

function fileIconFor(type = '') {
  const t = type.toLowerCase()
  if (t.includes('pdf')) return { icon: FolderIcon, tone: 'text-accent-500' }
  if (t.includes('doc') || t.includes('word')) return { icon: DocumentTextIcon, tone: 'text-primary' }
  return { icon: DocumentIcon, tone: 'text-red-500' }
}

// The exact response shape of documentAPI.getAll()/upload() hasn't been
// confirmed against the real backend yet — this stays tolerant of a few
// likely shapes rather than assuming one, same approach used for the chat
// endpoint until its real contract was confirmed.
function extractDocuments(payload) {
  if (!payload) return []
  const candidate = payload.data?.documents ?? payload.documents ?? payload.data ?? payload
  return Array.isArray(candidate) ? candidate : []
}

function normalizeDoc(doc, i) {
  return {
    id: doc.id ?? doc._id ?? i,
    name: doc.name ?? doc.filename ?? doc.title ?? 'Untitled file',
    type: doc.type ?? doc.file_type ?? doc.mimetype ?? 'file',
    date: doc.date ?? doc.created_at ?? doc.uploaded_at ?? '',
  }
}

const MILESTONES = [
  { label: 'Upcoming Milestone', date: 'Jun 18, 2023', note: 'Connect Progress', tone: 'primary', done: false },
  { label: 'Upcoming Milestone', date: 'Jun 3, 2023', note: null, tone: 'slate', done: false },
  { label: 'Completed Milestone', date: 'Dec 5, 2023', note: null, tone: 'emerald', done: true },
]

// A fixed project id until real project-level routing exists — every
// comment on this page is scoped to this one demo project for now.
const PROJECT_ID = 'quantum-ai-accelerator'

const SPRINT_TASKS = [
  { col: 'Task Point 1', tasks: ['Fixed bug in user progress', 'Fixed bug in progress'] },
  { col: 'Task Point 2', tasks: ['Quantum AI in progress progress', 'Fixed bug in progress'] },
]

const BURNDOWN_DATA = [
  { day: 0, ideal: 40, actual: 40 },
  { day: 10, ideal: 32, actual: 34 },
  { day: 20, ideal: 24, actual: 26 },
  { day: 30, ideal: 16, actual: 20 },
  { day: 40, ideal: 8, actual: 12 },
  { day: 50, ideal: 0, actual: 6 },
]

const PRIORITY_TONE = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent-50 text-accent-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
}

const TEAM = [
  { name: 'Sarah J.', status: 'online' },
  { name: 'Sarah S.', status: 'online' },
  { name: 'Sana B.', status: 'online' },
  { name: 'Denry K.', status: 'online' },
  { name: 'Matshiay...', status: 'offline' },
  { name: 'Katielsi H.', status: 'online' },
]

function FilesPanel() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await documentAPI.getAll()
      const docs = extractDocuments(response?.data).map(normalizeDoc)
      setFiles(docs)
    } catch (err) {
      setError('Could not load documents.')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await documentAPI.upload(file)
      toast.success(`"${file.name}" uploaded`)
      await fetchFiles()
    } catch (err) {
      toast.error('Upload failed — the document service may be unavailable.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-semibold text-ink dark:text-white">Files &amp; Documents</h2>
        <button type="button" onClick={fetchFiles} aria-label="Refresh files" className="text-slate-400 hover:text-slate-600">
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-3 mb-4 min-h-[60px]">
        {loading ? (
          <p className="text-xs text-slate-400 text-center py-4">Loading documents…</p>
        ) : error ? (
          <p className="text-xs text-red-500 text-center py-4">{error}</p>
        ) : files.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No documents uploaded yet.</p>
        ) : (
          files.map((f) => {
            const { icon: Icon, tone } = fileIconFor(f.type)
            return (
              <div key={f.id} className="flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 ${tone}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink dark:text-white truncate">{f.name}</p>
                  <p className="text-[11px] text-slate-400">{f.type} type</p>
                </div>
                {f.date && <span className="text-[11px] text-slate-400 shrink-0">{f.date}</span>}
              </div>
            )
          })
        )}
      </div>

      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="btn-primary w-full text-sm justify-center disabled:opacity-60"
      >
        <ArrowUpTrayIcon className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload New File'}
      </button>
    </div>
  )
}

function timeAgo(iso) {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function CommentsPanel() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState(null)
  const isLoggedIn = !!localStorage.getItem('token')

  const fetchComments = async () => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const response = await workspaceAPI.getComments(PROJECT_ID)
      const list = response?.data?.data
      setComments(Array.isArray(list) ? list : [])
    } catch {
      setError('Could not load comments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || posting || !isLoggedIn) return
    setPosting(true)
    try {
      const authorName = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}').full_name || 'You'
        } catch {
          return 'You'
        }
      })()
      await workspaceAPI.addComment(PROJECT_ID, text, authorName)
      setDraft('')
      await fetchComments()
    } catch {
      toast.error('Could not post comment — please try again.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="card p-5">
      <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Comments &amp; Activity</h2>

      {!isLoggedIn ? (
        <p className="text-xs text-slate-400 text-center py-4">Log in to view and post comments on this project.</p>
      ) : (
        <>
          <div className="space-y-3 mb-3 min-h-[40px]">
            {loading ? (
              <p className="text-xs text-slate-400 text-center py-4">Loading comments…</p>
            ) : error ? (
              <p className="text-xs text-red-500 text-center py-4">{error}</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No comments yet — be the first to post one.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary text-[11px] font-semibold flex items-center justify-center shrink-0">
                    {(c.author_name || '?')[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-ink dark:text-white">{c.author_name}</span> — {c.text}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(c.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 dark:border-primary-700 pt-3">
            <ChatBubbleLeftIcon className="h-4 w-4 text-slate-300 shrink-0" />
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={posting}
              placeholder="Add a comment..."
              className="input py-1.5 text-xs flex-1 disabled:opacity-60"
            />
            <button type="submit" disabled={posting || !draft.trim()} aria-label="Post comment" className="text-primary disabled:opacity-40">
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  )
}

function extractChatReply(payload) {
  if (!payload) return null
  if (typeof payload.data === 'string') return payload.data
  return payload.data?.reply ?? payload.data?.message ?? payload.data?.response ?? payload.reply ?? null
}

function AIAssistantWidget() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Quantum AI accelerator?' },
    { role: 'user', text: 'Let me check recent activity and authentication status.' },
    { role: 'ai', text: 'Here is your progress update.' },
  ])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const send = async () => {
    const text = draft.trim()
    if (!text || sending) return
    setMessages((prev) => [...prev, { role: 'user', text }])
    setDraft('')
    setSending(true)
    try {
      const response = await mlAPI.chat(
        { message: text, context: { title: 'MInT Workspace board assistant' } },
        { timeout: 15000 }
      )
      const reply = extractChatReply(response?.data)
      setMessages((prev) => [...prev, { role: 'ai', text: reply || "I couldn't generate a response for that." }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'AI assistant is unavailable right now.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-700 to-primary-800 text-white p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading font-semibold flex items-center gap-1.5 text-sm">
          <SparklesIcon className="h-4 w-4 text-accent-300" /> AI Assistant
        </h3>
        <button type="button" aria-label="More options" className="text-white/60 hover:text-white">
          <EllipsisHorizontalIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 space-y-2 mb-3 overflow-y-auto max-h-40">
        {messages.map((m, i) => (
          <div key={i} className={`text-xs rounded-xl px-3 py-2 max-w-[85%] ${m.role === 'user' ? 'ml-auto bg-white/15' : 'bg-white/10'}`}>
            {m.text}
          </div>
        ))}
        {sending && <div className="text-xs rounded-xl px-3 py-2 bg-white/10 italic text-white/60 max-w-[85%]">Thinking…</div>}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={sending}
          placeholder="Type a message..."
          className="flex-1 bg-white/10 placeholder-white/50 text-white text-xs rounded-lg px-3 py-2 outline-none focus:bg-white/15 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !draft.trim()}
          aria-label="Send"
          className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 rounded-lg p-2"
        >
          <PaperAirplaneIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function Workspace() {
  return (
    <div className="-m-6 min-h-screen bg-slate-50 dark:bg-primary-900 flex">
      {/* Sidebar nav */}
      <aside className="w-56 shrink-0 bg-white dark:bg-primary-800 border-r border-slate-100 dark:border-primary-700 hidden lg:flex flex-col py-5 px-3">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold">M</div>
          <span className="font-heading font-bold text-ink dark:text-white text-sm">MInT Workspace</span>
        </div>
        <nav className="space-y-0.5 text-sm">
          {['Dashboard', 'Projects', 'Teams', 'Milestones', 'Discussions', 'Reports'].map((item) => (
            <button
              key={item}
              type="button"
              className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                item === 'Projects' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-primary-700'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="mt-6 px-3">
          <p className="text-xs font-semibold text-slate-400 mb-2">Teams</p>
          <div className="space-y-2">
            {TEAM.map((t) => (
              <div key={t.name} className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center">
                  {t.name[0]}
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-300 flex-1 truncate">{t.name}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${t.status === 'online' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-6 py-3 bg-white dark:bg-primary-800 border-b border-slate-100 dark:border-primary-700">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input placeholder="Search..." className="input pl-9 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button type="button" aria-label="Notifications" className="relative text-slate-400 hover:text-slate-600">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent-500" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">H</div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Project header + stage stepper */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-ink dark:text-white">Quantum AI Accelerator</h1>
              <button type="button" aria-label="Edit project name" className="text-slate-400 hover:text-slate-600">
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="btn-outline text-sm">
                <ArrowPathIcon className="h-4 w-4" /> Refresh
              </button>
              <button type="button" className="btn-primary text-sm">
                Status <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center overflow-x-auto pb-1">
            {STAGES.map((s, i) => (
              <div key={s.label} className="flex items-center shrink-0">
                <div
                  className={`px-4 py-2 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 ${
                    s.status === 'done'
                      ? 'bg-primary text-white'
                      : s.status === 'active'
                        ? 'bg-accent-500 text-white'
                        : 'bg-slate-100 dark:bg-primary-700 text-slate-500'
                  } ${i === 0 ? 'rounded-l-full' : ''} ${i === STAGES.length - 1 ? 'rounded-r-full' : ''}`}
                  style={{ marginLeft: i === 0 ? 0 : -8, paddingLeft: i === 0 ? 16 : 24 }}
                >
                  {s.status === 'done' && <CheckCircleIcon className="h-3.5 w-3.5" />}
                  <span>
                    {s.label}
                    <span className="block text-[10px] opacity-75 font-normal">{s.date}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Kanban board */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-ink dark:text-white">Project Board</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <button type="button" className="btn-outline text-xs py-1.5 px-3">Directory</button>
                <button type="button" className="btn-outline text-xs py-1.5 px-3">Priority</button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto">
              {BOARD_COLUMNS.map((col) => (
                <div key={col.id} className="min-w-[200px]">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{col.title}</p>
                    <EllipsisHorizontalIcon className="h-4 w-4 text-slate-300" />
                  </div>
                  <div className="space-y-2.5">
                    {col.cards.map((card) => (
                      <div key={card.id} className="rounded-xl border border-slate-100 dark:border-primary-600 p-3 bg-white dark:bg-primary-800">
                        <div className={`h-1 w-8 rounded-full mb-2 ${card.color === 'primary' ? 'bg-primary' : card.color === 'accent' ? 'bg-accent-500' : card.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <p className="text-xs font-medium text-ink dark:text-white mb-2 leading-snug">{card.title}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_TONE[card.color]}`}>{card.priority} Priority</span>
                          <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-primary-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left/main column: Sprint board */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-ink dark:text-white">Sprint Board</h2>
                  <span className="text-xs text-slate-400">Current Sprint</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div className="rounded-xl border border-slate-100 dark:border-primary-600 p-4">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Current Sprint</p>
                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex justify-between"><span>Story points</span><span className="font-semibold text-ink dark:text-white">40</span></div>
                      <div className="flex justify-between"><span>In progress</span><span className="font-semibold text-ink dark:text-white">1</span></div>
                      <div className="flex justify-between"><span>Individuals</span><span className="font-semibold text-ink dark:text-white">5</span></div>
                      <div className="flex justify-between border-t border-slate-100 dark:border-primary-600 pt-1.5 mt-1.5"><span>Total</span><span className="font-semibold text-ink dark:text-white">10</span></div>
                    </div>
                  </div>
                  {SPRINT_TASKS.map((t) => (
                    <div key={t.col} className="rounded-xl border border-slate-100 dark:border-primary-600 p-4">
                      <p className="text-xs font-semibold text-slate-500 mb-2">{t.col}</p>
                      <div className="space-y-2">
                        {t.tasks.map((task) => (
                          <div key={task} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <div className="h-5 w-5 rounded-full bg-primary/10 shrink-0" />
                            <span className="truncate">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Sprint Burndown</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={BURNDOWN_DATA}>
                      <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="ideal" stroke="#EF9C82" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="actual" stroke="#1D4241" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* GitHub integration */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-semibold text-ink dark:text-white flex items-center gap-2">
                    <CodeBracketIcon className="h-4 w-4" /> GitHub Integration
                  </h2>
                </div>
                <p className="text-xs font-semibold text-slate-500 mb-3">Recent repository activity</p>
                <div className="space-y-3">
                  {GITHUB_ACTIVITY.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <a.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink dark:text-white">{a.title} <span className="text-slate-400 font-normal">· {a.time}</span></p>
                        <p className="text-xs text-slate-500 truncate">{a.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              <div className="h-64">
                <AIAssistantWidget />
              </div>

              {/* Real, fetched-and-uploadable Files & Documents panel (single panel — the
                  reference image showed this section twice, consolidated here) */}
              <FilesPanel />

              <div className="card p-5">
                <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Milestones Timeline</h2>
                <div className="space-y-4">
                  {MILESTONES.map((m, i) => (
                    <div key={i} className="flex gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full mt-1.5 shrink-0 ${m.done ? 'bg-emerald-500' : m.tone === 'primary' ? 'bg-primary' : 'bg-slate-300'}`} />
                      <div>
                        <p className="text-xs font-medium text-ink dark:text-white">{m.label}</p>
                        <p className="text-[11px] text-slate-400">{m.date}</p>
                        {m.note && <span className="inline-block mt-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{m.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <CommentsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
