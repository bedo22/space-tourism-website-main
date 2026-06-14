"""Inspect god_nodes and surprising_connections from saved graph.json."""
import json
from pathlib import Path
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
import networkx as nx

# Load graph.json (it has the graph structure)
gj = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
G = nx.readwrite.json_graph.node_link_graph(gj, edges='links')
print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges')

# Need communities to compute surprising_connections
from graphify.cluster import cluster, score_all
comms = cluster(G)
cohesion = score_all(G, comms)
print(f'{len(comms)} communities, top sizes:')
for cid, members in sorted(comms.items(), key=lambda x: -len(x[1]))[:8]:
    print(f'  c{cid}: {len(members)} (cohesion={cohesion.get(cid,0):.3f})')

gods = god_nodes(G)
print(f'\ngod_nodes: {len(gods)} items')
for g in gods[:10]:
    print(f'  {g}')

# Top degree
deg = sorted(G.degree(), key=lambda x: -x[1])[:10]
print('\nTop 10 by raw degree:')
for n, d in deg:
    print(f'  {d:3d}  {n}')

# Surprising connections
sur = surprising_connections(G, comms)
print(f'\nsurprising_connections: {len(sur)}')
for s in sur[:5]:
    print(f'  {s}')

# Suggested questions
# Build labels dict
labels = {}
for cid, members in comms.items():
    # pick a representative label from first node
    first = members[0] if members else f'c{cid}'
    # Try to clean: take the segment after the last underscore pair
    labels[cid] = first.split('_')[-1] if first else f'c{cid}'
questions = suggest_questions(G, comms, labels)
print(f'\nsuggested_questions: {len(questions)}')
for q in questions[:5]:
    print(f'  {q}')
