# Runtime flow: deep-link to a specific crew member

This document walks through what happens, end-to-end, when a user opens
`/crew.html#mark-shuttleworth` in a fresh browser tab. It is the canonical
example for the per-page controller architecture; the other two tabbed pages
(destination, technology) follow the same shape with different data and
different render functions.

## The cast of files

| File                | Role                                                                  |
|---------------------|-----------------------------------------------------------------------|
| `crew.html`         | HTML shell. Has the Tabstrip markup, the Tab panel container, and a `<script type="module">` that imports `page.js`. |
| `js/page.js`        | Entry point. Looks at the URL, imports the right per-page controller, runs its init. |
| `js/crew.js`        | The crew page's controller. Knows the crew data and the crew panel's shape. |
| `js/data.js`        | The data layer. Fetches `data.json` once, exposes `getCrew()` (and the two siblings). |
| `js/tabs.js`        | The shared ARIA Tabs pattern. A factory function `createTabs(...)` that wires up clicks, keyboard, ARIA, and focus. Knows nothing about crew, destinations, or technology. |
| `data.json`         | Static JSON. Three arrays: `destinations`, `crew`, `technology`. |
| `js/render/crew.js` | (Conceptually) the per-page render function. Updates the panel's text and image for a given crew item. |

## Step-by-step

1. **Browser parses `crew.html`.**
   The HTML shell includes `<link rel="preload">` tags for the page background
   and the first crew image (the LCP candidate), so those downloads start
   immediately. The CSS is parsed and applied. The DOM is built with the
   header, the Tabstrip markup, and the empty Tab panel container — but
   the panel itself has no content yet. The Tabstrip is present in HTML
   (it doesn't change between items and doesn't depend on data). The
   panel's first render waits for JS to fetch `data.json`.

2. **`<script type="module" src="./js/page.js">` executes.**
   Modules are deferred by default — the script runs after the DOM is parsed
   but before `DOMContentLoaded` fires. At this point the DOM is fully
   available, the preload images are downloading in parallel, and we have
   not yet blocked the main thread on the `data.json` fetch.

3. **`page.js` reads `location.pathname`.**
   It sees `/crew.html` (or just `crew.html` on `file://`) and decides:
   "this is the crew page." It does a dynamic `import('./crew.js')` and
   calls the default export — `initCrewPage()`.

4. **`crew.js` calls `getCrew()` from `data.js`.**
   The data layer checks its in-memory cache. Empty on first call, so it
   fires `fetch('./data.json')`, awaits the response, parses the JSON,
   stores the parsed object in module-scoped state, and returns the `crew`
   array. Subsequent calls (e.g. on `hashchange` later) hit the cache and
   return synchronously.

5. **`crew.js` reads `location.hash`.**
   The hash is `#mark-shuttleworth`. `crew.js` runs `slugify()` on every
   item's `name` and finds the matching index. The array order is
   `["Douglas Hurley", "Mark Shuttleworth", "Victor Glover", "Anousheh Ansari"]`,
   so Mark Shuttleworth is at index `1`. If the hash were missing, empty,
   or didn't match any item, `crew.js` would fall back to index `0` and
   rewrite the hash to `#douglas-hurley` via `history.replaceState`.

6. **`crew.js` calls `createTabs({ ... })` from `tabs.js`.**
   The arguments are:
   - `tabs`: an array of `<button>` elements, one per crew member, found
     by querying the Tabstrip container.
   - `panel`: the single `<div role="tabpanel">` in the page.
   - `onActivate`: a callback `crew.js` provides. It takes `(index, item)`
     and calls the per-page render function (e.g. `renderCrewPanel(panel, item)`).
     It also updates the URL hash via `history.replaceState`.

   `createTabs` sets up `aria-controls`, `aria-selected`, and `tabindex`
   on each tab. The active tab gets `tabindex="0"`; the inactive ones get
   `tabindex="-1"` (so they receive focus on arrow-key navigation but not
   on a plain `Tab` from the address bar). It wires up `click` handlers,
   `keydown` handlers (arrow keys move focus, `Home`/`End` jump to
   first/last, `Enter`/`Space` activate the focused tab), and a
   `hashchange` listener. It returns `{ activate, destroy }`.

7. **`createTabs` returns the controller object.**
   No DOM is rendered yet at this point — the controller is in its initial
   state. The pre-JS HTML still shows item 0 (Douglas Hurley).

8. **`crew.js` calls `controller.activate(1)`.**
   This is the moment the page actually updates. Inside `activate(1)`:
   - Set `aria-selected="false"` and `tabindex="-1"` on tab 0.
   - Set `aria-selected="true"` and `tabindex="0"` on tab 1.
   - Move keyboard focus to tab 1 (so a screen reader announces the change).
   - Update `aria-labelledby` on the panel to point to tab 1's id.
   - Fire the `onActivate(1, crew[1])` callback.
   - The callback calls `renderCrewPanel(panel, crew[1])`, which updates
     the panel's role kicker, name, bio, and `<img>` source.
   - The image is awaited via `img.decode()` so the swap is glitch-free.
   - The URL hash is updated to `#mark-shuttleworth` via
     `history.replaceState` (no new history entry).

The user sees: page loads → first item briefly visible (Douglas Hurley) →
fade or instant swap to Mark Shuttleworth → URL bar reads
`/crew.html#mark-shuttleworth`.

## What happens on a subsequent `hashchange`

If the user is on `/crew.html#mark-shuttleworth` and clicks the browser
back button, they leave the page entirely (per ADR-0005 — `replaceState`
means tab clicks don't create history entries). But if the user navigates
*to* `/crew.html#victor-glover` from an external link, or types it in the
address bar, the page reloads and steps 1–8 run again with index `2`.

If the user is on the same page and uses a script or extension to set
`location.hash = 'anousheh-ansari'`, the `hashchange` event fires inside
`tabs.js`. The handler reads the new hash, finds the index (`3`), and
calls `controller.activate(3)` — skipping the URL-rewrite step because
the hash is already valid.

## Why this shape

- **The Tabstrip is in the HTML shell, the panel content is in `data.json`.**
  Users on slow connections or with JS disabled see the page chrome
  (header, background, Tabstrip) but no panel content. The Tabstrip
  doesn't change between items, so it's safe to hard-code. The panel
  content is fetched and rendered by JS — one source of truth in
  `data.json`, no risk of HTML/JSON drift.
- **The data layer is the only place that knows about `data.json`.** A
  future change to the data source (a different file, a `fetch` from an
  API, a hard-coded object for tests) only touches `data.js`.
- **`tabs.js` is the only place that knows about the ARIA Tabs pattern.**
  A future accessibility audit, or a switch to radio-button semantics,
  touches one file.
- **The render function is the only place that knows the panel's
  shape.** Changing "where does the role go" is a one-file change.

The seam between "shared pattern" (`tabs.js`) and "page-specific shape"
(the render function) is the boundary that lets us add a fourth tabbed
page later (e.g. `mission.html`) by writing only the new HTML, the new
data, and one new render function — no changes to `tabs.js`, `data.js`,
or `page.js`.
