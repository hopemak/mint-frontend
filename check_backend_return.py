import os

path = os.path.expanduser('~/Documents/Mint-incubator/mint-platform/backend/app/routes/analytics.py')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print("=== BACKEND get_analytics FUNCTION ===")
start = content.find('def get_analytics')
if start != -1:
    # Print from def to return
    func = content[start:start+2000]
    print(func)
else:
    print("get_analytics not found")

print("\n=== CHECKING FIELD MAPPING ===")
# Check what variables are computed
vars_found = []
for var in ['active_startups', 'ideas_submitted', 'total_funding', 'mentors_count', 
            'jobs_created', 'growth_trend', 'funding_by_stage', 'submissions_by_quarter',
            'regions', 'event_registrations']:
    if var in content:
        vars_found.append(var)
print(f"Backend computes: {vars_found}")
