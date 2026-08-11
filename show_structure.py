with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== SECTION HEADERS (lines with <h2) ===")
for i, line in enumerate(lines, 1):
    if '<h2' in line or 'setShowCreate' in line or 'handleDelete' in line:
        print(f"{i:4d}: {line.strip()[:100]}")

print("\n=== FETCH USEEFFECT (lines with fetch/axios) ===")
for i, line in enumerate(lines, 1):
    if 'fetch(' in line or 'axios' in line or 'API.get' in line or 'API.create' in line or 'loadData' in line or 'useEffect' in line:
        print(f"{i:4d}: {line.strip()[:100]}")
