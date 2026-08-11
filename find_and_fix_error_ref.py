import os, glob

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
analytics_files = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)
path = analytics_files[0]

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("=== FULL FILE ===")
for i, line in enumerate(lines, 1):
    marker = ""
    if 'error' in line and 'useApiData' not in line and 'const {' not in line:
        marker = "  <-- has 'error'"
    if 'data' in line and 'useApiData' not in line and 'const {' not in line and 'sampleAnalytics' not in line:
        marker += "  <-- has 'data'"
    print(f"{i:2d}: {line.rstrip()[:100]}{marker}")

# Find where useApiData is declared
hook_line = None
for i, line in enumerate(lines):
    if 'useApiData' in line:
        hook_line = i
        break

print(f"\n=== useApiData at line {hook_line+1 if hook_line else 'NOT FOUND'} ===")

# Find any reference to error or data BEFORE the hook
if hook_line:
    print("\nReferences to 'error' or 'data' BEFORE useApiData:")
    for i in range(hook_line):
        if ('error' in lines[i] or 'data' in lines[i]) and 'sampleAnalytics' not in lines[i]:
            print(f"  Line {i+1}: {lines[i].rstrip()[:100]}")
