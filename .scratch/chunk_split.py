"""Split uncached files into 3 chunks, grouped by directory."""
from pathlib import Path

files = [f for f in Path('graphify-out/.graphify_uncached.txt').read_text(encoding='utf-8').splitlines() if f]
print(f'total: {len(files)}')

# Group by top-level dir to keep related files in same chunk
from collections import defaultdict
groups = defaultdict(list)
for f in files:
    parts = Path(f).parts
    if len(parts) > 2:
        # project root / subdir / filename  -> group by subdir
        groups[parts[-2]].append(f)
    else:
        groups['(root)'].append(f)

# Round-robin assignment so each chunk has variety
chunks = [[], [], []]
for sub, fs in sorted(groups.items()):
    bucket = min(range(3), key=lambda i: len(chunks[i]))
    chunks[bucket].extend(sorted(fs))

# Write chunk files (just file lists, subagents re-read)
for i, c in enumerate(chunks, 1):
    Path(f'graphify-out/.graphify_chunk_{i:02d}_files.txt').write_text('\n'.join(c), encoding='utf-8')
    print(f'chunk {i}: {len(c)} files')
