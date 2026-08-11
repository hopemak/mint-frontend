import re

with open('src/pages/Startups/Startups.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Original size: {len(content)} chars")

# 1. Add useNavigate and toast imports
old_imports = "import { Link } from 'react-router-dom'"
new_imports = "import { Link, useNavigate } from 'react-router-dom'\nimport toast from 'react-hot-toast'"
content = content.replace(old_imports, new_imports)

# 2. Add navigate hook inside component
old_component = "export default function Startups() {"
new_component = "export default function Startups() {\n  const navigate = useNavigate()"
content = content.replace(old_component, new_component)

# 3. Add handleDelete function before the return
old_return = "  return (\n    <div>"
new_handlers = """  const handleDeleteStartup = async (id) => {
    if (!window.confirm('Delete this startup?')) return
    try {
      await startupAPI.deleteById(id)
      toast.success('Startup deleted')
      setData(data.filter((s) => (s.startup_id || s.id) !== id))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete')
    }
  }

  return (
    <div>"""
content = content.replace(old_return, new_handlers)

# 4. Replace the button row with working buttons
old_buttons = '''                      <button className="p-1.5 rounded-lghover:bg-slate-100 dark:hover:bg-primary-700"><EyeIcon className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded-lghover:bg-slate-100 dark:hover:bg-primary-700"><PencilSquareIcon className="h-4 w-4" /></button>
                      <button className="p-1.5 rounded-lghover:bg-red-50 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>'''

new_buttons = '''                      <button onClick={() => navigate(`/startups/${s.startup_id || s.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700" title="View"><EyeIcon className="h-4 w-4" /></button>
                      <button onClick={() => navigate(`/startups/${s.startup_id || s.id}/edit`)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-primary-700" title="Edit"><PencilSquareIcon className="h-4 w-4" /></button>
                      <button onClick={() => handleDeleteStartup(s.startup_id || s.id)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500" title="Delete"><TrashIcon className="h-4 w-4" /></button>'''

content = content.replace(old_buttons, new_buttons)

with open('src/pages/Startups/Startups.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"New size: {len(content)} chars")
print("✅ Added View, Edit, Delete handlers")
