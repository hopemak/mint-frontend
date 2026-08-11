import re

with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Flexible regex for task move update
content = re.sub(
    r'await taskAPI\.update\([^,]+,\s*\{\s*column:\s*[^}]+?\}\s*\)',
    'await taskAPI.update(task.id, { column: targetCol, status: targetCol })',
    content
)

with open('src/pages/Workspace/Workspace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    check = f.read()

print('task move fixed:', 'status: targetCol' in check)
