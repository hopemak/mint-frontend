with open('src/services/api.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all export const blocks and their content
import re

blocks = []
for m in re.finditer(r'export const (\w+) = \{', content):
    name = m.group(1)
    start = m.start()
    # Find matching }
    depth = 1
    i = m.end()
    while i < len(content) and depth > 0:
        if content[i] == '{': depth += 1
        elif content[i] == '}': depth -= 1
        i += 1
    block_content = content[m.start():i]
    blocks.append((name, block_content))

print("Found blocks:")
for name, block in blocks:
    inner = block[block.find('{')+1:block.rfind('}')]
    open_b = inner.count('{')
    close_b = inner.count('}')
    print("  %s: inner braces %d/%d %s" % (name, open_b, close_b, 'OK' if open_b == close_b else 'BROKEN'))

# Check for content between blocks that shouldn't be there
print("\nChecking for orphaned code between blocks...")
