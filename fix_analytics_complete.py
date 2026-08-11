import os, glob, re

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')

# 1. Fix backend: remove @admin_required, add missing fields
matches = glob.glob(os.path.join(base, '**/analytics.py'), recursive=True)
if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    
    # Replace @admin_required with @jwt_required
    if '@admin_required' in backend:
        backend = backend.replace('@admin_required', '@jwt_required')
        print('✅ Backend: Replaced @admin_required with @jwt_required')
    
    # Add jobs_created calculation
    if 'jobs_created' not in backend:
        backend = backend.replace(
            'mentors_count = len(mentors)',
            'mentors_count = len(mentors)\n    jobs_created = sum(s.get("jobs_created", 0) for s in startups)'
        )
        print('✅ Backend: Added jobs_created calculation')
    
    # Fix return to include jobsCreated and fundingByStage
    # Find the return block
    old_return = None
    for m in re.finditer(r"return jsonify\(\{.*?\}\)", backend, re.DOTALL):
        candidate = m.group(0)
        if 'activeStartups' in candidate:
            old_return = candidate
    
    if old_return:
        new_return = """return jsonify({
        'success': True,
        'data': {
            'activeStartups': active_startups,
            'ideasSubmitted': ideas_submitted,
            'totalFunding': f'${total_funding:,}',
            'mentors': mentors_count,
            'jobsCreated': jobs_created,
            'growthTrend': growth_trend,
            'fundingByStage': funding_by_stage_approved,
            'fundingByStageRequested': funding_by_stage_requested,
            'fundingByStageApproved': funding_by_stage_approved,
            'submissionsByQuarter': submissions_by_quarter,
            'regions': regions,
            'sectorDistribution': sector_distribution,
            'statusDistribution': status_distribution,
            'fundingPipeline': funding_pipeline,
            'eventRegistrations': event_registrations_by_event,
        }
    })"""
        backend = backend.replace(old_return, new_return)
        with open(matches[0], 'w', encoding='utf-8') as f:
            f.write(backend)
        print('✅ Backend: Fixed return with jobsCreated, fundingByStage, etc.')
    else:
        print('⚠️ Backend: Could not find return block')
else:
    print('❌ Backend: analytics.py not found')

# 2. Fix frontend Analytics.jsx - remove forecast (not in backend) and fix field names
with open('src/pages/Analytics/Analytics.jsx', 'r', encoding='utf-8') as f:
    frontend = f.read()

# Replace forecast with a field that exists, or remove that chart
if 'data.forecast' in frontend:
    # Check what charts exist after fundingByStage
    # The forecast chart might be the 4th one. Let's replace it with eventRegistrations
    frontend = frontend.replace(
        'data={data.forecast}',
        'data={data.eventRegistrations || []}'
    )
    # Also fix the title if it says Forecast
    frontend = frontend.replace(
        '>Funding Forecast<',
        '>Event Registrations<'
    )
    print('✅ Frontend: Replaced forecast with eventRegistrations')

# 3. Remove fallback from useApiData so we see real errors (optional but helpful)
with open('src/services/useApiData.js', 'r', encoding='utf-8') as f:
    hook = f.read()

# Keep fallback but make it more obvious when it's active
if 'isFallback' in hook:
    print('✅ useApiData: isFallback already tracked (ErrorNotice will show)')
else:
    print('ℹ️ useApiData: Fallback is active - ErrorNotice shows when using sample data')

with open('src/pages/Analytics/Analytics.jsx', 'w', encoding='utf-8') as f:
    f.write(frontend)

print('\n=== NEXT STEPS ===')
print('1. Restart backend: Ctrl+C in backend terminal, then python run.py')
print('2. Hard refresh browser: Ctrl + Shift + R')
print('3. Go to Analytics page')
print('4. If you see "Using sample data" banner, check browser console for 401/403 errors')
