import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ShieldCheckIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext.jsx'
import authHero from '../../assets/auth-hero.png'

export default function VerifyRegistrationOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''
  const { verifyRegistrationOtp, resendRegistrationOtp } = useAuth()

  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)

  useEffect(() => {
    if (resendCountdown <= 0) return undefined

    const timer = setTimeout(() => {
      setResendCountdown((seconds) => Math.max(0, seconds - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [resendCountdown])

  const handleResendRegistrationOtp = async () => {
    if (!email || resending || resendCountdown > 0) return

    setResending(true)

    try {
      const result = await resendRegistrationOtp(email)

      if (result.ok) {
        setOtp('')
        setResendCountdown(60)
        toast.success(result.message || 'A new verification code has been sent.')
      } else {
        const match = result.error?.match(/wait (\d+) seconds/i)

        if (match) {
          setResendCountdown(Number(match[1]))
        }

        toast.error(result.error || 'Could not resend verification code')
      }
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error('Registration email is missing. Please register again.')
      navigate('/register', { replace: true })
      return
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      toast.error('Enter the 6-digit verification code.')
      return
    }

    setSubmitting(true)

    try {
      const result = await verifyRegistrationOtp(email, otp)

      if (result.ok) {
        toast.success(result.message || 'Email verified. Please log in.')
        navigate('/login', { replace: true })
      } else {
        toast.error(result.error || 'Verification failed')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-primary-900">
      <div className="flex flex-col justify-center px-6 sm:px-16 py-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
            <ShieldCheckIcon className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-semibold text-center text-ink dark:text-white">
            Verify Your Email
          </h1>

          <p className="text-sm text-center text-slate-500 mt-3">
            Enter the 6-digit code we sent to your email address.
          </p>

          {email ? (
            <p className="text-sm font-medium text-center text-ink dark:text-white mt-2 break-all">
              {email}
            </p>
          ) : (
            <p className="text-sm text-center text-red-500 mt-3">
              No registration email was provided. Please register again.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div>
              <label htmlFor="registration-otp" className="label">
                Verification Code
              </label>

              <div className="relative">
                <EnvelopeIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />

                <input
                  id="registration-otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  autoFocus
                  required
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="Enter 6-digit code"
                  className="input pl-10 text-center tracking-[0.5em] font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !email}
              className="btn-primary w-full py-3"
            >
              {submitting ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendRegistrationOtp}
                disabled={!email || resending || resendCountdown > 0}
                className="text-primary font-medium disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {resending
                  ? 'Sending code...'
                  : resendCountdown > 0
                    ? `Resend code in ${resendCountdown}s`
                    : 'Resend verification code'}
              </button>
            </div>

            <p className="text-center text-sm text-slate-500">
              Already verified?{' '}
              <Link to="/login" className="text-primary font-medium">
                Sign in
              </Link>
            </p>

            <p className="text-center text-sm text-slate-500">
              <Link to="/register" className="text-primary font-medium">
                Back to registration
              </Link>
            </p>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative overflow-hidden">
        <img
          src={authHero}
          alt="Empowering innovation with AI"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
