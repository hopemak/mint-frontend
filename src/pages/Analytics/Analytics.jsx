import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { RocketLaunchIcon, LightBulbIcon, BanknotesIcon, UserGroupIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { PageHeader, StatCard, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { useApiData } from '../../services/useApiData.js'
import { analytics as sampleAnalytics } from '../../data/sampleData.js'

export default function Analytics() {
  const { data, loading, isFallback } = useApiData('/api/analytics', sampleAnalytics)

  if (loading) return <LoadingBlock />

  return (
    <div>
      <PageHeader eyebrow="Insights" title="Innovation Incubator Analytics" />
      {isFallback && <ErrorNotice />}

      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard icon={RocketLaunchIcon} label="Active Startups" value={data.activeStartups} />
        <StatCard icon={LightBulbIcon} label="Ideas Submitted" value={data.ideasSubmitted} />
        <StatCard icon={BanknotesIcon} label="Total Funding" value={data.totalFunding} />
        <StatCard icon={UserGroupIcon} label="Mentors" value={data.mentors} />
        <StatCard icon={BriefcaseIcon} label="Jobs Created" value={data.jobsCreated} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Startup Growth Trends</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.growthTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1D4241" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Funding Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.fundingByStage} dataKey="value" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {data.fundingByStage.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {data.fundingByStage.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />{d.name}
                </span>
                <span className="font-medium text-ink dark:text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Idea Submissions Overview</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.submissionsByQuarter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="q" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="submitted" fill="#1D4241" radius={[6, 6, 0, 0]} name="Submitted" />
              <Bar dataKey="approved" fill="#EF9C82" radius={[6, 6, 0, 0]} name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Startup Success Forecast</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="optimistic" stroke="#1D4241" strokeWidth={2} name="Optimistic" />
              <Line type="monotone" dataKey="base" stroke="#4C8884" strokeWidth={2} name="Base" />
              <Line type="monotone" dataKey="conservative" stroke="#EF9C82" strokeWidth={2} name="Conservative" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Regional Innovation Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700">
                <th className="py-2 pr-4 font-medium">Region</th>
                <th className="py-2 pr-4 font-medium">Innovation Index</th>
                <th className="py-2 pr-4 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {data.regions.map((r) => (
                <tr key={r.region} className="border-b border-slate-50 dark:border-primary-700 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-ink dark:text-white">{r.region}</td>
                  <td className="py-2.5 pr-4 text-slate-500">{r.index}</td>
                  <td className="py-2.5 pr-4 text-emerald-600">+{r.change}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
