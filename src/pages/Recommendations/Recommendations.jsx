import React, { useState } from 'react'
import { XMarkIcon, SparklesIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { useApiData } from '../../services/useApiData.js'
import { mentors as sampleMentors, investors as sampleInvestors, grants as sampleGrants } from '../../data/sampleData.js'

const researchPapers = [
  { id: 1, title: 'Optimizing Edge Computing for IoT', author: 'S. Fomans', takeaway: 'Edge computing cuts latency for real-time IoT decisions.' },
  { id: 2, title: 'Neural Networks and Adoption Curves', author: 'Scott Amare', takeaway: 'Adoption accelerates once inference cost drops below a threshold.' },
]

const startupEvents = [
  { id: 1, day: 26, title: 'Startup Pitch Night', location: 'Online', time: '3:00 PM' },
  { id: 2, day: 17, title: 'Founder Roundtable', location: 'Online', time: '9:00 PM' },
  { id: 3, day: 28, title: 'Demo Day Rehearsal', location: 'Online', time: '3:00 PM' },
]

const courses = [
  { id: 1, title: 'Advanced Product Analytics', progress: 45 },
  { id: 2, title: 'Fundraising Fundamentals', progress: 0 },
]

const aiSuggestions = [
  'Based on your recent milestone, consider connecting with Dr. Evelyn Reed for scaling advice.',
  'A new grant opportunity matches your sector focus — check the deadline on Eco Innovation Grant.',
]

export default function Recommendations() {
  const { data: mentors, loading, isFallback } = useApiData('/api/recommendations/mentors', sampleMentors)
  const { data: investors } = useApiData('/api/recommendations/investors', sampleInvestors)
  const { data: grants } = useApiData('/api/recommendations/grants', sampleGrants)
  const [assistantOpen, setAssistantOpen] = useState(true)

  if (loading) return <LoadingBlock label="Finding your best matches..." />

  return (
    <div className="relative">
      <PageHeader eyebrow="AI Matchmaking" title="My AI Recommendations" />
      {isFallback && <ErrorNotice />}

      <div className={assistantOpen ? 'xl:pr-[340px]' : ''}>
        <section className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Recommended Mentors</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mentors.map((m) => (
              <div key={m.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <span className="h-10 w-10 rounded-full border-4 border-emerald-400 flex items-center justify-center text-[10px] font-semibold text-emerald-600">
                    {m.match}%
                  </span>
                </div>
                <p className="font-medium text-ink dark:text-white">{m.name}</p>
                <p className="text-sm text-slate-500 mb-3">{m.title}</p>
                <button className="btn-outline w-full text-sm">View Profile</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Recommended Investors</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {investors.map((inv) => (
              <div key={inv.id} className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-ink dark:text-white">{inv.name}</p>
                  <p className="text-sm text-slate-500">Focus: {inv.focus}</p>
                  <p className="text-xs text-slate-400">Investment Stage: {inv.stage}</p>
                </div>
                <div className="text-right">
                  <span className="badge bg-emerald-100 text-emerald-700 mb-2 block w-fit ml-auto">{inv.match}% Match</span>
                  <button className="btn-outline text-sm">Connect</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Recommended Grants</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {grants.slice(0, 2).map((g) => (
              <div key={g.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-ink dark:text-white">{g.name}</p>
                  <span className="badge bg-red-100 text-red-600">Deadline: {g.deadline}</span>
                </div>
                <p className="text-sm text-slate-500 mb-3">{g.tags?.join(' · ')}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink dark:text-white">${g.amount.toLocaleString()} max</span>
                  <button className="btn-primary text-sm">Apply Now</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-4">
          <section className="lg:col-span-1">
            <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Research Papers</h2>
            <div className="space-y-3">
              {researchPapers.map((r) => (
                <div key={r.id} className="card p-4">
                  <p className="font-medium text-sm text-ink dark:text-white">{r.title}</p>
                  <p className="text-xs text-slate-400 mb-1.5">By {r.author}</p>
                  <p className="text-xs text-slate-500 mb-2">Key takeaway: {r.takeaway}</p>
                  <button className="text-xs text-primary font-medium">Read More →</button>
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-1">
            <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Startup Events</h2>
            <div className="space-y-3">
              {startupEvents.map((e) => (
                <div key={e.id} className="card p-4 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{e.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink dark:text-white truncate">{e.title}</p>
                    <p className="text-xs text-slate-500">{e.location} · {e.time}</p>
                  </div>
                  <button className="btn-outline text-xs px-3 py-1.5">Register</button>
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-1">
            <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Courses</h2>
            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c.id} className="card p-4">
                  <p className="font-medium text-sm text-ink dark:text-white mb-2">{c.title}</p>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden mb-2">
                    <div className="h-full bg-primary" style={{ width: `${c.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{c.progress === 0 ? 'Not Started' : `${c.progress}% Completed`}</span>
                    <button className="text-xs text-primary font-medium">Continue Learning</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {assistantOpen && (
        <aside className="hidden xl:block fixed top-24 right-8 w-80 card p-5 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-ink dark:text-white">Smart AI Assistant</h2>
            <button onClick={() => setAssistantOpen(false)} className="text-slate-400 hover:text-slate-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent-500 mx-auto mb-4 flex items-center justify-center">
            <SparklesIcon className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-3">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="rounded-xl bg-slate-50 dark:bg-primary-700 p-3.5 text-sm text-slate-600 dark:text-slate-300">
                {s}
                <button className="block text-xs text-primary font-medium mt-1.5">Learn more →</button>
              </div>
            ))}
          </div>
          <input placeholder="Ask the AI assistant..." className="input mt-4 text-sm" />
        </aside>
      )}
    </div>
  )
}
