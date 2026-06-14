"""Regenerate report with hand-picked community labels."""
import json
from pathlib import Path
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
detection = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8', errors='replace'))
analysis = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding='utf-8'))

G = build_from_json(extraction)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}

# Hand-picked labels for top communities. Singletons get a generic label.
labels = {
    0: "Project README Structure",
    1: "Slices 3-6 Tracking Plan",
    2: "Session Handoff (2026-06-13)",
    3: "Domain Glossary (CONTEXT.md)",
    4: "PRD: Space Tourism v1",
    5: "ADR 0001: JS-Driven Data Loading",
    6: "ADR 0005: URL Hash Contract",
    7: "ADR 0002: No Build Step",
    8: "ADR 0003: Self-Hosted Fonts",
    9: "ADR 0004: Two-Breakpoint Responsive",
    10: "ADR 0006: Tabs Keyboard Contract",
    11: "ADR 0007: Responsive Images",
    12: "Architecture Wrap (Decisions 2026-06)",
    13: "README Template Sections",
    14: "Agent: Domain Docs Guide",
    15: "Agent: Issue Tracker Guide",
    16: "Runtime Flow Architecture",
    17: "Slice 1 Spec",
    18: "Slice 2 Spec",
    19: "Slice 3 Spec",
    20: "Slice 4 Spec",
    21: "Slice 5 Spec",
    22: "Slice 6 Spec",
    23: "Per-Page Hydrate / Slugify",
    24: "Render Index Re-exports",
}
# All other communities get generic labels
for cid in communities:
    if cid not in labels:
        labels[cid] = f"Orphan / Section Node {cid}"

# Re-cluster to ensure cohesion uses the new labels? No, cohesion is structural.
questions = suggest_questions(G, communities, labels)
report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'],
                  detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
Path('graphify-out/.graphify_labels.json').write_text(
    json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False, indent=2),
    encoding='utf-8'
)
print('Report regenerated with community labels')
print(f'Labeled {sum(1 for v in labels.values() if not v.startswith("Orphan"))} non-generic communities')
