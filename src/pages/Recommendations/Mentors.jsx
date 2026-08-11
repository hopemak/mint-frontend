import React, { useState } from 'react'
import { MagnifyingGlassIcon, VideoCameraIcon, PaperAirplaneIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { useApiData } from '../../services/useApiData.js'
import { sessionAPI } from '../../services/api.js'
import toast from 'react-hot-toast'
import { mentors as sampleMentors } from '../../data/sampleData.js'

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
  const [chat, setChat] = useState([{ id: 1, from: 'mentor', text: 'Hi! Happy to help — what would you like to talk through this week?' }])
  const [input, setInput] = useState('')

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

  const sendChat = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setChat((c) => [...c, { id: Date.now(), from: 'me', text: input }])
    setInput('')
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
                  {m.match != null && (
                    <div className="h-12 w-12 rounded-full border-4 border-primary-300 text-primary flex flex-col items-center justify-center text-[10px] font-semibold shrink-0">
                      {m.match}% <span className="text-[8px] font-normal">Match</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn-outline flex-1 text-xs">View Profile</button>
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

        {/* Chat + calendar */}
        <aside className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">DR</div>
              <p className="font-medium text-sm text-ink dark:text-white">Dr. Evelyn Reed</p>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-2">
              {chat.map((m) => (
                <div key={m.id} className={`text-xs rounded-xl px-3 py-2 max-w-[85%] ${m.from === 'me' ? 'bg-primary text-white ml-auto' : 'bg-slate-100 dark:bg-primary-700 text-ink dark:text-slate-100'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={sendChat} className="flex gap-1.5">
              <input value={input} onChange={(e) => setInput(e.target.value)} className="input text-xs py-2" placeholder="Type a message..." />
              <button className="btn-primary px-2.5"><PaperAirplaneIcon className="h-4 w-4" /></button>
            </form>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-sm text-ink dark:text-white">Monthly</p>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-primary-700"><ChevronLeftIcon className="h-4 w-4 text-slate-400" /></button>
                <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-primary-700"><ChevronRightIcon className="h-4 w-4 text-slate-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-400 mb-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {days.map((d) => (
                <span key={d} className={`h-7 w-7 flex items-center justify-center rounded-full mx-auto ${highlighted.includes(d) ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          <button className="btn-accent w-full text-sm">
            <VideoCameraIcon className="h-4 w-4" /> Start Video Meeting
          </button>
        </aside>
      </div>
    </div>
  )
}
