with open('src/pages/Auth/Register.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Ensure institution_code field exists (add it back if missing)
if 'institution_code' not in content:
    # Find the role select closing and insert institution code after it
    old_block = """              </select>
            </div>

            {(selectedRole === 'mentor' || selectedRole === 'founder') && ("""
    
    new_block = """              </select>
            </div>

            <div>
              <label className="label">Institution ID</label>
              <input
                type="text"
                placeholder="Enter your institution code (e.g. MINT-ABC123)"
                className="input"
                {...registerField('institution_code', { required: 'Institution ID is required' })}
              />
              {errors.institution_code && <p className="text-xs text-red-500 mt-1">{errors.institution_code.message}</p>}
            </div>

            {(selectedRole === 'mentor' || selectedRole === 'founder') && ("""
    
    if old_block in content:
        content = content.replace(old_block, new_block)
        print("1. Added institution_code field back")
    else:
        print("1. Could not find insertion point for institution_code")
else:
    print("1. institution_code already exists")

# 2. Ensure handleRequestAccess function exists
has_func = 'const handleRequestAccess' in content
if not has_func:
    # Find onSubmit closing and insert after
    old_end = """    } else {
      toast.error(res.error || 'Could not create account')
    }
  }"""
    
    new_end = """    } else {
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
    
    if old_end in content:
        content = content.replace(old_end, new_end)
        print("2. Added handleRequestAccess function")
    else:
        print("2. Could not find onSubmit end")
else:
    print("2. handleRequestAccess already exists")

# 3. Ensure adminAPI is imported
if "adminAPI" not in content:
    content = content.replace(
        "import { useAuth } from '../../context/AuthContext.jsx'",
        "import { useAuth } from '../../context/AuthContext.jsx'\nimport { adminAPI } from '../../services/api.js'"
    )
    print("3. Added adminAPI import")
else:
    print("3. adminAPI import OK")

# 4. Ensure request states exist
if 'requestEmail' not in content:
    content = content.replace(
        "  const selectedRole = watch('role', 'founder')",
        "  const selectedRole = watch('role', 'founder')\n  const [requestEmail, setRequestEmail] = useState('')\n  const [requestSent, setRequestSent] = useState(false)"
    )
    print("4. Added request states")
else:
    print("4. request states OK")

# 5. Ensure Request Access UI exists
if 'Need an Institution Code?' not in content:
    # Add after institution_code div
    old_ui = """            </div>

            {(selectedRole === 'mentor' || selectedRole === 'founder') && ("""
    
    new_ui = """            </div>

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

            {(selectedRole === 'mentor' || selectedRole === 'founder') && ("""
    
    if old_ui in content:
        content = content.replace(old_ui, new_ui)
        print("5. Added Request Access UI")
    else:
        print("5. Could not find insertion point for Request Access UI")
else:
    print("5. Request Access UI already exists")

with open('src/pages/Auth/Register.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nRegister.jsx fixed!")
