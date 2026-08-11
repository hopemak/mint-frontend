import os, glob

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
analytics_files = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)
path = analytics_files[0]

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Original size: {len(content)} chars")

# The problem: lines 25-26 use error/data before line 28 declares them
# We need to move the useApiData line BEFORE the guards

lines = content.split('\n')
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    
    # Skip the premature guard lines (error/data before declaration)
    if 'if (error) return' in line and i < 27:
        print(f"  Removing premature guard at line {i+1}: {line.strip()[:60]}")
        i += 1
        continue
    
    if 'if (!data) return' in line and i < 27:
        print(f"  Removing premature guard at line {i+1}: {line.strip()[:60]}")
        i += 1
        continue
    
    new_lines.append(line)
    
    # After we hit the useApiData line, insert the guards
    if 'useApiData' in line and 'const {' in line:
        new_lines.append('')
        new_lines.append('  if (loading) return <LoadingBlock />')
        new_lines.append('  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>')
        new_lines.append('  if (!data) return <div className="p-8 text-center text-slate-500">No data available</div>')
        new_lines.append('')
        print("  ✅ Inserted guards AFTER useApiData declaration")
    
    i += 1

content = '\n'.join(new_lines)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"New size: {len(content)} chars")
print("\n=== FIRST 40 LINES ===")
for i, line in enumerate(content.split('\n')[:40], 1):
    print(f"{i:2d}: {line.rstrip()[:100]}")
