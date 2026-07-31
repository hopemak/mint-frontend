import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { TrophyIcon } from '@heroicons/react/24/outline'
import { PageHeader } from '../../components/ui.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const achievements = [
  { title: 'Primary Trophy', detail: 'Completed the first incubation milestone.' },
  { title: 'Success Trophy', detail: 'Closed a funding round successfully.' },
  { title: 'Mentor Trophy', detail: 'Completed 10 mentorship sessions.' },
  { title: 'Launch Trophy', detail: 'Shipped a working prototype.' },
]

const skills = ['Product Strategy', 'FinTech', 'AI/ML', 'Fundraising', 'Go-to-Market', 'Team Building']

const fundingHistory = [
  { month: 'Jan', amount: 40000 }, { month: 'Mar', amount: 65000 }, { month: 'May', amount: 55000 },
  { month: 'Jul', amount: 120000 }, { month: 'Sep', amount: 95000 }, { month: 'Nov', amount: 175000 },
]

export default function Profile() {
  const { user } = useAuth()

  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile" />
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-6 text-center lg:col-span-1 h-fit">
          <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-4">
            {(user?.name || 'John Doe').split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <h2 className="font-heading text-xl font-semibold text-ink dark:text-white">{user?.name || 'John Doe'}</h2>
          <span className="badge bg-gradient-to-r from-primary to-accent-500 text-white mt-2">
            {user?.role || 'Innovator'} · FinTech · Mentor
          </span>

          <div className="mt-6 text-left">
            <p className="text-sm font-medium text-ink dark:text-white mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="badge bg-primary/10 text-primary">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Achievements</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {achievements.map((a) => (
                <div key={a.title} className="flex gap-3 rounded-xl border border-slate-100 dark:border-primary-700 p-3.5">
                  <TrophyIcon className="h-8 w-8 text-accent shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-ink dark:text-white">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-4">Funding History</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fundingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="amount" fill="#1D4241" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Mentorship History</h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <div><p className="font-medium text-ink dark:text-white">Session with Dr. Evelyn Reed</p><p className="text-xs text-slate-500">Discussed go-to-market for Q3</p></div>
              </div>
              <div className="flex gap-3">
                <span className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                <div><p className="font-medium text-ink dark:text-white">Session with Amesal Katin</p><p className="text-xs text-slate-500">Reviewed the funding pitch deck</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
