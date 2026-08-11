import React, { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, PaperAirplaneIcon, CheckIcon, XMarkIcon, CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { useApiData } from '../../services/useApiData.js'
import { sessionAPI, mentorAPI, messageAPI, startupAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import { mentors as sampleMentors } from '../../data/sampleData.js'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

const industries = ['Technology', 'Healthcare', 'Finance', 'Sustainability']
const skills = ['Product Strategy', 'Fundraising', 'Marketing', 'Engineering']
const countries = [
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'UK', name: 'UK', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
]
const companyLogos = ['bg-primary-700', 'bg-primary-400', 'bg-accent-500', 'bg-primary-300']

const days = Array.from({ length: 31 }, (_, i) => i + 1)
const highlighted = [10, 11, 14, 15, 20]

export default function Mentors() {
  const { data, loading, isFallback } = useApiData('/api/mentors/', sampleMentors)
  const [search, setSearch] = useState('')
  const [requestingId, setRequestingId] = useState(null)
  const [experience, setExperience] = useState([])
  const [experienceRange, setExperienceRange] = useState(50)
  const [selectedIndustries, setSelectedIndustries] = useState([])
  const [selectedSkills, setSelectedSkills] = useState(['Engineering'])
  const [country, setCountry] = useState(countries[0])
  const [activeMentor, setActiveMentor] = useState(null)
  const [chatThread, setChatThread] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [profileModal, setProfileModal] = useState(null)
  const [profileDetail, setProfileDetail] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const { user } = useAuth()
  const [matchById, setMatchById] = useState({})
  const [mySessionRequests, setMySessionRequests] = useState([])
  const today = new Date()
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth())
  const [calendarYear, setCalendarYear] = useState(today.getFullYear())

  useEffect(() => {
    async function loadMatchAndSessions() {
      try {
        const { data: myStartupsRes } = await startupAPI.getMyStartups()
        const myStartups = (myStartupsRes && myStartupsRes.data) ? myStartupsRes.data : myStartupsRes
        const startup = Array.isArray(myStartups) ? myStartups[0] : null
        if (startup) {
          const { data: matchRes } = await mentorAPI.match({ sector: startup.sector })
          const matches = (matchRes.data && matchRes.data.matches) || []
          setMatchById(Object.fromEntries(matches.map((m) => [m.mentor_id, m.match_percentage])))
        }
      } catch (err) {
        // matching is best-effort
      }
      try {
        const { data: myRequestsRes } = await sessionAPI.mine()
        const requests = (myRequestsRes && myRequestsRes.data) ? myRequestsRes.data : []
        setMySessionRequests(requests)
      } catch (err) {
        // best-effort
      }
    }
    loadMatchAndSessions()
  }, [])

  const changeMonth = (delta) => {
    let m = calendarMonth + delta
    let y = calendarYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setCalendarMonth(m)
    setCalendarYear(y)
  }

  const highlightedDays = mySessionRequests
    .map((r) => new Date(r.created_at))
    .filter((d) => d.getFullYear() === calendarYear && d.getMonth() === calendarMonth)
    .map((d) => d.getDate())

  const calendarDays = Array.from({ length: daysInMonth(calendarYear, calendarMonth) }, (_, i) => i + 1)

  const startVideoMeeting = () => {
    if (!activeMentor) {
      toast.error('Select a mentor to message first, then start a video meeting.')
      return
    }
    const mentorId = activeMentor.mentor_id || activeMentor.id
    const userId = user?.id || 'guest'
    const roomName = `mint-${mentorId}-${userId}`.replace(/[^a-zA-Z0-9-]/g, '')
    window.open(`https://meet.jit.si/${roomName}`, '_blank', 'noopener,noreferrer')
  }

  const toggle = (list, setList, value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const asText = (v) => Array.isArray(v) ? v.join(' ') : (v || '')

  const filteredMentors = data.filter((m) => {
    const name = asText(m.full_name || m.name).toLowerCase()
    const expertise = asText(m.expertise_areas || m.title).toLowerCase()
    if (search && !name.includes(search.toLowerCase()) && !expertise.includes(search.toLowerCase())) return false
    if (selectedIndustries.length > 0 && !selectedIndustries.some((i) => (m.preferred_sectors || []).includes(i))) return false
    if (selectedSkills.length > 0 && !selectedSkills.some((s) => expertise.includes(s.toLowerCase()))) return false
    if (experience.length > 0) {
      const years = m.years_experience ?? m.years ?? 0
      const bucket = years <= 3 ? '0-3 years' : years <= 7 ? '4-7 years' : '8+ years'
      if (!experience.includes(bucket)) return false
    }
    return true
  })

  const handleRequestSession = async (mentor) => {
    const id = mentor.mentor_id || mentor.id
    setRequestingId(id)
    try {
      await sessionAPI.request(id)
      toast.success('Session requested')
    } catch (err) {
      if (err?.response?.status === 409) {
        toast('Already requested')
      } else {
        toast.error('Could not request session')
      }
    } finally {
      setRequestingId(null)
    }
  }

  const openChat = async (mentor) => {
    setActiveMentor(mentor)
    setChatThread([])
    setChatLoading(true)
    try {
      const id = mentor.mentor_id || mentor.id
      const res = await messageAPI.getThread(id)
      const thread = (res.data && res.data.data) || []
      setChatThread(Array.isArray(thread) ? thread : [])
    } catch (err) {
      toast.error('Could not load conversation')
    } finally {
      setChatLoading(false)
    }
  }

  const sendChat = async (e) => {
    e.preventDefault()
    const text = chatInput.trim()
    if (!text || !activeMentor || chatSending) return
    setChatSending(true)
    try {
      const id = activeMentor.mentor_id || activeMentor.id
      await messageAPI.send(id, text)
      setChatThread((prev) => [...prev, { from: 'me', text }])
      setChatInput('')
    } catch (err) {
      toast.error('Could not send message')
    } finally {
      setChatSending(false)
    }
  }

  const openProfile = async (mentor) => {
    setProfileModal(mentor)
    setProfileDetail(null)
    setProfileLoading(true)
    try {
      const id = mentor.mentor_id || mentor.id
      const res = await mentorAPI.getById(id)
      const detail = (res.data && res.data.data) || res.data
      setProfileDetail(detail)
    } catch (err) {
      toast.error('Could not load profile')
    } finally {
      setProfileLoading(false)
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Mentorship" title="Find Your Mentor" />
      {isFallback && <ErrorNotice />}

      <div className="grid xl:grid-cols-[260px_1fr_300px] gap-4">
        {/* Filters */}
        <aside className="card p-5 h-fit space-y-5">
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search mentors..." className="input pl-9 text-sm" />
          </div>

          <div>
            <p className="text-sm font-medium text-ink dark:text-white mb-2">Experience</p>
            <input
              type="range"
              min="0"
              max="100"
              value={experienceRange}
              onChange={(e) => setExperienceRange(Number(e.target.value))}
              className="w-full accent-primary mb-2"
            />
            <div className="space-y-1.5">
              {['0-3 years', '4-7 years', '8+ years'].map((e) => (
                <label key={e} className="flex items-center gap-2 text-sm text-slate-500">
                  <input type="checkbox" checked={experience.includes(e)} onChange={() => toggle(experience, setExperience, e)} className="accent-primary" />
                  {e}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink dark:text-white mb-2">Industry</p>
            <div className="space-y-1.5">
              {industries.map((i) => (
                <label key={i} className="flex items-center gap-2 text-sm text-slate-500">
                  <input type="checkbox" checked={selectedIndustries.includes(i)} onChange={() => toggle(selectedIndustries, setSelectedIndustries, i)} className="accent-primary" />
                  {i}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink dark:text-white mb-2">Country</p>
            <div className="input text-sm flex items-center gap-2 mb-2 cursor-default">
              <span>{country.flag}</span> {country.name}
            </div>
            <div className="flex flex-wrap gap-2">
              {countries.filter((c) => c.code !== country.code).map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c)}
                  className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-primary"
                >
                  <span>{c.flag}</span> {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink dark:text-white mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => {
                const active = selectedSkills.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => toggle(selectedSkills, setSelectedSkills, s)}
                    className={`badge flex items-center gap-1 cursor-pointer ${active ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-primary-700 text-slate-500'}`}
                  >
                    {active && <CheckIcon className="h-3 w-3" />} {s}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => {
              setSearch('')
              setExperience([])
              setSelectedIndustries([])
              setSelectedSkills([])
            }}
            className="btn-outline w-full text-sm"
          >
            Clear Filters
          </button>
        </aside>

        {/* Mentor grid */}
        {loading ? (
          <LoadingBlock />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
            {filteredMentors.map((m) => {
              const name = m.full_name || m.name || 'Unnamed Mentor'
              const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('')
              const years = m.years_experience ?? m.years
              const expertise = asText(m.expertise_areas || m.title)
              const match = matchById[m.mentor_id || m.id]
              return (
              <div key={m.mentor_id || m.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-ink dark:text-white">{name}</p>
                    {expertise && <p className="text-xs text-slate-400">{expertise}</p>}
                    {years != null && <p className="text-xs text-slate-500">{years}+ Years Experience</p>}
                  </div>
                </div>
                {m.rating != null && <p className="text-xs text-amber-500 mb-3">★ {m.rating}</p>}
                <p className="text-xs text-slate-400 mb-1.5">Company Logos</p>
                <div className="flex gap-1.5 mb-3">
                  {companyLogos.map((c, i) => (
                    <span key={i} className={`h-5 w-5 rounded-full ${c}`} />
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Availability</p>
                    {m.availability === 'available' ? (
                      <span className="badge bg-emerald-100 text-emerald-700">Available This Week</span>
                    ) : m.availability ? (
                      <span className="badge bg-accent-100 text-accent-700">Next Availability: {m.nextDate}</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-500 dark:bg-primary-700">Contact to check</span>
                    )}
                  </div>
                  {match != null && (
                    <div className="h-12 w-12 rounded-full border-4 border-primary-300 text-primary flex flex-col items-center justify-center text-[10px] font-semibold shrink-0">
                      {match}% <span className="text-[8px] font-normal">Match</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => openProfile(m)} className="btn-outline flex-1 text-xs">View Profile</button>
                  <button onClick={() => openChat(m)} className="btn-outline flex-1 text-xs">Message</button>
                  <button
                    onClick={() => handleRequestSession(m)}
                    disabled={requestingId === (m.mentor_id || m.id)}
                    className="btn-primary flex-1 text-xs disabled:opacity-50"
                  >
                    {requestingId === (m.mentor_id || m.id) ? 'Requesting...' : 'Request Session'}
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* Chat */}
        <aside className="space-y-4">
          <div className="card p-4">
            {!activeMentor ? (
              <p className="text-sm text-slate-400">Click a mentor's "Message" button to start chatting.</p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {asText(activeMentor.full_name || activeMentor.name).split(' ').map((p) => p[0]).slice(0, 2).join('')}
                  </div>
                  <p className="font-medium text-sm text-ink dark:text-white truncate">{activeMentor.full_name || activeMentor.name}</p>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
                  {chatLoading && <p className="text-xs text-slate-400">Loading...</p>}
                  {!chatLoading && chatThread.length === 0 && <p className="text-xs text-slate-400">No messages yet — say hello.</p>}
                  {chatThread.map((m, i) => (
                    <div key={i} className={`text-xs rounded-xl px-3 py-2 max-w-[85%] ${m.from === 'me' ? 'bg-primary text-white ml-auto' : 'bg-slate-100 dark:bg-primary-700 text-ink dark:text-slate-100'}`}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <form onSubmit={sendChat} className="flex gap-1.5">
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="input text-xs py-2" placeholder="Type a message..." disabled={chatSending} />
                  <button type="submit" disabled={chatSending || !chatInput.trim()} className="btn-primary px-2.5 disabled:opacity-50"><PaperAirplaneIcon className="h-4 w-4" /></button>
                </form>
              </>
            )}
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-sm text-ink dark:text-white">{monthNames[calendarMonth]} {calendarYear}</p>
              <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-primary-700"><ChevronLeftIcon className="h-4 w-4 text-slate-400" /></button>
                <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-primary-700"><ChevronRightIcon className="h-4 w-4 text-slate-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((d) => (
                <span key={d} className={`h-7 w-7 flex items-center justify-center rounded-full mx-auto ${highlightedDays.includes(d) ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                  {d}
                </span>
              ))}
            </div>
            {highlightedDays.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-2">Highlighted days have a session request.</p>
            )}
          </div>

          <button onClick={startVideoMeeting} className="btn-accent w-full text-sm">
            <VideoCameraIcon className="h-4 w-4" /> Start Video Meeting
          </button>
        </aside>
      </div>
      {profileModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setProfileModal(null)}>
          <div className="card w-full max-w-md p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-lg text-ink dark:text-white">{profileModal.full_name || profileModal.name}</h3>
              <button onClick={() => setProfileModal(null)} className="text-slate-400 hover:text-slate-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {profileLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-1">{asText(profileDetail?.expertise_areas)}</p>
                {profileDetail?.years_experience != null && (
                  <p className="text-sm text-slate-500 mb-1">{profileDetail.years_experience}+ years experience</p>
                )}
                {profileDetail?.bio && <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">{profileDetail.bio}</p>}
                {profileDetail?.preferred_sectors && profileDetail.preferred_sectors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {profileDetail.preferred_sectors.map((s) => (
                      <span key={s} className="badge bg-primary-100 text-primary-700 dark:bg-primary-700 dark:text-accent-200">{s}</span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
