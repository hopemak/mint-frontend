with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find Ideas section
for i, line in enumerate(lines, 1):
    if 'Ideas' in line or 'Startups' in line or 'Review submitted ideas' in line:
        print(f"{i:4d}: {line.rstrip()[:120]}")
        # Print surrounding context
        for j in range(max(0, i-2), min(len(lines), i+8)):
            if j != i-1:
                print(f"     {lines[j].rstrip()[:120]}")
        print("---")
