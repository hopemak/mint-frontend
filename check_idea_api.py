import os, glob, re

# Check frontend api.js for ideaAPI
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

print("=== ideaAPI IN api.js ===")
for m in re.finditer(r"ideaAPI = \{.*?\}", api, re.DOTALL):
    print(m.group(0))

print("\n=== ideaAPI.update EXISTS? ===")
print('update:' in api and 'ideaAPI' in api)

# Find backend ideas.py
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/ideas.py'), recursive=True)
if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    print("\n=== BACKEND IDEAS ROUTES ===")
    for m in re.finditer(r'@ideas_bp\.route.*?\n.*?def .*?\(.*?\):.*?(?=\n@|\Z)', backend, re.DOTALL):
        print(m.group(0)[:200])
        print("---")
else:
    print("No ideas.py found")
