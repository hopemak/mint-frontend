import React, { useState, useEffect, useMemo } from 'react'
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
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
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
import api from '../../services/api.js'
import { MAP_W, MAP_H, REGION_SHAPES } from '../../data/ethiopiaRegions.js'
import {
  eventAPI,
  dashboardAPI,
  startupAPI,
  taskAPI,
  milestoneAPI,
  evaluationAPI,
} from '../../services/api.js'

/* ───────────────────────────── Design tokens ───────────────────────────── */

const CHART = {
  submitted: '#316966', // primary-500
  approved: '#EF9C82', // accent
  axis: '#94A3B8',
  grid: '#E2E8F0',
  sectors: ['#1D4241', '#4C8884', '#EF9C82', '#75A3A0', '#DF5B2B', '#9FBFBC'],
}

const TRL_LABELS = [
  'Basic Research', 'Technology Concept', 'Experimental Proof',
  'Lab Validation', 'Relevant Environment', 'Relevant Demo',
  'System Prototype', 'System Complete', 'Proven System',
]

const EVENT_TONES = [
  { bg: 'bg-primary-700', fg: 'text-white', Icon: RocketLaunchIcon },
  { bg: 'bg-primary-400', fg: 'text-white', Icon: CalendarDaysIcon },
  { bg: 'bg-accent-200', fg: 'text-primary-800', Icon: SparklesIcon },
  { bg: 'bg-primary-100', fg: 'text-primary-700', Icon: UserGroupIcon },
]

const EMPTY = '—'

/* ────────────────────────────── Utilities ──────────────────────────────── */

function fmtMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return EMPTY
  n = Number(n)
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function fmtDate(value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!value) return ''
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', opts)
}

function eventWhen(e) {
  const d = new Date(Number(e.year), Number(e.month) - 1, Number(e.day))
  if (Number.isNaN(d.getTime())) return { label: '', hot: false }
  const now = new Date()
  const diff = Math.round((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000)
  if (diff === 0) return { label: 'Today', hot: true }
  if (diff === 1) return { label: 'Tomorrow', hot: false }
  if (diff > 1 && diff <= 7) return { label: `In ${diff} days`, hot: false }
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), hot: false }
}

/* ───────────────────────── Shared building blocks ──────────────────────── */

function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`rounded-md bg-slate-100 dark:bg-primary-700 animate-pulse ${className}`} />
}

function Card({ children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-card dark:border-primary-700 dark:bg-primary-800 ${className}`}
    >
      {children}
    </section>
  )
}

function CardHeader({ title, subtitle, action }) {
  return (
    <header className="flex items-start justify-between gap-4 px-5 pt-5">
      <div className="min-w-0">
        <h2 className="font-heading text-[15px] font-semibold leading-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

function TextLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex shrink-0 items-center gap-1 rounded-md text-xs font-semibold text-primary-500 hover:text-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:text-primary-200 dark:hover:text-white"
    >
      {children}
      <ArrowRightIcon className="h-3.5 w-3.5" />
    </Link>
  )
}

function EmptyNote({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-primary-700">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {body && <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

function ChartTip({ active, payload, label, money = false }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-soft dark:border-primary-600 dark:bg-primary-800">
      <p className="mb-1.5 font-semibold text-slate-800 dark:text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums text-slate-900 dark:text-white">
            {money ? fmtMoney(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

/* ───────────────────────── Ethiopia startup map (compact) ──────────────── */

// Region ids on the map -> platform region names (same grouping as the landing map;
// Central and South Ethiopia are drawn together as the former SNNP area).
const AREAS = {
  'Addis Ababa': { label: 'Addis Ababa', keys: ['Addis Ababa'] },
  Afar: { label: 'Afar', keys: ['Afar'] },
  Amhara: { label: 'Amhara', keys: ['Amhara'] },
  'Benishangul Gumz': { label: 'Benishangul-Gumuz', keys: ['Benishangul-Gumuz'] },
  'Dire Dawa': { label: 'Dire Dawa', keys: ['Dire Dawa'] },
  Gambela: { label: 'Gambela', keys: ['Gambela'] },
  Harari: { label: 'Harari', keys: ['Harari'] },
  Oromia: { label: 'Oromia', keys: ['Oromia'] },
  Sidama: { label: 'Sidama', keys: ['Sidama'] },
  SNNP: { label: 'Central & South Ethiopia', keys: ['Central Ethiopia', 'South Ethiopia'] },
  Somali: { label: 'Somali', keys: ['Somali'] },
  SWEPR: { label: 'South West Ethiopia', keys: ['South West Ethiopia'] },
  Tigray: { label: 'Tigray', keys: ['Tigray'] },
}

// Light-on-dark ramp: more startups in a region = brighter fill.
const MAP_RAMP = [
  { max: 0, fill: '#2B5C59' },
  { max: 2, fill: '#4C8884' },
  { max: 5, fill: '#75A3A0' },
  { max: 10, fill: '#C7DAD8' },
  { max: Infinity, fill: '#FFFFFF' },
]
const rampFill = (n) => (MAP_RAMP.find((r) => n <= r.max) || MAP_RAMP[0]).fill

function EthiopiaMap() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let live = true
    api.get('/api/public/regions')
      .then((r) => live && setData(r.data))
      .catch(() => live && setData({ regions: {} }))
    return () => { live = false }
  }, [])

  const areas = useMemo(() => {
    const regions = data?.regions || {}
    return REGION_SHAPES.map((s) => {
      const cfg = AREAS[s.id] || { label: s.id, keys: [s.id] }
      const count = cfg.keys.reduce((sum, k) => sum + (regions[k]?.count || 0), 0)
      return { ...s, label: cfg.label, count }
    })
  }, [data])

  const total = areas.reduce((s, a) => s + a.count, 0)
  const active = areas.filter((a) => a.count > 0).length

  return (
    <figure className="mt-4 flex flex-1 flex-col justify-center">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        role="img"
        aria-label={`Map of Ethiopia: ${total} startups across ${active} regions`}
        className="mx-auto h-auto w-full max-w-[260px]" style={{ filter: 'drop-shadow(0 0 18px rgba(117,163,160,0.45))' }}
      >
        {areas.map((a) => (
          <path
            key={a.id}
            d={a.d}
            fill={rampFill(a.count)}
            stroke="rgba(199,218,216,0.7)"
            strokeWidth="1"
            strokeLinejoin="round"
            className="transition-opacity hover:opacity-80"
          >
            <title>{`${a.label}: ${a.count} ${a.count === 1 ? 'startup' : 'startups'}`}</title>
          </path>
        ))}
      </svg>
      <figcaption className="mt-2 flex items-center justify-between text-[11px] text-white/60">
        <span>
          {data === null
            ? 'Loading regional data…'
            : total > 0
              ? `${total} ${total === 1 ? 'startup' : 'startups'} · ${active} of ${areas.length} regions`
              : 'No regional data yet'}
        </span>
        <span className="flex items-center gap-1" aria-hidden="true">
          Fewer
          {MAP_RAMP.map((r) => <span key={r.fill} className="h-2 w-3 rounded-sm" style={{ background: r.fill }} />)}
          More
        </span>
      </figcaption>
    </figure>
  )
}

/* ─────────────────────────────── KPI card ──────────────────────────────── */

function KpiCard({ icon: Icon, label, value, hint, loading, to }) {
  return (
    <Link
      to={to}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      <Card className="h-full p-5 transition-shadow group-hover:shadow-soft">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-700 dark:text-primary-100">
            <Icon className="h-5 w-5" />
          </span>
          <ChevronRightIcon className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-500" />
        </div>
        <div className="mt-5">
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="font-heading text-[28px] font-semibold leading-none tracking-tight tabular-nums text-slate-900 dark:text-white">
              {value}
            </p>
          )}
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
        </div>
      </Card>
    </Link>
  )
}

/* ───────────────────────────── Startup overview ────────────────────────── */

function Metric({ label, children, foot }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-primary-700 dark:bg-primary-900/40">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-2">{children}</div>
      {foot && <p className="mt-auto truncate pt-3 text-xs text-slate-500 dark:text-slate-400">{foot}</p>}
    </div>
  )
}

function ProgressBar({ pct, tone = 'bg-primary-500' }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-primary-700"
    >
      <div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ─────────────────────────────── Main page ─────────────────────────────── */

export default function Dashboard() {
  const { user } = useAuth()

  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [events, setEvents] = useState(null)
  const [myStartup, setMyStartup] = useState(null)
  const [myTasks, setMyTasks] = useState([])
  const [myMilestones, setMyMilestones] = useState([])
  const [lastEval, setLastEval] = useState(null)
  const [startupLoading, setStartupLoading] = useState(true)
  const [series, setSeries] = useState('all')

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
    let live = true
    eventAPI.getAll().then((r) => {
      if (!live) return
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const list = (r.data?.data || [])
        .map((e) => ({ ...e, _d: new Date(Number(e.year), Number(e.month) - 1, Number(e.day)) }))
        .filter((e) => !Number.isNaN(e._d.getTime()) && e._d >= today)
        .sort((a, b) => a._d - b._d)
        .slice(0, 4)
      setEvents(list)
    }).catch(() => live && setEvents([]))
    return () => { live = false }
  }, [])

  useEffect(() => {
    let live = true
    ;(async () => {
      setStartupLoading(true)
      try {
        const r = await startupAPI.getMyStartups()
        const list = r.data?.data || []
        if (!live || !list.length) return
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
      } catch { /* keep empty state */ }
      finally { if (live) setStartupLoading(false) }
    })()
    return () => { live = false }
  }, [])

  /* ── Derived values (real data only; missing values render as "—") ── */
  const name = user?.full_name || user?.name || 'Founder'
  const firstName = name.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const doneTasks = myTasks.filter((t) => t.column === 'done').length
  const donePct = myTasks.length ? Math.round((doneTasks / myTasks.length) * 100) : 0
  const nextMs = [...myMilestones]
    .filter((m) => !m.completed)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))[0]
  const trl = parseInt(myStartup?.trl_level || myStartup?.trl || 0, 10) || 0
  const hasStartup = !startupLoading && !!myStartup

  const kpi = {
    startups: stats ? stats.total_startups : EMPTY,
    mentors: stats ? stats.mentors_active : EMPTY,
    funding: stats ? fmtMoney(stats.total_funding) : EMPTY,
    success: stats ? `${stats.success_rate}%` : EMPTY,
  }

  const barData = useMemo(() => (
    trends?.labels?.length
      ? trends.labels.map((m, i) => ({ month: m, Submitted: trends.applications[i], Approved: trends.approvals[i] }))
      : []
  ), [trends])

  const cumulativeData = useMemo(() => {
    let sub = 0
    let app = 0
    return barData.map((d) => {
      sub += d.Submitted
      app += d.Approved
      return { month: d.month, 'Total submitted': sub, 'Total approved': app }
    })
  }, [barData])

  const donutData = useMemo(() => (
    Object.entries(analytics?.sector_distribution || {}).map(([n, v], i) => ({
      name: n, value: v, color: CHART.sectors[i % CHART.sectors.length],
    }))
  ), [analytics])
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0)

  const activity = useMemo(() => {
    const items = []
    if (lastEval) {
      items.push({
        key: 'eval', icon: SparklesIcon, to: '/evaluate',
        title: `AI evaluation scored ${lastEval.overall_score}/100`,
        detail: lastEval.title || 'Latest saved evaluation',
        when: fmtDate(lastEval.created_at, { month: 'short', day: 'numeric' }),
      })
    }
    if (myTasks.length) {
      items.push({
        key: 'tasks', icon: ClipboardDocumentCheckIcon, to: '/prototype',
        title: `${doneTasks} of ${myTasks.length} build tasks complete`,
        detail: myStartup?.business_name,
        when: '',
      })
    }
    if (nextMs) {
      items.push({
        key: 'ms', icon: FlagIcon, to: '/prototype',
        title: `Next milestone: ${nextMs.title}`,
        detail: 'Due date',
        when: fmtDate(nextMs.date, { month: 'short', day: 'numeric' }),
      })
    }
    ;(events || []).filter((e) => e.registered).forEach((e) => {
      items.push({
        key: `ev-${e.event_id}`, icon: CalendarDaysIcon, to: '/recommendations',
        title: `Registered: ${e.title}`,
        detail: [e.location, e.time].filter(Boolean).join(' · '),
        when: eventWhen(e).label,
      })
    })
    if (stats?.total_funding > 0) {
      items.push({
        key: 'fund', icon: BanknotesIcon, to: '/funding',
        title: `${fmtMoney(stats.total_funding)} in approved funding`,
        detail: 'Across your funding requests', when: '',
      })
    }
    return items.slice(0, 4)
  }, [lastEval, myTasks, doneTasks, nextMs, events, stats, myStartup])

  const checklist = [
    { done: myTasks.length > 0, label: 'Add tasks to your build board', to: '/prototype' },
    { done: myMilestones.length > 0, label: 'Set a project milestone', to: '/prototype' },
    { done: !!lastEval, label: 'Run an AI evaluation', to: '/evaluate' },
    { done: (stats?.total_funding || 0) > 0, label: 'Secure approved funding', to: '/funding' },
  ]
  const checklistDone = checklist.filter((c) => c.done).length

  const showSubmitted = series === 'all' || series === 'Submitted'
  const showApproved = series === 'all' || series === 'Approved'

  /* ───────────────────────────────── Render ───────────────────────────── */
  return (
    <div className="space-y-6 pb-8">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-400">Founder dashboard</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {hasStartup
              ? `${myStartup.business_name?.trim()} · ${myStartup.sector || 'No sector'} · TRL ${trl}/9`
              : 'Here is where your innovation journey stands.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!hasStartup && !startupLoading && (
            <Link to="/startups/create" className="btn btn-primary">
              <PlusIcon className="h-4 w-4" /> Create startup
            </Link>
          )}
          <Link
            to="/evaluate"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-primary-600 dark:bg-primary-800 dark:text-slate-100 dark:hover:bg-primary-700"
          >
            <SparklesIcon className="h-4 w-4 text-primary-500" /> Run AI evaluation
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={BuildingOffice2Icon} label="My startups" value={kpi.startups} hint="Registered on MInT" loading={statsLoading} to="/startups" />
        <KpiCard icon={UserGroupIcon} label="Active mentors" value={kpi.mentors} hint="Available to match" loading={statsLoading} to="/recommendations" />
        <KpiCard icon={BanknotesIcon} label="Funding approved" value={kpi.funding} hint="Across your requests" loading={statsLoading} to="/funding" />
        <KpiCard icon={ArrowTrendingUpIcon} label="Approval rate" value={kpi.success} hint="Approved vs submitted" loading={statsLoading} to="/analytics" />
      </div>

      {/* Overview + events */}
      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <Card className="flex flex-col">
          {hasStartup ? (
            <>
              <CardHeader
                title="Startup overview"
                subtitle="Build, readiness and what is due next"
                action={<TextLink to="/prototype">Open prototype center</TextLink>}
              />
              <div className="grid flex-1 gap-3 p-5 sm:grid-cols-3">
                <Metric label="Build progress" foot={myTasks.length ? `${doneTasks} of ${myTasks.length} tasks done` : 'No tasks yet'}>
                  <p className="font-heading text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
                    {myTasks.length ? donePct : EMPTY}
                    {myTasks.length > 0 && <span className="ml-0.5 text-sm font-normal text-slate-400">%</span>}
                  </p>
                  <div className="mt-2.5">
                    <ProgressBar pct={donePct} tone={donePct >= 80 ? 'bg-emerald-500' : 'bg-primary-500'} />
                  </div>
                </Metric>

                <Metric label="Technology readiness" foot={trl > 0 ? TRL_LABELS[trl - 1] : 'Not set'}>
                  <p className="font-heading text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
                    {trl || EMPTY}
                    <span className="ml-0.5 text-sm font-normal text-slate-400">/9</span>
                  </p>
                  <div className="mt-2.5 flex gap-1" aria-hidden="true">
                    {Array.from({ length: 9 }, (_, i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-sm ${i < trl ? 'bg-primary-500' : 'bg-slate-200 dark:bg-primary-700'}`} />
                    ))}
                  </div>
                </Metric>

                <Metric label="Next milestone" foot={nextMs ? fmtDate(nextMs.date) : undefined}>
                  {nextMs ? (
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">{nextMs.title}</p>
                  ) : (
                    <Link to="/prototype" className="text-sm font-semibold text-primary-500 hover:underline">
                      Add a milestone
                    </Link>
                  )}
                </Metric>
              </div>

              {lastEval ? (
                <div className="mx-5 mb-5 flex items-center gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3 dark:border-primary-700 dark:bg-primary-900/40">
                  <CheckCircleSolid className="h-5 w-5 shrink-0 text-primary-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Latest AI score <span className="tabular-nums text-primary-600 dark:text-primary-200">{lastEval.overall_score}/100</span>
                      {lastEval.rating && (
                        <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-primary-600 ring-1 ring-primary-100 dark:bg-primary-800 dark:text-primary-100 dark:ring-primary-600">
                          {lastEval.rating}
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {lastEval.title} · AI-generated guidance, not an official decision
                    </p>
                  </div>
                  <TextLink to="/evaluate">Re-evaluate</TextLink>
                </div>
              ) : (
                <div className="mx-5 mb-5 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-4 py-3 dark:border-primary-600">
                  <SparklesIcon className="h-5 w-5 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">No AI evaluation yet</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Run one to see scores, strengths and risks for {myStartup.business_name?.trim() || 'your startup'}.</p>
                  </div>
                  <TextLink to="/evaluate">Evaluate</TextLink>
                </div>
              )}
            </>
          ) : !startupLoading ? (
            <EmptyNote
              icon={LightBulbIcon}
              title="Register your first startup"
              body="Creating a startup unlocks AI evaluation, the prototype center, funding requests and mentor matching."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/startups/create" className="btn btn-primary"><PlusIcon className="h-4 w-4" /> Create startup</Link>
                  <Link to="/idea-submission" className="btn btn-outline">Submit an idea first</Link>
                </div>
              }
            />
          ) : (
            <div className="space-y-4 p-5">
              <Skeleton className="h-5 w-40" />
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
              </div>
            </div>
          )}
        </Card>

        <Card className="flex flex-col">
          <CardHeader
            title="Upcoming events"
            subtitle="Workshops and meetings you can join"
            action={<TextLink to="/recommendations">See all</TextLink>}
          />
          {events === null ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : events.length === 0 ? (
            <EmptyNote icon={CalendarDaysIcon} title="No upcoming events" body="New workshops will appear here as soon as they are scheduled." />
          ) : (
            <ul className="flex flex-1 flex-col divide-y divide-slate-100 px-5 py-2 dark:divide-primary-700">
              {events.map((ev, i) => {
                const { label, hot } = eventWhen(ev)
                const tone = EVENT_TONES[i % EVENT_TONES.length]
                return (
                  <li key={ev.event_id} className="flex flex-1 items-center gap-3 py-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.bg} ${tone.fg}`}
                      style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '8px 8px' }}
                    >
                      <tone.Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-slate-900 dark:text-white">{ev.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {[ev.time, ev.location].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${hot ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-primary-700 dark:text-slate-200'}`}>
                        {label}
                      </span>
                      {ev.registered && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircleSolid className="h-3.5 w-3.5" /> Registered
                        </span>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Chart + AI panel + sector donut */}
      <div className="grid gap-5 xl:grid-cols-[1fr_280px_300px]">
        <Card className="flex flex-col">
          <CardHeader
            title="Funding applications"
            subtitle="Submitted and approved per month"
            action={
              <>
                <label className="sr-only" htmlFor="series-filter">Series to display</label>
                <select
                  id="series-filter"
                  value={series}
                  onChange={(e) => setSeries(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-primary-600 dark:bg-primary-800 dark:text-slate-200"
                >
                  <option value="all">All metrics</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Approved">Approved</option>
                </select>
              </>
            }
          />

          <div className="relative min-h-[260px] flex-1 px-3 pt-3">
            {statsLoading ? (
              <Skeleton className="mx-2 h-[220px]" />
            ) : barData.length === 0 ? (
              <EmptyNote icon={DocumentChartBarIcon} title="No applications yet" body="Your monthly funding activity will chart here once you submit a request." />
            ) : (
              <div className="absolute inset-x-3 bottom-0 top-3"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }} barGap={4}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
                  {showSubmitted && <Bar dataKey="Submitted" fill={CHART.submitted} radius={[6, 6, 0, 0]} maxBarSize={26} />}
                  {showApproved && <Bar dataKey="Approved" fill={CHART.approved} radius={[6, 6, 0, 0]} maxBarSize={26} />}
                </BarChart>
              </ResponsiveContainer></div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-primary-700">
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART.submitted }} />Submitted</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART.approved }} />Approved</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/idea-submission" className="rounded-lg bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2">
                Submit idea
              </Link>
              <Link to="/recommendations" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-primary-600 dark:bg-primary-800 dark:text-slate-100">
                Find mentor
              </Link>
              <Link to="/funding" className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 dark:border-primary-600 dark:bg-primary-800 dark:text-slate-100">
                Apply for funding
              </Link>
            </div>
          </div>
        </Card>

        {/* AI panel */}
        <section
          className="relative flex flex-col overflow-hidden rounded-2xl bg-primary-800 p-5 text-white shadow-card"
          style={{
            backgroundImage:
              'radial-gradient(circle at 85% 0%, rgba(76,136,132,0.55), transparent 55%), radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
            backgroundSize: 'auto, 14px 14px',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <SparklesIcon className="h-5 w-5 text-accent" />
            </span>
            <div>
              <h2 className="font-heading text-[15px] font-semibold leading-tight">AI recommendations</h2>
              <p className="mt-0.5 text-xs text-white/60">Suggested next moves</p>
            </div>
          </div>
          <EthiopiaMap />
          <nav className="mt-4 space-y-1" aria-label="AI recommendations">
            {[
              { label: 'Matched mentors and funders', to: '/recommendations', Icon: SparklesIcon },
              { label: 'Funding opportunities', to: '/funding', Icon: BanknotesIcon },
              { label: 'Prototype center', to: '/prototype', Icon: CpuChipIcon },
            ].map(({ label, to, Icon }) => (
              <Link
                key={label}
                to={to}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-white/90 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Icon className="h-4 w-4 text-white/55 transition-colors group-hover:text-accent" />
                <span className="flex-1 truncate">{label}</span>
                <ChevronRightIcon className="h-3.5 w-3.5 text-white/30 transition-all group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            ))}
          </nav>
          <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-white/50">
            Recommendations are AI-generated to support, not replace, review by the incubator team.
          </p>
        </section>

        {/* Sector donut */}
        <Card className="flex flex-col">
          <CardHeader title="Startups by sector" subtitle="Your registered startups" />
          {statsLoading ? (
            <div className="p-5"><Skeleton className="mx-auto h-40 w-40 !rounded-full" /></div>
          ) : donutData.length === 0 ? (
            <EmptyNote icon={BuildingOffice2Icon} title="No sectors yet" body="Register a startup to see its sector here." />
          ) : (
            <div className="flex flex-1 flex-col justify-center px-5 pb-5 pt-3">
              <div className="relative">
                <ResponsiveContainer width="100%" height={176}>
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                      {donutData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-heading text-2xl font-semibold leading-none tabular-nums text-slate-900 dark:text-white">{donutTotal}</p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{donutTotal === 1 ? 'startup' : 'startups'}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {donutData.slice(0, 5).map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                      {Math.round((d.value / donutTotal) * 100)}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* Trend + activity */}
      <div className="grid gap-5 xl:grid-cols-[1fr_400px]">
        <Card className="flex flex-col">
          <CardHeader title="Cumulative applications" subtitle="Running total of funding requests submitted and approved" />
          <div className="relative min-h-[260px] flex-1 px-3 pb-4 pt-4">
            {statsLoading ? (
              <Skeleton className="mx-2 h-[220px]" />
            ) : cumulativeData.length === 0 ? (
              <EmptyNote icon={ArrowTrendingUpIcon} title="No trend to show yet" body="This chart fills in as you submit funding requests." />
            ) : (
              <div className="absolute inset-x-3 bottom-4 top-4"><ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cumulativeData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSubmitted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART.submitted} stopOpacity={0.22} />
                      <stop offset="95%" stopColor={CHART.submitted} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: CHART.axis }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTip />} cursor={{ stroke: CHART.axis, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="Total submitted" stroke={CHART.submitted} strokeWidth={2.5} fill="url(#gradSubmitted)" dot={false} activeDot={{ r: 4 }} />
                  <Area type="monotone" dataKey="Total approved" stroke={CHART.approved} strokeWidth={2.5} fill="none" dot={false} activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer></div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Recent activity" subtitle="Drawn from your startup and funding records" action={<TextLink to="/analytics">Analytics</TextLink>} />
          <div className="flex-1 px-5 pt-4">
            {startupLoading && activity.length === 0 ? (
              <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : activity.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs leading-relaxed text-slate-500 dark:border-primary-600 dark:text-slate-400">
                Nothing to show yet. Evaluations, tasks, milestones and event registrations will appear here.
              </p>
            ) : (
              <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-px before:bg-slate-200 dark:before:bg-primary-600">
                {activity.map(({ key, icon: Icon, title, detail, when, to }) => (
                  <li key={key} className="relative">
                    <Link to={to} className="group flex items-start gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                      <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-4 ring-white dark:bg-primary-700 dark:text-primary-100 dark:ring-primary-800">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[13px] font-semibold text-slate-900 group-hover:text-primary-500 dark:text-white">{title}</span>
                          {when && <span className="shrink-0 text-[11px] text-slate-400">{when}</span>}
                        </span>
                        {detail && <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{detail}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {hasStartup && (
            <div className="mt-5 border-t border-slate-100 px-5 py-4 dark:border-primary-700">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Getting started</p>
                <p className="text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">{checklistDone}/{checklist.length}</p>
              </div>
              <ul className="space-y-1">
                {checklist.map(({ done, label, to }) => (
                  <li key={label}>
                    <Link to={to} className="group flex items-center gap-2.5 rounded-md py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 group-hover:border-primary-500'}`}>
                        {done && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </span>
                      <span className={`text-xs ${done ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-primary-500 dark:text-slate-200'}`}>
                        {label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
