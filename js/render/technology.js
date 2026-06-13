// Technology page: 3 tabs, image (portrait/landscape) + meta.
import { createTabs } from '../tabs.js';
import { getTechnologies, slugify } from '../data.js';
import { buildPictureEl } from './picture.js';

export async function mountTechnology() {
  const items = await getTechnologies();
  const strip = document.querySelector('[role="tablist"]');
  const panel = document.querySelectorAll('[role="tabpanel"]')[0];

  // Tech uses JPG only; the imageKey picks the right orientation based
  // on the viewport at render time. For now we default to landscape and
  // swap to portrait at < 768px on resize. The starter ships both.
  const tabs = createTabs({
    stripEl: strip,
    panelEl: panel,
    items,
    renderPanel: (item, panelEl) => renderTechPanel(item, panelEl),
    onActivate: (slug) => {
      history.replaceState(null, '', '#' + slug);
      scheduleDecode(panel);
    },
  });

  hydrateFromHash(tabs, items, 0);
  window.addEventListener('hashchange', () => hydrateFromHash(tabs, items, 0));
}

function renderTechPanel(item, panelEl) {
  panelEl.replaceChildren();
  const isMobile = window.matchMedia && window.matchMedia('(max-width: 47.99em)').matches;
  const orientation = isMobile ? 'portrait' : 'landscape';
  const picture = buildPictureEl(item, { imageKey: orientation });
  const h2 = document.createElement('h2');
  h2.textContent = item.name;
  const p = document.createElement('p');
  p.textContent = item.description;
  panelEl.append(picture, h2, p);
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
