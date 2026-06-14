"""AST extraction for code files."""
import json
from pathlib import Path
from graphify.extract import collect_files, extract

all_files = [p for p in Path('graphify-out/.graphify_all_files.txt').read_text(encoding='utf-8').splitlines() if p]
code_files = [Path(p) for p in all_files if Path(p).suffix in {'.js', '.ts', '.py', '.css', '.html', '.json', '.mjs', '.cjs'}]
# only feed code files (not html/json — extract decides)
code_only = [p for p in code_files if p.suffix in {'.js', '.ts', '.py', '.mjs', '.cjs'}]

if code_only:
    result = extract(code_only, cache_root=Path('.'))
    Path('graphify-out/.graphify_ast.json').write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    print(f'AST: {len(result["nodes"])} nodes, {len(result["edges"])} edges')
else:
    Path('graphify-out/.graphify_ast.json').write_text(
        json.dumps({'nodes': [], 'edges': [], 'input_tokens': 0, 'output_tokens': 0}, ensure_ascii=False),
        encoding='utf-8'
    )
    print('No code files - AST skipped')
