with open('src/services/api.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== FULL api.js ===")
for i, line in enumerate(lines, 1):
    print(f"{i:4d}: {line.rstrip()}")
