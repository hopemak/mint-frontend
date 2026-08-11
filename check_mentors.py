import os, glob, re

# Find mentors.py in backend
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/mentors.py'), recursive=True)
print("Found mentors.py files:")
for m in matches:
    print("  ", m)

if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        backend = f.read()
    print("\n=== BACKEND MENTORS CREATE ===")
    m = re.search(r'def create_mentor.*?(?=def |\Z)', backend, re.DOTALL)
    if m:
        print(m.group(0)[:1000])
    else:
        m = re.search(r'@.*mentors_bp.*POST.*?\n.*?def .*?\(.*?\):.*?(?=\n@|\Z)', backend, re.DOTALL)
        if m:
            print(m.group(0)[:1000])
        else:
            print(backend[:1000])

# Check frontend
with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    frontend = f.read()

print("\n=== FRONTEND MENTOR FORM STATE ===")
m = re.search(r"const \[mentorForm.*?\)", frontend)
if m:
    print(m.group(0))

print("\n=== FRONTEND HANDLE CREATE MENTOR ===")
m = re.search(r"const handleCreateMentor = async.*?await mentorAPI\.create\(.*?\)", frontend, re.DOTALL)
if m:
    print(m.group(0)[:500])

print("\n=== MENTOR DISPLAY CARD ===")
m = re.search(r"mentors\.map\(\(m, mi\).*?</div>\s*\)\)}", frontend, re.DOTALL)
if m:
    print(m.group(0)[:700])
