import re
with open('app.js', 'r', encoding='utf-8', errors='replace') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if re.search(r'\\[''"`]\s*$', line) or re.search(r'\ufffd\\', line) or line.count('`') % 2 != 0:
        print(f'Line {i+1}: {line.strip()}')
