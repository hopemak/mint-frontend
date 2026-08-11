with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix expertise_areas crash
content = content.replace(
    '(m.expertise_areas || []).join(", ")',
    '(Array.isArray(m.expertise_areas) ? m.expertise_areas : (m.expertise_areas ? String(m.expertise_areas).split(",").map(s=>s.trim()) : [])).join(", ")'
)

# 2. Fix duplicate document keys
content = content.replace('{documents.map((doc) => (', '{documents.map((doc, idx) => (')
content = content.replace("key={doc.document_id || doc.id}", "key={(doc.document_id || doc.id || doc._id || 'doc-' + idx) + '-' + idx}")

# 3. Fix task creation payload
old = "await taskAPI.create({ ...taskForm, startup_id: selectedProject.startup_id || selectedProject.id })"
new = """const payload = {
        title: taskForm.title,
        description: taskForm.description || '',
        priority: taskForm.priority || 'Medium',
        column: taskForm.column || 'todo',
        status: taskForm.column || 'todo',
        startup_id: selectedProject.startup_id || selectedProject.id || selectedProject._id
      }
      console.log('TASK CREATE PAYLOAD:', payload)
      await taskAPI.create(payload)"""
content = content.replace(old, new)

# 4. Fix task move
content = content.replace("await taskAPI.update(task.id, { column: targetCol })", "await taskAPI.update(task.id, { column: targetCol, status: targetCol })")

with open('src/pages/Workspace/Workspace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Workspace.jsx fixed')
