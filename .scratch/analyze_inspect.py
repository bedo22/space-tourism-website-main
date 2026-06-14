"""Inspect graph and analyzer output directly."""
import json
from pathlib import Path
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding='utf-8'))
G = build_from_json(extraction)
print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges')
print(f'Density: {G.number_of_edges() / (G.number_of_nodes() * (G.number_of_nodes()-1) / 2) if G.number_of_nodes() > 1 else 0:.4f}')

# Top degree nodes
deg = sorted(G.degree(), key=lambda x: -x[1])[:15]
print('\nTop 15 by degree:')
for n, d in deg:
    print(f'  {d:3d}  {n}')

gods = god_nodes(G)
print(f'\ngod_nodes returned: {len(gods)} items')
print('Sample:', gods[:3] if gods else gods)

communities = cluster(G)
cohesion = score_all(G, communities)
print(f'\n{len(communities)} communities, top 5 sizes:')
for cid, members in sorted(communities.items(), key=lambda x: -len(x[1]))[:5]:
    print(f'  c{cid}: {len(members)}')

# Why is god_nodes empty?
print('\nDegree distribution sample:')
import collections
degrees = [d for _, d in G.degree()]
print(f'  max degree: {max(degrees)}, mean: {sum(degrees)/len(degrees):.2f}')
print(f'  degree counts: {collections.Counter(degrees).most_common(10)}')
