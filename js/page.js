// Page entry point. Reads the current path, dispatches to a per-page
// module. Each module boots the Tabs component, reads the URL hash,
// wires history.replaceState, and orchestrates image pre-decode.

import * as data from './data.js';
import { mountCrew } from './render/crew.js';
import { mountDestination } from './render/destination.js';
import { mountTechnology } from './render/technology.js';
import { mountHome } from './render/home.js';
import { mountMobileNav } from './mobile-nav.js';

const ROUTES = {
  '/': mountHome,
  '/index.html': mountHome,
  '/destination.html': mountDestination,
  '/crew.html': mountCrew,
  '/technology.html': mountTechnology,
};

document.addEventListener('DOMContentLoaded', () => {
  // `location.pathname` on file:// URLs can be e.g. "/E:/.../crew.html".
  // Match by suffix on the basename so we don't have to care about the
  // drive letter or absolute path.
  const path = location.pathname;
  const mount =
    ROUTES[path] ||
    Object.entries(ROUTES).find(([k]) => k !== '/' && path.endsWith(k.replace(/^\//, '')))?.[1] ||
    mountHome;

  // Global fetch-failure handler: any page that hits data.js can throw.
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && /data\.json/.test(String(e.reason.message || e.reason))) {
      e.preventDefault();
      import('./render/error.js').then(({ renderErrorInPanel }) => {
        // Render into whichever panel exists, or fall back to a top-level notice.
        const panel = document.querySelector('[role="tabpanel"]') || document.querySelector('main');
        renderErrorInPanel(panel, 'We could not load the trip data right now. Please try again later.');
      });
      console.error('data.json load failed:', e.reason);
    }
  });

  // Wrap the mount in a try/catch so a fetch failure becomes a real
  // rejection event (not an unhandled async throw). The unhandledrejection
  // listener above catches it and renders the error panel.
  Promise.resolve()
    .then(() => mount(data))
    .catch((err) => {
      const message = String((err && (err.message || err)) || 'Unknown error');
      if (/data\.json/.test(message) || /fetch/.test(message) || err instanceof TypeError) {
        import('./render/error.js').then(({ renderErrorInPanel }) => {
          const panel = document.querySelector('[role="tabpanel"]') || document.querySelector('main');
          renderErrorInPanel(panel, 'We could not load the trip data right now. Please try again later.');
        });
        console.error('data.json load failed:', err);
      } else {
        throw err; // not our error
      }
    });
  mountMobileNav();
});
