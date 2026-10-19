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
  BellIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ChartBarSquareIcon,
  WrenchScrewdriverIcon,
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

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  primary: '#1D4241',
  teal:    '#4C8884',
  accent:  '#EF9C82',
  muted:   '#C7DAD8',
  blue:    '#3B82F6',
  indigo:  '#6366F1',
  emerald: '#10B981',
  amber:   '#F59E0B',
  violet:  '#8B5CF6',
}

const TRL_LABELS = [
  'Basic Research', 'Technology Concept', 'Experimental Proof',
  'Lab Validation', 'Relevant Environment', 'Relevant Demo',
  'System Prototype', 'System Complete', 'Proven System',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt$(n) {
  if (!n && n !== 0) return '$0'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function fmtEvent(e) {
  try {
    const d    = new Date(Number(e.year), Number(e.month) - 1, Number(e.day))
    const today = new Date()
    const diff  = Math.round((d - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000)
    if (diff === 0) return { label: 'Today',       hot: true  }
    if (diff === 1) return { label: 'Tomorrow',    hot: false }
    if (diff > 0 && diff <= 7) return { label: `In ${diff} days`, hot: false }
    return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), hot: false }
  } catch { return { label: '', hot: false } }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ w = 'w-full', h = 'h-4' }) {
  return <div className={`rounded-lg ${w} ${h} bg-slate-100 dark:bg-slate-700/60 animate-pulse`} />
}

// ─── Reusable Card ────────────────────────────────────────────────────────────
function Card({ children, className = '', padding = 'p-6' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm ${padding} ${className}`}>
      {children}
    </div>
  )
}

// ─── Panel header ─────────────────────────────────────────────────────────────
function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5">
      <div>
        <h2 className="font-heading text-[15px] font-semibold text-slate-800 dark:text-white leading-snug">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, accent, loading, to }) {
  const body = (
    <div className={`relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group h-full`}>
      {/* Subtle accent stripe at top */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${accent.stripe}`} />

      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${accent.iconBg}`}>
          <Icon className={`h-5 w-5 ${accent.iconColor}`} />
        </div>
        <ChevronRightIcon className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
      </div>

      {loading
        ? <><Skeleton h="h-8" w="w-20" className="mb-2" /><Skeleton h="h-3" w="w-28" /></>
        : <>
          <p className={`font-heading text-2xl font-bold tracking-tight mb-0.5 ${accent.value}`}>{value}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
        </>}
    </div>
  )
  return to ? <Link to={to} className="block h-full">{body}</Link> : body
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 shadow-xl text-xs min-w-[110px]">
      <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-700">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span style={{ color: p.color }} className="font-semibold">
            {typeof p.value === 'number' && p.value > 999 ? fmt$(p.value) : p.value}
          </span>
          <span className="text-slate-400">{p.name}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Event card ───────────────────────────────────────────────────────────────
function EventCard({ ev, index }) {
  const { label, hot } = fmtEvent(ev)
  const themes = [
    { from: P.primary, to: '#0F2422', Icon: RocketLaunchIcon  },
    { from: P.teal,    to: '#2D5C59', Icon: CalendarDaysIcon  },
    { from: P.accent,  to: '#C97A62', Icon: SparklesIcon      },
    { from: '#2563EB', to: '#1D4ED8', Icon: UserGroupIcon     },
  ]
  const t  = themes[index % themes.length]
  const Ic = t.Icon
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image area */}
      <div
        className="h-[72px] flex items-center justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
      >
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
        <Ic className="h-7 w-7 text-white/90 relative z-10" />
        {hot && (
          <span className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            TODAY
          </span>
        )}
      </div>
      {/* Body */}
      <div className="p-2.5 flex flex-col gap-1 flex-1 bg-white dark:bg-slate-800">
        <p className="text-xs font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2">{ev.title}</p>
        <p className="text-[10px] text-slate-400">{ev.location || 'Online'} · {ev.time}</p>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[9px] uppercase tracking-wide font-semibold text-slate-400">
            {ev.type || 'Workshop'}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            hot
              ? 'bg-primary text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>{label}</span>
        </div>
        {ev.registered && (
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
            <CheckCircleSolid className="h-3 w-3" /> Registered
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Activity item ────────────────────────────────────────────────────────────
function ActivityItem({ icon: Icon, iconBg, iconColor, title, detail, time, linkTo }) {
  return (
    <Link to={linkTo} className="flex items-start gap-3 group py-2 hover:bg-slate-50 dark:hover:bg-slate-700/30 -mx-3 px-3 rounded-xl transition-colors">
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{title}</p>
          <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">{time}</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mt-0.5">{detail}</p>
      </div>
    </Link>
  )
}

// ─── Checklist item ───────────────────────────────────────────────────────────
function CheckItem({ done, label, to }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 py-1.5 group">
      <div className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
        done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-primary'
      }`} style={{ height: '1.125rem', width: '1.125rem' }}>
        {done && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        )}
      </div>
      <span className={`text-xs leading-snug ${
        done
          ? 'line-through text-slate-400'
          : 'text-slate-600 dark:text-slate-300 group-hover:text-primary dark:group-hover:text-primary-300 transition-colors'
      }`}>{label}</span>
    </Link>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
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

  useEffect(() => {
    eventAPI.getAll().then(r => {
      const now = new Date()
      const list = (r.data?.data || [])
        .map(e => ({ ...e, _d: new Date(Number(e.year), Number(e.month) - 1, Number(e.day)) }))
        .filter(e => !isNaN(e._d) && e._d >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        .sort((a, b) => a._d - b._d)
        .slice(0, 4)
      setEvents(list)
    }).catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    let live = true
    ;(async () => {
      setStartupLoading(true)
      try {
        const r    = await startupAPI.getMyStartups()
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

  // ── Derived values ─────────────────────────────────────────────────────────
  const name       = user?.full_name || user?.name || 'Founder'
  const firstName  = name.split(' ')[0]
  const hour       = new Date().getHours()
  const greeting   = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const doneTasks  = myTasks.filter(t => t.column === 'done').length
  const donePct    = myTasks.length ? Math.round(doneTasks / myTasks.length * 100) : 0
  const nextMs     = [...myMilestones].filter(m => !m.completed).sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0]
  const trl        = parseInt(myStartup?.trl_level || myStartup?.trl || 0, 10) || 0
  const hasStartup = !startupLoading && !!myStartup

  const kpiStartups = stats?.total_startups ?? fbKpis.totalStartups
  const kpiMentors  = stats?.mentors_active ?? fbKpis.activeMentors
  const kpiFunding  = stats?.total_funding  ?? 0
  const kpiSuccess  = stats?.success_rate   ?? fbKpis.successRate

  const barData = trends
    ? trends.labels.map((m, i) => ({ month: m, Submitted: trends.applications[i], Approved: trends.approvals[i] }))
    : fbProgress.map(p => ({ month: p.month, Submitted: Math.round(p.progress * 0.6), Approved: Math.round(p.progress * 0.4) }))

  const areaData = trends
    ? trends.labels.map((m, i) => ({ month: m, Activity: trends.applications[i] * 15000 }))
    : fbProgress.map(p => ({ month: p.month, Activity: p.progress * 8000 }))

  const donutData = analytics?.sector_distribution
    ? Object.entries(analytics.sector_distribution).map(([n, v], i) => ({
        name: n, value: v,
        color: [P.primary, P.teal, P.accent, P.blue, P.violet, P.emerald][i % 6],
      }))
    : fbDonut.map((d, i) => ({ ...d, color: [P.primary, P.teal, P.accent, P.muted][i % 4] }))

  const donutTotal     = donutData.reduce((s, d) => s + d.value, 0)
  const totalRaisedStr = fmt$(kpiFunding || donutTotal * 13800)

  const kpiCards = [
    {
      icon: BuildingOffice2Icon, label: 'My Startups',      value: kpiStartups,      sub: 'registered in MInT',
      accent: { stripe: 'bg-primary', iconBg: 'bg-primary/10', iconColor: 'text-primary', value: 'text-primary' },
      to: '/startups',
    },
    {
      icon: UserGroupIcon,       label: 'Active Mentors',   value: kpiMentors,       sub: 'available to match',
      accent: { stripe: 'bg-sky-400', iconBg: 'bg-sky-100', iconColor: 'text-sky-600', value: 'text-sky-600' },
      to: '/recommendations',
    },
    {
      icon: BanknotesIcon,       label: 'Funding Approved', value: fmt$(kpiFunding), sub: 'across my requests',
      accent: { stripe: 'bg-emerald-400', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', value: 'text-emerald-600' },
      to: '/funding',
    },
    {
      icon: ArrowTrendingUpIcon, label: 'Success Rate',     value: `${kpiSuccess}%`, sub: 'approved vs submitted',
      accent: { stripe: 'bg-accent', iconBg: 'bg-accent/15', iconColor: 'text-accent-600', value: 'text-accent-600' },
      to: '/analytics',
    },
  ]

  return (
    <div className="space-y-5 pb-8 max-w-[1440px]">

      {/* ── Top bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            readOnly
            placeholder="Search dashboard…"
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-600 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/25 transition"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="relative h-9 w-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition shadow-sm">
            <BellIcon className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full ring-1 ring-white" />
          </button>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-teal-700 flex items-center justify-center text-white text-sm font-bold shadow-sm select-none">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Welcome line ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
            {greeting}, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
            Innovation Incubator Platform
            <span className="h-1 w-1 rounded-full bg-slate-300 inline-block" />
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 relative" />
              </span>
              {statsLoading ? 'Loading…' : 'All systems operational'}
            </span>
            {myStartup && (
              <>
                <span className="h-1 w-1 rounded-full bg-slate-300 inline-block" />
                <span className="text-slate-400">{myStartup.business_name}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!hasStartup && !startupLoading && (
            <Link to="/startups/create"
              className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-700 transition shadow-sm">
              <PlusIcon className="h-4 w-4" /> Create Startup
            </Link>
          )}
          <Link to="/evaluate"
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
            <SparklesIcon className="h-4 w-4 text-primary" /> AI Evaluation
          </Link>
        </div>
      </div>

      {/* ── KPI row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(k => (
          <KpiCard key={k.label} {...k} loading={statsLoading} />
        ))}
      </div>

      {/* ── Row 2: Startup panel + Events ────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-5">

        {/* Startup progress panel */}
        <Card>
          {hasStartup ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Startup</p>
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white leading-none">
                    {myStartup.business_name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">{myStartup.sector} · Status: <span className="capitalize font-medium text-slate-600 dark:text-slate-300">{myStartup.status || 'submitted'}</span></p>
                </div>
                <Link to="/prototype"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/25 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition">
                  Open Workspace <ChevronRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* 3 mini stat blocks */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {/* Build Progress */}
                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CpuChipIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Build</p>
                  </div>
                  <p className="font-heading text-3xl font-bold text-slate-900 dark:text-white leading-none">
                    {donePct}<span className="text-base font-medium text-slate-400">%</span>
                  </p>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${donePct >= 80 ? 'bg-emerald-500' : donePct >= 40 ? 'bg-primary' : 'bg-amber-400'}`}
                      style={{ width: `${donePct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">{doneTasks} of {myTasks.length} tasks done</p>
                </div>

                {/* TRL */}
                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-sky-100 flex items-center justify-center">
                      <RocketLaunchIcon className="h-3.5 w-3.5 text-sky-600" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">TRL</p>
                  </div>
                  <p className="font-heading text-3xl font-bold text-sky-600 leading-none">
                    {trl}<span className="text-base font-medium text-slate-400">/9</span>
                  </p>
                  <div className="flex gap-0.5 mt-3">
                    {Array.from({ length: 9 }, (_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-sm transition-colors ${i < trl ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-600'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 truncate">{trl > 0 ? TRL_LABELS[trl - 1] : 'Not set yet'}</p>
                </div>

                {/* Next Milestone */}
                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FlagIcon className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Milestone</p>
                  </div>
                  {nextMs ? (
                    <>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2">{nextMs.title}</p>
                      <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                        <CalendarDaysIcon className="h-3 w-3 shrink-0" />
                        {nextMs.date ? new Date(nextMs.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-slate-400 mb-1">No milestones set</p>
                      <Link to="/prototype" className="text-xs text-primary font-medium hover:underline">Add one →</Link>
                    </>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2">
                    {myMilestones.filter(m => m.completed).length}/{myMilestones.length} completed
                  </p>
                </div>
              </div>

              {/* Last eval pill */}
              {lastEval && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 rounded-xl px-4 py-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <SparklesIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Last AI Evaluation
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        lastEval.overall_score >= 85 ? 'bg-emerald-100 text-emerald-700' :
                        lastEval.overall_score >= 70 ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'
                      }`}>{lastEval.rating}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Score: <strong className="text-primary">{lastEval.overall_score}/100</strong>
                      {lastEval.title && <span className="ml-1 text-slate-400">— {lastEval.title}</span>}
                    </p>
                  </div>
                  <Link to="/evaluate"
                    className="shrink-0 text-xs font-semibold text-primary border border-primary/25 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition flex items-center gap-1">
                    Re-run <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </>
          ) : !startupLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                <LightBulbIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-1">Create your first startup</h2>
              <p className="text-sm text-slate-500 mb-5 max-w-xs">
                Register to unlock AI evaluation, prototyping, funding, mentors, and the full MInT platform.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Link to="/startups/create"
                  className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-sm">
                  <PlusIcon className="h-4 w-4" /> Create Startup
                </Link>
                <Link to="/idea-submission"
                  className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm px-5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition">
                  Submit an Idea
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton h="h-5" w="w-48" />
              <div className="grid grid-cols-3 gap-3"><Skeleton h="h-28" /><Skeleton h="h-28" /><Skeleton h="h-28" /></div>
            </div>
          )}
        </Card>

        {/* Events */}
        <Card>
          <PanelHeader
            title="Upcoming Events"
            subtitle="Workshops, roundtables and meetings"
            action={
              <Link to="/recommendations"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                See all <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            }
          />
          {events === null ? (
            <div className="grid grid-cols-2 gap-3">
              {[0,1,2,3].map(i => <Skeleton key={i} h="h-36" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[180px] text-center">
              <CalendarDaysIcon className="h-10 w-10 text-slate-200 dark:text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-500">No upcoming events</p>
              <p className="text-xs text-slate-400 mt-0.5">Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {events.map((ev, i) => <EventCard key={ev.event_id} ev={ev} index={i} />)}
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 3: Bar chart + AI panel + Donut ──────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_240px_240px] gap-5">

        {/* Startup Progress bar chart */}
        <Card>
          <PanelHeader
            title="Startup Progress"
            subtitle="Monthly funding applications — submitted vs approved"
            action={
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: P.blue }} />Submitted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: P.violet }} />Approved
                </span>
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="2 4" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
              <Bar dataKey="Submitted" fill={P.blue}   radius={[5, 5, 0, 0]} maxBarSize={24} />
              <Bar dataKey="Approved"  fill={P.violet} radius={[5, 5, 0, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI Recommendations — dark panel */}
        <div className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'linear-gradient(160deg, #1D4241 0%, #0F2422 100%)' }}>
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-white/8" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,156,130,0.2)' }}>
                <SparklesIcon className="h-4.5 w-4.5 text-accent" style={{ height: '1.125rem', width: '1.125rem' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">AI Panel</p>
                <p className="text-[10px] text-white/40 mt-0.5">Powered by MInT AI</p>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex-1 px-3 py-3 space-y-1">
            {[
              { label: 'AI Recommendations',    to: '/recommendations', Icon: SparklesIcon         },
              { label: 'Reports & Analytics',   to: '/analytics',       Icon: ChartBarSquareIcon   },
              { label: 'Apply for Funding',     to: '/funding',         Icon: BanknotesIcon        },
              { label: 'Mentor Matches',        to: '/mentors',         Icon: UserGroupIcon        },
              { label: 'Prototype Center',      to: '/prototype',       Icon: WrenchScrewdriverIcon },
              { label: 'Research Papers',       to: '/recommendations', Icon: BookOpenIcon         },
            ].map(({ label, to, Icon }) => (
              <Link key={label} to={to}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all group"
                style={{ background: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <span className="flex items-center gap-2 text-white/75 group-hover:text-white transition-colors">
                  <Icon className="h-3.5 w-3.5 text-white/40 group-hover:text-accent transition-colors" />
                  {label}
                </span>
                <ChevronRightIcon className="h-3 w-3 text-white/25 group-hover:text-white/60 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Footer metric */}
          <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Platform Success Rate</p>
              <p className="text-xs font-bold text-accent">{kpiSuccess}%</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${kpiSuccess}%`, background: 'linear-gradient(90deg, #EF9C82, #EA7C57)' }} />
            </div>
          </div>
        </div>

        {/* Funding Donut */}
        <Card padding="p-5">
          <PanelHeader title="Funding Status" subtitle="By category" />
          <div className="relative">
            <ResponsiveContainer width="100%" height={148}>
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={3} strokeWidth={0}>
                  {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="font-heading text-lg font-bold text-slate-900 dark:text-white leading-none">{totalRaisedStr}</p>
              <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">Raised</p>
            </div>
          </div>
          <div className="space-y-2 mt-1">
            {donutData.slice(0, 4).map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="truncate">{d.name}</span>
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 ml-2 shrink-0">
                  {donutTotal ? Math.round(d.value / donutTotal * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row 4: Area chart + Activity Feed ────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-5">

        {/* KPI Area chart */}
        <Card>
          <PanelHeader
            title="Key Performance Metrics"
            subtitle="Platform funding activity over time"
            action={
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: P.blue }} />
                Key Indicators
              </div>
            }
          />
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={P.blue}    stopOpacity={0.18} />
                  <stop offset="100%" stopColor={P.blue}    stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} cursor={{ stroke: P.blue, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="Activity" stroke={P.blue} fill="url(#ag1)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: P.blue }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Activity Feed */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-[15px] font-semibold text-slate-800 dark:text-white">Activity Feed</h2>
              <p className="text-xs text-slate-400 mt-0.5">Platform notifications &amp; actions</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-primary hover:underline">View all</Link>
          </div>

          {/* Activity items */}
          <div className="space-y-0.5 mb-4">
            <ActivityItem
              icon={BuildingOffice2Icon}
              iconBg="bg-primary/10" iconColor="text-primary"
              title="Platform Event"
              detail={hasStartup ? `${myStartup?.business_name} is active and registered on MInT.` : 'Create a startup to get started on the MInT platform.'}
              time="Now"
              linkTo="/startups"
            />
            <ActivityItem
              icon={UserGroupIcon}
              iconBg="bg-sky-100" iconColor="text-sky-600"
              title="Platform Notifications"
              detail={`${kpiMentors} mentors are available — get matched to an expert in your sector.`}
              time="1h ago"
              linkTo="/recommendations"
            />
            <ActivityItem
              icon={BanknotesIcon}
              iconBg="bg-violet-100" iconColor="text-violet-600"
              title="Funding Opportunities"
              detail="New grants and funding rounds are open. Review matches in the funding section."
              time="2h ago"
              linkTo="/funding"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-700 mb-3" />

          {/* Checklist */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Getting started</p>
            <div className="space-y-0.5">
              <CheckItem done={hasStartup}              label="Register your startup"        to="/startups/create" />
              <CheckItem done={myTasks.length > 0}     label="Add tasks to Kanban board"    to="/prototype"      />
              <CheckItem done={myMilestones.length > 0} label="Set a project milestone"      to="/prototype"      />
              <CheckItem done={!!lastEval}              label="Run first AI evaluation"      to="/evaluate"       />
              <CheckItem done={kpiFunding > 0}         label="Submit a funding request"     to="/funding"        />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
