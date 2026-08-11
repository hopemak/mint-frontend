import re

with open('src/pages/Workspace/Workspace.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Strategy: Find the exact start and end of the Team tab section and replace it entirely

# Find the Team tab start
team_start = content.find("{activeTab === 'team' && (")
if team_start == -1:
    print("ERROR: Could not find Team tab start")
    exit(1)

# Find the end of Team tab - it should close before the next activeTab
# Look for the pattern:           )}
# followed by documents tab
next_tab = content.find("{activeTab === 'documents'", team_start)
if next_tab == -1:
    print("ERROR: Could not find next tab after Team")
    exit(1)

# Go back to find the closing of Team tab
# The Team tab ends with:             </div>\n          )}
# Let's find the last )} before documents
search_area = content[team_start:next_tab]
# Find the last occurrence of ")}"
last_close = search_area.rfind(')}')
if last_close == -1:
    print("ERROR: Could not find Team tab closing")
    exit(1)

team_end = team_start + last_close + len(')}')

print(f"Team tab spans lines {content[:team_start].count(chr(10))+1} to {content[:team_end].count(chr(10))+1}")

# Build the new Team tab
new_team_tab = """{activeTab === 'team' && (
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
          )}"""

# Replace the Team tab
content = content[:team_start] + new_team_tab + content[team_end:]

# Now verify balance
paren = 0
brace = 0
for ch in content:
    if ch == '(':
        paren += 1
    elif ch == ')':
        paren -= 1
    elif ch == '{':
        brace += 1
    elif ch == '}':
        brace -= 1

print(f"After fix - Parentheses: {paren}, Braces: {brace}")

if paren != 0 or brace != 0:
    print("WARNING: Still unbalanced!")
else:
    print("✅ Balanced!")

with open('src/pages/Workspace/Workspace.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
