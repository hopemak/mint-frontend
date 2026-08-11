with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the ideas.map block
in_ideas = False
for i, line in enumerate(lines, 1):
    if 'ideas.map' in line:
        in_ideas = True
    if in_ideas:
        print(f"{i:4d}: {line.rstrip()[:130]}")
        if i > 560 and '))}' in line:
            break
