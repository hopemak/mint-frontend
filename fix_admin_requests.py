with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add requests state after codes state
old_state = "  const [codes, setCodes] = useState([])"
new_state = """  const [codes, setCodes] = useState([])
  const [requests, setRequests] = useState([])"""
content = content.replace(old_state, new_state)
print("1. Added requests state")

# 2. Add fetch requests in loadAll (after setCodes)
old_load = "      setCodes(extractData(codesRes))"
new_load = """      setCodes(extractData(codesRes))
      // Load requests from localStorage fallback since backend has no MongoDB
      const savedReqs = JSON.parse(localStorage.getItem('mint_requests') || '[]')
      setRequests(savedReqs)"""
content = content.replace(old_load, new_load)
print("2. Added requests loading")

# 3. Add handleApproveRequest after handleSendCode
old_handler = """  const handleSendCode = async (e) => {
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

new_handler = """  const handleSendCode = async (e) => {
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

content = content.replace(old_handler, new_handler)
print("3. Added handleApproveRequest")

# 4. Add Pending Requests section after the codes grid
old_section = """          {codes.length === 0 && <p className="text-sm text-slate-400 col-span-full">No codes generated yet.</p>}
        </div>
      </section>"""

new_section = """          {codes.length === 0 && <p className="text-sm text-slate-400 col-span-full">No codes generated yet.</p>}
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

content = content.replace(old_section, new_section)
print("4. Added Pending Requests section")

# 5. Fix key prop for codes.map
content = content.replace('codes.map((c) => (', 'codes.map((c, i) => (')
content = content.replace("key={c.code}", "key={c.code || i}")
print("5. Fixed key props")

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone! Restart frontend and hard refresh.")
