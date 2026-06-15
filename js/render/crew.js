// Crew page: 4 tabs (one per crew member), image + role + bio.
import { createTabs } from '../tabs.js';
import { getCrew, slugify } from '../data.js';
import { buildPictureEl } from './picture.js';

export async function mountCrew() {
  const items = await getCrew();
  const strip = document.querySelector('[role="tablist"]');
  const panel = document.getElementById('panel-crew');

  const tabs = createTabs({
    stripEl: strip,
    panelEl: panel,
    items,
    renderPanel: (item, panelEl) => renderCrewPanel(item, panelEl),
    onActivate: (slug) => {
      history.replaceState(null, '', '#' + slug);
      scheduleDecode(panel);
    },
  });

  hydrateFromHash(tabs, items, 0);
  window.addEventListener('hashchange', () => hydrateFromHash(tabs, items, 0));
}

function renderCrewPanel(item, panelEl) {
  panelEl.replaceChildren();
  const picture = buildPictureEl(item, { imageKey: 'webp', format: 'png' });
  picture.classList.add('crew__image');

  const body = document.createElement('div');
  body.className = 'crew__body';

  const role = document.createElement('p');
  role.className = 'crew__role';
  role.textContent = item.role;
  const h1 = document.createElement('h1');
  h1.className = 'crew__name';
  h1.textContent = item.name;
  const bio = document.createElement('p');
  bio.className = 'crew__bio';
  bio.textContent = item.bio;

  body.append(role, h1, bio);
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
