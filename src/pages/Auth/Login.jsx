import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, FingerPrintIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import authHero from '../../assets/auth-hero.png'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const { login } = useAuth()
  const { dark, toggleDark } = useTheme()
  const navigate = useNavigate()

  const resendCode = () => {
    if (resendCooldown > 0) return
    toast.success('A new verification code has been sent to your email')
    setResendCooldown(30)
    const timer = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const onSubmit = async (values) => {
    const res = await login(values.email, values.password)
    if (res.ok) {
      toast.success(res.demo ? 'Signed in (demo mode — backend offline)' : 'Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-primary-900">
      <div className="flex flex-col justify-center px-6 sm:px-16 py-12 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">Dark Mode</span>
          <button
            onClick={toggleDark}
            className={`h-6 w-11 rounded-full transition-colors ${dark ? 'bg-primary' : 'bg-slate-200'} relative`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="max-w-sm mx-auto w-full">
          <div className="flex gap-6 border-b border-slate-100 dark:border-primary-700 mb-8">
            <span className="pb-3 border-b-2 border-primary text-primary font-semibold">Login</span>
            <Link to="/register" className="pb-3 text-slate-400">Register</Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input pl-10"
                  {...register('email', { required: 'Email is required' })}
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
                  placeholder="Password"
                  className="input pl-10 pr-10"
                  {...register('password', { required: 'Password is required' })}
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
              <div className="text-right mt-1.5">
                <Link to="#" className="text-sm text-primary font-medium">Forgot Password?</Link>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="label">OTP Verification</label>
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={resendCooldown > 0}
                  className="text-sm text-primary font-medium disabled:text-slate-400"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>
              <div className="relative">
                <ShieldCheckIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="OTP Verification"
                  className="input pl-10"
                  {...register('otp')}
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="relative py-2 text-center">
              <span className="bg-white dark:bg-primary-900 px-3 text-xs text-slate-400 relative z-10">Other Login Methods</span>
              <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 dark:border-primary-700" />
            </div>

            <button type="button" className="btn-outline w-full py-3">
              <FingerPrintIcon className="h-5 w-5" /> Biometric Login
            </button>

            <div className="relative py-2 text-center">
              <span className="bg-white dark:bg-primary-900 px-3 text-xs text-slate-400 relative z-10">Social Login</span>
              <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 dark:border-primary-700" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {['Google', 'Apple', 'Microsoft'].map((p) => (
                <button key={p} type="button" className="btn-outline text-xs py-2.5">{p}</button>
              ))}
            </div>
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
