import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext.jsx'
import { adminAPI } from '../../services/api.js'
import authHero from '../../assets/auth-hero.png'

export default function Register() {
  const { register: registerField, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const selectedRole = watch('role', 'founder')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestSent, setRequestSent] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (values) => {
    const payload = { ...values, full_name: values.fullName }
    delete payload.fullName
    const res = await register(payload)
    if (res.ok) {
      if (res.demo) {
        toast.success('Account created (demo mode — backend offline)')
        navigate('/dashboard')
      } else if (values.role === 'mentor' || values.role === 'investor') {
        toast.success('Account created! Your account is pending admin approval before you can log in.')
        navigate('/login')
      } else {
        toast.success('Account created!')
        navigate('/dashboard')
      }
    } else {
      toast.error(res.error || 'Could not create account')
    }
  }

  const handleRequestAccess = async (e) => {
    e.preventDefault()
    if (!requestEmail.trim()) return toast.error('Email is required')
    try {
      await adminAPI.submitRequest({ email: requestEmail, role: selectedRole })
      toast.success('Access request submitted! Admin will review and send code to your email.')
      setRequestSent(true)
    } catch (err) {
      toast.error('Could not submit request')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-primary-900">
      <div className="flex flex-col justify-center px-6 sm:px-16 py-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex gap-6 border-b border-slate-100 dark:border-primary-700 mb-8">
            <Link to="/login" className="pb-3 text-slate-400">Login</Link>
            <span className="pb-3 border-b-2 border-primary text-primary font-semibold">Register</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <UserIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="input pl-10"
                  {...registerField('fullName', { required: 'Full name is required' })}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input pl-10"
                  {...registerField('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="input pl-10 pr-10"
                  {...registerField('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Role</label>
              <select className="input" {...registerField('role', { required: true })} defaultValue="founder">
                <option value="founder">Innovator</option>
                <option value="mentor">Mentor</option>
                <option value="investor">Investor</option>
              </select>
            </div>

            <div className="card p-4 bg-slate-50 dark:bg-primary-800 border border-slate-200 dark:border-primary-700">
              <p className="text-sm font-medium text-ink dark:text-white mb-2">Need an Institution Code?</p>
              <p className="text-xs text-slate-500 mb-3">Request access and admin will send a code to your email.</p>
              {requestSent ? (
                <p className="text-sm text-emerald-600 font-medium">Request sent! Check your email soon.</p>
              ) : (
                <form onSubmit={handleRequestAccess} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="input text-sm flex-1"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary text-sm whitespace-nowrap">Request</button>
                </form>
              )}
            </div>

            {(selectedRole === 'mentor' || selectedRole === 'founder') && (
              <>
                <div>
                  <label className="label">Areas of Expertise</label>
                  <input type="text" placeholder="e.g. Product Strategy, Fundraising" className="input" {...registerField('expertise_areas', { required: 'Expertise is required' })} />
                  {errors.expertise_areas && <p className="text-xs text-red-500 mt-1">{errors.expertise_areas.message}</p>}
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <input type="number" min="0" placeholder="e.g. 8" className="input" {...registerField('years_experience', { required: 'Years of experience is required', valueAsNumber: true })} />
                  {errors.years_experience && <p className="text-xs text-red-500 mt-1">{errors.years_experience.message}</p>}
                </div>
              </>
            )}

            {selectedRole === 'investor' && (
              <>
                <div>
                  <label className="label">Firm Name</label>
                  <input type="text" placeholder="e.g. Acme Ventures" className="input" {...registerField('firm_name', { required: 'Firm name is required' })} />
                  {errors.firm_name && <p className="text-xs text-red-500 mt-1">{errors.firm_name.message}</p>}
                </div>
                <div>
                  <label className="label">Investment Focus</label>
                  <input type="text" placeholder="e.g. Fintech, AgriTech" className="input" {...registerField('focus', { required: 'Focus is required' })} />
                  {errors.focus && <p className="text-xs text-red-500 mt-1">{errors.focus.message}</p>}
                </div>
                <div>
                  <label className="label">Investment Stage</label>
                  <select className="input" {...registerField('investment_stage', { required: 'Investment stage is required' })}>
                    <option value="">Select stage</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Growth">Growth</option>
                  </select>
                  {errors.investment_stage && <p className="text-xs text-red-500 mt-1">{errors.investment_stage.message}</p>}
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium">Sign in</Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden">
        <img
          src={authHero}
          alt="Empowering Innovation with AI — welcome to the future of incubator technology"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
