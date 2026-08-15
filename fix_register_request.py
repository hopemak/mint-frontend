with open('src/pages/Auth/Register.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add adminAPI to imports
old_import = "import { useAuth } from '../../context/AuthContext.jsx'"
new_import = """import { useAuth } from '../../context/AuthContext.jsx'
import { adminAPI } from '../../services/api.js'"""

content = content.replace(old_import, new_import)
print("1. Added adminAPI import")

# 2. Add request state after selectedRole
old_state = "  const selectedRole = watch('role', 'founder')"
new_state = """  const selectedRole = watch('role', 'founder')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestSent, setRequestSent] = useState(false)"""

content = content.replace(old_state, new_state)
print("2. Added request state")

# 3. Add handleRequest function after onSubmit
old_onsubmit = """  const onSubmit = async (values) => {
    const payload = { ...values, full_name: values.fullName }
    delete payload.fullName
    const res = await register(payload)
    if (res.ok) {
      if (res.demo) {
        toast.success('Account created (demo mode — backend offline)')
        navigate('/dashboard')
      } else if (values.role === 'mentor' || values.role === 'investor') {
        toast.success('Account created! Your account is pending admin approval before you 
        navigate('/login')
      } else {
        toast.success('Account created!')
        navigate('/dashboard')
      }
    } else {
      toast.error(res.error || 'Could not create account')
    }
  }"""

new_onsubmit = """  const onSubmit = async (values) => {
    const payload = { ...values, full_name: values.fullName }
    delete payload.fullName
    const res = await register(payload)
    if (res.ok) {
      if (res.demo) {
        toast.success('Account created (demo mode — backend offline)')
        navigate('/dashboard')
      } else if (values.role === 'mentor' || values.role === 'investor') {
        toast.success('Account created! Your account is pending admin approval before you 
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
  }"""

content = content.replace(old_onsubmit, new_onsubmit)
print("3. Added handleRequestAccess")

# 4. Replace institution_code block with Request Access
old_block = """            <div>
              <label className="label">Institution ID</label>
              <input
                type="text"
                placeholder="Enter your institution code (e.g. MINT-ABC123)"
                className="input"
                {...registerField('institution_code', { required: 'Institution ID is required' })}
              />
              {errors.institution_code && <p className="text-xs text-red-500 mt-1">{errors.institution_code.message}</p>}
            </div>"""

new_block = """            <div className="card p-4 bg-slate-50 dark:bg-primary-800 border border-slate-200 dark:border-primary-700">
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
            </div>"""

content = content.replace(old_block, new_block)
print("4. Replaced institution_code with Request Access")

with open('src/pages/Auth/Register.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! Register page now has Request Access flow.")
