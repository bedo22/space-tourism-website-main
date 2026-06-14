import json
from pathlib import Path
d = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8', errors='replace'))
root = Path(d.get('scan_root'))

# Breakdown of starter-code
sc_counts = {}
for k, v in d.get('files', {}).items():
    if not isinstance(v, list):
        continue
    for fp in v:
        p = Path(fp)
        try:
            rel = p.relative_to(root)
        except ValueError:
            continue
        if rel.parts and rel.parts[0] == 'starter-code':
            sub = '/'.join(rel.parts[1:2]) if len(rel.parts) > 1 else '(root)'
            sc_counts.setdefault(k, {}).setdefault(sub, 0)
            sc_counts[k][sub] = sc_counts[k].get(sub, 0) + 1

print('starter-code breakdown by type+subdir:')
for k, subs in sc_counts.items():
    print(f'  {k}:')
    for s, n in sorted(subs.items(), key=lambda x: -x[1]):
        print(f'    {s}: {n}')

# What is in .scratch?
print()
print('.scratch files:')
for k, v in d.get('files', {}).items():
    if not isinstance(v, list):
        continue
    for fp in v:
        if '.scratch' in fp:
            print(f'  [{k}] {Path(fp).relative_to(root)}')
