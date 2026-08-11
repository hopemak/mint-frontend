import os, glob, re

# Find events.py in backend
base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
matches = glob.glob(os.path.join(base, '**/events.py'), recursive=True)
print("Found events.py files:")
for m in matches:
    print("  ", m)

if matches:
    with open(matches[0], 'r', encoding='utf-8') as f:
        content = f.read()
    print("\n=== BACKEND EVENTS CONTENT ===")
    # Find create function
    m = re.search(r'def create_event.*?(?=def |\Z)', content, re.DOTALL)
    if m:
        print(m.group(0)[:1000])
    else:
        # Try finding the POST route
        m = re.search(r'@.*events_bp.*POST.*?\n.*?def .*?\(.*?\):.*?(?=\n@|\Z)', content, re.DOTALL)
        if m:
            print(m.group(0)[:1000])
        else:
            print(content[:1000])
else:
    print("No events.py found")
