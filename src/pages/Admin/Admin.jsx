import React, { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, PencilSquareIcon, TrashIcon, ShieldExclamationIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock, ErrorNotice } from '../../components/ui.jsx'
import { userAPI, auditAPI, grantAPI } from '../../services/api.js'

const statusColor = { active: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', inactive: 'bg-red-100 text-red-700' }
const roleColor = { admin: 'bg-primary/10 text-primary', mentor: 'bg-accent-100 text-accent-600', founder: 'bg-slate-100 text-slate-600' }
const levelColor = { high: 'text-red-500', medium: 'text-amber-500', low: 'text-emerald-500' }

export default function Admin() {
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [auditLog, setAuditLog] = useState([])
  const [securityAlerts, setSecurityAlerts] = useState([])
  const [grantApps, setGrantApps] = useState([])
  const [isFallback, setIsFallback] = useState(false)
  const [query, setQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)

  const loadAll = useCallback(async () => {
    setUsersLoading(true)
    try {
      const [usersRes, logsRes, alertsRes, grantsRes] = await Promise.all([
        userAPI.getAll(),
        auditAPI.getLogs({ limit: 8 }),
        auditAPI.getSecurityAlerts(),
        grantAPI.listApplications(),
      ])
      const u = (usersRes.data && usersRes.data.data) || usersRes.data || []
      const logs = (logsRes.data && logsRes.data.data && logsRes.data.data.logs) || (logsRes.data && logsRes.data.data) || []
      const alerts = (alertsRes.data && alertsRes.data.data) || alertsRes.data || []
      const grants = (grantsRes.data && grantsRes.data.data) || grantsRes.data || []
      setUsers(Array.isArray(u) ? u : [])
      setAuditLog(Array.isArray(logs) ? logs : [])
      setSecurityAlerts(Array.isArray(alerts) ? alerts : [])
      setGrantApps(Array.isArray(grants) ? grants : [])
      setIsFallback(false)
    } catch (err) {
      setIsFallback(true)
    } finally {
      setUsersLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const filtered = users.filter((u) =>
    (u.full_name || u.name || '').toLowerCase().includes(query.toLowerCase())
  )

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

  const handleGrantDecision = async (applicationId, status) => {
    try {
      await grantAPI.updateApplicationStatus(applicationId, status)
      setGrantApps((prev) => prev.map((g) => (g.id === applicationId || g._id === applicationId) ? { ...g, status } : g))
      toast.success(`Application ${status}`)
    } catch (err) {
      toast.error('Could not update application')
    }
  }

  const pendingGrants = grantApps.filter((g) => g.status === 'pending')

  return (
    <div>
      <PageHeader eyebrow="Administration" title="Admin Dashboard" />
      {isFallback && <ErrorNotice />}

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <div className="card px-4 py-3 flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {users.length} Total Users
        </div>
        <div className="card px-4 py-3 flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> {pendingGrants.length} Pending Grant Applications
        </div>
        <div className="card px-4 py-3 flex items-center gap-2 text-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> {securityAlerts.length} Security Alerts
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Audit Log</h2>
          {auditLog.length === 0 ? (
            <p className="text-sm text-slate-400">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {auditLog.map((a) => (
                <div key={a.id} className="flex gap-2.5 text-sm">
                  <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ink dark:text-white">{a.action}</p>
                    <p className="text-xs text-slate-500">{a.user_id ? `user: ${a.user_id} · ` : ''}{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Security Alerts</h2>
          {securityAlerts.length === 0 ? (
            <p className="text-sm text-slate-400">No active alerts.</p>
          ) : (
            <div className="space-y-3">
              {securityAlerts.map((s, i) => (
                <div key={s.id || i} className="flex gap-2.5 text-sm">
                  <ShieldExclamationIcon className={`h-5 w-5 mt-0.5 shrink-0 ${levelColor[s.level] || 'text-slate-400'}`} />
                  <div>
                    <p className="font-medium text-ink dark:text-white">{s.title || s.action}</p>
                    <p className="text-xs text-slate-500">{s.detail || s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-heading font-semibold text-ink dark:text-white mb-3">Grant Applications</h2>
          {pendingGrants.length === 0 ? (
            <p className="text-sm text-slate-400">No pending applications.</p>
          ) : (
            <div className="space-y-3">
              {pendingGrants.map((g) => (
                <div key={g.id || g._id} className="flex items-center justify-between gap-2 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-ink dark:text-white truncate">{g.grant_name || g.grant_id}</p>
                    <p className="text-xs text-slate-500">${(g.amount_requested || 0).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleGrantDecision(g.id || g._id, 'approved')} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" aria-label="Approve">
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleGrantDecision(g.id || g._id, 'rejected')} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" aria-label="Reject">
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 className="font-heading font-semibold text-ink dark:text-white">User Management</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="input pl-9 w-56 text-sm" />
          </div>
        </div>
        {usersLoading ? (
          <div className="p-5"><LoadingBlock /></div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 dark:border-primary-700">
                  <th className="px-5 py-3 font-medium">Full Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const id = u.id || u._id
                  const isEditing = editingUserId === id
                  return (
                    <tr key={id} className="border-b border-slate-50 dark:border-primary-700 last:border-0">
                      <td className="px-5 py-3.5 font-medium text-ink dark:text-white">{u.full_name || u.name}</td>
                      <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(id, e.target.value)}
                            className="input !py-1 !text-xs"
                          >
                            <option value="founder">Founder</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`badge ${roleColor[u.role] || 'bg-slate-100 text-slate-600'}`}>{u.role}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <select
                            value={u.status}
                            onChange={(e) => handleStatusChange(id, e.target.value)}
                            className="input !py-1 !text-xs"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`badge ${statusColor[u.status] || 'bg-slate-100 text-slate-600'}`}>{u.status}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5 text-slate-400">
                          <button
                            onClick={() => setEditingUserId(isEditing ? null : id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700"
                            aria-label="Edit user"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500"
                            aria-label="Delete user"
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
        )}
      </div>
    </div>
  )
}
