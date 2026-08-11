with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of handleCreateIdea and keep only the first
parts = content.split('const handleCreateIdea = async (e) => {')
if len(parts) > 2:
    # Keep first occurrence + everything after the second one's end
    # The second function ends at "const handleDeleteIdea"
    second_start = content.find('const handleCreateIdea = async (e) => {', len(parts[0]) + len('const handleCreateIdea = async (e) => {'))
    second_end = content.find('const handleDeleteIdea = async (id) => {', second_start)
    if second_end != -1:
        content = content[:second_start] + content[second_end:]
        print('Removed duplicate handleCreateIdea')
    else:
        print('Could not find end of duplicate')
else:
    print('Only one handleCreateIdea found')

with open('src/pages/Admin/Admin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
