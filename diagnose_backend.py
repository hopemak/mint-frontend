import os, re

path = os.path.expanduser('~/Documents/Mint-incubator/mint-platform/backend/app/routes/analytics.py')
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

print("=== FULL BACKEND FILE ===")
lines = content.split('\n')
for i, line in enumerate(lines):
    print(f"{i+1:3d}: {line.rstrip()}")

print("\n=== CHECKING FOR UNDEFINED VARIABLES IN RETURN ===")
# Find all assignments like "xxx = "
assigned = set()
for line in lines:
    m = re.match(r'^(\s+)(\w+)\s*=', line)
    if m:
        assigned.add(m.group(2))

# Find what's referenced in return
return_vars = []
in_return = False
for i, line in enumerate(lines):
    if 'return jsonify' in line:
        in_return = True
    if in_return:
        # Extract variable names before colons
        for m in re.finditer(r"'[\w]+'\s*:\s*(\w+)", line):
            var = m.group(1)
            if var not in assigned and var not in ['jsonify', 'True', 'False', 'None']:
                return_vars.append((i+1, var, "NOT ASSIGNED"))

print("\nVariables in return that might not be assigned:")
for line_no, var, status in return_vars:
    print(f"  Line {line_no}: {var} - {status}")

print(f"\nAll assigned variables: {sorted(assigned)}")
