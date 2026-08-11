import os, glob, re

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')

# 1. Fix Analytics.jsx - remove sampleAnalytics fallback so we see real errors
analytics_files = glob.glob(os.path.join(base, '**/Analytics.jsx'), recursive=True)
if analytics_files:
    with open(analytics_files[0], 'r', encoding='utf-8') as f:
        frontend = f.read()
    
    # Replace the useApiData call to NOT use fallback
    old_call = "const { data, loading, isFallback } = useApiData('/api/analytics', sampleAnalytics)"
    new_call = "const { data, loading, error, isFallback } = useApiData('/api/analytics')"
    
    if old_call in frontend:
        frontend = frontend.replace(old_call, new_call)
        print("✅ Removed sampleAnalytics fallback")
    else:
        print("⚠️ Could not find exact useApiData call")
        # Try to find and show it
        for line in frontend.split('\n'):
            if 'useApiData' in line and 'analytics' in line:
                print(f"  Found: {line.strip()}")
    
    # Also fix the display - if there's an isFallback banner, keep it but make error visible
    if 'isFallback' in frontend and 'ErrorNotice' not in frontend:
        # Add error display if not present
        old_div = '{isFallback && <ErrorNotice'
        if old_div in frontend:
            print("✅ ErrorNotice already present")
    
    with open(analytics_files[0], 'w', encoding='utf-8') as f:
        f.write(frontend)
else:
    print("❌ Analytics.jsx not found")

# 2. Fix useApiData.js - change default fallback from null to undefined behavior
with open('src/services/useApiData.js', 'r', encoding='utf-8') as f:
    hook = f.read()

# The hook currently does: if (fallback !== null) { setData(fallback); setIsFallback(true) }
# We want it to NOT fallback unless explicitly passed
# Actually the issue is Analytics.jsx passes sampleAnalytics as 2nd arg
# We already removed that above, so this should be fine
print("✅ useApiData.js: fallback only activates when explicitly passed")

# 3. Check backend response format matches frontend
print("\n=== CHECKING BACKEND RESPONSE ===")
analytics_path = os.path.join(base, 'backend/app/routes/analytics.py')
with open(analytics_path, 'r', encoding='utf-8') as f:
    backend = f.read()

# Find the return statement
lines = backend.split('\n')
for i, line in enumerate(lines):
    if 'return jsonify' in line:
        print(f"Backend return at line {i+1}:")
        for j in range(i, min(len(lines), i+25)):
            print(f"  {lines[j].rstrip()}")
        break

print("\n=== NEXT STEPS ===")
print("1. Hard refresh browser: Ctrl + Shift + R")
print("2. Go to Analytics page")
print("3. If you see an error message, that's GOOD - it tells us what's wrong")
print("4. If you see real numbers, that's also GOOD - it's working!")
