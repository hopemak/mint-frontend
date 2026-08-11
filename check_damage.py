import os

files = [
    'src/pages/Admin/Admin.jsx',
    'src/services/api.js',
]

base = os.path.expanduser('~/Documents/Mint-incubator/mint-platform')
import glob
backend_matches = glob.glob(os.path.join(base, '**/ideas.py'), recursive=True)
if backend_matches:
    files.append(backend_matches[0])

for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        print(f"=== {f} ===")
        print(f"Size: {len(content)} chars, {len(content.splitlines())} lines")
        print(f"First 200 chars: {content[:200]}")
        print(f"Last 200 chars: {content[-200:]}")
        print()
    except Exception as e:
        print(f"ERROR reading {f}: {e}")
        print()
