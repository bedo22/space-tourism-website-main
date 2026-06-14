"""Final regen of report from saved graph.json + labels.json."""
import json
import networkx as nx
from pathlib import Path
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate

gj = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
G = nx.readwrite.json_graph.node_link_graph(gj, edges='links')

labels_data = json.loads(Path('graphify-out/.graphify_labels.json').read_text(encoding='utf-8'))
# Use labels as is - they're already string-keyed
labels = {int(k) if k.isdigit() else k: v for k, v in labels_data.items()}

# Ensure all communities have labels
comms = cluster(G)
for cid in comms:
    if cid not in labels:
        labels[cid] = f'Orphan / Section Node {cid}'

cohesion = score_all(G, comms)
gods = god_nodes(G)
sur = surprising_connections(G, comms)
questions = suggest_questions(G, comms, labels)

# Use empty detection for token totals
detection = {
    'total_files': 66,
    'total_words': 28159,
    'skipped_sensitive': ['image: 85 starter-code PNGs excluded as visual reference'],
    'files': {},
}
tokens = {'input': 0, 'output': 0}

report = generate(G, comms, cohesion, labels, gods, sur, detection, tokens, '.', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding='utf-8')
print('Report regenerated.')
print(f'  {len(gods)} god nodes, {len(sur)} surprising connections, {len(questions)} questions')
