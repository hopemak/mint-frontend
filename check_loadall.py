with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find loadAll function
for i, line in enumerate(lines, 1):
    if 'const loadAll' in line or 'const loadData' in line:
        print(f"=== loadAll STARTS AT LINE {i} ===")
        for j in range(i-1, min(len(lines), i+40)):
            print(f"{j+1:4d}: {lines[j].rstrip()[:120]}")
        print("---")
        break

# Find useEffect
for i, line in enumerate(lines, 1):
    if 'useEffect' in line and 'loadAll' in line:
        print(f"=== useEffect AT LINE {i} ===")
        print(lines[i-1].rstrip())
        break

# Check if any API calls are commented out or broken
print("\n=== ALL API CALLS IN loadAll ===")
for i, line in enumerate(lines, 1):
    if 'API.' in line and ('getAll' in line or 'get' in line or 'catch' in line):
        print(f"{i:4d}: {line.rstrip()[:120]}")
