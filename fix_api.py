with open('src/services/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

old = "export const adminAPI = {\n  getCodes: () => api.get('/api/admin/codes'),\n  createCode: (data) => api.post('/api/admin/codes', data),\n}"

new = "export const adminAPI = {\n  getCodes: () => api.get('/api/admin/codes'),\n  createCode: (data) => api.post('/api/admin/codes', data),\n  sendCode: (data) => api.post('/api/admin/codes/send', data),\n}"

if old in content:
    content = content.replace(old, new)
    print('Added sendCode')
else:
    print('adminAPI not found')

with open('src/services/api.js', 'w', encoding='utf-8') as f:
    f.write(content)
