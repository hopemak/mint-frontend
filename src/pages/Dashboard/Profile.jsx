import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { CameraIcon } from '@heroicons/react/24/outline'
import { PageHeader, LoadingBlock } from '../../components/ui.jsx'
import { accountAPI } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

const money = (n) => '$' + Number(n || 0).toLocaleString()

const PHOTO_MAX_BYTES = 5 * 1024 * 1024

// Crop the chosen picture to a centred square and shrink it to 256px, so the saved photo is
// small (usually 15-40 KB) no matter how large the original was.
function fileToAvatar(file, size = 256) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const s = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      canvas.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as a picture. Try a JPG or PNG.'))
    }
    img.src = url
  })
}

export default function Profile() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState({ full_name: '', phone: '', organization: '', region: '', bio: '', expertise: '' })
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)
  const fileRef = useRef(null)
  const { updateUser } = useAuth()

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
      updateUser({ full_name: r.data.user.full_name })
      toast.success('Profile saved')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not save')
    } finally { setSaving(false) }
  }

  const savePhoto = async (profile_image, message) => {
    setPhotoBusy(true)
    try {
      const r = await accountAPI.update({ profile_image })
      setData((d) => ({ ...d, user: { ...d.user, ...r.data.user } }))
      updateUser({ profile_image: r.data.user.profile_image || '' })
      toast.success(message)
    } catch (err) {
      const msg = err.response?.data?.error
      toast.error(msg === 'Nothing to update' ? 'Photo upload is not enabled on the server yet.' : msg || 'Could not update your photo')
    } finally {
      setPhotoBusy(false)
    }
  }

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the same file be chosen again later
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file (JPG or PNG).')
    if (file.size > PHOTO_MAX_BYTES) return toast.error('That picture is larger than 5 MB.')
    try {
      await savePhoto(await fileToAvatar(file), 'Profile photo updated')
    } catch (err) {
      toast.error(err.message)
    }
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
        <div className="relative shrink-0">
          {user.profile_image ? (
            <img src={user.profile_image} alt="Your profile photo" className={`h-20 w-20 rounded-full object-cover ring-2 ring-white/30 ${photoBusy ? 'opacity-50' : ''}`} />
          ) : (
            <div className={`h-20 w-20 rounded-full bg-white/15 flex items-center justify-center text-2xl font-heading font-bold ${photoBusy ? 'opacity-50' : ''}`}>{initials}</div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            aria-label={user.profile_image ? 'Change profile photo' : 'Upload profile photo'}
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-accent text-primary-800 shadow flex items-center justify-center hover:bg-accent-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
          >
            <CameraIcon className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-xl font-semibold truncate">{user.full_name || 'Unnamed'}</h2>
          <p className="text-sm text-slate-300 truncate">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-white/10 capitalize">{user.role}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 capitalize">{user.status}</span>
            {user.created_at && <span className="px-2 py-0.5 rounded-full bg-white/10">Member since {new Date(user.created_at).toLocaleDateString()}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={photoBusy} className="underline underline-offset-2 text-slate-200 hover:text-white disabled:opacity-60">
              {photoBusy ? 'Saving photo...' : user.profile_image ? 'Change photo' : 'Upload photo'}
            </button>
            {user.profile_image && !photoBusy && (
              <button type="button" onClick={() => savePhoto('', 'Profile photo removed')} className="underline underline-offset-2 text-slate-300 hover:text-white">
                Remove photo
              </button>
            )}
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
