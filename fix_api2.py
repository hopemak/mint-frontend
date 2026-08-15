with open('src/services/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = """export const adminAPI = {
  getCodes: () => api.get('/api/admin/codes'),
  createCode: (data) => api.post('/api/admin/codes', data),
  sendCode: (data) => api.post('/api/admin/codes/send', data),
}"""

new = """export const adminAPI = {
  getCodes: () => api.get('/api/admin/codes'),
  createCode: (data) => api.post('/api/admin/codes', data),
  sendCode: (data) => api.post('/api/admin/codes/send', data),
  getRequests: () => api.get('/api/admin/codes/requests'),
  submitRequest: (data) => api.post('/api/admin/codes/requests', data),
  approveRequest: (data) => api.post('/api/admin/codes/approve', data),
}"""

if old in content:
    content = content.replace(old, new)
    print('Updated adminAPI')
else:
    print('adminAPI not found')

with open('src/services/api.js', 'w', encoding='utf-8') as f:
    f.write(content)
