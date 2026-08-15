with open('src/pages/Auth/Register.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find handleRequestAccess and replace the API call with localStorage
old = """  const handleRequestAccess = async (e) => {
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

new = """  const handleRequestAccess = async (e) => {
    e.preventDefault()
    if (!requestEmail.trim()) return toast.error('Email is required')
    try {
      const existing = JSON.parse(localStorage.getItem('mint_requests') || '[]')
      const newRequest = {
        request_id: 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        email: requestEmail.trim(),
        role: selectedRole,
        status: 'pending',
        created_at: new Date().toISOString()
      }
      localStorage.setItem('mint_requests', JSON.stringify([...existing, newRequest]))
      toast.success('Access request submitted! Admin will review and send code to your email.')
      setRequestSent(true)
    } catch (err) {
      toast.error('Could not submit request')
    }
  }"""

if old in content:
    content = content.replace(old, new)
    print('Fixed: Register now saves requests to localStorage')
else:
    print('Pattern mismatch - trying alternative...')
    # Try with single quotes
    old2 = old.replace("'", '"')
    if old2 in content:
        content = content.replace(old2, new)
        print('Fixed with double quotes')
    else:
        print('Could not find exact function body')

with open('src/pages/Auth/Register.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
