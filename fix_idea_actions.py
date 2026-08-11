with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Line 542 (index 541): description paragraph
# Insert action buttons AFTER line 542, BEFORE line 543 (the flex div)
action_buttons = '''              <div className="flex gap-2 mt-2">
                {idea.status !== 'approved' && idea.status !== 'rejected' && (
                  <button onClick={() => handleApproveIdea(idea.id || idea._id)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-200">Approve</button>
                )}
                {idea.status === 'approved' && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">✓ Approved</span>
                )}
                {idea.status !== 'rejected' && idea.status !== 'approved' && (
                  <button onClick={() => handleRejectIdea(idea.id || idea._id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Reject</button>
                )}
                {idea.status === 'rejected' && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">✗ Rejected</span>
                )}
              </div>
'''

# Insert after line 542 (index 541)
lines.insert(542, action_buttons)

# Also fix the description line to show problem/solution instead of description
lines[541] = lines[541].replace(
    '{idea.description}',
    "{idea.problem || idea.description || 'No description'}"
)

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Added Approve/Reject buttons to idea cards')
