"""Merge AST + semantic into final extraction."""
import json
from pathlib import Path

ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text(encoding='utf-8'))
sem = json.loads(Path('graphify-out/.graphify_semantic_new.json').read_text(encoding='utf-8'))

seen = {n['id'] for n in ast['nodes']}
merged = list(ast['nodes'])
for n in sem['nodes']:
    if n['id'] not in seen:
        merged.append(n)
        seen.add(n['id'])

merged_edges = ast['edges'] + sem['edges']
merged_hyper = sem.get('hyperedges', [])

result = {
    'nodes': merged,
    'edges': merged_edges,
    'hyperedges': merged_hyper,
    'input_tokens': sem.get('input_tokens', 0),
    'output_tokens': sem.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8'
)
print(f'Merged: {len(merged)} nodes, {len(merged_edges)} edges')
print(f'  AST: {len(ast["nodes"])} nodes, {len(ast["edges"])} edges')
print(f'  Semantic: {len(sem["nodes"])} nodes, {len(sem["edges"])} edges')
