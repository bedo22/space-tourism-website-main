// Technology page: 3 tabs, image + meta.
import { createTabs } from '../tabs.js';
import { getTechnologies, slugify } from '../data.js';
import { buildPictureEl } from './picture.js';

export async function mountTechnology() {
  const items = await getTechnologies();
  const strip = document.querySelector('[role="tablist"]');
  const panel = document.getElementById('panel-technology');

  // Both the stacked mobile/tablet layout and the 3-column desktop layout
  // have a taller-than-wide image area, so the portrait asset is correct
  // at every breakpoint. No resize swap needed.
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
  // Both the stacked mobile/tablet layout and the 3-column desktop layout
  // have a taller-than-wide image area, so the portrait asset is correct
  // at every breakpoint. Using landscape in a portrait container caused
  // the image to be cropped with object-fit: cover.
  const picture = buildPictureEl(item, { imageKey: 'portrait' });
  picture.classList.add('technology__image');

  const body = document.createElement('div');
  body.className = 'technology__body';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'kicker technology__eyebrow';
  eyebrow.textContent = 'The terminology…';

  const h2 = document.createElement('h2');
  h2.className = 'technology__name';
  h2.textContent = item.name;
  const p = document.createElement('p');
  p.className = 'technology__bio';
  p.textContent = item.description;

  body.append(eyebrow, h2, p);
  panelEl.append(body, picture);
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
