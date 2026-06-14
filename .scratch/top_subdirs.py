import json
from collections import Counter
from pathlib import Path

d = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8', errors='replace'))
scan_root = d.get('scan_root') or Path('.').resolve().as_posix()
print('scan_root:', scan_root)

# Collect all files across types
all_files = []
for k, v in d.get('files', {}).items():
    if isinstance(v, list):
        all_files.extend(v)

# Top-level subdir counts (excluding graphify-out)
c = Counter()
root = Path(scan_root)
for fp in all_files:
    p = Path(fp)
    try:
        rel = p.relative_to(root)
    except ValueError:
        continue
    parts = rel.parts
    if not parts:
        c['(root)'] += 1
        continue
    # Skip graphify-out itself
    if parts[0] == 'graphify-out':
        continue
    c[parts[0]] += 1

for name, n in c.most_common(8):
    print(f'  {name}: {n}')
