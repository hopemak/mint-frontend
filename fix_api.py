import os

path = 'src/services/api.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("Lines 125-140:")
for i in range(124, min(140, len(lines))):
    print("%3d: %r" % (i+1, lines[i]))

# Check brace balance in startupAPI block
in_startup = False
brace_depth = 0
startup_lines = []
for i, line in enumerate(lines):
    if 'startupAPI = {' in line:
        in_startup = True
        brace_depth = 1
        startup_lines.append((i, line))
        continue
    if in_startup:
        startup_lines.append((i, line))
        brace_depth += line.count('{')
        brace_depth -= line.count('}')
        if brace_depth == 0:
            break

print("\nstartupAPI block:")
for idx, line in startup_lines:
    print("%3d: %r" % (idx+1, line))

# Check if closing brace exists
has_close = any(line.strip() == '}' for idx, line in startup_lines)
print("\nHas closing brace:", has_close)

if not has_close:
    print("FIXING: Adding closing brace")
    # Find last line of startup block and add } after it
    last_idx, last_line = startup_lines[-1]
    lines.insert(last_idx + 1, '}\n')

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Done")
