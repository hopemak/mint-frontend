import os, glob, re, json

# 1. Check useApiData hook - does it fallback?
with open('src/services/useApiData.js', 'r', encoding='utf-8') as f:
    hook = f.read()

print("=== useApiData FULL ===")
print(hook)
print("---")

# 2. Check backend analytics route decorators
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/analytics.py'), recursive=True)
if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    
    print("\n=== BACKEND ROUTE DECORATORS ===")
    m = re.search(r'@analytics_bp\.route.*?\n.*?def get_analytics', backend, re.DOTALL)
    if m:
        print(m.group(0))
    
    print("\n=== BACKEND RETURN STATEMENT ===")
    for line in backend.split('\n'):
        if 'return jsonify' in line:
            # Print context around return
            idx = backend.split('\n').index(line)
            for j in range(max(0, idx-5), min(len(backend.split('\n')), idx+15)):
                print(backend.split('\n')[j])
            break

# 3. Check what Analytics.jsx actually receives
with open('src/pages/Analytics/Analytics.jsx', 'r', encoding='utf-8') as f:
    frontend = f.read()

print("\n=== ANALYTICS DATA USAGE ===")
for line in frontend.split('\n'):
    if 'data.' in line and ('value=' in line or 'dataKey=' in line or 'data=' in line):
        print(line.strip()[:120])

# 4. Test the endpoint with curl using token from localStorage concept
print("\n=== TEST WITH CURL ===")
print("Run this in Git Bash to test the endpoint directly:")
print('curl -s http://localhost:5000/api/analytics/ -H "Authorization: Bearer YOUR_TOKEN"')
print("\nTo get your token: F12 -> Console -> localStorage.getItem('mint_token')")
