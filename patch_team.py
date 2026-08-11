import re

with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add selectedMentor state after other useState hooks
state_insert = '''
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [showMentorModal, setShowMentorModal] = useState(false)'''
    
# Find a safe insertion point - after the last useState before useEffect
idx = content.find('const [showMilestoneForm,')
if idx == -1:
    idx = content.find('const [milestoneForm,')
if idx == -1:
    idx = content.rfind('const [')
    
if idx != -1:
    line_end = content.find('\n', idx)
    content = content[:line_end] + state_insert + content[line_end:]
    print('Added mentor modal state')
else:
    print('Could not find state insertion point')

# 2. Add filteredMentors computed value before sprintStats
filter_block = '''
  const filteredMentors = useMemo(() => {
    if (!selectedProject?.sector || !mentors.length) return mentors
    const sector = selectedProject.sector.toLowerCase()
    return mentors.filter(m => {
      const prefs = Array.isArray(m.preferred_sectors) ? m.preferred_sectors : []
      const expertise = Array.isArray(m.expertise_areas) ? m.expertise_areas : []
      return prefs.some(s => s.toLowerCase().includes(sector)) ||
             expertise.some(e => e.toLowerCase().includes(sector)) ||
             sector.includes((m.preferred_sectors || []).join(' ').toLowerCase())
    })
  }, [mentors, selectedProject])

'''

idx = content.find('const sprintStats = useMemo')
if idx != -1:
    content = content[:idx] + filter_block + content[idx:]
    print('Added filteredMentors')
else:
    print('Could not find sprintStats')

# 3. Replace sidebar Team section
old_team_sidebar = '''{mentors.length > 0 ? (
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
            )}'''

new_team_sidebar = '''{filteredMentors.length > 0 ? (
              <div className="space-y-3">
                {filteredMentors.slice(0, 3).map((m) => (
                  <div 
                    key={m.mentor_id || m.id || m._id} 
                    className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-primary-700/50 p-1.5 rounded-lg transition-colors"
                    onClick={() => { setSelectedMentor(m); setShowMentorModal(true); }}
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                      {(m.full_name || m.name || '?').charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{(m.full_name || m.name || 'Unnamed')}</p>
                      <p className="text-xs text-slate-400 truncate">{m.years_experience ? m.years_experience + ' yrs exp' : 'Mentor'}</p>
                      {m.expertise_areas && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(Array.isArray(m.expertise_areas) ? m.expertise_areas : String(m.expertise_areas).split(',').map(s=>s.trim())).slice(0, 2).map((area, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-1 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                          {m.availability || 'Available'}
                        </span>
                        {m.rating && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            {m.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredMentors.length > 3 && (
                  <button
                    onClick={() => setActiveTab('team')}
                    className="text-xs text-primary hover:underline w-full text-center py-1"
                  >
                    +{filteredMentors.length - 3} more mentors
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No matching mentors for this sector.</p>
            )}'''

if old_team_sidebar in content:
    content = content.replace(old_team_sidebar, new_team_sidebar)
    print('Replaced sidebar Team section')
else:
    print('Could not find old sidebar Team section')

# 4. Replace Team tab with rich cards
old_team_tab = '''{activeTab === 'team' && (
            <div>
              <h2 className="font-heading font-semibold text-lg mb-4">Team & Mentors</h2>
              {mentorsLoading ? (
                <LoadingBlock />
              ) : mentors.length === 0 ? (
                <EmptyState title="No mentors yet" subtitle="Mentors will appear here when available." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mentors.map((m) => (
                    <div key={m.mentor_id || m.id} className="card p-4flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {(m.full_name || m.name || '?').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{m.full_name || m.name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {(Array.isArray(m.expertise_areas) ? m.expertise_areas : (m.expertise_areas ? String(m.expertise_areas).split(",").map(s=>s.trim()) : [])).join(', ') || m.expertise || 'No expertise'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}'''

new_team_tab = '''{activeTab === 'team' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-lg">Team & Mentors</h2>
                <div className="text-xs text-slate-400">
                  {filteredMentors.length} matching · {mentors.length} total
                </div>
              </div>
              {mentorsLoading ? (
                <LoadingBlock />
              ) : mentors.length === 0 ? (
                <EmptyState title="No mentors yet" subtitle="Mentors will appear here when available." />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mentors.map((m) => {
                    const isMatch = filteredMentors.includes(m)
                    return (
                      <div 
                        key={m.mentor_id || m.id || m._id} 
                        className={`card p-4 hover:shadow-md transition-shadow cursor-pointer ${isMatch ? 'ring-1 ring-primary/30' : 'opacity-75'}`}
                        onClick={() => { setSelectedMentor(m); setShowMentorModal(true); }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                            {(m.full_name || m.name || '?').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{m.full_name || m.name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-400">{m.years_experience ? m.years_experience + ' years experience' : 'Mentor'}</p>
                            {isMatch && (
                              <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                Recommended for {selectedProject?.sector}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {(Array.isArray(m.expertise_areas) ? m.expertise_areas : (m.expertise_areas ? String(m.expertise_areas).split(',').map(s=>s.trim()) : [])).map((area, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-primary-700 text-slate-600 dark:text-slate-300 rounded-full">
                              {area}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-primary-700">
                          <div className="flex items-center gap-2">
                            {m.rating && (
                              <span className="text-xs text-amber-600 font-medium">{'★'.repeat(Math.round(m.rating))} {m.rating}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${m.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              {m.availability || 'Unknown'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{m.country || ''}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}'''

if old_team_tab in content:
    content = content.replace(old_team_tab, new_team_tab)
    print('Replaced Team tab')
else:
    print('Could not find old Team tab')

# 5. Add mentor modal before the final closing div
modal_html = '''
      {/* Mentor Detail Modal */}
      {showMentorModal && selectedMentor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMentorModal(false)}>
          <div className="bg-white dark:bg-primary-800 rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
                {(selectedMentor.full_name || selectedMentor.name || '?').charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{(selectedMentor.full_name || selectedMentor.name || 'Unnamed')}</h3>
                <p className="text-sm text-slate-400">{selectedMentor.years_experience ? selectedMentor.years_experience + ' years experience' : 'Mentor'}</p>
                <div className="flex gap-2 mt-2">
                  {selectedMentor.rating && (
                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{'★'.repeat(Math.round(selectedMentor.rating))} {selectedMentor.rating}</span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedMentor.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedMentor.availability || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Expertise</p>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(selectedMentor.expertise_areas) ? selectedMentor.expertise_areas : (selectedMentor.expertise_areas ? String(selectedMentor.expertise_areas).split(',').map(s=>s.trim()) : [])).map((area, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{area}</span>
                ))}
              </div>
            </div>
            {selectedMentor.preferred_sectors && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Preferred Sectors</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedMentor.preferred_sectors) ? selectedMentor.preferred_sectors : []).map((s, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-slate-100 dark:bg-primary-700 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { toast.success('Message sent to ' + (selectedMentor.full_name || selectedMentor.name)); setShowMentorModal(false); }}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 text-sm font-medium"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowMentorModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-primary-600 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}'''

# Insert before the final closing </div> of the main container
# Find the last </div> before the component closing
last_div = content.rfind('    </div>\n  )\n}')
if last_div != -1:
    content = content[:last_div] + modal_html + '\n' + content[last_div:]
    print('Added mentor modal')
else:
    print('Could not find insertion point for modal')

with open('src/pages/Workspace/Workspace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('\\nDone! Changes applied.')
