import os, glob, re

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')

# Find ideas.py
ideas_matches = glob.glob(os.path.join(base, '**/ideas.py'), recursive=True)
print("=== IDEAS BACKEND ===")
if ideas_matches:
    with open(ideas_matches[0], 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'def (create_idea|submit_idea).*?(?=def |\Z)', content, re.DOTALL)
    if m:
        print(m.group(0)[:1000])
    else:
        m = re.search(r'@.*ideas_bp.*POST.*?\n.*?def .*?\(.*?\):.*?(?=\n@|\Z)', content, re.DOTALL)
        if m:
            print(m.group(0)[:1000])
        else:
            print(content[:1000])
else:
    print("ideas.py not found")

# Find startups.py
startup_matches = glob.glob(os.path.join(base, '**/startups.py'), recursive=True)
print("\n=== STARTUPS BACKEND ===")
if startup_matches:
    with open(startup_matches[0], 'r', encoding='utf-8') as f:
        content = f.read()
    m = re.search(r'def create_startup.*?(?=def |\Z)', content, re.DOTALL)
    if m:
        print(m.group(0)[:1000])
    else:
        m = re.search(r'@.*startups_bp.*POST.*?\n.*?def .*?\(.*?\):.*?(?=\n@|\Z)', content, re.DOTALL)
        if m:
            print(m.group(0)[:1000])
        else:
            print(content[:1000])
else:
    print("startups.py not found")

# Check frontend
with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    frontend = f.read()

print("\n=== FRONTEND IDEA FORM STATE ===")
m = re.search(r"const \[ideaForm.*?\)", frontend)
if m:
    print(m.group(0))

print("\n=== FRONTEND HANDLE CREATE IDEA ===")
m = re.search(r"const handleCreateIdea = async.*?await ideaAPI\.create\(.*?\)", frontend, re.DOTALL)
if m:
    print(m.group(0)[:500])

print("\n=== FRONTEND STARTUP FORM STATE ===")
m = re.search(r"const \[startupForm.*?\)", frontend)
if m:
    print(m.group(0))

print("\n=== FRONTEND HANDLE CREATE STARTUP ===")
m = re.search(r"const handleCreateStartup = async.*?await startupAPI\.create\(.*?\)", frontend, re.DOTALL)
if m:
    print(m.group(0)[:500])
