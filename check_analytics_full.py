import os, glob, re

# 1. Full backend analytics function
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/analytics.py'), recursive=True)
if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    print("=== BACKEND get_analytics FULL ===")
    m = re.search(r'def get_analytics.*?(?=def |\Z)', backend, re.DOTALL)
    if m:
        print(m.group(0))
    else:
        print("get_analytics not found")
    print("---")

# 2. useApiData hook
hook_matches = glob.glob(os.path.join(base, '**/useApiData.js'), recursive=True)
if hook_matches:
    with open(hook_matches[0], 'r', encoding='utf-8') as f:
        hook = f.read()
    print("\n=== useApiData HOOK ===")
    print(hook[:800])

# 3. Full Analytics.jsx
analytics_matches = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)
if analytics_matches:
    with open(analytics_matches[0], 'r', encoding='utf-8') as f:
        frontend = f.read()
    print("\n=== ANALYTICS CHARTS SECTION ===")
    # Find the charts/recharts usage
    m = re.search(r'<div className="grid lg:grid-cols-3 gap-4 mb-4">.*?</div>\s*</div>', frontend, re.DOTALL)
    if m:
        print(m.group(0)[:1500])
    else:
        # Print lines after the stat cards
        lines = frontend.split('\n')
        for i, line in enumerate(lines):
            if 'jobsCreated' in line:
                for j in range(i+1, min(len(lines), i+60)):
                    print(f"{j+1:4d}: {lines[j].rstrip()[:120]}")
                break
