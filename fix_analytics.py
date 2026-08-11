import os, glob, re

# 1. Fix useApiData to unwrap response
with open('src/services/useApiData.js', 'r', encoding='utf-8') as f:
    hook = f.read()

old_setdata = 'setData(res)'
new_setdata = 'setData(res.data?.data || res.data || res)'
if old_setdata in hook:
    hook = hook.replace(old_setdata, new_setdata)
    with open('src/services/useApiData.js', 'w', encoding='utf-8') as f:
        f.write(hook)
    print('✅ useApiData: Now unwraps response data')
else:
    print('⚠️ useApiData: Could not find setData(res)')

# 2. Fix api.js analyticsAPI to include the right endpoint
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

old_analytics = """analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard/'),
  getReports: () => api.get('/api/analytics/reports/'),
  getMetrics: () => api.get('/api/analytics/metrics/'),
}"""

new_analytics = """analyticsAPI = {
  getDashboard: () => api.get('/api/analytics/dashboard/'),
  getReports: () => api.get('/api/analytics/reports/'),
  getMetrics: () => api.get('/api/analytics/metrics/'),
  getAnalytics: () => api.get('/api/analytics/'),
}"""

if old_analytics in api:
    api = api.replace(old_analytics, new_analytics)
    with open('src/services/api.js', 'w', encoding='utf-8') as f:
        f.write(api)
    print('✅ api.js: Added getAnalytics endpoint')
else:
    print('⚠️ api.js: Could not find analyticsAPI block')

# 3. Fix backend to return camelCase keys and add jobsCreated
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/analytics.py'), recursive=True)
if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    
    # Find the return statement and fix it
    # The backend probably returns something like:
    # return jsonify({'success': True, 'data': {...}})
    
    # Check if jobsCreated exists
    if 'jobs_created' not in backend and 'jobsCreated' not in backend:
        # Add jobs_created = 0 near the other stats
        backend = backend.replace(
            'mentors_count = len(mentors)',
            'mentors_count = len(mentors)\n    jobs_created = sum(s.get(\"jobs_created\", 0) for s in startups)'
        )
        print('✅ Backend: Added jobs_created calculation')
    
    # Fix return to use camelCase keys matching frontend
    # Find the return jsonify line
    if 'return jsonify' in backend:
        # Replace the return with properly formatted camelCase data
        old_return = None
        for m in re.finditer(r'return jsonify\(\{.*?\}\)', backend, re.DOTALL):
            old_return = m.group(0)
        
        if old_return and 'active_startups' in old_return:
            # The backend already has the fields, just need to ensure camelCase
            # Actually, let me check what the current return looks like
            print(f"\n=== CURRENT RETURN ===")
            print(old_return[:500])
            
            # If it uses snake_case, we need to fix it
            if 'active_startups' in old_return and 'activeStartups' not in old_return:
                new_return = """return jsonify({
        'success': True,
        'data': {
            'activeStartups': active_startups,
            'ideasSubmitted': ideas_submitted,
            'totalFunding': total_funding,
            'mentors': mentors_count,
            'jobsCreated': jobs_created,
            'growthTrend': growth_trend,
            'fundingByStage': funding_by_stage,
        }
    })"""
                backend = backend.replace(old_return, new_return)
                with open(matches[0], 'w', encoding='utf-8') as f:
                    f.write(backend)
                print('✅ Backend: Fixed return to use camelCase keys')
        else:
            print('⚠️ Backend: Could not find return statement with active_startups')
    else:
        print('⚠️ Backend: No return jsonify found')
else:
    print('❌ Backend: analytics.py not found')

# 4. Also check if there's an @admin_required decorator issue
if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    if '@admin_required' in backend:
        print('\n⚠️ Backend uses @admin_required — make sure you are logged in as admin')
    if '@jwt_required' in backend:
        print('✅ Backend has @jwt_required')
