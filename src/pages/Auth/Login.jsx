import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  FingerPrintIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import authHero from '../../assets/auth-hero.png'
import GoogleSignInButton from '../../components/GoogleSignInButton.jsx'

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm()

  const [showPassword, setShowPassword] = useState(false)
  const [otpStep, setOtpStep] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const { login, verifyOtp, resendOtp } = useAuth()
  const { dark, toggleDark } = useTheme()

  useEffect(() => {
    if (resendCooldown <= 0) return

    const timer = setInterval(() => {
      setResendCooldown((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer)
          return 0
        }
        return seconds - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resendCooldown])

  const onSubmit = async (values) => {
    if (otpStep) {
      const res = await verifyOtp(loginEmail, values.otp)

      if (res.ok) {
        toast.success('Login successful!')
        window.location.href = '/dashboard'
      } else {
        toast.error(res.error || 'Invalid verification code')
      }

      return
    }

    const res = await login(values.email, values.password)

    if (res.ok && res.requiresOtp) {
      setLoginEmail(res.email)
      setOtpStep(true)
      setResendCooldown(60)
      toast.success('Verification code sent to your email')
    } else {
      toast.error(res.error || 'Invalid email or password')
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !loginEmail) return

    const res = await resendOtp(loginEmail)

    if (res.ok) {
      toast.success('A new verification code has been sent')
      setResendCooldown(60)
    } else {
      toast.error(res.error || 'Could not resend code')
    }
  }

  const changeAccount = () => {
    setOtpStep(false)
    setLoginEmail('')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-primary-900">
      <div className="flex flex-col justify-center px-6 sm:px-16 py-12 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Dark Mode
          </span>

          <button
            onClick={toggleDark}
            className={`h-6 w-11 rounded-full transition-colors ${
              dark ? 'bg-primary' : 'bg-slate-200'
            } relative`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                dark ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="max-w-sm mx-auto w-full">
          <div className="flex gap-6 border-b border-slate-100 dark:border-primary-700 mb-8">
            <span className="pb-3 border-b-2 border-primary text-primary font-semibold">
              Login
            </span>

            <Link
              to="/register"
              className="pb-3 text-slate-400"
            >
              Register
            </Link>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {!otpStep ? (
              <>
                <div>
                  <label className="label">Email</label>

                  <div className="relative">
                    <EnvelopeIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="input pl-10"
                      {...register('email', {
                        required: 'Email is required'
                      })}
                    />
                  </div>

                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Password</label>

                  <div className="relative">
                    <LockClosedIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      className="input pl-10 pr-10"
                      {...register('password', {
                        required: 'Password is required'
                      })}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword
                        ? <EyeSlashIcon className="h-5 w-5" />
                        : <EyeIcon className="h-5 w-5" />
                      }
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}

                  <div className="text-right mt-1.5">
                    <Link
                      to="#"
                      className="text-sm text-primary font-medium"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <ShieldCheckIcon className="h-7 w-7 text-primary" />
                  </div>

                  <h2 className="text-xl font-semibold text-ink dark:text-white">
                    Verify Your Login
                  </h2>

                  <p className="text-sm text-slate-500 mt-2">
                    We sent a 6-digit verification code to
                  </p>

                  <p className="text-sm font-medium text-ink dark:text-white mt-1">
                    {loginEmail}
                  </p>
                </div>

                <label className="label">
                  Verification Code
                </label>

                <div className="relative">
                  <ShieldCheckIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    placeholder="Enter 6-digit code"
                    className="input pl-10 text-center tracking-[0.5em] font-semibold"
                    {...register('otp', {
                      required: 'Verification code is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Enter the 6-digit code'
                      }
                    })}
                  />
                </div>

                {errors.otp && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.otp.message}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className="text-sm text-primary font-medium disabled:text-slate-400"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : 'Resend Code'}
                  </button>

                  <button
                    type="button"
                    onClick={changeAccount}
                    className="text-sm text-slate-500 hover:text-primary"
                  >
                    Change account
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3"
            >
              {isSubmitting
                ? 'Please wait...'
                : otpStep
                  ? 'Verify & Sign In'
                  : 'Continue'}
            </button>

            {!otpStep && <GoogleSignInButton />}
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
