import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { PageHeader, LoadingBlock } from '../../components/ui.jsx'
import { accountAPI } from '../../services/api.js'

const money = (n) => '$' + Number(n || 0).toLocaleString()

export default function Profile() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '', organization: '', region: '', bio: '', expertise: '' })
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fill = (u) => setForm({
    full_name: u.full_name || '', phone: u.phone || '', organization: u.organization || '',
    region: u.region || '', bio: u.bio || '', expertise: (u.expertise || []).join(', '),
  })

  useEffect(() => {
    accountAPI.me()
      .then((r) => { setData(r.data); fill(r.data.user) })
      .catch(() => setError('Could not load your profile.'))
  }, [])

  if (error) return <div className="p-6 text-red-500 text-sm">{error}</div>
  if (!data) return <div className="p-6"><LoadingBlock /></div>

  const { user, summary } = data
  const isMentor = user.role === 'mentor'
  const initials = (user.full_name || user.email || '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  const checks = [form.full_name, form.phone, form.organization, form.region, form.bio, ...(isMentor ? [form.expertise] : [])]
  const complete = Math.round((checks.filter((x) => String(x).trim()).length / checks.length) * 100)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, expertise: form.expertise.split(',').map((s) => s.trim()).filter(Boolean) }
      const r = await accountAPI.update(payload)
      setData({ ...data, user: r.data.user })
      try {
        const stored = JSON.parse(localStorage.getItem('mint_user') || '{}')
        localStorage.setItem('mint_user', JSON.stringify({ ...stored, full_name: r.data.user.full_name }))
      } catch { /* ignore */ }
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save')
    } finally { setSaving(false) }
  }

  const changePw = async (e) => {
    e.preventDefault()
    if (pw.new_password !== pw.confirm) return toast.error('Passwords do not match')
    try {
      await accountAPI.changePassword({ current_password: pw.current_password, new_password: pw.new_password })
      toast.success('Password changed')
      setPw({ current_password: '', new_password: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change password')
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const stat = (label, value) => (
    <div className="card p-4"><p className="text-2xl font-bold text-primary">{value}</p><p className="text-xs text-slate-500 mt-1">{label}</p></div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <PageHeader eyebrow="Account" title="Profile" />

      <div className="rounded-2xl bg-primary-800 text-white p-5 sm:p-6 flex flex-wrap items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-white/15 flex items-center justify-center text-2xl font-heading font-bold">{initials}</div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-xl font-semibold truncate">{user.full_name || 'Unnamed'}</h2>
          <p className="text-sm text-slate-300 truncate">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-white/10 capitalize">{user.role}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 capitalize">{user.status}</span>
            {user.created_at && <span className="px-2 py-0.5 rounded-full bg-white/10">Member since {new Date(user.created_at).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="w-full sm:w-52">
          <div className="flex justify-between text-xs text-slate-300 mb-1"><span>Profile complete</span><span>{complete}%</span></div>
          <div className="h-2 rounded-full bg-white/15 overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${complete}%` }} /></div>
        </div>
      </div>

      {user.role === 'founder' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stat('Startups', summary.startups)}
          {stat('Funding requests', summary.funding_requests)}
          {stat('Funding approved', money(summary.funding_approved))}
          {stat('Testimonials', summary.testimonials)}
        </div>
      )}

      <form onSubmit={save} className="card p-5 grid sm:grid-cols-2 gap-4">
        <h3 className="font-heading font-semibold sm:col-span-2">Personal information</h3>
        <div><label className="label">Full name</label><input className="input" required value={form.full_name} onChange={set('full_name')} /></div>
        <div><label className="label">Email (cannot be changed)</label><input className="input opacity-70" disabled value={user.email} /></div>
        <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
        <div><label className="label">Organisation</label><input className="input" value={form.organization} onChange={set('organization')} /></div>
        <div><label className="label">Region</label><input className="input" value={form.region} onChange={set('region')} /></div>
        {isMentor && (
          <div><label className="label">Expertise (comma separated)</label><input className="input" value={form.expertise} onChange={set('expertise')} /></div>
        )}
        <div className="sm:col-span-2">
          <label className="label">Short bio</label>
          <textarea className="input" rows={4} maxLength={500} value={form.bio} onChange={set('bio')} />
          <p className="text-xs text-slate-400 mt-1">{form.bio.length}/500</p>
        </div>
        <div className="sm:col-span-2"><button className="btn btn-primary px-6 py-2.5 text-sm" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></div>
      </form>

      <form onSubmit={changePw} className="card p-5 grid sm:grid-cols-3 gap-4">
        <h3 className="font-heading font-semibold sm:col-span-3">Change password</h3>
        <input type="password" autoComplete="current-password" required placeholder="Current password" className="input" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} />
        <input type="password" autoComplete="new-password" required minLength={8} placeholder="New password (8+ characters)" className="input" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
        <input type="password" autoComplete="new-password" required placeholder="Confirm new password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
        <div className="sm:col-span-3"><button className="btn btn-outline px-6 py-2.5 text-sm">Update password</button></div>
      </form>
    </div>
  )
}
