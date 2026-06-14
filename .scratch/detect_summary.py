import json
from pathlib import Path
d = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8', errors='replace'))
print('total_files:', d.get('total_files'))
print('total_words:', d.get('total_words'))
print('skipped_sensitive:', d.get('skipped_sensitive'))
for k, v in d.get('files', {}).items():
    if isinstance(v, list):
        print(f'  {k}: {len(v)} files')
    else:
        print(f'  {k}: {v}')
