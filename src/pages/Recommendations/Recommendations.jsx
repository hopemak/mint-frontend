import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { XMarkIcon, SparklesIcon, CalendarDaysIcon, CheckCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { mentorAPI, investorAPI, grantAPI, paperAPI, eventAPI, startupAPI, messageAPI, mlAPI } from '../../services/api.js'

const courses = [
  { id: 1, title: 'Advanced Product Analytics', progress: 45 },
  { id: 2, title: 'Fundraising Fundamentals', progress: 0 },
]

export default function Recommendations() {
  const [startup, setStartup] = useState(null)
  const [mentors, setMentors] = useState([])
  const [investors, setInvestors] = useState([])
  const [grants, setGrants] = useState([])
  const [papers, setPapers] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFallback, setIsFallback] = useState(false)
  const [registeringId, setRegisteringId] = useState(null)
  const [applyingGrantId, setApplyingGrantId] = useState(null)

  const [assistantOpen, setAssistantOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)

  const [mentorModal, setMentorModal] = useState(null)
  const [mentorDetail, setMentorDetail] = useState(null)
  const [mentorDetailLoading, setMentorDetailLoading] = useState(false)
  const [mentorThread, setMentorThread] = useState([])
  const [mentorMsgInput, setMentorMsgInput] = useState('')
  const [mentorMsgSending, setMentorMsgSending] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const { data: startupsRes } = await startupAPI.getMyStartups()
        const startups = (startupsRes && startupsRes.data) ? startupsRes.data : startupsRes
        const primary = Array.isArray(startups) ? startups[0] : null

        if (!primary) {
          if (!cancelled) {
            setStartup(null)
            setMentors([]); setInvestors([]); setGrants([]); setPapers([]); setEvents([])
            setIsFallback(true)
          }
          return
        }
        if (!cancelled) setStartup(primary)

        const startupData = { sector: primary.sector }

        const [mentorRes, investorRes, grantRes, paperRes, eventRes] = await Promise.all([
          mentorAPI.match(startupData),
          investorAPI.match(startupData),
          grantAPI.match(startupData),
          paperAPI.match(startupData),
          eventAPI.getAll(),
        ])

        const mentorMatches = (mentorRes.data && mentorRes.data.data && mentorRes.data.data.matches) || []
        const investorMatches = (investorRes.data && investorRes.data.data && investorRes.data.data.matches) || []
        const grantMatches = (grantRes.data && grantRes.data.data && grantRes.data.data.matches) || []
        const paperMatches = (paperRes.data && paperRes.data.data && paperRes.data.data.matches) || []
        const eventList = (eventRes.data && eventRes.data.data) || []

        if (!cancelled) {
          setMentors(mentorMatches.map((m) => ({
            id: m.mentor_id, name: m.name, title: m.expertise, match: m.match_percentage,
          })))
          setInvestors(investorMatches.map((inv) => ({
            id: inv.investor_id, name: inv.name, focus: inv.focus, stage: inv.stage, match: inv.match_percentage,
          })))
          setGrants(grantMatches.map((g) => ({
            id: g.grant_id, name: g.name, deadline: g.deadline, tags: g.tags || [], amount: g.amount || 0, match: g.match_percentage,
          })))
          setPapers(paperMatches.map((p) => ({
            id: p.paper_id, title: p.title, author: p.author, takeaway: p.takeaway, url: p.url, match: p.match_percentage,
          })))
          setEvents(eventList.map((e) => ({
            id: e.event_id || e.id, day: e.day, title: e.title, location: e.location, time: e.time, registered: e.registered,
          })))
          setIsFallback(false)
        }
      } catch (err) {
        if (!cancelled) {
          setMentors([]); setInvestors([]); setGrants([]); setPapers([]); setEvents([])
          setIsFallback(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleRegister = async (eventId) => {
    setRegisteringId(eventId)
    try {
      await eventAPI.register(eventId)
      setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, registered: true } : e))
      toast.success('Registered')
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, registered: true } : e))
      } else {
        toast.error('Could not register')
      }
    } finally {
      setRegisteringId(null)
    }
  }

  const handleApplyGrant = async (grant) => {
    if (!startup) {
      toast.error('Create a startup first to apply for grants')
      return
    }
    setApplyingGrantId(grant.id)
    try {
      await grantAPI.apply({
        grant_id: grant.id,
        startup_id: startup.startup_id,
        amount_requested: grant.amount,
      })
      toast.success('Application submitted')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Could not submit application'
      toast.error(msg)
    } finally {
      setApplyingGrantId(null)
    }
  }

  const openMentorProfile = async (mentor) => {
    setMentorModal(mentor)
    setMentorDetail(null)
    setMentorThread([])
    setMentorDetailLoading(true)
    try {
      const [detailRes, threadRes] = await Promise.all([
        mentorAPI.getById(mentor.id),
        messageAPI.getThread(mentor.id),
      ])
      const detail = (detailRes.data && detailRes.data.data) || detailRes.data
      const thread = (threadRes.data && threadRes.data.data) || []
      setMentorDetail(detail)
      setMentorThread(Array.isArray(thread) ? thread : [])
    } catch (err) {
      toast.error('Could not load mentor profile')
    } finally {
      setMentorDetailLoading(false)
    }
  }

  const sendMentorMessage = async () => {
    const text = mentorMsgInput.trim()
    if (!text || !mentorModal || mentorMsgSending) return
    setMentorMsgSending(true)
    try {
      await messageAPI.send({ mentor_id: mentorModal.id, text })
      setMentorThread((prev) => [...prev, { from: 'me', text, created_at: new Date().toISOString() }])
      setMentorMsgInput('')
    } catch (err) {
      toast.error('Could not send message')
    } finally {
      setMentorMsgSending(false)
    }
  }

  const sendChatMessage = async () => {
    const text = chatInput.trim()
    if (!text || chatSending) return
    const userMsg = { role: 'user', content: text }
    setChatMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatSending(true)
    try {
      const res = await mlAPI.chat(text, {})
      const reply = res?.data?.data?.reply || "I'm here to help, but I didn't get a clear response that time."
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setChatMessages((prev) => [...prev, {
        role: 'assistant',
        content: "I'm currently offline — but based on your profile, consider checking the mentor matches above for now.",
      }])
    } finally {
      setChatSending(false)
    }
  }

  if (loading) return <LoadingBlock label="Finding your best matches..." />

  return (
    <div className="relative">
      <PageHeader eyebrow="AI Matchmaking" title="My AI Recommendations" />
      {isFallback && <ErrorNotice />}

      <div className={assistantOpen ? 'xl:pr-[340px]' : ''}>
        <section className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Recommended Mentors</h2>
          {mentors.length === 0 ? (
            <p className="text-sm text-slate-500">No mentor matches yet — create a startup to get personalized matches.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {mentors.map((m) => (
                <div key={m.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                      {(m.name || '?').split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </div>
                    <span className="h-10 w-10 rounded-full border-4 border-emerald-400 flex items-center justify-center text-[11px] font-semibold text-emerald-600">
                      {m.match}%
                    </span>
                  </div>
                  <p className="font-medium text-base text-ink dark:text-white">{m.name}</p>
                  <p className="text-sm text-slate-500 mb-3">{m.title}</p>
                  <button onClick={() => openMentorProfile(m)} className="btn-outline w-full text-sm">View Profile</button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Recommended Investors</h2>
          {investors.length === 0 ? (
            <p className="text-sm text-slate-500">No investor matches yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {investors.map((inv) => (
                <div key={inv.id} className="card p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-base text-ink dark:text-white">{inv.name}</p>
                    <p className="text-sm text-slate-500">Focus: {inv.focus}</p>
                    <p className="text-sm text-slate-400">Investment Stage: {inv.stage}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge bg-emerald-100 text-emerald-700 mb-2 block w-fit ml-auto">{inv.match}% Match</span>
                    <button onClick={() => toast('Direct investor messaging is not available yet')} className="btn-outline text-sm">Connect</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Recommended Grants</h2>
          {grants.length === 0 ? (
            <p className="text-sm text-slate-500">No grant matches yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {grants.slice(0, 2).map((g) => (
                <div key={g.id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium text-base text-ink dark:text-white">{g.name}</p>
                    <span className="badge bg-red-100 text-red-600">Deadline: {g.deadline}</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">{g.tags?.join(' · ')}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink dark:text-white">${(g.amount || 0).toLocaleString()} max</span>
                    <button
                      onClick={() => handleApplyGrant(g)}
                      disabled={applyingGrantId === g.id}
                      className="btn-primary text-sm disabled:opacity-50"
                    >
                      {applyingGrantId === g.id ? 'Submitting...' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-4">
          <section className="lg:col-span-1">
            <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Research Papers</h2>
            <div className="space-y-3">
              {papers.length === 0 && <p className="text-sm text-slate-500">No paper matches yet.</p>}
              {papers.map((r) => (
                <div key={r.id} className="card p-4">
                  <p className="font-medium text-sm text-ink dark:text-white">{r.title}</p>
                  <p className="text-xs text-slate-400 mb-1.5">By {r.author}</p>
                  <p className="text-sm text-slate-500 mb-2">Key takeaway: {r.takeaway}</p>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium">Read More →</a>
                  ) : (
                    <span className="text-sm text-slate-400">No link available</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-1">
            <h2 className="font-heading font-semibold text-lg text-ink dark:text-white mb-4">Startup Events</h2>
            <div className="space-y-3">
              {events.length === 0 && <p className="text-sm text-slate-500">No events right now.</p>}
              {events.map((e) => (
                <div key={e.id} className="card p-4 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center shrink-0">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span className="text-xs font-semibold">{e.day}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-ink dark:text-white truncate">{e.title}</p>
                    <p className="text-sm text-slate-500">{e.location} · {e.time}</p>
                  </div>
                  {e.registered ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 px-3 py-1.5">
                      <CheckCircleIcon className="h-4 w-4" /> Registered
                    </span>
                  ) : (
                    <button
                      onClick={() => handleRegister(e.id)}
                      disabled={registeringId === e.id}
                      className="btn-outline text-xs px-3 py-1.5 disabled:opacity-50"
                    >
                      {registeringId === e.id ? 'Registering...' : 'Register'}
                    </button>
                  )}
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
                    <span className="text-sm text-slate-500">{c.progress === 0 ? 'Not Started' : `${c.progress}% Completed`}</span>
                    <button onClick={() => toast('Courses coming soon')} className="text-sm text-primary font-medium">Continue Learning</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {mentorModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setMentorModal(null)}>
          <div className="card w-full max-w-md p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-lg text-ink dark:text-white">{mentorModal.name}</h3>
              <button onClick={() => setMentorModal(null)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {mentorDetailLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-1">{mentorDetail?.expertise || mentorModal.title}</p>
                {mentorDetail?.bio && <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{mentorDetail.bio}</p>}

                <div className="border-t border-slate-100 dark:border-primary-700 pt-4 mt-2">
                  <p className="text-sm font-medium text-ink dark:text-white mb-2">Messages</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                    {mentorThread.length === 0 && <p className="text-sm text-slate-400">No messages yet — say hello.</p>}
                    {mentorThread.map((msg, i) => (
                      <div key={i} className={`rounded-lg p-2.5 text-sm max-w-[85%] ${msg.from === 'me' ? 'bg-primary text-white ml-auto' : 'bg-slate-50 dark:bg-primary-700 text-slate-600 dark:text-slate-300'}`}>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={mentorMsgInput}
                      onChange={(e) => setMentorMsgInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendMentorMessage() }}
                      placeholder="Type a message..."
                      className="input text-sm flex-1"
                      disabled={mentorMsgSending}
                    />
                    <button
                      onClick={sendMentorMessage}
                      disabled={mentorMsgSending || !mentorMsgInput.trim()}
                      className="btn-primary px-3 disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          className="hidden xl:flex fixed top-24 right-8 items-center gap-2 pl-3 pr-4 h-12 rounded-full bg-gradient-to-br from-primary to-accent-500 shadow-lg z-10"
        >
          <SparklesIcon className="h-5 w-5 text-white" />
          <span className="text-sm font-medium text-white">AI Assistant</span>
        </button>
      )}

      {assistantOpen && (
        <aside className="hidden xl:block fixed top-24 right-8 w-80 card p-5 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-ink dark:text-white flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-primary" /> Smart AI Assistant
            </h2>
            <button onClick={() => setAssistantOpen(false)} className="text-slate-400 hover:text-slate-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto mb-3">
            {chatMessages.length === 0 && (
              <p className="text-sm text-slate-500">Ask me anything about your matches or startup.</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`rounded-xl p-3 text-sm max-w-[90%] ${m.role === 'user' ? 'bg-primary text-white ml-auto' : 'bg-slate-50 dark:bg-primary-700 text-slate-600 dark:text-slate-300'}`}>
                {m.content}
              </div>
            ))}
            {chatSending && <div className="text-xs text-slate-400">Thinking...</div>}
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage() }}
              placeholder="Ask the AI assistant..."
              className="input text-sm flex-1"
              disabled={chatSending}
            />
            <button
              onClick={sendChatMessage}
              disabled={chatSending || !chatInput.trim()}
              className="btn-primary px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}
