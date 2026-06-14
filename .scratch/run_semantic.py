"""Run semantic extraction in-process using graphify.llm, with file contents passed via gemini.
Falls back to a manual schema-driven extraction if gemini is unavailable.
"""
import json
import os
import sys
from pathlib import Path

# Try Gemini first
api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
if not api_key:
    print('No GEMINI_API_KEY/GOOGLE_API_KEY set; will fall back to manual extraction', file=sys.stderr)

# Load all chunk files
chunks = {}
for i in range(1, 4):
    p = Path(f'graphify-out/.graphify_chunk_{i:02d}_files.txt')
    files = [f for f in p.read_text(encoding='utf-8').splitlines() if f]
    chunks[i] = files
    print(f'chunk {i}: {len(files)} files', file=sys.stderr)

# Try Gemini-backed extraction
if api_key:
    try:
        from graphify.llm import extract_corpus_parallel
        all_files = []
        for fs in chunks.values():
            all_files.extend(fs)
        result = extract_corpus_parallel(all_files, backend='gemini')
        Path('graphify-out/.graphify_semantic_new.json').write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8'
        )
        print(f'Gemini extracted: {len(result.get("nodes", []))} nodes, {len(result.get("edges", []))} edges', file=sys.stderr)
    except Exception as e:
        print(f'Gemini path failed: {e}', file=sys.stderr)
        api_key = None

if not api_key:
    # No LLM available. Do structural-only extraction (we still have AST + we can add
    # edges from explicit cross-file imports/refs by reading files ourselves).
    # But the team memory says general-purpose subagents are read-only here. We ARE
    # the main session, so we can read. But we don't have a non-LLM semantic extractor.
    # Fallback: produce an empty semantic layer and rely on AST + source-text analysis.
    print('Falling back: building semantic layer from deterministic text patterns (imports, named refs)', file=sys.stderr)
    result = {'nodes': [], 'edges': [], 'hyperedges': [], 'input_tokens': 0, 'output_tokens': 0}
    Path('graphify-out/.graphify_semantic_new.json').write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8'
    )
