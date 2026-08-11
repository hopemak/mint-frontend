with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove duplicate showCreateIdea and ideaForm declarations
# Keep the first occurrence, remove the second
seen_showCreateIdea = False
seen_ideaForm = False
clean_lines = []

for line in lines:
    if 'const [showCreateIdea, setShowCreateIdea]' in line:
        if seen_showCreateIdea:
            continue  # skip duplicate
        seen_showCreateIdea = True
    if 'const [ideaForm, setIdeaForm]' in line:
        if seen_ideaForm:
            continue  # skip duplicate
        seen_ideaForm = True
    clean_lines.append(line)

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print('Duplicate declarations removed')
