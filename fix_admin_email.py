with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add send email state after codeForm
old_state = "  const [codeForm, setCodeForm] = useState({ prefix: 'MINT', count: 1 })"
new_state = """  const [codeForm, setCodeForm] = useState({ prefix: 'MINT', count: 1 })
  const [sendEmail, setSendEmail] = useState('')
  const [showSendEmail, setShowSendEmail] = useState(false)"""

content = content.replace(old_state, new_state)
print("1. Added email state")

# 2. Add handleSendCode after handleCreateCode
old_handler = """  const handleCreateCode = (e) => {
    e.preventDefault()
    const prefix = codeForm.prefix || 'MINT'
    const count = Math.min(Number(codeForm.count) || 1, 50)
    const existing = JSON.parse(localStorage.getItem('mint_codes') || '[]')
    const generated = []
    for (let i = 0; i < count; i++) {
      const code = prefix + '-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      generated.push({ code, used: false, created_at: new Date().toISOString() })
    }
    const all = [...existing, ...generated]
    localStorage.setItem('mint_codes', JSON.stringify(all))
    setCodes(all)
    toast.success(generated.length + ' code(s) generated')
    setShowCreateCode(false)
    setCodeForm({ prefix: 'MINT', count: 1 })
  }"""

new_handler = """  const handleCreateCode = (e) => {
    e.preventDefault()
    const prefix = codeForm.prefix || 'MINT'
    const count = Math.min(Number(codeForm.count) || 1, 50)
    const existing = JSON.parse(localStorage.getItem('mint_codes') || '[]')
    const generated = []
    for (let i = 0; i < count; i++) {
      const code = prefix + '-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      generated.push({ code, used: false, created_at: new Date().toISOString() })
    }
    const all = [...existing, ...generated]
    localStorage.setItem('mint_codes', JSON.stringify(all))
    setCodes(all)
    toast.success(generated.length + ' code(s) generated')
    setShowCreateCode(false)
    setCodeForm({ prefix: 'MINT', count: 1 })
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!sendEmail.trim()) return toast.error('Email is required')
    try {
      const res = await adminAPI.sendCode({ email: sendEmail.trim() })
      const data = res.data
      if (data.emailed) {
        toast.success('Code sent to ' + sendEmail)
      } else {
        toast.success('Code generated: ' + data.code + ' (copy manually)')
      }
      setShowSendEmail(false)
      setSendEmail('')
      // Refresh codes list
      const saved = JSON.parse(localStorage.getItem('mint_codes') || '[]')
      setCodes(saved)
    } catch (err) {
      toast.error('Could not send code')
    }
  }"""

content = content.replace(old_handler, new_handler)
print("2. Added handleSendCode")

# 3. Add Send Email form in Institution Codes section
old_section = """        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Generate and manage unique institution IDs for mentor/investor registration.</p>
          <button onClick={() => setShowCreateCode(!showCreateCode)} className="btn btn-primary text-sm flex items-center gap-1">
            <PlusIcon className="h-4 w-4" /> Generate Codes
          </button>
        </div>"""

new_section = """        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">Generate and manage unique institution IDs for mentor/investor registration.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowSendEmail(!showSendEmail)} className="btn btn-outline text-sm flex items-center gap-1">
              <EnvelopeIcon className="h-4 w-4" /> Send via Email
            </button>
            <button onClick={() => setShowCreateCode(!showCreateCode)} className="btn btn-primary text-sm flex items-center gap-1">
              <PlusIcon className="h-4 w-4" /> Generate Codes
            </button>
          </div>
        </div>

        {showSendEmail && (
          <form onSubmit={handleSendCode} className="card p-4 mb-4 flex gap-3 max-w-lg">
            <input
              type="email"
              placeholder="user@example.com"
              className="input text-sm flex-1"
              value={sendEmail}
              onChange={(e) => setSendEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary text-sm">Send Code</button>
            <button type="button" onClick={() => setShowSendEmail(false)} className="btn btn-outline text-sm">Cancel</button>
          </form>
        )}"""

content = content.replace(old_section, new_section)
print("3. Added email UI")

# 4. Add EnvelopeIcon to imports
old_import = """  PlusIcon,
  UsersIcon,"""

new_import = """  PlusIcon,
  EnvelopeIcon,
  UsersIcon,"""

content = content.replace(old_import, new_import)
print("4. Added EnvelopeIcon import")

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! Restart backend and frontend, then test.")
