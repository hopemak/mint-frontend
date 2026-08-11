with open('src/services/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find updateStatus line and insert } right after it
old = "  updateStatus: (id, status) => api.put('/api/startups/'+ id + '/status', {status: status}),\n\n//"
new = "  updateStatus: (id, status) => api.put('/api/startups/'+ id + '/status', {status: status}),\n}\n\n//"

if old in content:
    content = content.replace(old, new)
    print("Fixed!")
else:
    print("Pattern not found, trying alternative...")
    # Try with different spacing
    old2 = "  updateStatus: (id, status) => api.put('/api/startups/'+ id + '/status', {status: status}),\n\n\n//"
    new2 = "  updateStatus: (id, status) => api.put('/api/startups/'+ id + '/status', {status: status}),\n}\n\n\n//"
    if old2 in content:
        content = content.replace(old2, new2)
        print("Fixed (alt)!")
    else:
        print("Could not find pattern")

with open('src/services/api.js', 'w', encoding='utf-8') as f:
    f.write(content)
