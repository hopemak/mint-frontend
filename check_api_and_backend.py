import os, glob

# Check api.js for ideaAPI
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

print("=== ideaAPI SECTION ===")
start = api.find('ideaAPI = {')
if start != -1:
    end = api.find('}', start)
    print(api[start:end+1])
else:
    print("ideaAPI not found")

print("\n=== CHECK FOR SYNTAX ERRORS IN api.js ===")
# Check for common issues
if api.count('{') != api.count('}'):
    print("WARNING: Mismatched braces in api.js")
if '  ' in api[:500]:
    print("NOTE: Has double spaces (probably fine)")

# Check backend ideas.py syntax
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/ideas.py'), recursive=True)
if matches:
    path = matches[0]
    print(f"\n=== BACKEND {path} ===")
    with open(path, 'r', encoding='utf-8') as f:
        backend = f.read()
    
    # Try to compile it
    try:
        compile(backend, path, 'exec')
        print("✅ Backend ideas.py compiles successfully")
    except SyntaxError as e:
        print(f"❌ SYNTAX ERROR in ideas.py: {e}")
        print(f"   Line {e.lineno}: {e.text}")
    
    # Check for the update route
    if 'def update_idea' in backend:
        print("✅ update_idea route exists")
    else:
        print("❌ update_idea route NOT found")
else:
    print("ideas.py not found")

# Check Admin.jsx for syntax errors
with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    admin = f.read()

try:
    compile(admin, 'Admin.jsx', 'exec')
    print("\n✅ Admin.jsx compiles successfully")
except SyntaxError as e:
    print(f"\n❌ SYNTAX ERROR in Admin.jsx: {e}")
    print(f"   Line {e.lineno}: {e.text}")
