import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  ChevronRightIcon,
  RocketLaunchIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  CpuChipIcon,
  FlagIcon,
  ArrowRightIcon,
  PlusIcon,
  CheckCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuth } from '../../context/AuthContext.jsx'
import {
  eventAPI,
  dashboardAPI,
  startupAPI,
  taskAPI,
  milestoneAPI,
  evaluationAPI,
} from '../../services/api.js'
import {
  kpis as fbKpis,
  startupProgress as fbProgress,
  fundingDonut as fbDonut,
} from '../../data/sampleData.js'

// ─── Design tokens (matching the reference image exactly) ──────────────────────

// Chart palette
const C = {
  primary:  '#1D4241',
  teal:     '#4C8884',
  accent:   '#EF9C82',
  muted:    '#C7DAD8',
  blue:     '#3B82F6',
  purple:   '#8B5CF6',
  emerald:  '#10B981',
  amber:    '#F59E0B',
}

const TRL_LABELS = [
  'Basic Research','Technology Concept','Experimental Proof',
  'Lab Validation','Relevant Environment','Relevant Demo',
  'System Prototype','System Complete','Proven System',
]

// ─── Utilities ─────────────────────────────────────────────────────────────────

function fmt$(n) {
  if (!n && n !== 0) return '$0'
  if (n >= 1e9)  return `$${(n/1e9).toFixed(1)}B`
  if (n >= 1e6)  return `$${(n/1e6).toFixed(1)}M`
  if (n >= 1e3)  return `$${(n/1e3).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function fmtEvent(e) {
  try {
    const d    = new Date(Number(e.year), Number(e.month)-1, Number(e.day))
    const today = new Date()
    const diff  = Math.round((d - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000)
    if (diff === 0) return { label: 'Today',      hot: true  }
    if (diff === 1) return { label: 'Tomorrow',   hot: false }
    if (diff > 0 && diff <= 7) return { label: `In ${diff}d`, hot: false }
    return { label: d.toLocaleDateString('en-US',{ month:'short', day:'numeric' }), hot: false }
  } catch { return { label: '', hot: false } }
}

function Skeleton({ w = 'w-full', h = 'h-4' }) {
  return <div className={`rounded ${w} ${h} bg-slate-100 dark:bg-slate-700 animate-pulse`} />
}

// ─── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, delta, deltaLabel, iconBg, iconColor, loading, to }) {
  const body = (
    <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow h-full">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {delta != null && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            delta >= 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-600'
          }`}>
            {delta >= 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      {/* Value */}
      {loading
        ? <Skeleton h="h-8" w="w-28" />
        : <p className="font-heading text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>}
      {/* Label + sub */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {deltaLabel && !loading && (
          <p className="text-xs text-slate-400 mt-0.5">{deltaLabel}</p>
        )}
      </div>
    </div>
  )
  return to ? <Link to={to} className="block h-full">{body}</Link> : body
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h2 className="font-heading text-base font-semibold text-slate-800 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── Action button (3 main CTAs matching the reference) ────────────────────────

function ActionBtn({ label, to, color }) {
  const colors = {
    blue:    'bg-blue-600 hover:bg-blue-700 text-white',
    purple:  'bg-purple-600 hover:bg-purple-700 text-white',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  }
  return (
    <Link to={to} className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${colors[color]}`}>
      {label}
    </Link>
  )
}

// ─── Custom chart tooltip ──────────────────────────────────────────────────────

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? fmt$(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()

  const [statsLoading,   setStatsLoading]   = useState(true)
  const [stats,          setStats]          = useState(null)
  const [trends,         setTrends]         = useState(null)
  const [analytics,      setAnalytics]      = useState(null)
  const [events,         setEvents]         = useState(null)
  const [myStartup,      setMyStartup]      = useState(null)
  const [myTasks,        setMyTasks]        = useState([])
  const [myMilestones,   setMyMilestones]   = useState([])
  const [lastEval,       setLastEval]       = useState(null)
  const [startupLoading, setStartupLoading] = useState(true)

  // Fetch platform stats
  useEffect(() => {
    let live = true
    ;(async () => {
      setStatsLoading(true)
      const [s, t, a] = await Promise.all([
        dashboardAPI.getStats().catch(() => null),
        dashboardAPI.getTrends().catch(() => null),
        dashboardAPI.getAnalytics().catch(() => null),
      ])
      if (!live) return
      if (s?.data?.data) setStats(s.data.data)
      if (t?.data?.data) setTrends(t.data.data)
      if (a?.data?.data) setAnalytics(a.data.data)
      setStatsLoading(false)
    })()
    return () => { live = false }
  }, [])

  // Fetch events
  useEffect(() => {
    eventAPI.getAll().then(r => {
      const now = new Date()
      const list = (r.data?.data || [])
        .map(e => ({ ...e, _d: new Date(Number(e.year), Number(e.month)-1, Number(e.day)) }))
        .filter(e => !isNaN(e._d) && e._d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        .sort((a,b) => a._d - b._d)
        .slice(0, 4)
      setEvents(list)
    }).catch(() => setEvents([]))
  }, [])

  // Fetch startup context
  useEffect(() => {
    let live = true
    ;(async () => {
      setStartupLoading(true)
      try {
        const r = await startupAPI.getMyStartups()
        const list = r.data?.data || []
        if (!live || !list.length) { setStartupLoading(false); return }
        const s = list[0]
        setMyStartup(s)
        const [tr, mr, er] = await Promise.all([
          taskAPI.getAll(s.startup_id).catch(() => null),
          milestoneAPI.list(s.startup_id).catch(() => null),
          evaluationAPI.getMy().catch(() => null),
        ])
        if (!live) return
        setMyTasks(tr?.data?.data || [])
        setMyMilestones(mr?.data?.milestones || [])
        setLastEval((er?.data?.data || [])[0] || null)
      } catch { /**/ }
      finally { if (live) setStartupLoading(false) }
    })()
    return () => { live = false }
  }, [])

  // ── Derived ────────────────────────────────────────────────────────────────────
  const name      = user?.full_name || user?.name || 'Founder'
  const firstName = name.split(' ')[0]
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const doneTasks = myTasks.filter(t => t.column === 'done').length
  const donePct   = myTasks.length ? Math.round(doneTasks / myTasks.length * 100) : 0
  const nextMs    = [...myMilestones].filter(m => !m.completed).sort((a,b) => (a.date||'').localeCompare(b.date||''))[0]
  const trl       = parseInt(myStartup?.trl_level || myStartup?.trl || 0, 10) || 0
  const hasStartup = !startupLoading && !!myStartup

  // KPI values
  const kpiStartups = stats?.total_startups ?? fbKpis.totalStartups
  const kpiMentors  = stats?.mentors_active ?? fbKpis.activeMentors
  const kpiFunding  = stats?.total_funding  ?? 0
  const kpiSuccess  = stats?.success_rate   ?? fbKpis.successRate

  // Chart data
  const barData = trends
    ? trends.labels.map((m,i) => ({ month: m, Submitted: trends.applications[i], Approved: trends.approvals[i] }))
    : fbProgress.map(p => ({ month: p.month, Submitted: Math.round(p.progress * 0.6), Approved: Math.round(p.progress * 0.4) }))

  const areaData = trends
    ? trends.labels.map((m,i) => ({ month: m, Funding: trends.applications[i] * 15000 }))
    : fbProgress.map(p => ({ month: p.month, Funding: p.progress * 8000 }))

  const donutData = analytics?.sector_distribution
    ? Object.entries(analytics.sector_distribution).map(([n,v],i) => ({
        name: n, value: v,
        color: [C.primary, C.teal, C.accent, C.blue, C.purple, C.emerald][i % 6],
      }))
    : fbDonut.map((d,i) => ({ ...d, color: [C.primary, C.teal, C.accent, C.muted][i%4] }))

  const donutTotal = donutData.reduce((s,d) => s+d.value, 0)
  const totalRaisedStr = fmt$(kpiFunding || (donutTotal * 13800))

  // ── Card wrapper shorthand ──────────────────────────────────────────────────
  const Card = ({ children, className = '', noPad = false }) => (
    <div className={`bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl ${noPad ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  )

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-8">

      {/* ════════════════════════════════════════════════════════════════
          TOP BAR  —  search · bell · avatar  (mirrors reference image)
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            readOnly
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="h-9 w-9 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 transition relative">
            <BellIcon className="h-4.5 w-4.5" style={{height:'1.125rem',width:'1.125rem'}} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full" />
          </button>
          {/* Avatar */}
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          WELCOME ROW
      ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            Welcome, {name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            Current status is powered by
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              {statsLoading ? 'Loading…' : 'Active'}
            </span>
            {myStartup && (
              <span className="text-slate-400">
                · {myStartup.business_name} · {myStartup.sector} · TRL {trl}/9
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasStartup && !startupLoading && (
            <Link to="/startups/create" className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition">
              <PlusIcon className="h-4 w-4" /> Create Startup
            </Link>
          )}
          <Link to="/evaluate" className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition">
            <SparklesIcon className="h-4 w-4 text-primary" /> Run AI Evaluation
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 1:  Welcome card + Startup progress  |  Upcoming Events
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-5">

        {/* Left: startup progress panel */}
        <Card>
          {hasStartup ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Current Startup</p>
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white mt-0.5">{myStartup.business_name}</h2>
                </div>
                <Link to="/prototype" className="inline-flex items-center gap-1 text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition">
                  Open Workspace <ChevronRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* 3-column mini stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {/* Build progress */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Build Progress</p>
                  <p className="font-heading text-2xl font-bold text-slate-900 dark:text-white">{donePct}<span className="text-sm font-normal text-slate-400">%</span></p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${donePct>=80?'bg-emerald-500':donePct>=40?'bg-primary':'bg-amber-400'}`}
                      style={{ width:`${donePct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">{doneTasks}/{myTasks.length} tasks done</p>
                </div>

                {/* TRL */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">TRL Level</p>
                  <p className="font-heading text-2xl font-bold text-sky-600">{trl}<span className="text-sm font-normal text-slate-400">/9</span></p>
                  <div className="flex gap-0.5 mt-2">
                    {Array.from({length:9},(_,i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-sm ${i<trl?'bg-sky-500':'bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 truncate">{trl>0?TRL_LABELS[trl-1]:'Not set'}</p>
                </div>

                {/* Next milestone */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Next Milestone</p>
                  {nextMs ? (
                    <>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2">{nextMs.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                        <CalendarDaysIcon className="h-3 w-3 shrink-0" />
                        {nextMs.date ? new Date(nextMs.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                      </p>
                    </>
                  ) : (
                    <Link to="/prototype" className="text-xs text-primary hover:underline">Add milestone →</Link>
                  )}
                </div>
              </div>

              {/* Last evaluation bar */}
              {lastEval && (
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
                  <CheckCircleSolid className="h-5 w-5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      AI Score: <span className="text-primary">{lastEval.overall_score}/100</span>
                      <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        lastEval.overall_score>=85?'bg-emerald-100 text-emerald-700':
                        lastEval.overall_score>=70?'bg-primary/10 text-primary':'bg-amber-100 text-amber-700'
                      }`}>{lastEval.rating}</span>
                    </p>
                    <p className="text-xs text-slate-500 truncate">{lastEval.title}</p>
                  </div>
                  <Link to="/evaluate" className="text-xs font-semibold text-primary border border-primary/30 px-2.5 py-1 rounded-lg hover:bg-primary/5 transition flex items-center gap-1 shrink-0">
                    Re-evaluate <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </>
          ) : !startupLoading ? (
            /* Onboarding */
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <LightBulbIcon className="h-7 w-7 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-1">Create your first startup</h2>
              <p className="text-sm text-slate-500 mb-5 max-w-xs">Register your startup to unlock AI evaluation, prototype tools, funding, mentors, and more.</p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Link to="/startups/create" className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition">
                  <PlusIcon className="h-4 w-4" /> Create Startup
                </Link>
                <Link to="/idea-submission" className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm px-4 py-2 rounded-xl hover:bg-slate-50 transition">
                  Submit Idea First
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Skeleton h="h-5" w="w-48" />
              <Skeleton h="h-24" />
            </div>
          )}
        </Card>

        {/* Right: Upcoming Events */}
        <Card>
          <SectionHeader
            title="Upcoming Events"
            subtitle="Stay on top of workshops and meetings"
            action={
              <Link to="/recommendations" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                See all <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            }
          />

          {events === null ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 items-center">
                  <Skeleton h="h-16" w="w-16" />
                  <div className="flex-1 space-y-2">
                    <Skeleton h="h-3.5" w="w-32" />
                    <Skeleton h="h-3" w="w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CalendarDaysIcon className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500">No upcoming events</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {events.map((ev, i) => {
                const { label, hot } = fmtEvent(ev)
                const bgs = [
                  'bg-primary-800 text-white',
                  'bg-primary-400 text-white',
                  'bg-[#EF9C82] text-primary-900',
                  'bg-sky-600 text-white',
                ]
                const Icons = [RocketLaunchIcon, CalendarDaysIcon, SparklesIcon, UserGroupIcon]
                const Ic = Icons[i % Icons.length]
                return (
                  <div key={ev.event_id} className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                    <div className={`h-20 flex items-center justify-center ${bgs[i % bgs.length]}`}>
                      <Ic className="h-8 w-8 opacity-80" />
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2">{ev.title}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[10px] text-slate-400">{ev.type || 'Workshop'} · Meetings</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${hot ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">{ev.time}</span>
                        {ev.registered && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircleSolid className="h-3 w-3" /> Reg'd
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 2:  KPI cards
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={BuildingOffice2Icon} label="My Startups"
          value={kpiStartups} deltaLabel="registered in MInT"
          iconBg="bg-primary/10" iconColor="text-primary"
          loading={statsLoading} to="/startups"
        />
        <KpiCard
          icon={UserGroupIcon} label="Active Mentors"
          value={kpiMentors} deltaLabel="available to match"
          iconBg="bg-sky-100" iconColor="text-sky-600"
          loading={statsLoading} to="/recommendations"
        />
        <KpiCard
          icon={BanknotesIcon} label="Funding Approved"
          value={fmt$(kpiFunding)} deltaLabel="across my requests"
          iconBg="bg-emerald-100" iconColor="text-emerald-600"
          loading={statsLoading} to="/funding"
        />
        <KpiCard
          icon={ArrowTrendingUpIcon} label="Success Rate"
          value={`${kpiSuccess}%`} deltaLabel="approved vs submitted"
          iconBg="bg-accent/15" iconColor="text-accent-600"
          loading={statsLoading} to="/analytics"
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 3:  Startup Progress Chart  |  AI Panel  |  Funding Donut
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_260px_260px] gap-5">

        {/* Bar chart — startup progress / applications */}
        <Card>
          <SectionHeader
            title="Startup Progress"
            subtitle="Monthly applications submitted and approved"
            action={
              <select className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none">
                <option>All Metrics</option>
                <option>Submitted</option>
                <option>Approved</option>
              </select>
            }
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top:4, right:4, left:-20, bottom:0 }} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="Submitted" fill={C.blue}   radius={[6,6,0,0]} maxBarSize={28} />
              <Bar dataKey="Approved"  fill={C.purple} radius={[6,6,0,0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>

          {/* 3 action buttons — exactly as in the reference */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <ActionBtn label="Submit Idea"       to="/idea-submission" color="blue"    />
            <ActionBtn label="Find Mentor"       to="/recommendations" color="purple"  />
            <ActionBtn label="Apply for Funding" to="/funding"         color="emerald" />
          </div>
        </Card>

        {/* AI Recommendations panel — dark card matching reference */}
        <div className="bg-gradient-to-b from-[#1D4241] to-[#0F2422] rounded-2xl p-5 flex flex-col text-white">
          {/* Top icon + title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <SparklesIcon className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">AI Recommendations Panel</p>
              <p className="text-[10px] text-white/50 font-mono">#7C3AED</p>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-2 flex-1">
            {[
              { label: 'AI Recommendations',          to: '/recommendations', Icon: SparklesIcon     },
              { label: 'Reports & Notifications',     to: '/analytics',       Icon: ArrowTrendingUpIcon },
              { label: 'Apply for Funding',           to: '/funding',         Icon: BanknotesIcon    },
              { label: 'View Mentor Matches',         to: '/mentors',         Icon: UserGroupIcon    },
              { label: 'Prototype Dev Center',        to: '/prototype',       Icon: CpuChipIcon      },
            ].map(({ label, to, Icon }) => (
              <Link key={label} to={to}
                className="flex items-center justify-between rounded-xl bg-white/8 hover:bg-white/15 px-3 py-2.5 text-xs font-medium transition-colors group"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-white/60 group-hover:text-accent transition-colors" />
                  {label}
                </span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-white/40 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>

          {/* Success rate footer */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-[11px] text-white/50">Success Rate</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width:`${kpiSuccess}%` }} />
              </div>
              <span className="text-xs font-bold text-accent">{kpiSuccess}%</span>
            </div>
          </div>
        </div>

        {/* Funding Status Donut */}
        <Card>
          <SectionHeader title="Funding Status" subtitle="Distribution by category" />
          <div className="relative mb-3">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {donutData.map((d,i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="font-heading text-xl font-bold text-slate-900 dark:text-white leading-none">{totalRaisedStr}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Funds Raised</p>
            </div>
          </div>
          <div className="space-y-2">
            {donutData.slice(0,4).map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="truncate max-w-[100px]">{d.name}</span>
                </span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {donutTotal ? Math.round(d.value/donutTotal*100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          ROW 4:  KPI Trend Area Chart  |  Activity Feed / Next Steps
      ════════════════════════════════════════════════════════════════ */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-5">

        {/* KPI area chart */}
        <Card>
          <SectionHeader
            title="Key Performance Metrics"
            subtitle="Funding activity trend over time"
            action={
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
                Key Indicators
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.blue} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area
                type="monotone"
                dataKey="Funding"
                stroke={C.blue}
                fill="url(#areaGrad)"
                strokeWidth={2.5}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity Feed / Next Steps */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-slate-800 dark:text-white">Activity Feed</h2>
              <p className="text-xs text-slate-400">Your recent platform activity</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </div>

          {/* 3 action buttons */}
          <div className="space-y-2 mb-5">
            <ActionBtn label="Submit Idea"       to="/idea-submission" color="blue"    />
            <ActionBtn label="Find Mentor"       to="/recommendations" color="purple"  />
            <ActionBtn label="Apply for Funding" to="/funding"         color="emerald" />
          </div>

          {/* Activity items — next steps as activity entries */}
          <div className="space-y-3 flex-1">
            {[
              { label: 'Platform Event',         detail: hasStartup ? `${myStartup?.business_name} is registered and active.` : 'Create a startup to get started on the MInT platform.',    dot: 'bg-primary',  time: 'Now'   },
              { label: 'Platform Notifications', detail: `${kpiMentors} mentors available — get matched to an expert in your sector.`,                                                        dot: 'bg-blue-400', time: '1h ago' },
              { label: 'Funding Opportunities',  detail: 'New grants and funding rounds are open. Review your matches in the funding section.',                                               dot: 'bg-purple-400',time:'2h ago' },
            ].map(({ label, detail, dot, time }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="shrink-0 mt-1">
                  <span className={`h-2.5 w-2.5 rounded-full inline-block ${dot}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{detail}</p>
                </div>
              </div>
            ))}

            {/* Next step checklist */}
            {hasStartup && (
              <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                {[
                  { done: myTasks.length > 0,      label: 'Add tasks to Kanban board',  to: '/prototype'   },
                  { done: myMilestones.length > 0,  label: 'Set a project milestone',    to: '/prototype'   },
                  { done: !!lastEval,               label: 'Run AI evaluation',          to: '/evaluate'    },
                  { done: kpiFunding > 0,           label: 'Submit funding request',     to: '/funding'     },
                ].map(({ done, label, to }) => (
                  <Link key={label} to={to} className="flex items-center gap-2.5 group py-0.5">
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 group-hover:border-primary'}`}>
                      {done && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs ${done ? 'line-through text-slate-400' : 'text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors'}`}>{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
