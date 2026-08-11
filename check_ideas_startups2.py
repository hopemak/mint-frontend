import re

with open('src/pages/Admin/Admin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

print("=== ALL useState DECLARATIONS ===")
for m in re.finditer(r"const \[(\w+Form).*?\)", content):
    print(m.group(0))

print("\n=== ALL handleCreate FUNCTIONS ===")
for m in re.finditer(r"const handleCreate\w+ = async \(e\)", content):
    start = m.start()
    end = content.find("await ", start) + 50
    print(content[start:end])
    print("---")

print("\n=== IDEAS SECTION IN FILE ===")
# Find Ideas section
idx = content.find('Ideas')
if idx != -1:
    print(content[idx:idx+800])
else:
    print("No 'Ideas' text found")

print("\n=== STARTUPS SECTION IN FILE ===")
idx = content.find('Startups')
if idx != -1:
    print(content[idx:idx+800])
else:
    print("No 'Startups' text found")

print("\n=== ideaAPI USAGE ===")
for m in re.finditer(r"ideaAPI\.\w+\(.*?\)", content):
    print(m.group(0))

print("\n=== startupAPI USAGE ===")
for m in re.finditer(r"startupAPI\.\w+\(.*?\)", content):
    print(m.group(0))
