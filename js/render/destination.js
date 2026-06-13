// Destination page: 4 tabs (Moon, Mars, Europa, Titan), image + meta.
import { createTabs } from '../tabs.js';
import { getDestinations, slugify } from '../data.js';
import { buildPictureEl } from './picture.js';

export async function mountDestination() {
  const items = await getDestinations();
  const strip = document.querySelector('[role="tablist"]');
  const panel = document.querySelectorAll('[role="tabpanel"]')[0];

  const tabs = createTabs({
    stripEl: strip,
    panelEl: panel,
    items,
    renderPanel: (item, panelEl) => renderDestinationPanel(item, panelEl),
    onActivate: (slug) => {
      history.replaceState(null, '', '#' + slug);
      scheduleDecode(panel);
    },
  });

  hydrateFromHash(tabs, items, 0);
  window.addEventListener('hashchange', () => hydrateFromHash(tabs, items, 0));
}

function renderDestinationPanel(item, panelEl) {
  panelEl.replaceChildren();
  const picture = buildPictureEl(item, { imageKey: 'webp', format: 'png' });
  const h2 = document.createElement('h2');
  h2.textContent = item.name;
  const p = document.createElement('p');
  p.textContent = item.description;

  const meta = document.createElement('dl');
  meta.className = 'destination__meta';
  appendStat(meta, 'Avg. distance', item.distance);
  appendStat(meta, 'Est. travel time', item.travel);

  panelEl.append(picture, h2, p, meta);
}

function appendStat(dl, term, value) {
  const dt = document.createElement('dt');
  dt.textContent = term;
  const dd = document.createElement('dd');
  dd.textContent = value;
  dl.append(dt, dd);
}

function hydrateFromHash(tabs, items, fallback) {
  const wanted = location.hash.replace(/^#/, '');
  const i = items.findIndex((it) => slugify(it.name) === wanted);
  const idx = i >= 0 ? i : fallback;
  tabs.activate(idx, { focus: true });
  if (i < 0) history.replaceState(null, '', '#' + slugify(items[idx].name));
}

function scheduleDecode(panelEl) {
  const img = panelEl.querySelector('img');
  if (!img || typeof img.decode !== 'function') return;
  img.decode().catch((err) => {
    console.warn('img.decode rejected; fading anyway', err);
  });
}
