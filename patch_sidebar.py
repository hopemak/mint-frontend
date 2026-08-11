import re

with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the right sidebar start
sidebar_start = content.find('w-72 border-l border-slate-100')
if sidebar_start == -1:
    sidebar_start = content.find('w-80 border-l')
sidebar_end = content.find('</aside>', sidebar_start)
if sidebar_end == -1:
    sidebar_end = content.find('</div>\\n    </div>\\n  )\\n}', sidebar_start)

old_sidebar = content[sidebar_start:sidebar_end + len('</aside>')]

# Build new sidebar
new_sidebar = '''w-72 border-l border-slate-100 dark:border-primary-700 bg-slate-50/50 dark:bg-primary-800/30 p-4 space-y-6 overflow-y-auto">
          {/* Sprint Stats */}
          <div className="card p-4">
            <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4 text-primary" /> Sprint Overview
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-primary">{sprintStats.total}</p>
                <p className="text-xs text-slate-400">Total Tasks</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-emerald-500">{sprintStats.done}</p>
                <p className="text-xs text-slate-400">Completed</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-500">{sprintStats.inProgress}</p>
                <p className="text-xs text-slate-400">In Progress</p>
              </div>
              <div className="text-center p-2 bg-white dark:bg-primary-700 rounded-lg">
                <p className="text-2xl font-bold text-amber-500">{sprintStats.storyPoints}</p>
                <p className="text-xs text-slate-400">Story Points</p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary" /> Milestones
              </h3>
              <button
                onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                className="text-xs text-primary hover:text-primary-600"
              >
                {showMilestoneForm ? 'Cancel' : '+ Add'}
              </button>
            </div>

            {showMilestoneForm && (
              <form onSubmit={handleAddMilestone} className="mb-3 space-y-2">
                <input
                  type="text"
                  placeholder="Milestone title"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm({...milestoneForm, title: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-primary-700 dark:border-primary-600"
                  required
                />
                <input
                  type="date"
                  value={milestoneForm.date}
                  onChange={(e) => setMilestoneForm({...milestoneForm, date: e.target.value})}
                  className="w-full px-2 py-1.5 text-sm border rounded dark:bg-primary-700 dark:border-primary-600"
                  required
                />
                <button
                  type="submit"
                  className="w-full px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary-600"
                >
                  Add Milestone
                </button>
              </form>
            )}

            {milestones.length > 0 ? (
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 group">
                    <button
                      onClick={() => toggleMilestone(i)}
                      className="shrink-0 mt-0.5"
                    >
                      {m.completed ? (
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-amber-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${m.completed ? 'line-through text-slate-400' : ''}`}>
                        {m.title}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(m.date)}</p>
                    </div>
                    <button
                      onClick={() => deleteMilestone(i)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 shrink-0"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No milestones set.</p>
            )}
          </div>

          {/* Team Quick View */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-primary" /> Team
              </h3>
              <button
                onClick={() => setActiveTab('team')}
                className="text-xs text-primary hover:text-primary-600"
              >
                View All
              </button>
            </div>
            {mentors.length > 0 ? (
              <div className="space-y-3">
                {mentors.slice(0, 3).map((m) => (
                  <div key={m.mentor_id || m.id || m._id} className="flex items-start gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {(m.full_name || m.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{(m.full_name || m.name || 'Unnamed')}</p>
                      <p className="text-xs text-slate-400 truncate">{m.position || m.role || 'Mentor'}</p>
                      {m.expertise_areas && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(m.expertise_areas) ? m.expertise_areas : String(m.expertise_areas).split(',').map(s=>s.trim())).slice(0, 2).map((area, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {mentors.length > 3 && (
                  <button
                    onClick={() => setActiveTab('team')}
                    className="text-xs text-primary hover:underline w-full text-center"
                  >
                    +{mentors.length - 3} more mentors
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No mentors assigned.</p>
            )}
          </div>
        </aside>'''

content = content.replace(old_sidebar, new_sidebar)

# Now add the milestone state and handlers near other useState hooks
# Find the existing useState block and add after it
old_state = "const [showMilestoneForm, setShowMilestoneForm] = useState(false)"
if old_state not in content:
    # Find a good insertion point - after the last useState
    idx = content.rfind('const [')
    if idx != -1:
        # Find end of that line
        line_end = content.find('\\n', idx)
        insert = "\\n  const [milestones, setMilestones] = useState(selectedProject?.milestones || [])\\n  const [milestoneForm, setMilestoneForm] = useState({ title: '', date: '' })\\n  const [showMilestoneForm, setShowMilestoneForm] = useState(false)"
        content = content[:line_end] + insert + content[line_end:]

# Add milestone handlers
old_handlers = "const handleDeleteTask"
new_handlers = """const handleAddMilestone = (e) => {
    e.preventDefault()
    if (!milestoneForm.title.trim() || !milestoneForm.date) return
    const newMilestone = {
      title: milestoneForm.title,
      date: milestoneForm.date,
      completed: false
    }
    const updated = [...milestones, newMilestone]
    setMilestones(updated)
    setMilestoneForm({ title: '', date: '' })
    setShowMilestoneForm(false)
    toast.success('Milestone added')
    // Save to localStorage for persistence
    localStorage.setItem('milestones_' + (selectedProject?.startup_id || selectedProject?.id), JSON.stringify(updated))
  }

  const toggleMilestone = (index) => {
    const updated = milestones.map((m, i) => i === index ? { ...m, completed: !m.completed } : m)
    setMilestones(updated)
    localStorage.setItem('milestones_' + (selectedProject?.startup_id || selectedProject?.id), JSON.stringify(updated))
  }

  const deleteMilestone = (index) => {
    const updated = milestones.filter((_, i) => i !== index)
    setMilestones(updated)
    localStorage.setItem('milestones_' + (selectedProject?.startup_id || selectedProject?.id), JSON.stringify(updated))
    toast.success('Milestone deleted')
  }

  const handleDeleteTask"""

content = content.replace(old_handlers, new_handlers)

# Load milestones from localStorage when project changes
old_load = "setMilestones(selectedProject?.milestones || [])"
if old_load not in content:
    # Add after project selection effect
    idx = content.find('setSelectedProject')
    if idx != -1:
        line_end = content.find('\\n', idx)
        insert = "\\n    // Load milestones from localStorage\\n    const saved = localStorage.getItem('milestones_' + (project?.startup_id || project?.id))\\n    if (saved) {\\n      try { setMilestones(JSON.parse(saved)) } catch {}\\n    } else {\\n      setMilestones(project?.milestones || [])\\n    }"
        content = content[:line_end] + insert + content[line_end:]

with open('src/pages/Workspace/Workspace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Sidebar patched with functional Milestones and Team')
