import os, glob, re

# Find frontend Analytics page
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
frontend_matches = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True) + glob.glob(os.path.join(base, '**/analytics.jsx'), recursive=True)
print("=== FRONTEND ANALYTICS FILES ===")
for m in frontend_matches:
    print("  ", m)

if frontend_matches:
    with open(frontend_matches[0], 'r', encoding='utf-8') as f:
        frontend = f.read()
    print("\n=== FRONTEND IMPORTS & STATE ===")
    for line in frontend.split('\n')[:40]:
        if line.strip():
            print(line[:120])
    
    print("\n=== FRONTEND API CALLS ===")
    for m in re.finditer(r"analyticsAPI\.\w+\(.*?\)|dashboardAPI\.\w+\(.*?\)|fetch\(.*?\)", frontend):
        print(m.group(0))
    
    print("\n=== FRONTEND CHART LIBRARY ===")
    if 'recharts' in frontend:
        print("Uses: recharts")
    elif 'chart.js' in frontend:
        print("Uses: chart.js")
    elif 'apexcharts' in frontend:
        print("Uses: apexcharts")
    else:
        print("No chart library detected")

# Find backend analytics.py
backend_matches = glob.glob(os.path.join(base, '**/analytics.py'), recursive=True)
print("\n=== BACKEND ANALYTICS FILES ===")
for m in backend_matches:
    print("  ", m)

if backend_matches:
    with open(backend_matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    print("\n=== BACKEND ROUTES ===")
    for m in re.finditer(r'@analytics_bp\.route.*?\n.*?def .*?\(.*?\):.*?(?=\n@analytics_bp|\Z)', backend, re.DOTALL):
        print(m.group(0)[:250])
        print("---")
else:
    print("No analytics.py found")

# Check api.js for analyticsAPI
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

print("\n=== analyticsAPI IN api.js ===")
m = re.search(r"analyticsAPI = \{.*?\}", api, re.DOTALL)
if m:
    print(m.group(0))
else:
    print("No analyticsAPI found")
