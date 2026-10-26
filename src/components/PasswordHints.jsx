import React, { useEffect, useRef, useState } from 'react'

const EMAIL_NAME_MIN = 3

function passwordError(pw, email, fullName) {
  if (!pw) return 'Password is required'
  if (pw.length < 8) return 'At least 8 characters'
  if (pw.length > 64) return 'At most 64 characters'
  if (/\s/.test(pw)) return 'Password cannot contain spaces'
  if (!/[A-Z]/.test(pw)) return 'Add an uppercase letter'
  if (!/[a-z]/.test(pw)) return 'Add a lowercase letter'
  if (!/\d/.test(pw)) return 'Add a number'
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Add a special character (e.g. ! @ # $)'
  const lower = pw.toLowerCase()
  const local = email.split('@')[0].toLowerCase()
  if (local.length >= EMAIL_NAME_MIN && lower.includes(local)) return 'Password must not contain your email name'
  const parts = fullName.toLowerCase().split(/\s+/).filter((p) => p.length >= 3)
  if (parts.some((p) => lower.includes(p))) return 'Password must not contain your name'
  return ''
}

export default function PasswordHints() {
  const [hint, setHint] = useState('')
  const [confirmHint, setConfirmHint] = useState('')
  const confirmRef = useRef(null)
  const checkRef = useRef(() => {})

  useEffect(() => {
    const q = (n) => document.querySelector(`input[name="${n}"]`)
    const pw = q('password')
    if (!pw) return undefined

    const check = () => {
      const msg = passwordError(pw.value, q('email')?.value || '', q('fullName')?.value || '')
      setHint(pw.value ? msg : '')
      pw.setCustomValidity(msg)

      const c = confirmRef.current
      if (c) {
        const cMsg = !c.value ? 'Please confirm your password' : c.value !== pw.value ? 'Passwords do not match' : ''
        setConfirmHint(c.value ? cMsg : '')
        c.setCustomValidity(cMsg)
      }
    }
    checkRef.current = check

    const watched = [pw, q('email'), q('fullName')].filter(Boolean)
    watched.forEach((el) => el.addEventListener('input', check))
    check()
    return () => watched.forEach((el) => el.removeEventListener('input', check))
  }, [])

  return (
    <div className="mt-2">
      {hint && <p className="text-xs text-red-500 mb-2">{hint}</p>}
      <input
        ref={confirmRef}
        type="password"
        placeholder="Confirm your password"
        className="input"
        autoComplete="new-password"
        onInput={() => checkRef.current()}
      />
      {confirmHint && <p className="text-xs text-red-500 mt-1">{confirmHint}</p>}
    </div>
  )
}
