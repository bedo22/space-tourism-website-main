"""Filter detect result to code+docs only, then write new detect and uncached list."""
import json
from pathlib import Path

d = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8', errors='replace'))
root = Path(d.get('scan_root'))

EXCLUDE_TOP_DIRS = {'node_modules', 'graphify-out', '.git'}
EXCLUDE_TYPE_DIRS = {'starter-code/Design', 'starter-code/assets', 'starter-code/Design system'}

# Rebuild files dict - keep code, document, paper. Drop image, video entirely.
new_files = {}
total_files = 0
total_words = 0
for ftype, paths in d.get('files', {}).items():
    if ftype in ('image', 'video'):
        new_files[ftype] = []
        continue
    if not isinstance(paths, list):
        new_files[ftype] = paths
        continue
    kept = []
    for fp in paths:
        p = Path(fp)
        try:
            rel = p.relative_to(root)
        except ValueError:
            kept.append(fp)
            continue
        # Drop if any top dir is excluded
        if rel.parts and rel.parts[0] in EXCLUDE_TOP_DIRS:
            continue
        # Drop if under excluded subdir path
        head = '/'.join(rel.parts[:2]) if len(rel.parts) > 1 else rel.parts[0] if rel.parts else ''
        if head in EXCLUDE_TYPE_DIRS:
            continue
        kept.append(fp)
    new_files[ftype] = kept

# Re-sum word counts from kept files (re-read for accuracy)
def count_words(fp):
    try:
        text = Path(fp).read_text(encoding='utf-8', errors='replace')
    except Exception:
        return 0
    return len(text.split())

total_words = 0
total_files = 0
for ftype, paths in new_files.items():
    for fp in paths:
        total_files += 1
        total_words += count_words(fp)

d['files'] = new_files
d['total_files'] = total_files
d['total_words'] = total_words
d['skipped_sensitive'] = d.get('skipped_sensitive', []) + [
    'image: 85 starter-code PNGs (Design + assets) excluded as visual reference',
]

Path('graphify-out/.graphify_detect.json').write_text(
    json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8'
)

# Flat list for uncached lookup
all_files = []
for v in new_files.values():
    if isinstance(v, list):
        all_files.extend(v)
Path('graphify-out/.graphify_all_files.txt').write_text('\n'.join(all_files), encoding='utf-8')

print(f'Filtered corpus: {total_files} files, ~{total_words:,} words')
for k, v in new_files.items():
    if isinstance(v, list):
        print(f'  {k}: {len(v)}')
