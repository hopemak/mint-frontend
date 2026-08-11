with open('src/services/api.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines before: {len(lines)}")

# Fix 1: Remove duplicate interceptor block (lines 21-24, indices 20-23)
# The duplicate is:
#   if (token) {
#     config.headers.Authorization = `Bearer ${token}`
#   }
#   return config
dup_start = None
for i in range(len(lines)):
    if i > 15 and 'if (token) {' in lines[i]:
        # Check if the previous line was also "return config"
        if i > 0 and 'return config' in lines[i-1]:
            dup_start = i
            break

if dup_start:
    # Remove 4 lines: if, config.headers, }, return config
    print(f"Removing duplicate interceptor at lines {dup_start+1}-{dup_start+4}")
    del lines[dup_start:dup_start+4]

# Fix 2: Remove corrupted ideaAPI tail
# Find the line with "}")," or garbage after the real ideaAPI closing
for i in range(len(lines)):
    if i > 70 and lines[i].strip() == "}`),":
        # This is the corrupted line 78. Remove from here to the next "}"
        # But keep the real closing "}"
        print(f"Fixing corrupted ideaAPI at line {i+1}")
        # Replace lines[i] with just "}\n"
        lines[i] = "}\n"
        # Remove any lines after until we hit a blank line or comment
        j = i + 1
        while j < len(lines) and not (lines[j].strip().startswith('//') or lines[j].strip() == ''):
            print(f"  Removing garbage line {j+1}: {lines[j].strip()[:60]}")
            j += 1
        del lines[i+1:j]
        break

print(f"Total lines after: {len(lines)}")

with open('src/services/api.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

# Verify
with open('src/services/api.js', 'r', encoding='utf-8') as f:
    api = f.read()

open_b = api.count('{')
close_b = api.count('}')
open_p = api.count('(')
close_p = api.count(')')
print(f"\nBraces: {{={open_b} }}={close_b}")
print(f"Parens: (={open_p} )={close_p}")

if open_b == close_b and open_p == close_p:
    print("✅ api.js is now balanced!")
else:
    print("❌ Still unbalanced")
