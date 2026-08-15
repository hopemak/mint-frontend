with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

changes = []

# 1. Add handleApproveRequest if missing
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
        changes.append("ERROR: Could not find handleSendCode to insert after")
else:
    changes.append("handleApproveRequest already exists")

# 2. Fix key props on all map calls that lack them
# grants.map((g) => ( -> grants.map((g, gi) => (
if 'grants.map((g) => (' in content:
    content = content.replace('grants.map((g) => (', 'grants.map((g, gi) => (')
    changes.append("Fixed grants.map key")

# pendingGrants.map((g) -> pendingGrants.map((g, pgi) -> also fix key
if 'pendingGrants.map((g) => (' in content:
    content = content.replace('pendingGrants.map((g) => (', 'pendingGrants.map((g, pgi) => (')
    changes.append("Fixed pendingGrants.map key")

# fundingRequests.filter(...).map((r) -> fundingRequests.filter(...).map((r, ri)
if "fundingRequests.filter((r) => r.status === 'pending').map((r) => (" in content:
    content = content.replace("fundingRequests.filter((r) => r.status === 'pending').map((r) => (", 
                              "fundingRequests.filter((r) => r.status === 'pending').map((r, ri) => (")
    changes.append("Fixed fundingRequests.map key")

# ideas.map((idea) -> ideas.map((idea, ii)
if 'ideas.map((idea) => (' in content:
    content = content.replace('ideas.map((idea) => (', 'ideas.map((idea, ii) => (')
    changes.append("Fixed ideas.map key")

# mentors.map((m) -> mentors.map((m, mi)
if 'mentors.map((m) => (' in content:
    content = content.replace('mentors.map((m) => (', 'mentors.map((m, mi) => (')
    changes.append("Fixed mentors.map key")

# 3. Ensure requests load from localStorage in useEffect
if 'setRequests(savedReqs)' not in content:
    # Find the useEffect that loads codes from localStorage
    if 'const saved = JSON.parse(localStorage.getItem' in content and 'setCodes(saved)' in content:
        content = content.replace(
            'setCodes(saved)',
            'setCodes(saved)\n    const savedReqs = JSON.parse(localStorage.getItem(\\'mint_requests\\') || \\'[]\\')\n    setRequests(savedReqs)'
        )
        changes.append("Added requests loading from localStorage")
    else:
        changes.append("Could not find useEffect to add requests loading")

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

for c in changes:
    print(c)
print("\nAdmin.jsx fixed!")
