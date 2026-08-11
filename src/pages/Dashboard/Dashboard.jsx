import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  SparklesIcon,
  ChevronRightIcon,
  UserGroupIcon,
  BellAlertIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useAuth } from '../../context/AuthContext.jsx'
import { dashboardAPI } from '../../services/api.js'
import {
  kpis as fallbackKpis,
  startupProgress as fallbackStartupProgress,
  kpiTrend as fallbackKpiTrend,
  fundingDonut as fallbackFundingDonut,
  upcomingEvents as fallbackUpcomingEvents,
  activityFeed as fallbackActivityFeed,
} from '../../data/sampleData.js'

const activityIcons = [RocketLaunchIcon, BellAlertIcon, SparklesIcon]

const eventTone = [
  { icon: AcademicCapIcon, bg: 'bg-primary-700' },
  { icon: CalendarDaysIcon, bg: 'bg-primary-400' },
  { icon: AcademicCapIcon, bg: 'bg-accent-500' },
]

const COLORS = ['#1D4241', '#4C8884', '#EF9C82', '#C7DAD8', '#8B5CF6', '#10B981', '#F59E0B']

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [trends, setTrends] = useState(null)
  const [analytics, setAnalytics] = useState(null)

  // Fallback data
  const kpis = stats || fallbackKpis
  const startupProgress = trends
    ? trends.labels.map((m, i) => ({ month: m, progress: trends.applications[i] }))
    : fallbackStartupProgress
  const kpiTrend = trends
    ? trends.labels.map((m, i) => ({ month: m, sessions: trends.applications[i] * 30000, ideas: trends.approvals[i] * 10 }))
    : fallbackKpiTrend
  const fundingDonut = analytics
    ? Object.entries(analytics.sector_distribution || {}).slice(0, 4).map(([name, value], i) => ({
        name,
        value,
        color: COLORS[i % COLORS.length],
      }))
    : fallbackFundingDonut
  const upcomingEvents = fallbackUpcomingEvents
  const activityFeed = fallbackActivityFeed

  const totalFunds = fundingDonut.reduce((sum, d) => sum + d.value, 0)
  const totalRaised = ((stats?.total_funding || fallbackKpis.totalFunding) / 1e6).toFixed(1)

  useEffect(() => {
    let mounted = true
    async function fetchDashboard() {
      try {
        setLoading(true)
        const [statsRes, trendsRes, analyticsRes] = await Promise.all([
          dashboardAPI.getStats().catch(() => null),
          dashboardAPI.getTrends().catch(() => null),
          dashboardAPI.getAnalytics().catch(() => null),
        ])
        if (!mounted) return
        if (statsRes?.data?.data) setStats(statsRes.data.data)
        if (trendsRes?.data?.data) setTrends(trendsRes.data.data)
        if (analyticsRes?.data?.data) setAnalytics(analyticsRes.data.data)
      } catch (e) {
        console.warn('Dashboard fetch failed, using fallback data:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchDashboard()
    return () => { mounted = false }
  }, [])

  const userName = user?.full_name || user?.name || 'Innovation Leader'

  return (
    <div>
      {/* Welcome + Upcoming Events */}
      <div className="grid lg:grid-cols-4 gap-4 mb-4 items-start">
        <div className="lg:col-span-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-ink dark:text-white">
            Welcome, {userName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Current status is powered by <span className="text-emerald-600 font-medium">● {loading ? 'Loading...' : 'Success'}</span>.
            {stats && (
              <span className="ml-2 text-xs text-slate-400">
                ({stats.total_startups || 0} startups · {stats.mentors_active || 0} mentors)
              </span>
            )}
          </p>
        </div>

        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Upcoming Events</h2>
            <Link to="#" className="text-sm text-primary font-medium">See all</Link>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Stay on top of workshops and mentor meetings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingEvents.map((e, i) => {
              const tone = eventTone[i % eventTone.length]
              const Icon = tone.icon
              return (
                <div
                  key={e.id}
                  className="rounded-xl border border-slate-100 dark:border-primary-700 p-3 flex flex-col gap-2"
                >
                  <div className={`h-20 w-full rounded-lg flex items-center justify-center ${tone.bg}`}>
                    <Icon className="h-8 w-8 text-white/90" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-ink dark:text-white leading-snug">{e.title}</p>
                    <p className="text-xs text-slate-500">{e.type} · Meetings</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400">{e.when}</span>
                    <span className="flex items-center gap-1 text-xs text-primary font-medium">
                      <UserGroupIcon className="h-3.5 w-3.5" />
                      {e.attendees}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Startup Progress + AI Recommendations + Funding Status */}
      <div className="grid lg:grid-cols-4 gap-4 mb-4 items-stretch">
        <div className="lg:col-span-2 card p-5 flex flex-col">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Startup Progress Bar Chart</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={startupProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="progress" fill="#1D4241" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Link to="/idea-submission" className="btn bg-primary text-white hover:bg-primary-700 text-sm">Submit Idea</Link>
            <Link to="/recommendations" className="btn bg-primary-400 text-white hover:bg-primary-500 text-sm">Find Mentor</Link>
            <Link to="/funding" className="btn bg-emerald-500 text-white hover:bg-emerald-600 text-sm">Apply for Funding</Link>
          </div>
        </div>

        <div className="card p-5 bg-gradient-to-br from-primary-700 to-primary-800 text-white flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
              <SparklesIcon className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-heading font-semibold">AI Recommendations</h2>
          </div>
          <div className="space-y-2">
            <Link to="/recommendations" className="flex items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 px-4 py-3 text-sm transition-colors">
              AI Recommendations <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link to="/analytics" className="flex items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 px-4 py-3 text-sm transition-colors">
              Reports &amp; Notifications <ChevronRightIcon className="h-4 w-4" />
            </Link>
            <Link to="/funding" className="flex items-center justify-between rounded-xl bg-white/10 hover:bg-white/15 px-4 py-3 text-sm transition-colors">
              Apply for Funding <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
          {stats && (
            <div className="mt-auto pt-4 border-t border-white/10">
              <p className="text-xs text-white/70">Success Rate: <span className="font-semibold">{stats.success_rate}%</span></p>
              <p className="text-xs text-white/70">Jobs Created: <span className="font-semibold">{stats.total_jobs_created}</span></p>
            </div>
          )}
        </div>

        <div className="card p-5 flex flex-col">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-2">Funding Status Donut Chart</h2>
          <div className="relative">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={fundingDonut} dataKey="value" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {fundingDonut.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="font-heading text-lg font-semibold text-ink dark:text-white">${totalRaised}M</p>
              <p className="text-xs text-slate-500">Funds Raised</p>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {fundingDonut.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-ink dark:text-white">
                  {Math.round((d.value / totalFunds) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Performance Metrics + Activity Feed */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Key Performance Metrics</h2>
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Key Indicators
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={kpiTrend}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4241" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1D4241" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="sessions" stroke="#1D4241" fill="url(#colorSessions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={kpiTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#1D4241" radius={[6, 6, 0, 0]} />
                <Bar dataKey="ideas" fill="#EF9C82" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Activity Feed</h2>
            <Link to="#" className="text-sm text-primary font-medium">View all</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Link to="/idea-submission" className="btn w-full bg-primary text-white hover:bg-primary-700 text-sm">Submit Idea</Link>
              <Link to="/recommendations" className="btn w-full bg-primary-400 text-white hover:bg-primary-500 text-sm">Find Mentor</Link>
              <Link to="/funding" className="btn w-full bg-emerald-500 text-white hover:bg-emerald-600 text-sm">Apply for Funding</Link>
            </div>
            <div className="relative pl-6">
              <div className="absolute left-2.5 top-1 bottom-1 w-px bg-slate-100 dark:bg-primary-700" />
              <div className="space-y-4">
                {activityFeed.map((a, i) => {
                  const Icon = activityIcons[i % activityIcons.length]
                  return (
                    <div key={a.id} className="relative">
                      <div className="absolute -left-6 top-0 h-5 w-5 rounded-full bg-primary/10 dark:bg-primary-700 text-primary dark:text-accent-200 flex items-center justify-center ring-4 ring-white dark:ring-primary-800">
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-ink dark:text-white">{a.title}</p>
                        <span className="text-xs text-slate-400 shrink-0">{a.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{a.detail}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
