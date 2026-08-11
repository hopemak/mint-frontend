import os, glob, re

# 1. Fix useApiData.js - remove fallback to sample data, show errors instead
with open('src/services/useApiData.js', 'r', encoding='utf-8') as f:
    hook = f.read()

# Check if it falls back to sample data
if 'sampleData' in hook or 'fallback' in hook.lower():
    print("⚠️ useApiData has sample data fallback - checking if we should keep or remove it")
    # Print the fallback section
    lines = hook.split('\n')
    for i, line in enumerate(lines):
        if 'sampleData' in line or 'fallback' in line.lower():
            print(f"  Line {i+1}: {line.strip()[:100]}")
else:
    print("✅ useApiData: No sample data fallback detected")

# 2. Fix api.js - ensure analyticsAPI has correct endpoint
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

# Check if getAnalytics exists
if 'getAnalytics' in api:
    print("✅ api.js: getAnalytics exists")
else:
    # Add it
    old = """analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard/'),
  getReports: () => api.get('/api/analytics/reports/'),
  getMetrics: () => api.get('/api/analytics/metrics/'),
}"""
    new = """analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard/'),
  getReports: () => api.get('/api/analytics/reports/'),
  getMetrics: () => api.get('/api/analytics/metrics/'),
  getAnalytics: () => api.get('/api/analytics/'),
}"""
    if old in api:
        api = api.replace(old, new)
        with open('src/services/api.js', 'w', encoding='utf-8') as f:
            f.write(api)
        print("✅ api.js: Added getAnalytics endpoint")
    else:
        print("⚠️ api.js: Could not find analyticsAPI block to update")

# 3. Check Analytics.jsx - what endpoint does it call?
print("\n=== Analytics.jsx API calls ===")
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
analytics_files = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)
if analytics_files:
    with open(analytics_files[0], 'r', encoding='utf-8') as f:
        frontend = f.read()
    
    # Find the useApiData call
    for line in frontend.split('\n'):
        if 'useApiData' in line:
            print(f"  {line.strip()[:120]}")
    
    # Check if it uses analyticsAPI or useApiData
    if 'analyticsAPI' in frontend:
        print("✅ Analytics.jsx uses analyticsAPI")
    elif 'useApiData' in frontend:
        print("✅ Analytics.jsx uses useApiData")
    
    # Check what data fields it expects
    print("\n  Data fields expected:")
    fields = set()
    for m in re.finditer(r'data\.(\w+)', frontend):
        fields.add(m.group(1))
    for f in sorted(fields):
        print(f"    - {f}")
else:
    print("❌ Analytics.jsx not found")

print("\n=== DONE ===")
print("Now: 1) Hard refresh browser (Ctrl+Shift+R)")
print("     2) Go to Analytics page")
print("     3) Check if real numbers show")
