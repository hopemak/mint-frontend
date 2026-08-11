with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''  const filteredMentors = useMemo(() => {
    const sector = selectedProject.sector.toLowerCase()'''

new = '''  const filteredMentors = useMemo(() => {
    if (!selectedProject || !selectedProject.sector || !mentors.length) return mentors
    const sector = selectedProject.sector.toLowerCase()'''

if old in content:
    content = content.replace(old, new)
    print('Fixed null check')
else:
    print('Pattern not found')

with open('src/pages/Workspace/Workspace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
