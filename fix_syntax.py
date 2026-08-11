import re

# Fix 1: Admin.jsx — replace box-drawing characters with simple dashes
with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    admin = f.read()

# Replace all box-drawing and special unicode chars in comments with simple dashes
admin = admin.replace('─', '-')
admin = admin.replace('───', '---')
admin = admin.replace('──', '--')

# Also fix any other problematic unicode chars
admin = admin.replace('│', '|')
admin = admin.replace('┌', '+')
admin = admin.replace('┐', '+')
admin = admin.replace('└', '+')
admin = admin.replace('┘', '+')

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(admin)

print('✅ Admin.jsx: Replaced box-drawing chars with ASCII dashes')

# Fix 2: api.js — fix broken ideaAPI.getById
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

# Fix the broken getById line
api = api.replace(
    "getById: (id) => api.get(`/api/ideas/${id}",
    "getById: (id) => api.get(`/api/ideas/${id}`),"
)

# Also check if update exists in ideaAPI, if not add it
if 'ideaAPI' in api and 'update:' not in api[api.find('ideaAPI'):api.find('}', api.find('ideaAPI'))]:
    api = api.replace(
        "getById: (id) => api.get(`/api/ideas/${id}`),",
        "getById: (id) => api.get(`/api/ideas/${id}`),\n  update: (id, data) => api.put(`/api/ideas/${id}`, data),"
    )
    print('✅ api.js: Fixed getById and added update')
else:
    print('✅ api.js: Fixed getById')

with open('src/services/api.js', 'w', encoding='utf-8') as f:
    f.write(api)

# Verify both files compile
try:
    compile(admin, 'Admin.jsx', 'exec')
    print('✅ Admin.jsx compiles successfully')
except SyntaxError as e:
    print(f'❌ Admin.jsx still has error: {e}')

try:
    compile(api, 'api.js', 'exec')
    print('✅ api.js compiles successfully')
except SyntaxError as e:
    print(f'❌ api.js still has error: {e}')
