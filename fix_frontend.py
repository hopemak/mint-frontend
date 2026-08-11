import re

with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix expertise_areas crash
content = re.sub(
    r'\(m\.expertise_areas\s*\|\|\s*\[\]\)\.join\(([^)]+)\)',
    r'(Array.isArray(m.expertise_areas) ? m.expertise_areas : (m.expertise_areas ? String(m.expertise_areas).split(",").map(s=>s.trim()) : [])).join(\1)',
    content
)

# 2. Fix task creation payload
old = re.search(r'await taskAPI\.create\(\{[^}]*taskForm[^}]*startup_id[^}]*\}\)', content)
if old:
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
    content = content.replace(old.group(0), new)

# 3. Fix task move
content = content.replace(
    "await taskAPI.update(task.id, { column: targetCol })",
    "await taskAPI.update(task.id, { column: targetCol, status: targetCol })"
)

with open('src/pages/Workspace/Workspace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    check = f.read()

print('expertise_areas safe:', 'Array.isArray' in check)
print('task payload fixed:', 'TASK CREATE PAYLOAD' in check)
print('task move fixed:', 'status: targetCol' in check)
