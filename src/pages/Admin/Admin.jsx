import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ShieldExclamationIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  UsersIcon,
  BanknotesIcon,
  LightBulbIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock } from '../../components/ui.jsx'
import {
  userAPI,
  auditAPI,
  grantAPI,
  ideaAPI,
  mentorAPI,
  eventAPI,
  fundingAPI,
} from '../../services/api.js'

const statusColor = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  inactive: 'bg-red-100 text-red-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  open: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-100 text-slate-600',
  evaluated: 'bg-primary/10 text-primary',
  new: 'bg-slate-100 text-slate-600',
}

const roleColor = {
  admin: 'bg-primary/10 text-primary',
  mentor: 'bg-accent-100 text-accent-600',
  founder: 'bg-slate-100 text-slate-600',
}

const levelColor = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-emerald-500' }

export default function Admin() {
  const [loading, setLoading] = useState(true)

  const [users, setUsers] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [securityAlerts, setSecurityAlerts] = useState([])
  const [grants, setGrants] = useState([])
  const [grantApps, setGrantApps] = useState([])
  const [fundingRequests, setFundingRequests] = useState([])
  const [ideas, setIdeas] = useState([])
  const [mentors, setMentors] = useState([])
  const [events, setEvents] = useState([])

  const [userQuery, setUserQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [showCreateGrant, setShowCreateGrant] = useState(false)
  const [showCreateMentor, setShowCreateMentor] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
    
  const [grantForm, setGrantForm] = useState({ grant_name: '', program: '', max_amount: '', min_amount: '', deadline: '', sectors: '' })
  const [mentorForm, setMentorForm] = useState({ full_name: '', expertise_areas: '', years_experience: '', email: '', bio: '' })
  const [eventForm, setEventForm] = useState({ title: '', day: '', month: '', year: '', location: '', time: '' })

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [usersRes, logsRes, alertsRes, grantsRes, appsRes, ideasRes, mentorsRes, eventsRes, fundingRes] =
        await Promise.all([
          userAPI.getAll().catch(() => null),
          auditAPI.getLogs().catch(() => null),
          auditAPI.getSecurityAlerts().catch(() => null),
          grantAPI.getAll().catch(() => null),
          grantAPI.getApplications().catch(() => null),
          ideaAPI.getAll().catch(() => null),
          mentorAPI.getAll().catch(() => null),
          eventAPI.getAll().catch(() => null),
          fundingAPI.getAll().catch(() => null),
        ])

      const extractData = (res) => {
        if (!res) return []
        const d = res.data?.data || res.data
        return Array.isArray(d) ? d : []
      }

      setFundingRequests(extractData(fundingRes))
      setUsers(extractData(usersRes))
      setAuditLog(extractData(logsRes))
      setSecurityAlerts(extractData(alertsRes))
      setGrants(extractData(grantsRes))
      setGrantApps(extractData(appsRes))
      setIdeas(extractData(ideasRes))
      setMentors(extractData(mentorsRes))
      setEvents(extractData(eventsRes))
    } catch (err) {
      console.error('Admin load error:', err)
      toast.error('Some data could not load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const handleRoleChange = async (userId, newRole) => {
    try {
      await userAPI.updateRole(userId, newRole)
      setUsers((prev) => prev.map((u) => (u.id === userId || u._id === userId) ? { ...u, role: newRole } : u))
      toast.success('Role updated')
    } catch (err) {
      toast.error('Could not update role')
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await userAPI.updateStatus(userId, newStatus)
      setUsers((prev) => prev.map((u) => (u.id === userId || u._id === userId) ? { ...u, status: newStatus } : u))
      toast.success('Status updated')
    } catch (err) {
      toast.error('Could not update status')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return
    try {
      await userAPI.delete(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId && u._id !== userId))
      toast.success('User deleted')
    } catch (err) {
      toast.error('Could not delete user')
    }
  }

  const handleGrantDecision = async (appId, status) => {
    try {
      await grantAPI.updateApplicationStatus(appId, status)
      setGrantApps((prev) => prev.map((g) => (g.id === appId || g._id === appId) ? { ...g, status } : g))
      toast.success(`Application ${status}`)
    } catch (err) {
      toast.error('Could not update application')
    }
  }

  const handleFundingApprove = async (requestId, amount) => {
    try {
      await fundingAPI.approve(requestId, amount)
      setFundingRequests((prev) => prev.map((r) => r.request_id === requestId ? { ...r, status: 'approved', approved_amount: amount } : r))
      toast.success('Funding approved')
    } catch (err) {
      toast.error('Could not approve funding request')
    }
  }

  const handleFundingReject = async (requestId) => {
    const reason = window.prompt('Reason for rejection (optional):', '') || 'Not specified'
    try {
      await fundingAPI.reject(requestId, reason)
      setFundingRequests((prev) => prev.map((r) => r.request_id === requestId ? { ...r, status: 'rejected' } : r))
      toast.success('Funding rejected')
    } catch (err) {
      toast.error('Could not reject funding request')
    }
  }

  const handleCreateGrant = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        grant_name: grantForm.grant_name,
        program: grantForm.program || 'General Funding',
        max_amount: Number(grantForm.max_amount),
        min_amount: Number(grantForm.min_amount) || 0,
        deadline: grantForm.deadline,
        sectors: grantForm.sectors ? grantForm.sectors.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }
      await grantAPI.create(payload)
      toast.success('Grant created')
      setShowCreateGrant(false)
      setGrantForm({ grant_name: '', program: '', max_amount: '', min_amount: '', deadline: '', sectors: '' })
      loadAll()
    } catch (err) {
      toast.error('Could not create grant')
    }
  }

  const handleDeleteGrant = async (id) => {
    if (!window.confirm('Delete this grant?')) return
    try {
      await grantAPI.delete(id)
      setGrants((prev) => prev.filter((g) => g.id !== id && g._id !== id))
      toast.success('Grant deleted')
    } catch (err) {
      toast.error('Could not delete grant')
    }
  }

  const handleCreateMentor = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        full_name: mentorForm.full_name,
        expertise_areas: mentorForm.expertise_areas.split(',').map((t) => t.trim()).filter(Boolean),
        years_experience: Number(mentorForm.years_experience),
        email: mentorForm.email || '',
        bio: mentorForm.bio || '',
      }
      await mentorAPI.create(payload)
      toast.success('Mentor added')
      setShowCreateMentor(false)
      setMentorForm({ full_name: '', expertise_areas: '', years_experience: '', email: '', bio: '' })
      loadAll()
    } catch (err) {
      toast.error('Could not add mentor')
    }
  }

  const handleDeleteMentor = async (id) => {
    if (!window.confirm('Remove this mentor?')) return
    try {
      await mentorAPI.delete(id)
      setMentors((prev) => prev.filter((m) => m.id !== id && m._id !== id))
      toast.success('Mentor removed')
    } catch (err) {
      toast.error('Could not remove mentor')
    }
  }

  const handleCreateEvent = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title: eventForm.title,
        day: eventForm.day,
        month: eventForm.month,
        year: eventForm.year,
        location: eventForm.location,
        time: eventForm.time,
      }
      await eventAPI.create(payload)
      toast.success('Event created')
      setShowCreateEvent(false)
      setEventForm({ title: '', day: '', month: '', year: '', location: '', time: '' })
      loadAll()
    } catch (err) {
      toast.error('Could not create event')
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Cancel this event?')) return
    try {
      await eventAPI.delete(id)
      setEvents((prev) => prev.filter((ev) => ev.id !== id && ev._id !== id))
      toast.success('Event cancelled')
    } catch (err) {
      toast.error('Could not cancel event')
    }
  }

  const handleEvaluateIdea = async (ideaId) => {
    try {
      const res = await ideaAPI.evaluate(ideaId)
      const score = res.data?.data?.overall_score || res.data?.overall_score
      toast.success(`Evaluated! Score: ${score || 'N/A'}`)
      loadAll()
    } catch (err) {
      toast.error('Evaluation failed')
    }
  }

  const handleApproveIdea = async (id) => {
    try {
      await ideaAPI.update(id, { status: 'approved' })
      toast.success('Idea approved')
      loadAll()
    } catch (err) {
      toast.error('Could not approve idea')
    }
  }

  const handleRejectIdea = async (id) => {
    try {
      await ideaAPI.update(id, { status: 'rejected' })
      toast.success('Idea rejected')
      loadAll()
    } catch (err) {
      toast.error('Could not reject idea')
    }
  }

  const handleDeleteIdea = async (id) => {
    if (!window.confirm('Delete this idea?')) return
    try {
      await ideaAPI.delete(id)
      setIdeas((prev) => prev.filter((i) => i.id !== id && i._id !== id))
      toast.success('Idea deleted')
    } catch (err) {
      toast.error('Could not delete idea')
    }
  }

  const filteredUsers = users.filter((u) =>
    (u.full_name || u.name || '').toLowerCase().includes(userQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userQuery.toLowerCase())
  )

  const pendingGrants = grantApps.filter((g) => (g.status || '').toLowerCase() === 'pending')

  if (loading) return <div className="p-5"><LoadingBlock /></div>

  return (
    <div className="space-y-16 pb-20">
      <PageHeader eyebrow="Administration" title="Admin Control Center" />

      {/* --- PLATFORM OVERVIEW --- */}
      <section>
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          Platform Overview
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="card p-4">
            <p className="text-3xl font-bold text-primary">{users.length}</p>
            <p className="text-sm text-slate-500">Total Users</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-emerald-600">{users.filter((u) => u.status === 'active').length} Active</span>
              <span className="text-amber-600">{users.filter((u) => u.status === 'pending').length} Pending</span>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-3xl font-bold text-primary">{ideas.length}</p>
            <p className="text-sm text-slate-500">Ideas Submitted</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-primary">{ideas.filter((i) => i.status === 'evaluated').length} Evaluated</span>
              <span className="text-slate-400">{ideas.filter((i) => i.status !== 'evaluated').length} Pending</span>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-3xl font-bold text-primary">{grants.length}</p>
            <p className="text-sm text-slate-500">Grant Programs</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-amber-600">{pendingGrants.length} Pending Apps</span>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-3xl font-bold text-primary">{mentors.length}</p>
            <p className="text-sm text-slate-500">Active Mentors</p>
            <div className="mt-2 flex gap-2 text-xs">
              <span className="text-emerald-600">{events.length} Upcoming Events</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <button onClick={() => document.getElementById('grants-section').scrollIntoView({ behavior: 'smooth' })} className="card p-4 text-left hover:border-primary transition-colors">
            <BanknotesIcon className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-ink dark:text-white">Create Grant</p>
            <p className="text-xs text-slate-500">Launch a new funding program</p>
          </button>
          <button onClick={() => document.getElementById('mentors-section').scrollIntoView({ behavior: 'smooth' })} className="card p-4 text-left hover:border-primary transition-colors">
            <AcademicCapIcon className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-ink dark:text-white">Add Mentor</p>
            <p className="text-xs text-slate-500">Onboard a new industry expert</p>
          </button>
          <button onClick={() => document.getElementById('events-section').scrollIntoView({ behavior: 'smooth' })} className="card p-4 text-left hover:border-primary transition-colors">
            <CalendarDaysIcon className="h-6 w-6 text-primary mb-2" />
            <p className="font-medium text-ink dark:text-white">Schedule Event</p>
            <p className="text-xs text-slate-500">Workshop, demo day, or meeting</p>
          </button>
        </div>
      </section>

      {/* --- USER MANAGEMENT --- */}
      <section>
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          User Management
        </h2>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3"><p className="text-sm text-slate-500">Manage registered users, roles, and account status.</p><button onClick={() => window.location.href="/register"} className="btn btn-primary text-xs flex items-center gap-1"><PlusIcon className="h-3 w-3" /> Add User</button></div>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search users..."
              className="input pl-9 w-56 text-sm"
            />
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700 bg-slate-50 dark:bg-primary-800">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, ui) => {
                  const id = u.id || u._id
                  const isEditing = editingUserId === id
                  return (
                    <tr key={id || 'user-' + ui} className="border-b border-slate-50 dark:border-primary-700 last:border-0 hover:bg-slate-50/50 dark:hover:bg-primary-800/50">
                      <td className="px-5 py-3.5 font-medium text-ink dark:text-white">{u.full_name || u.name}</td>
                      <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <select
                            value={u.role || 'founder'}
                            onChange={(e) => handleRoleChange(id, e.target.value)}
                            className="input !py-1 !text-xs"
                          >
                            <option value="founder">Founder</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`badge ${roleColor[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role || 'founder'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <select
                            value={u.status || 'active'}
                            onChange={(e) => handleStatusChange(id, e.target.value)}
                            className="input !py-1 !text-xs"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`badge ${statusColor[u.status] || 'bg-slate-100 text-slate-600'}`}>{u.status || 'active'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          <button
                            onClick={() => setEditingUserId(isEditing ? null : id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700"
                            title={isEditing ? 'Done' : 'Edit'}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <p className="p-5 text-sm text-slate-400 text-center">No users found.</p>
          )}
        </div>
      </section>

      {/* --- GRANTS & FUNDING --- */}
      <section id="grants-section">
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          Grants & Funding
        </h2>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Create grant programs and review funding applications.</p>
          <button onClick={() => setShowCreateGrant(!showCreateGrant)} className="btn btn-primary text-sm flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> New Grant Program
          </button>
        </div>

        {showCreateGrant && (
          <form onSubmit={handleCreateGrant} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input required placeholder="Grant name" className="input text-sm" value={grantForm.grant_name} onChange={(e) => setGrantForm({ ...grantForm, grant_name: e.target.value })} />
            <input required placeholder="Program" className="input text-sm" value={grantForm.program} onChange={(e) => setGrantForm({ ...grantForm, program: e.target.value })} />
            <input required type="number" placeholder="Max Amount" className="input text-sm" value={grantForm.max_amount} onChange={(e) => setGrantForm({ ...grantForm, max_amount: e.target.value })} />
            <input type="number" placeholder="Min Amount" className="input text-sm" value={grantForm.min_amount} onChange={(e) => setGrantForm({ ...grantForm, min_amount: e.target.value })} />
            <input required type="date" className="input text-sm" value={grantForm.deadline} onChange={(e) => setGrantForm({ ...grantForm, deadline: e.target.value })} />
            <input required placeholder="Sectors (comma separated)" className="input text-sm" value={grantForm.sectors} onChange={(e) => setGrantForm({ ...grantForm, sectors: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
              <button type="button" onClick={() => setShowCreateGrant(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
              <button type="submit" className="btn btn-primary text-sm flex-1">Create</button>
            </div>
          </form>
        )}

        <h3 className="font-heading text-lg font-semibold text-ink dark:text-white mb-3">Active Programs</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {grants.map((g) => (
            <div key={g.id || g._id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-ink dark:text-white truncate">{g.grant_name || g.name || 'Unnamed'}</p>
                  <p className="text-xs text-slate-500">{g.program || g.type || 'General'} - Max: ${(g.max_amount || g.amount || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">Min: ${(g.min_amount || 0).toLocaleString()} - Deadline: {g.deadline || 'TBD'}</p>
                </div>
                <button onClick={() => handleDeleteGrant(g.grant_id || g.id || g._id)} className="p-1 text-slate-400 hover:text-red-500 shrink-0">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {(g.sectors || g.tags || []).map((t, tIdx) => (
                  <span key={t + '-' + tIdx} className="text-xs bg-slate-100 dark:bg-primary-700 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
          {grants.length === 0 && <p className="text-sm text-slate-400 col-span-full">No grant programs yet.</p>}
        </div>

        <h3 className="font-heading text-lg font-semibold text-ink dark:text-white mb-3">Pending Applications ({pendingGrants.length})</h3>
        <div className="space-y-2">
          {pendingGrants.map((g) => (
            <div key={g.id || g._id} className="card p-3 flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-ink dark:text-white truncate">{g.grant_name || g.grant_id || 'Unknown Grant'}</p>
                <p className="text-xs text-slate-500">${(g.amount_requested || g.amount || 0).toLocaleString()} - {g.applicant_name || g.applicant_email || 'Unknown applicant'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleGrantDecision(g.id || g._id, 'approved')} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-medium" title="Approve">
                  <CheckIcon className="h-4 w-4" /> <span>Approve</span>
                </button>
                <button onClick={() => handleGrantDecision(g.id || g._id, 'rejected')} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium" title="Reject">
                  <XMarkIcon className="h-4 w-4" /> <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
          {pendingGrants.length === 0 && <p className="text-sm text-slate-400">No pending applications.</p>}
        </div>
      </section>
      {/* --- FUNDING REQUESTS --- */}
      <section id="funding-section">
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          Funding Requests
        </h2>
        <p className="text-sm text-slate-500 mb-4">Review and decide on founder funding requests.</p>
        <div className="space-y-2">
          {fundingRequests.filter((r) => r.status === 'pending').map((r) => (
            <div key={r.id || r._id} className="card p-3 flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-ink dark:text-white truncate">{r.stage || 'Funding Request'}</p>
                <p className="text-xs text-slate-500">${(r.amount || 0).toLocaleString()} requested {r.user_id ? `- user: ${r.user_id}` : ''}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => handleFundingApprove(r.request_id, r.amount)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-medium" title="Approve">
                  <CheckIcon className="h-4 w-4" /> <span>Approve</span>
                </button>
                <button onClick={() => handleFundingReject(r.request_id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium" title="Reject">
                  <XMarkIcon className="h-4 w-4" /> <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
          {fundingRequests.filter((r) => r.status === 'pending').length === 0 && (
            <p className="text-sm text-slate-400">No pending funding requests.</p>
          )}
        </div>
      </section>

      {/* --- IDEAS & STARTUPS --- */}
      <section>
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          Ideas Management
        </h2>
        <p className="text-sm text-slate-500 mb-4">Review submitted ideas and run AI evaluations.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ideas.map((idea) => (
            <div key={idea.id || idea._id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-ink dark:text-white truncate">{idea.title || 'Untitled'}</p>
                  <p className="text-xs text-slate-500">{idea.industry || idea.sector || 'General'} - Innovation: {idea.innovation_level || 'N/A'}/10</p>
                </div>
                <span className={`badge shrink-0 ${statusColor[idea.status?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>{idea.status || 'pending'}</span>
              </div>
              <p className="text-sm text-slate-500 mt-2 line-clamp-2">{idea.problem || idea.description || 'No description'}</p>
              <div className="flex gap-2 mt-2">
                {idea.status !== 'approved' && idea.status !== 'rejected' && (
                  <button onClick={() => handleApproveIdea(idea.id || idea._id)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">Approve</button>
                )}
                {idea.status === 'approved' && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">✓ Approved</span>
                )}
                {idea.status !== 'rejected' && idea.status !== 'approved' && (
                  <button onClick={() => handleRejectIdea(idea.id || idea._id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Reject</button>
                )}
                {idea.status === 'rejected' && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">✗ Rejected</span>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEvaluateIdea(idea.id || idea._id)}
                  className="btn btn-primary text-xs flex-1"
                  disabled={idea.status === 'evaluated'}
                >
                  {idea.status === 'evaluated' ? '✓ Evaluated' : 'Run AI Evaluation'}
                </button>
                <button onClick={() => handleDeleteIdea(idea.id || idea._id || idea.idea_id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {ideas.length === 0 && <p className="text-sm text-slate-400 col-span-full">No ideas submitted yet.</p>}
        </div>
      </section>

      {/* --- MENTOR MANAGEMENT --- */}
      <section id="mentors-section">
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          Mentor Management
        </h2>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Add and manage industry mentors for the incubator.</p>
          <button onClick={() => setShowCreateMentor(!showCreateMentor)} className="btn btn-primary text-sm flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> Add Mentor
          </button>
        </div>

        {showCreateMentor && (
          <form onSubmit={handleCreateMentor} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input required placeholder="Full name" className="input text-sm" value={mentorForm.full_name} onChange={(e) => setMentorForm({ ...mentorForm, full_name: e.target.value })} />
            <input required type="number" placeholder="Years of experience" className="input text-sm" value={mentorForm.years_experience} onChange={(e) => setMentorForm({ ...mentorForm, years_experience: e.target.value })} />
            <input required placeholder="Expertise areas (comma separated)" className="input text-sm sm:col-span-2" value={mentorForm.expertise_areas} onChange={(e) => setMentorForm({ ...mentorForm, expertise_areas: e.target.value })} />
            <input placeholder="Email" className="input text-sm" value={mentorForm.email} onChange={(e) => setMentorForm({ ...mentorForm, email: e.target.value })} />
            <input placeholder="Bio (optional)" className="input text-sm sm:col-span-2 lg:col-span-6" value={mentorForm.bio} onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
              <button type="button" onClick={() => setShowCreateMentor(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
              <button type="submit" className="btn btn-primary text-sm flex-1">Create</button>
            </div>
          </form>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mentors.map((m) => (
            <div key={m.id || m._id} className="card p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink dark:text-white">{m.full_name || m.name || 'Unnamed'}</p>
                  <p className="text-xs text-slate-500">{m.bio || m.title || 'Mentor'}</p>
                </div>
                <button onClick={() => handleDeleteMentor(m.mentor_id || m.id || m._id)} className="p-1 text-slate-400 hover:text-red-500">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span>{m.years_experience || m.years || 0} years</span>
                <span className="text-amber-500">★ {m.rating || 'N/A'}</span>
                <span>{m.email || 'N/A'}</span>
              </div>
              {m.expertise && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {m.expertise.split(',').map((ex, exIdx) => (
                    <span key={ex} className="text-xs bg-slate-100 dark:bg-primary-700 text-slate-500 px-2 py-0.5 rounded-full">{ex.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {mentors.length === 0 && <p className="text-sm text-slate-400 col-span-full">No mentors added yet.</p>}
        </div>
      </section>

      {/* --- EVENT MANAGEMENT --- */}
      <section id="events-section">
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          Event Management
        </h2>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Schedule workshops, demo days, and meetings.</p>
          <button onClick={() => setShowCreateEvent(!showCreateEvent)} className="btn btn-primary text-sm flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" /> Schedule Event
          </button>
        </div>

        {showCreateEvent && (
          <form onSubmit={handleCreateEvent} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input required placeholder="Event title" className="input text-sm" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
            <input
              required
              type="date"
              className="input text-sm"
              onChange={(e) => {
                const [y, m, d] = e.target.value.split('-')
                setEventForm({ ...eventForm, year: y, month: String(Number(m)), day: String(Number(d)) })
              }}
            />
            <input required placeholder="Location" className="input text-sm" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
            <input required type="time" placeholder="Time" className="input text-sm" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
              <button type="button" onClick={() => setShowCreateEvent(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
              <button type="submit" className="btn btn-primary text-sm flex-1">Create</button>
            </div>
          </form>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((ev, evIdx) => (
            <div key={ev.id || ev._id || 'event-' + evIdx} className="card p-4">
              <div className={`h-14 w-full rounded-lg flex items-center justify-center mb-3 ${ev.type === 'Workshop' ? 'bg-primary-700' : ev.type === 'Meeting' ? 'bg-primary-400' : ev.type === 'Demo Day' ? 'bg-accent-500' : 'bg-primary'}`}>
                <CalendarDaysIcon className="h-7 w-7 text-white/90" />
              </div>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-ink dark:text-white truncate">{ev.title || 'Untitled Event'}</p>
                  <p className="text-xs text-slate-500">{ev.time || ev.type || 'TBD'} - {ev.when ? new Date(ev.when).toLocaleString() : 'TBD'}</p>
                  <p className="text-xs text-slate-400 mt-1">{ev.location || 'Location TBD'} - {ev.registered_users ? ev.registered_users.length : (ev.attendees || 0)} max</p>
                </div>
                <button onClick={() => handleDeleteEvent(ev.id || ev._id)} className="p-1 text-slate-400 hover:text-red-500 shrink-0">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && <p className="text-sm text-slate-400 col-span-full">No events scheduled.</p>}
        </div>
      </section>

      {/* --- AUDIT LOG & SECURITY --- */}
      <section>
        <h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-primary-700 pb-3">
          Audit Log & Security
        </h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-heading text-lg font-semibold text-ink dark:text-white mb-3">Recent Audit Activity</h3>
            {auditLog.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {auditLog.map((a, i) => (
                  <div key={a.id || i} className="flex gap-2.5 text-sm">
                    <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-ink dark:text-white">{a.action || a.title}</p>
                      <p className="text-xs text-slate-500">
                        {a.user_id ? `User: ${a.user_id} - ` : ''}
                        {a.timestamp ? new Date(a.timestamp).toLocaleString() : a.time || ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-heading text-lg font-semibold text-ink dark:text-white mb-3">Security Alerts</h3>
            {securityAlerts.length === 0 ? (
              <p className="text-sm text-slate-400">No active alerts. System secure.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {securityAlerts.map((s, i) => (
                  <div key={s.id || i} className="flex gap-2.5 text-sm">
                    <ShieldExclamationIcon className={`h-5 w-5 mt-0.5 shrink-0 ${levelColor[s.level?.toLowerCase()] || 'text-slate-400'}`} />
                    <div>
                      <p className="font-medium text-ink dark:text-white">{s.title || s.action}</p>
                      <p className="text-xs text-slate-500">{s.detail || s.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
