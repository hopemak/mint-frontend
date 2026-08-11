with open('src/services/api.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check each export const block for balance
brace_count = 0
paren_count = 0
backtick_count = 0

for i, line in enumerate(lines, 1):
    brace_count += line.count('{') - line.count('}')
    paren_count += line.count('(') - line.count(')')
    backtick_count += line.count('`')
    
    # Flag suspicious lines
    issues = []
    if '`' in line and line.count('`') % 2 != 0:
        issues.append("unbalanced backtick")
    if '})' in line and '({' in line:
        pass  # normal
    if line.strip().endswith('(') or line.strip().endswith('{'):
        pass  # multiline, check next
    
    if issues or (brace_count != 0 and i > 10):
        print(f"{i:4d} [b={brace_count} p={paren_count} bt={backtick_count%2}]: {line.rstrip()[:100]}")

print(f"\nFinal: braces={brace_count}, parens={paren_count}, backticks={backtick_count%2}")
