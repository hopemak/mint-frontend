import os, glob

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
analytics_files = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)
path = analytics_files[0]

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find useApiData line
hook_line = None
for i, line in enumerate(lines):
    if 'useApiData' in line:
        hook_line = i
        break

if hook_line is None:
    print("❌ useApiData not found")
    exit()

fixed = 0
new_lines = []
for i, line in enumerate(lines):
    # Before the hook, remove any lines referencing error or data
    if i < hook_line and ('error' in line or 'data' in line) and 'sampleAnalytics' not in line and 'useApiData' not in line:
        print(f"Removing premature reference at line {i+1}: {line.rstrip()[:80]}")
        fixed += 1
        continue
    new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"\n✅ Removed {fixed} premature references")
