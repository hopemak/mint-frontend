with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove showCreateIdea state if it exists
content = content.replace(
    "const [showCreateIdea, setShowCreateIdea] = useState(false)\n",
    ""
)

# 2. Remove ideaForm state if it exists
content = content.replace(
    "const [ideaForm, setIdeaForm] = useState({ title: '', problem: '', solution: '', category: 'General', industry: 'Technology', innovation_level: 5 })\n",
    ""
)

# 3. Remove handleCreateIdea function entirely
start = content.find('const handleCreateIdea = async (e) => {')
if start != -1:
    end = content.find('const handleDeleteIdea = async (id) => {', start)
    if end != -1:
        content = content[:start] + content[end:]
        print('Removed handleCreateIdea')
    else:
        print('Could not find end of handleCreateIdea')
else:
    print('No handleCreateIdea found')

# 4. Remove the "New Idea" button and form block
# Find and remove from <button onClick={() => setShowCreateIdea...> to the closing </form> )}
old_block = '        <button onClick={() => setShowCreateIdea(!showCreateIdea)} className="btn btn-primary text-sm flex items-center gap-2 mb-4">\n          {showCreateIdea ? \'Cancel\' : \'New Idea\'}\n        </button>\n        {showCreateIdea && (\n          <form onSubmit={handleCreateIdea} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">\n            <input required placeholder="Idea title" className="input text-sm sm:col-span-2" value={ideaForm.title} onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })} />\n            <input required placeholder="Problem statement" className="input text-sm sm:col-span-2 lg:col-span-6" value={ideaForm.problem} onChange={(e) => setIdeaForm({ ...ideaForm, problem: e.target.value })} />\n            <input required placeholder="Solution" className="input text-sm sm:col-span-2 lg:col-span-6" value={ideaForm.solution} onChange={(e) => setIdeaForm({ ...ideaForm, solution: e.target.value })} />\n            <input placeholder="Category" className="input text-sm" value={ideaForm.category} onChange={(e) => setIdeaForm({ ...ideaForm, category: e.target.value })} />\n            <input placeholder="Industry" className="input text-sm" value={ideaForm.industry} onChange={(e) => setIdeaForm({ ...ideaForm, industry: e.target.value })} />\n            <input type="number" min="1" max="10" placeholder="Innovation level (1-10)" className="input text-sm" value={ideaForm.innovation_level} onChange={(e) => setIdeaForm({ ...ideaForm, innovation_level: e.target.value })} />\n            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">\n              <button type="button" onClick={() => setShowCreateIdea(false)} className="btn btn-outline text-sm flex-1">Cancel</button>\n              <button type="submit" className="btn btn-primary text-sm flex-1">Submit Idea</button>\n            </div>\n          </form>\n        )}\n'

if old_block in content:
    content = content.replace(old_block, '')
    print('Removed New Idea form block')
else:
    print('New Idea form block not found (may already be removed)')

# 5. Add handleApproveIdea and handleRejectIdea before handleDeleteIdea
old_delete = 'const handleDeleteIdea = async (id) => {'
new_handlers = '''const handleApproveIdea = async (id) => {
    try {
      await ideaAPI.update(id, { status: 'approved' })
      toast.success('Idea approved')
      loadAll()
    } catch (err) {
      toast.error('Could not approve idea')
    }
  }

  const handleRejectIdea = async (id) => {
    try {
      await ideaAPI.update(id, { status: 'rejected' })
      toast.success('Idea rejected')
      loadAll()
    } catch (err) {
      toast.error('Could not reject idea')
    }
  }

  const handleDeleteIdea = async (id) => {'''
content = content.replace(old_delete, new_handlers)

# 6. Fix the Ideas section header
content = content.replace('Ideas & Startups', 'Ideas Management')

# 7. Add approve/reject buttons to idea cards
# Find the idea card and add action buttons
old_idea_card = '''                <span className={`badge shrink-0 ${statusColor[idea.status?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>{idea.status || 'pending'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{idea.description || idea.problem || 'No description'}</p>
              <div className="flex gap-2 mt-3">'''

new_idea_card = '''                <span className={`badge shrink-0 ${statusColor[idea.status?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>{idea.status || 'pending'}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{idea.description || idea.problem || 'No description'}</p>
              <div className="flex gap-2 mt-2">
                {idea.status !== 'approved' && (
                  <button onClick={() => handleApproveIdea(idea.id || idea._id)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">Approve</button>
                )}
                {idea.status !== 'rejected' && (
                  <button onClick={() => handleRejectIdea(idea.id || idea._id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Reject</button>
                )}
              </div>
              <div className="flex gap-2 mt-3">'''

content = content.replace(old_idea_card, new_idea_card)

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Admin Ideas section updated:')
print('  - Removed create idea form')
print('  - Added Approve/Reject buttons')
print('  - Renamed section to Ideas Management')
