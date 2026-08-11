with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Grant name
content = content.replace(
    '>{g.name}</p>',
    ">{g.grant_name || g.name || 'Unnamed'}</p>"
)

# 2. Amount & type -> Program & max amount
content = content.replace(
    '>${(g.amount || 0).toLocaleString()} · {g.type}</p>',
    ">{g.program || g.type || 'General'} · Max: ${(g.max_amount || g.amount || 0).toLocaleString()}</p>"
)

# 3. Deadline line -> add min amount
content = content.replace(
    ">Deadline: {g.deadline || 'TBD'}</p>",
    ">Min: ${(g.min_amount || 0).toLocaleString()} · Deadline: {g.deadline || 'TBD'}</p>"
)

# 4. Delete handler fallback
content = content.replace(
    'handleDeleteGrant(g.id || g._id)',
    'handleDeleteGrant(g.grant_id || g.id || g._id)'
)

# 5. Tags -> Sectors
content = content.replace(
    '{(g.tags || []).map((t, tIdx) => (',
    "{(g.sectors || g.tags || []).map((t, tIdx) => ("
)

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done — grant cards now show grant_name, program, max/min amount, and sectors')
