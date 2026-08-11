with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the Ideas section and insert button + form after the description paragraph
old_text = '''<p className="text-sm text-slate-500 mb-4">Review submitted ideas and run AI evaluations.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">'''

new_text = '''<p className="text-sm text-slate-500 mb-4">Review submitted ideas and run AI evaluations.</p>
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
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">'''

if old_text in content:
    content = content.replace(old_text, new_text)
    print('✅ Ideas form inserted')
else:
    print('⚠️ Could not find exact text — trying alternative')
    # Try with different spacing
    old_text2 = 'Review submitted ideas and run AI evaluations.</p>'
    if old_text2 in content:
        content = content.replace(old_text2, 'Review submitted ideas and run AI evaluations.</p>\n        <button onClick={() => setShowCreateIdea(!showCreateIdea)} className="btn btn-primary text-sm flex items-center gap-2 mb-4">{showCreateIdea ? \'Cancel\' : \'New Idea\'}</button>\n        {showCreateIdea && (\n          <form onSubmit={handleCreateIdea} className="card p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-6 gap-3">\n            <input required placeholder="Idea title" className="input text-sm sm:col-span-2" value={ideaForm.title} onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })} />\n            <input required placeholder="Problem statement" className="input text-sm sm:col-span-2 lg:col-span-6" value={ideaForm.problem} onChange={(e) => setIdeaForm({ ...ideaForm, problem: e.target.value })} />\n            <input required placeholder="Solution" className="input text-sm sm:col-span-2 lg:col-span-6" value={ideaForm.solution} onChange={(e) => setIdeaForm({ ...ideaForm, solution: e.target.value })} />\n            <input placeholder="Category" className="input text-sm" value={ideaForm.category} onChange={(e) => setIdeaForm({ ...ideaForm, category: e.target.value })} />\n            <input placeholder="Industry" className="input text-sm" value={ideaForm.industry} onChange={(e) => setIdeaForm({ ...ideaForm, industry: e.target.value })} />\n            <input type="number" min="1" max="10" placeholder="Innovation level (1-10)" className="input text-sm" value={ideaForm.innovation_level} onChange={(e) => setIdeaForm({ ...ideaForm, innovation_level: e.target.value })} />\n            <div className="flex gap-2 sm:col-span-2 lg:col-span-6">\n              <button type="button" onClick={() => setShowCreateIdea(false)} className="btn btn-outline text-sm flex-1">Cancel</button>\n              <button type="submit" className="btn btn-primary text-sm flex-1">Submit Idea</button>\n            </div>\n          </form>\n        )}')
        print('✅ Ideas form inserted (alt method)')

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
