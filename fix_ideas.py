import re

with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state declarations after showCreateEvent
old_state = "const [showCreateEvent, setShowCreateEvent] = useState(false)"
new_state = """const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showCreateIdea, setShowCreateIdea] = useState(false)
  const [ideaForm, setIdeaForm] = useState({ title: '', problem: '', solution: '', category: 'General', industry: 'Technology', innovation_level: 5 })"""
content = content.replace(old_state, new_state)

# 2. Add handleCreateIdea before handleDeleteIdea
old_delete_idea = "const handleDeleteIdea = async (id) => {"
new_handlers = """const handleCreateIdea = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title: ideaForm.title,
        problem: ideaForm.problem,
        solution: ideaForm.solution,
        category: ideaForm.category,
        industry: ideaForm.industry,
        innovation_level: Number(ideaForm.innovation_level),
      }
      await ideaAPI.create(payload)
      toast.success('Idea submitted')
      setIdeaForm({ title: '', problem: '', solution: '', category: 'General', industry: 'Technology', innovation_level: 5 })
      setShowCreateIdea(false)
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit idea')
    }
  }

  const handleDeleteIdea = async (id) => {"""
content = content.replace(old_delete_idea, new_handlers)

# 3. Fix Ideas section - add create button and form, fix display cards
# Find the Ideas section header and replace the whole block
old_ideas_section = r'(<h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">\s*Startups\s*</h2>\s*<p className="text-sm text-slate-500 mb-4">Review submitted ideas and run AI evaluations\.</p>)'
new_ideas_section = r'''<h2 className="font-heading text-3xl font-bold text-ink dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-2">
          Ideas
        </h2>
        <p className="text-sm text-slate-500 mb-4">Review submitted ideas and run AI evaluations.</p>
        <button onClick={() => setShowCreateIdea(!showCreateIdea)} className="btn btn-primary text-sm flex items-center gap-2 mb-4">
          {showCreateIdea ? 'Cancel' : 'New Idea'}
        </button>
        {showCreateIdea && (
          <form onSubmit={handleCreateIdea} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input required placeholder="Idea title" className="input text-sm sm:col-span-2" value={ideaForm.title} onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })} />
            <input required placeholder="Problem statement" className="input text-sm sm:col-span-2 lg:col-span-6" value={ideaForm.problem} onChange={(e) => setIdeaForm({ ...ideaForm, problem: e.target.value })} />
            <input required placeholder="Solution" className="input text-sm sm:col-span-2 lg:col-span-6" value={ideaForm.solution} onChange={(e) => setIdeaForm({ ...ideaForm, solution: e.target.value })} />
            <input placeholder="Category" className="input text-sm" value={ideaForm.category} onChange={(e) => setIdeaForm({ ...ideaForm, category: e.target.value })} />
            <input placeholder="Industry" className="input text-sm" value={ideaForm.industry} onChange={(e) => setIdeaForm({ ...ideaForm, industry: e.target.value })} />
            <input type="number" min="1" max="10" placeholder="Innovation level (1-10)" className="input text-sm" value={ideaForm.innovation_level} onChange={(e) => setIdeaForm({ ...ideaForm, innovation_level: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
              <button type="button" onClick={() => setShowCreateIdea(false)} className="btn btn-outline text-sm flex-1">Cancel</button>
              <button type="submit" className="btn btn-primary text-sm flex-1">Submit Idea</button>
            </div>
          </form>
        )}'''
content = re.sub(old_ideas_section, new_ideas_section, content)

# 4. Fix Idea display cards to show correct backend fields
# Fix title display
content = content.replace(
    '{idea.title}',
    "{idea.title || 'Untitled'}"
)
# Fix sector/industry display
content = content.replace(
    '{idea.sector || \'General\'}',
    "{idea.industry || idea.sector || 'General'}"
)
# Fix TRL display (backend uses innovation_level)
content = content.replace(
    'TRL {idea.trl_level || \'N/A\'}',
    "Innovation: {idea.innovation_level || 'N/A'}/10"
)
# Fix status badge
content = content.replace(
    '{idea.status || \'New\'}',
    "{idea.status || 'pending'}"
)
# Fix delete handler
content = content.replace(
    'handleDeleteIdea(idea.id || idea._id)',
    'handleDeleteIdea(idea.id || idea._id || idea.idea_id)'
)

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Ideas fixed:')
print('  - Added showCreateIdea state and ideaForm state')
print('  - Added handleCreateIdea with correct backend payload')
print('  - Added create form with title, problem, solution, category, industry, innovation_level')
print('  - Fixed display cards to show title, industry, innovation_level, status')
