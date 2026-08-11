import re

# Fix 1: api.js — find and show the broken section
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api_lines = f.readlines()

print("=== api.js LINES 65-80 ===")
for i in range(64, min(80, len(api_lines))):
    print(f"{i+1:4d}: {api_lines[i].rstrip()[:100]}")

# Fix the api.js by finding the exact broken pattern
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

# The issue: we may have duplicated or broken the ideaAPI block
# Let's rebuild the ideaAPI section cleanly
old_idea = None
start = api.find('ideaAPI = {')
if start != -1:
    end = api.find('}', start)
    old_idea = api[start:end+1]

if old_idea:
    print(f"\n=== CURRENT ideaAPI ===")
    print(old_idea)
    
    # Replace with clean version
    new_idea = """ideaAPI = {
  submit: (data) => api.post('/api/ideas/', data),
  getAll: () => api.get('/api/ideas'),
  getById: (id) => api.get(`/api/ideas/${id}`),
  update: (id, data) => api.put(`/api/ideas/${id}`, data),
  evaluate: (id) => api.post(`/api/ideas/${id}/evaluate`),
  delete: (id) => api.delete(`/api/ideas/${id}`),
}"""
    api = api.replace(old_idea, new_idea)
    
    with open('src/services/api.js', 'w', encoding='utf-8') as f:
        f.write(api)
    print("\n✅ api.js: Rebuilt ideaAPI section cleanly")

# Fix 2: Admin.jsx — replace middle-dot with simple dash
with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    admin = f.read()

admin = admin.replace(' · ', ' - ')
admin = admin.replace('·', '-')

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(admin)
print("✅ Admin.jsx: Replaced middle-dot with dash")

# Verify api.js by trying to parse as JS-like (check braces)
print("\n=== VERIFY api.js BRACES ===")
open_braces = api.count('{')
close_braces = api.count('}')
open_parens = api.count('(')
close_parens = api.count(')')
print(f"Braces: {{={open_braces} }}={close_braces}")
print(f"Parens: (={open_parens} )={close_parens}")
if open_braces == close_braces and open_parens == close_parens:
    print("✅ api.js braces/parens balanced")
else:
    print("❌ api.js STILL UNBALANCED")
