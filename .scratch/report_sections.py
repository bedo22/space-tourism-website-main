import re
from pathlib import Path
text = Path('graphify-out/GRAPH_REPORT.md').read_text(encoding='utf-8', errors='replace')
for section in ['## God Nodes', '## Surprising Connections', '## Suggested Questions']:
    start = text.find(section)
    if start == -1:
        print(f'(missing: {section})')
        continue
    # find next '## '
    rest = text[start+len(section):]
    nxt = rest.find('\n## ')
    if nxt == -1:
        body = rest
    else:
        body = rest[:nxt]
    print(f'\n========== {section} ==========')
    print(body.strip()[:2000])
