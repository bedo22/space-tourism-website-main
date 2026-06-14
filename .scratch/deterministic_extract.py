"""Deterministic semantic extraction for this corpus.

Since we have no LLM here and subagents can't read, we build the semantic layer
from explicit text patterns:

Code files (JS):
  - exported functions become code nodes
  - import statements become 'references' edges
  - import of an exported function becomes an 'uses' edge

Docs (MD):
  - H2 headings become concept nodes (per-section nodes)
  - H1 title is the document root
  - Markdown links to other docs become 'references' edges
  - ADR cross-references (e.g. "ADR 0003" or "see 0004") become 'cites' edges

Each chunk processes its files; outputs are merged.
"""
import json
import re
from pathlib import Path

CHUNK_ID = 0  # filled per invocation

# ID helper: lowercase, only [a-z0-9_]
def nid(*parts):
    out = []
    for p in parts:
        s = re.sub(r'[^a-zA-Z0-9]+', '_', p).strip('_').lower()
        out.append(s)
    return '_'.join([p for p in out if p])

def safe_read(p):
    try:
        return Path(p).read_text(encoding='utf-8', errors='replace')
    except Exception:
        return ''

# ---------- JS extractor ----------
JS_IMPORT_RE = re.compile(r"^\s*import\s+(?:\*\s+as\s+(\w+)|\{([^}]+)\}|(\w+))\s+from\s+['\"]([^'\"]+)['\"]", re.MULTILINE)
JS_EXPORT_FUNC_RE = re.compile(r"^\s*export\s+(?:async\s+)?function\s+(\w+)", re.MULTILINE)
JS_EXPORT_CONST_RE = re.compile(r"^\s*export\s+(?:const|let|var)\s+(\w+)", re.MULTILINE)
JS_DECL_FUNC_RE = re.compile(r"^\s*(?:async\s+)?function\s+(\w+)\s*\(", re.MULTILINE)
JS_DECL_CONST_RE = re.compile(r"^\s*(?:const|let|var)\s+(\w+)\s*=", re.MULTILINE)

def extract_js(rel_path, text):
    nodes = []
    edges = []
    # stem from immediate parent + filename (matches AST ID rules)
    p = Path(rel_path)
    parent = p.parent.name if p.parent.name else ''
    stem_base = nid(parent, p.stem) if parent else nid(p.stem)

    # Find function/const declarations (named exports and locals)
    decls = set()
    for m in JS_EXPORT_FUNC_RE.finditer(text):
        decls.add(m.group(1))
    for m in JS_EXPORT_CONST_RE.finditer(text):
        decls.add(m.group(1))
    for m in JS_DECL_FUNC_RE.finditer(text):
        decls.add(m.group(1))
    for m in JS_DECL_CONST_RE.finditer(text):
        decls.add(m.group(1))

    # Filter decls that look like DOM event names / globals (DOMContentLoaded etc)
    skip = {'document', 'window', 'console'}
    decls = {d for d in decls if d not in skip and not d.startswith('_') or d.startswith('_') and len(d) > 2}

    for d in sorted(decls):
        nid_full = nid(stem_base, d)
        nodes.append({
            'id': nid_full,
            'label': d,
            'file_type': 'code',
            'source_file': rel_path,
            'source_location': f'{rel_path}::{d}',
            'source_url': None, 'captured_at': None, 'author': None, 'contributor': None,
        })

    # Import edges: source is this module's root node, target is the imported module
    module_root_id = nid(stem_base, p.stem)  # convention: a module-level node
    nodes.append({
        'id': module_root_id,
        'label': p.stem,
        'file_type': 'code',
        'source_file': rel_path,
        'source_location': rel_path,
        'source_url': None, 'captured_at': None, 'author': None, 'contributor': None,
    })

    for m in JS_IMPORT_RE.finditer(text):
        default_name = m.group(1)
        named = m.group(2)
        spec = m.group(4)
        # Resolve spec to a path relative to project root
        if spec.startswith('.'):
            target_rel = (p.parent / spec).resolve()
            # Make relative to scan root
            try:
                target_rel_str = str(target_rel.relative_to(Path('.openclaude_extract_root').resolve())).replace('\\', '/')
            except ValueError:
                target_rel_str = str(target_rel).replace('\\', '/')
            target_p = Path(target_rel_str)
            target_stem = nid(target_p.parent.name, target_p.stem) if target_p.parent.name else nid(target_p.stem)
            edges.append({
                'source': module_root_id,
                'target': target_stem,
                'relation': 'references',
                'confidence': 'EXTRACTED',
                'confidence_score': 1.0,
                'source_file': rel_path,
                'source_location': f'{rel_path}:import:{spec}',
                'weight': 1.0,
            })
    return nodes, edges

# ---------- MD extractor ----------
MD_H1_RE = re.compile(r'^#\s+(.+)$', re.MULTILINE)
MD_H2_RE = re.compile(r'^##\s+(.+)$', re.MULTILINE)
MD_LINK_RE = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
# ADR cross-refs
MD_ADR_REF_RE = re.compile(r'\b(?:ADR\s+)?(\d{4})[\s\-\u2013\u2014:]+([\w\-]+)', re.IGNORECASE)

def extract_md(rel_path, text):
    nodes = []
    edges = []
    p = Path(rel_path)
    parent = p.parent.name if p.parent.name else ''
    stem_base = nid(parent, p.stem) if parent else nid(p.stem)

    # Document root
    h1 = MD_H1_RE.search(text)
    title = h1.group(1).strip() if h1 else p.stem
    root_id = nid(stem_base, p.stem)
    nodes.append({
        'id': root_id,
        'label': title,
        'file_type': 'document',
        'source_file': rel_path,
        'source_location': f'{rel_path}#title',
        'source_url': None, 'captured_at': None, 'author': None, 'contributor': None,
    })

    # H2 sections as concept nodes
    for m in MD_H2_RE.finditer(text):
        heading = m.group(1).strip()
        sec_id = nid(stem_base, heading)
        nodes.append({
            'id': sec_id,
            'label': heading,
            'file_type': 'concept',
            'source_file': rel_path,
            'source_location': f'{rel_path}#{nid(heading)}',
            'source_url': None, 'captured_at': None, 'author': None, 'contributor': None,
        })
        # Section belongs to document
        edges.append({
            'source': sec_id, 'target': root_id,
            'relation': 'conceptually_related_to',
            'confidence': 'EXTRACTED', 'confidence_score': 1.0,
            'source_file': rel_path, 'source_location': f'{rel_path}#{nid(heading)}',
            'weight': 1.0,
        })

    # Markdown links to other docs
    for m in MD_LINK_RE.finditer(text):
        target = m.group(2)
        if target.endswith('.md') or target.endswith('.html'):
            target_p = Path(target.split('#')[0])
            target_stem = nid(target_p.parent.name, target_p.stem) if target_p.parent.name else nid(target_p.stem)
            edges.append({
                'source': root_id, 'target': target_stem,
                'relation': 'references',
                'confidence': 'EXTRACTED', 'confidence_score': 1.0,
                'source_file': rel_path, 'source_location': f'{rel_path}:link:{target}',
                'weight': 1.0,
            })

    # ADR cross-references
    for m in MD_ADR_REF_RE.finditer(text):
        adr_num = m.group(1)
        adr_slug = m.group(2)
        target_stem = nid('architecture', f'{adr_num}-{adr_slug}')
        edges.append({
            'source': root_id, 'target': target_stem,
            'relation': 'cites',
            'confidence': 'INFERRED', 'confidence_score': 0.85,
            'source_file': rel_path, 'source_location': f'{rel_path}:adr:{adr_num}',
            'weight': 1.0,
        })

    return nodes, edges

# ---------- Process all files in chunk ----------
def process_chunk(chunk_idx):
    files = [f for f in Path(f'graphify-out/.graphify_chunk_{chunk_idx:02d}_files.txt').read_text(encoding='utf-8').splitlines() if f]
    all_nodes, all_edges = [], []
    for fp in files:
        p = Path(fp)
        # Make relative to project root
        try:
            rel = str(p.relative_to(Path('.openclaude_extract_root').resolve())).replace('\\', '/')
        except ValueError:
            rel = str(p).replace('\\', '/')
        text = safe_read(p)
        if p.suffix == '.js':
            ns, es = extract_js(rel, text)
        elif p.suffix == '.md':
            ns, es = extract_md(rel, text)
        else:
            continue
        all_nodes.extend(ns)
        all_edges.extend(es)
    return all_nodes, all_edges

# Run
all_nodes, all_edges = [], []
for i in range(1, 4):
    ns, es = process_chunk(i)
    print(f'chunk {i}: {len(ns)} nodes, {len(es)} edges', flush=True)
    all_nodes.extend(ns)
    all_edges.extend(es)

# Dedupe nodes by id
seen = set()
deduped = []
for n in all_nodes:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped.append(n)

result = {
    'nodes': deduped,
    'edges': all_edges,
    'hyperedges': [],
    'input_tokens': 0,
    'output_tokens': 0,
}
Path('graphify-out/.graphify_semantic_new.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8'
)
print(f'Total: {len(deduped)} nodes, {len(all_edges)} edges')
