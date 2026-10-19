import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  ChevronRightIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
  LightBulbIcon,
  CpuChipIcon,
  FlagIcon,
  ArrowRightIcon,
  PlusIcon,
  ExclamationCircleIcon,
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
  kpiTrend as fbTrend,
  fundingDonut as fbDonut,
  upcomingEvents as fbEvents,
} from '../../data/sampleData.js'

// ─── Constants ──────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#1D4241', '#4C8884', '#EF9C82', '#C7DAD8']

const TRL_LABELS = ['Basic Research', 'Technology Concept', 'Experimental Proof', 'Lab Validation',
  'Relevant Environment', 'Relevant Demo', 'System Prototype', 'System Complete', 'Proven System']

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt$(n) {
  if (!n && n !== 0) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function formatEventDate(e) {
  if (!e) return ''
  try {
    const d = new Date(Number(e.year), Number(e.month) - 1, Number(e.day))
    const today = new Date()
    const diff = Math.round((d - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff > 0 && diff <= 7) return `In ${diff} days`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch { return '' }
}

function SkeletonBlock({ className = '' }) {
  return <div className={`rounded-lg bg-slate-100 dark:bg-primary-700 animate-pulse ${className}`} />
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, tone, link, loading }) {
  const toneMap = {
    primary:  { icon: 'bg-primary/10 text-primary',        value: 'text-primary'      },
    emerald:  { icon: 'bg-emerald-100 text-emerald-600',   value: 'text-emerald-600'  },
    amber:    { icon: 'bg-amber-100 text-amber-600',       value: 'text-amber-600'    },
    sky:      { icon: 'bg-sky-100 text-sky-600',           value: 'text-sky-600'      },
    accent:   { icon: 'bg-accent/15 text-accent-600',      value: 'text-accent-600'   },
  }
  const t = toneMap[tone] || toneMap.primary
  const inner = (
    <div className="card p-5 flex items-center gap-4 hover:shadow-soft transition-shadow h-full">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${t.icon}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {loading
          ? <SkeletonBlock className="h-6 w-24 mt-1" />
          : <p className={`text-2xl font-heading font-bold ${t.value}`}>{value}</p>}
        {sub && !loading && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {link && <ChevronRightIcon className="h-4 w-4 text-slate-300 shrink-0" />}
    </div>
  )
  return link ? <Link to={link} className="block h-full">{inner}</Link> : inner
}

// ─── Quick action button ────────────────────────────────────────────────────────

function QuickAction({ icon: Icon, label, to, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary/10 text-primary hover:bg-primary hover:text-white',
    accent:  'bg-accent/15 text-accent-600 hover:bg-accent hover:text-white',
    emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-500 hover:text-white',
    sky:     'bg-sky-100 text-sky-700 hover:bg-sky-500 hover:text-white',
  }
  return (
    <Link to={to}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group ${tones[tone]}`}>
      <div className="h-9 w-9 rounded-xl flex items-center justify-center">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xs font-semibold text-center leading-tight">{label}</span>
    </Link>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth()

  // ── Remote data ───────────────────────────────────────────────────────────────
  const [statsLoading, setStatsLoading]   = useState(true)
  const [stats, setStats]                 = useState(null)
  const [trends, setTrends]               = useState(null)
  const [analytics, setAnalytics]         = useState(null)
  const [events, setEvents]               = useState(null)   // null = not yet loaded
  const [myStartup, setMyStartup]         = useState(null)
  const [myTasks, setMyTasks]             = useState([])
  const [myMilestones, setMyMilestones]   = useState([])
  const [lastEval, setLastEval]           = useState(null)
  const [startupLoading, setStartupLoading] = useState(true)

  // ── Load dashboard stats + trends + analytics ─────────────────────────────────
  useEffect(() => {
    let alive = true
    async function fetchStats() {
      setStatsLoading(true)
      const [sr, tr, ar] = await Promise.all([
        dashboardAPI.getStats().catch(() => null),
        dashboardAPI.getTrends().catch(() => null),
        dashboardAPI.getAnalytics().catch(() => null),
      ])
      if (!alive) return
      if (sr?.data?.data)  setStats(sr.data.data)
      if (tr?.data?.data)  setTrends(tr.data.data)
      if (ar?.data?.data)  setAnalytics(ar.data.data)
      setStatsLoading(false)
    }
    fetchStats()
    return () => { alive = false }
  }, [])

  // ── Load events ───────────────────────────────────────────────────────────────
  useEffect(() => {
    eventAPI.getAll()
      .then(res => {
        const list = res.data?.data || []
        const now  = new Date()
        const upcoming = list
          .map(e => ({ ...e, _date: new Date(Number(e.year), Number(e.month)-1, Number(e.day)) }))
          .filter(e => !isNaN(e._date) && e._date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
          .sort((a, b) => a._date - b._date)
          .slice(0, 4)
        setEvents(upcoming)
      })
      .catch(() => setEvents([]))
  }, [])

  // ── Load founder's startup + tasks + milestones + last evaluation ─────────────
  useEffect(() => {
    let alive = true
    async function fetchStartup() {
      setStartupLoading(true)
      try {
        const res = await startupAPI.getMyStartups()
        const list = res.data?.data || []
        if (!alive || !list.length) { setStartupLoading(false); return }
        const s = list[0]
        setMyStartup(s)
        const [tasksRes, msRes, evalRes] = await Promise.all([
          taskAPI.getAll(s.startup_id).catch(() => null),
          milestoneAPI.list(s.startup_id).catch(() => null),
          evaluationAPI.getMy().catch(() => null),
        ])
        if (!alive) return
        setMyTasks(tasksRes?.data?.data || [])
        setMyMilestones(msRes?.data?.milestones || [])
        const evals = evalRes?.data?.data || []
        setLastEval(evals[0] || null)
      } catch { /* silent */ }
      finally { if (alive) setStartupLoading(false) }
    }
    fetchStartup()
    return () => { alive = false }
  }, [])

  // ── Derived values ─────────────────────────────────────────────────────────────
  const userName     = user?.full_name || user?.name || 'Founder'
  const firstName    = userName.split(' ')[0]
  const hour         = new Date().getHours()
  const greeting     = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const doneTasks    = myTasks.filter(t => t.column === 'done').length
  const totalTasks   = myTasks.length
  const donePct      = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0
  const nextMs       = [...myMilestones].filter(m => !m.completed).sort((a,b) => (a.date||'').localeCompare(b.date||''))[0]

  const trl          = parseInt(myStartup?.trl_level || myStartup?.trl || 0, 10) || 0

  // Chart data
  const progressData = trends
    ? trends.labels.map((m, i) => ({ month: m, applications: trends.applications[i], approvals: trends.approvals[i] }))
    : fbProgress.map(p => ({ month: p.month, applications: Math.round(p.progress * 0.6), approvals: Math.round(p.progress * 0.4) }))

  const donutData = analytics?.sector_distribution
    ? Object.entries(analytics.sector_distribution).map(([name, value], i) => ({ name, value, color: CHART_COLORS[i % CHART_COLORS.length] }))
    : fbDonut

  const areaData = trends
    ? trends.labels.map((m, i) => ({ month: m, funding: trends.applications[i] * 15000 }))
    : fbProgress.map(p => ({ month: p.month, funding: p.progress * 8000 }))

  const totalDonut = donutData.reduce((s, d) => s + d.value, 0)

  // KPI values (real > fallback)
  const kpiTotalStartups = stats?.total_startups ?? fbKpis.totalStartups
  const kpiMentors       = stats?.mentors_active ?? fbKpis.activeMentors
  const kpiFunding       = stats?.total_funding  ?? 0
  const kpiSuccess       = stats?.success_rate   ?? fbKpis.successRate

  const hasStartup = !startupLoading && !!myStartup

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Hero welcome ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary via-primary-700 to-primary-800 text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4 overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, #EF9C82 0%, transparent 55%)' }} />
        <div className="relative">
          <p className="text-sm text-white/60 font-medium">{greeting},</p>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold mt-0.5">{firstName} 👋</h1>
          {myStartup && (
            <p className="text-sm text-white/70 mt-1">
              You're building <span className="font-semibold text-white">{myStartup.business_name}</span>
              {' · '}{myStartup.sector}{' · '}TRL {trl}/9
            </p>
          )}
          {!hasStartup && !startupLoading && (
            <p className="text-sm text-white/70 mt-1">Let's get your startup journey started.</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap relative">
          {!hasStartup && !startupLoading && (
            <Link to="/startups/create" className="btn bg-accent text-primary-800 hover:bg-accent-500 font-semibold gap-1.5">
              <PlusIcon className="h-4 w-4" /> Create Startup
            </Link>
          )}
          <Link to="/evaluate" className="btn bg-white/15 text-white hover:bg-white/25 gap-1.5 border border-white/20">
            <SparklesIcon className="h-4 w-4" /> Run AI Evaluation
          </Link>
        </div>
      </div>

      {/* ── KPI stat row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BuildingOffice2Icon} label="My Startups"      value={kpiTotalStartups} sub="registered"           tone="primary" link="/startups"       loading={statsLoading} />
        <StatCard icon={UserGroupIcon}       label="Active Mentors"   value={kpiMentors}       sub="available to match"   tone="sky"     link="/recommendations" loading={statsLoading} />
        <StatCard icon={BanknotesIcon}       label="Funding Approved" value={fmt$(kpiFunding)} sub="across my requests"   tone="emerald" link="/funding"         loading={statsLoading} />
        <StatCard icon={ArrowTrendingUpIcon} label="Success Rate"     value={`${kpiSuccess}%`} sub="approved / submitted" tone="accent"  link="/analytics"       loading={statsLoading} />
      </div>

      {/* ── My startup progress strip ────────────────────────────────── */}
      {hasStartup && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-0.5">Current Startup</p>
              <h2 className="font-heading font-semibold text-ink dark:text-white">{myStartup.business_name}</h2>
            </div>
            <Link to="/prototype" className="btn-outline text-sm gap-1.5">
              Open Workspace <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Task progress */}
            <div className="rounded-xl bg-slate-50 dark:bg-primary-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CpuChipIcon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-ink dark:text-white">Build Progress</p>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="font-heading text-2xl font-bold text-primary">{donePct}%</span>
                <span className="text-xs text-slate-500">{doneTasks}/{totalTasks} done</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-primary-600 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${donePct >= 80 ? 'bg-emerald-500' : donePct >= 40 ? 'bg-primary' : 'bg-amber-400'}`}
                  style={{ width: `${donePct}%` }} />
              </div>
              {totalTasks === 0 && (
                <Link to="/prototype" className="text-xs text-primary mt-2 block hover:underline">Add tasks →</Link>
              )}
            </div>

            {/* TRL */}
            <div className="rounded-xl bg-slate-50 dark:bg-primary-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-sky-100 flex items-center justify-center">
                  <RocketLaunchIcon className="h-4 w-4 text-sky-600" />
                </div>
                <p className="text-sm font-semibold text-ink dark:text-white">Technology Readiness</p>
              </div>
              <p className="font-heading text-2xl font-bold text-sky-600 mb-2">
                TRL {trl}<span className="text-sm font-normal text-slate-400">/9</span>
              </p>
              <div className="grid grid-cols-9 gap-0.5">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className={`h-2 rounded-sm ${i < trl ? 'bg-sky-500' : 'bg-slate-200 dark:bg-primary-600'}`} />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {trl > 0 ? TRL_LABELS[trl - 1] : 'Set TRL on your startup page'}
              </p>
            </div>

            {/* Next milestone */}
            <div className="rounded-xl bg-slate-50 dark:bg-primary-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <FlagIcon className="h-4 w-4 text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-ink dark:text-white">Next Milestone</p>
              </div>
              {nextMs ? (
                <>
                  <p className="text-sm font-semibold text-ink dark:text-white leading-snug">{nextMs.title}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0" />
                    {nextMs.date ? new Date(nextMs.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                </>
              ) : (
                <div>
                  <p className="text-xs text-slate-400 mb-2">No milestones yet.</p>
                  <Link to="/prototype" className="text-xs text-primary hover:underline">Add a milestone →</Link>
                </div>
              )}
              {myMilestones.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-2">
                  {myMilestones.filter(m => m.completed).length}/{myMilestones.length} completed
                </p>
              )}
            </div>
          </div>

          {/* Last evaluation score */}
          {lastEval && (
            <div className="mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <CheckCircleSolid className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink dark:text-white">
                  Last AI Evaluation: <span className="text-primary">{lastEval.overall_score}/100</span>
                  <span className={`ml-2 badge text-xs ${lastEval.overall_score >= 85 ? 'bg-emerald-100 text-emerald-700' : lastEval.overall_score >= 70 ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                    {lastEval.rating}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{lastEval.title}</p>
              </div>
              <Link to="/evaluate" className="btn-outline text-xs gap-1">
                Re-evaluate <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── No startup onboarding card ────────────────────────────────── */}
      {!hasStartup && !startupLoading && (
        <div className="card p-6 border-2 border-dashed border-slate-200 dark:border-primary-700 text-center">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <LightBulbIcon className="h-6 w-6 text-primary" />
          </div>
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-1">Create your first startup</h2>
          <p className="text-sm text-slate-500 mb-4 max-w-sm mx-auto">
            Register your startup to unlock the full MInT platform — AI evaluation, prototype tools, funding, mentors, and more.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/startups/create" className="btn-primary gap-2"><PlusIcon className="h-4 w-4" /> Create Startup</Link>
            <Link to="/idea-submission" className="btn-outline gap-2"><LightBulbIcon className="h-4 w-4" /> Submit an Idea First</Link>
          </div>
        </div>
      )}

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <div>
        <h2 className="font-heading font-semibold text-ink dark:text-white mb-3 text-sm uppercase tracking-wide text-slate-400">Quick Actions</h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <QuickAction icon={LightBulbIcon}       label="Submit Idea"       to="/idea-submission"  tone="primary" />
          <QuickAction icon={SparklesIcon}         label="AI Evaluation"     to="/evaluate"         tone="accent"  />
          <QuickAction icon={UserGroupIcon}        label="Find Mentor"       to="/recommendations"  tone="sky"     />
          <QuickAction icon={BanknotesIcon}        label="Apply Funding"     to="/funding"          tone="emerald" />
          <QuickAction icon={RocketLaunchIcon}     label="Prototype Center"  to="/prototype"        tone="primary" />
          <QuickAction icon={AcademicCapIcon}      label="Pitch Coach"       to="/pitch-coach"      tone="accent"  />
          <QuickAction icon={CpuChipIcon}          label="Workspace"         to="/workspace"        tone="sky"     />
          <QuickAction icon={ArrowTrendingUpIcon}  label="Analytics"         to="/analytics"        tone="emerald" />
        </div>
      </div>

      {/* ── Charts row ───────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Funding trend area chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Funding Activity</h2>
            <span className="badge bg-emerald-100 text-emerald-700 text-xs">Monthly</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Funding requests submitted over time</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1D4241" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1D4241" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }} />
              <Area type="monotone" dataKey="funding" stroke="#1D4241" fill="url(#fundGrad)" strokeWidth={2} name="Amount ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Applications bar chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Applications</h2>
            <span className="badge bg-primary/10 text-primary text-xs">Submitted vs Approved</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">Monthly funding requests and approvals</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={progressData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }} />
              <Bar dataKey="applications" fill="#1D4241"  radius={[4,4,0,0]} name="Submitted" />
              <Bar dataKey="approvals"    fill="#EF9C82"  radius={[4,4,0,0]} name="Approved"  />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector donut */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Sector Mix</h2>
            <span className="badge bg-sky-100 text-sky-700 text-xs">By startup</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">Distribution of your startups by sector</p>
          <div className="relative">
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={donutData} dataKey="value" innerRadius={38} outerRadius={55} paddingAngle={3}>
                  {donutData.map((d, i) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E2E8F0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="font-heading text-lg font-bold text-ink dark:text-white">{totalDonut}</p>
                <p className="text-[10px] text-slate-400">total</p>
              </div>
            </div>
          </div>
          <div className="space-y-1 mt-1">
            {donutData.slice(0, 3).map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-semibold text-ink dark:text-white">
                  {totalDonut ? Math.round((d.value / totalDonut) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row: Events + Activity ────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Upcoming events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-ink dark:text-white flex items-center gap-2">
              <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
              Upcoming Events
            </h2>
            <Link to="/recommendations" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              See all <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {events === null ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="h-11 w-11 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-40" />
                    <SkeletonBlock className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No upcoming events right now.</p>
              <p className="text-xs text-slate-400 mt-0.5">Check back later or contact your program manager.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((e, i) => {
                const dateLabel = formatEventDate(e)
                const isToday = dateLabel === 'Today'
                const iconBgs = ['bg-primary/10 text-primary', 'bg-accent/15 text-accent-600', 'bg-sky-100 text-sky-600', 'bg-emerald-100 text-emerald-600']
                return (
                  <div key={e.event_id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-primary-700/20 ${isToday ? 'bg-primary/5 border border-primary/10' : ''}`}>
                    <div className={`h-11 w-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${iconBgs[i % iconBgs.length]}`}>
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span className="text-[10px] font-bold mt-0.5">{e.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink dark:text-white truncate">{e.title}</p>
                      <p className="text-xs text-slate-500">{e.location} · {e.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`badge text-[10px] font-semibold ${isToday ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-primary-700 text-slate-600 dark:text-slate-300'}`}>
                        {dateLabel}
                      </span>
                      {e.registered && (
                        <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                          <CheckCircleSolid className="h-3 w-3" /> Registered
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Platform activity + next steps */}
        <div className="card p-5 flex flex-col gap-5">

          {/* Next steps (if startup exists) */}
          {hasStartup && (
            <div>
              <h2 className="font-heading font-semibold text-ink dark:text-white mb-3 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-slate-400" />
                Recommended Next Steps
              </h2>
              <div className="space-y-2">
                {[
                  { done: totalTasks > 0,           label: 'Add tasks to your Kanban board',            link: '/prototype'      },
                  { done: myMilestones.length > 0,   label: 'Set a milestone with a target date',        link: '/prototype'      },
                  { done: !!lastEval,                label: 'Run your first AI evaluation',              link: '/evaluate'       },
                  { done: trl > 0,                   label: 'Set your Technology Readiness Level (TRL)', link: '/startups'       },
                  { done: kpiFunding > 0,            label: 'Submit a funding request',                  link: '/funding'        },
                ].map(({ done, label, link }) => (
                  <Link key={label} to={link}
                    className={`flex items-center gap-3 p-2.5 rounded-xl group hover:bg-slate-50 dark:hover:bg-primary-700/20 transition-colors ${done ? 'opacity-60' : ''}`}>
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-primary-500 group-hover:border-primary'}`}>
                      {done && <CheckIcon className="h-3 w-3 text-white" />}
                    </div>
                    <p className={`text-sm flex-1 ${done ? 'line-through text-slate-400' : 'text-ink dark:text-white'}`}>{label}</p>
                    {!done && <ChevronRightIcon className="h-4 w-4 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Platform tips if no startup yet */}
          {!hasStartup && !startupLoading && (
            <div>
              <h2 className="font-heading font-semibold text-ink dark:text-white mb-3 flex items-center gap-2">
                <LightBulbIcon className="h-5 w-5 text-slate-400" />
                Get Started
              </h2>
              <div className="space-y-2">
                {[
                  { label: 'Register your startup',            link: '/startups/create',  Icon: BuildingOffice2Icon },
                  { label: 'Submit an idea for AI evaluation', link: '/idea-submission',  Icon: LightBulbIcon       },
                  { label: 'Explore available grants',         link: '/funding',          Icon: BanknotesIcon       },
                  { label: 'Find a mentor match',              link: '/recommendations',  Icon: UserGroupIcon       },
                ].map(({ label, link, Icon }) => (
                  <Link key={label} to={link}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-primary-700/20 transition-colors group">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-ink dark:text-white flex-1">{label}</p>
                    <ChevronRightIcon className="h-4 w-4 text-slate-300 group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI recommendations nudge */}
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/10 p-4 mt-auto">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <SparklesIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink dark:text-white">AI Recommendations ready</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get matched with mentors, investors, and grants tailored to your startup.
                </p>
              </div>
            </div>
            <Link to="/recommendations"
              className="btn-primary text-sm w-full mt-3 gap-1.5 justify-center">
              View My Matches <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple CheckIcon inline (avoid extra import)
function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
