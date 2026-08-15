with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

changes = []

# 1. Ensure requests state exists
if 'const [requests, setRequests]' not in content:
    content = content.replace(
        "  const [codes, setCodes] = useState([])",
        "  const [codes, setCodes] = useState([])\n  const [requests, setRequests] = useState([])"
    )
    changes.append("Added requests state")

# 2. Ensure sendEmail/showSendEmail states exist
if 'const [sendEmail, setSendEmail]' not in content:
    content = content.replace(
        "  const [codeForm, setCodeForm] = useState({ prefix: 'MINT', count: 1 })",
        "  const [codeForm, setCodeForm] = useState({ prefix: 'MINT', count: 1 })\n  const [sendEmail, setSendEmail] = useState('')\n  const [showSendEmail, setShowSendEmail] = useState(false)"
    )
    changes.append("Added sendEmail/showSendEmail states")

# 3. Ensure handleApproveRequest exists
if 'const handleApproveRequest' not in content:
    old = """  const handleSendCode = async (e) => {
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
      const saved = JSON.parse(localStorage.getItem('mint_codes') || '[]')
      setCodes(saved)
    } catch (err) {
      toast.error('Could not send code')
    }
  }"""
    
    new = """  const handleSendCode = async (e) => {
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
      const saved = JSON.parse(localStorage.getItem('mint_codes') || '[]')
      setCodes(saved)
    } catch (err) {
      toast.error('Could not send code')
    }
  }

  const handleApproveRequest = (req) => {
    const code = 'MINT-' + Math.random().toString(36).substring(2, 10).toUpperCase()
    const savedCodes = JSON.parse(localStorage.getItem('mint_codes') || '[]')
    savedCodes.push({ code, used: false, created_at: new Date().toISOString(), email: req.email })
    localStorage.setItem('mint_codes', JSON.stringify(savedCodes))
    setCodes(savedCodes)
    
    const savedReqs = JSON.parse(localStorage.getItem('mint_requests') || '[]')
    const updated = savedReqs.map(r => r.request_id === req.request_id ? { ...r, status: 'approved', code } : r)
    localStorage.setItem('mint_requests', JSON.stringify(updated))
    setRequests(updated)
    
    toast.success('Approved! Code: ' + code + ' (copy and send to ' + req.email + ')')
  }"""
    
    if old in content:
        content = content.replace(old, new)
        changes.append("Added handleApproveRequest")
    else:
        changes.append("Could not find handleSendCode to insert after")

# 4. Ensure Pending Requests section exists
if 'Pending Access Requests' not in content:
    old_sec = """          {codes.length === 0 && <p className="text-sm text-slate-400 col-span-full">No codes generated yet.</p>}
        </div>
      </section>"""
    
    new_sec = """          {codes.length === 0 && <p className="text-sm text-slate-400 col-span-full">No codes generated yet.</p>}
        </div>

        <h3 className="font-heading text-xl font-bold text-ink dark:text-white mb-4 mt-8">Pending Access Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-primary-700 text-left text-slate-500">
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.filter(r => r.status === 'pending').map((req, idx) => (
                <tr key={req.request_id || idx} className="border-b border-slate-100 dark:border-primary-800">
                  <td className="py-3 pr-4">{req.email}</td>
                  <td className="py-3 pr-4 capitalize">{req.role}</td>
                  <td className="py-3 pr-4"><span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span></td>
                  <td className="py-3">
                    <button onClick={() => handleApproveRequest(req)} className="btn btn-primary text-xs">Approve & Generate</button>
                  </td>
                </tr>
              ))}
              {requests.filter(r => r.status === 'pending').length === 0 && (
                <tr><td colSpan="4" className="py-4 text-slate-400 text-center">No pending requests</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>"""
    
    if old_sec in content:
        content = content.replace(old_sec, new_sec)
        changes.append("Added Pending Requests section")
    else:
        changes.append("Could not find codes section to insert after")

# 5. Fix key props
if 'codes.map((c) => (' in content:
    content = content.replace('codes.map((c) => (', 'codes.map((c, i) => (')
    content = content.replace('key={c.code}', 'key={c.code || i}')
    changes.append("Fixed key props")

# 6. Ensure requests are loaded from localStorage in useEffect or loadAll
if 'setRequests(savedReqs)' not in content and 'localStorage.getItem' in content:
    # Add in the useEffect that loads codes
    if 'useEffect(() => {' in content and 'setCodes(saved)' in content:
        content = content.replace(
            'setCodes(saved)',
            'setCodes(saved)\n    const savedReqs = JSON.parse(localStorage.getItem(\\'mint_requests\\') || \\'[]\\')\n    setRequests(savedReqs)'
        )
        changes.append("Added requests loading from localStorage")

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

for c in changes:
    print(c)
print("\nAdmin.jsx fixed!")
