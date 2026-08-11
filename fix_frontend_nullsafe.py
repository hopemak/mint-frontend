import os, glob

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
analytics_files = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)

if not analytics_files:
    print("❌ Analytics.jsx not found")
    exit()

path = analytics_files[0]
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print(f"Fixing: {path}")
print(f"Original size: {len(content)} chars")

# Fix 1: Add null-safety to ALL data.field accesses
# Replace data.activeStartups with data?.activeStartups ?? 0 (or appropriate default)
replacements = [
    # Stat cards - use ?? 0 for numbers
    ('data.activeStartups', '(data?.activeStartups ?? 0)'),
    ('data.ideasSubmitted', '(data?.ideasSubmitted ?? 0)'),
    ('data.totalFunding', '(data?.totalFunding ?? "$0")'),
    ('data.mentors', '(data?.mentors ?? 0)'),
    ('data.jobsCreated', '(data?.jobsCreated ?? 0)'),
    
    # Chart data - use ?? [] for arrays
    ('data.growthTrend', '(data?.growthTrend ?? [])'),
    ('data.fundingByStage', '(data?.fundingByStage ?? [])'),
    ('data.submissionsByQuarter', '(data?.submissionsByQuarter ?? [])'),
    ('data.regions', '(data?.regions ?? [])'),
    ('data.sectorDistribution', '(data?.sectorDistribution ?? [])'),
    ('data.statusDistribution', '(data?.statusDistribution ?? [])'),
    ('data.fundingPipeline', '(data?.fundingPipeline ?? [])'),
    ('data.eventRegistrations', '(data?.eventRegistrations ?? [])'),
]

count = 0
for old, new in replacements:
    if old in content:
        content = content.replace(old, new)
        count += 1
        print(f"  ✅ {old} → {new}")

# Fix 2: Add loading guard at the top of the component body
# Find the line after const { data, loading, error... and add a guard
old_loading = 'if (loading) return <div className="p-8 text-center">Loading analytics...</div>'
if old_loading not in content:
    # Find where the JSX starts and add loading check
    # Look for the first return statement or the main div
    pass  # We'll check if loading is already handled

# Fix 3: Add error + null guard
guard_code = '''  if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>
  if (!data) return <div className="p-8 text-center text-slate-500">No data available</div>

'''

# Find where to insert - after the useApiData call
lines = content.split('\n')
insert_after = None
for i, line in enumerate(lines):
    if 'useApiData' in line:
        insert_after = i
        break

if insert_after and guard_code.strip() not in content:
    # Insert after the useApiData line (and any destructuring on next line)
    # Find the next non-empty line after useApiData
    j = insert_after + 1
    while j < len(lines) and lines[j].strip() == '':
        j += 1
    # Insert after that line
    lines.insert(j + 1, guard_code)
    content = '\n'.join(lines)
    print("  ✅ Added loading/error/null guards")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nNew size: {len(content)} chars")
print(f"Made {count} data access fixes")
print("\n=== NEXT ===")
print("1. Run the backend diagnostic above and paste output")
print("2. Hard refresh browser")
print("3. Page should show 'Loading...' then either real data or an error message")
