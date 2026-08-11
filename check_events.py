import re

# Check backend
backend_path = '/c/Users/hp/Documents/Mint-incubator/mint-platform/backend/app/routes/events.py'
try:
    with open(backend_path, 'r', encoding='utf-8') as f:
        backend = f.read()
    print("=== BACKEND EVENTS ROUTE ===")
    # Find the create function
    match = re.search(r'def create_event.*?(?=def |\Z)', backend, re.DOTALL)
    if match:
        print(match.group(0)[:800])
    else:
        print(backend[:800])
except Exception as e:
    print(f"Backend error: {e}")

print("\n=== FRONTEND EVENT FORM ===")
with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    frontend = f.read()

# Find event form state
m = re.search(r"const \[eventForm.*?\)", frontend)
if m:
    print(m.group(0))

# Find handleCreateEvent
m = re.search(r"const handleCreateEvent = async.*?await eventAPI\.create\(.*?\)", frontend, re.DOTALL)
if m:
    print("\n" + m.group(0)[:500])

# Find event display card
m = re.search(r"events\.map\(\(ev\).*?</div>\s*\)\)}", frontend, re.DOTALL)
if m:
    print("\n=== EVENT DISPLAY CARD ===")
    print(m.group(0)[:600])
