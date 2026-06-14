"""Show top 20 community member lists so I can pick labels."""
import json
from pathlib import Path
a = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))
comms = a['communities']
sizes = sorted([(cid, len(m)) for cid, m in comms.items()], key=lambda x: -x[1])
for cid, n in sizes[:25]:
    members = comms[cid]
    print(f'\n--- c{cid} ({n} nodes) ---')
    for m in members:
        print(f'  {m}')
