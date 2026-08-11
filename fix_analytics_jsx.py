import os, glob

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
analytics_files = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)
path = analytics_files[0]

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Original size: {len(content)} chars")

# 1. Remove the incorrectly placed guard code (outside function)
bad_guard = '''  if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!data) return <div className="p-8 text-center text-slate-500">No data available</div>

'''
if bad_guard in content:
    content = content.replace(bad_guard, '')
    print("✅ Removed incorrectly placed guard code")

# 2. Find the useApiData destructuring line and insert guards RIGHT AFTER it
# The pattern is: const { data, loading, error, isFallback } = useApiData(...)
lines = content.split('\n')
new_lines = []
inserted = False
i = 0
while i < len(lines):
    new_lines.append(lines[i])
    # Look for the useApiData line
    if 'useApiData' in lines[i] and not inserted:
        # The destructuring might span multiple lines, find the end
        j = i
        while j < len(lines) and ')' not in lines[j]:
            j += 1
            new_lines.append(lines[j])
        # Now insert the guards after this line
        new_lines.append('')
        new_lines.append('  if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>')
        new_lines.append('  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>')
        new_lines.append('  if (!data) return <div className="p-8 text-center text-slate-500">No data available</div>')
        new_lines.append('')
        i = j + 1
        inserted = True
        print("✅ Inserted guards inside function after useApiData")
        continue
    i += 1

content = '\n'.join(new_lines)

# 3. Also remove any duplicate guard blocks that might exist
# Remove standalone lines that match the guard pattern
content_lines = content.split('\n')
clean_lines = []
skip_next = 0
for idx, line in enumerate(content_lines):
    if skip_next > 0:
        skip_next -= 1
        continue
    # Check if this line is a guard outside the function
    if idx < 25 and ('if (loading) return' in line or 'if (error) return' in line or 'if (!data) return' in line):
        print(f"  Removing stray guard at line {idx+1}")
        continue
    clean_lines.append(line)

content = '\n'.join(clean_lines)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"New size: {len(content)} chars")
print("\n=== FIRST 35 LINES ===")
for i, line in enumerate(content.split('\n')[:35], 1):
    print(f"{i:2d}: {line.rstrip()[:100]}")
