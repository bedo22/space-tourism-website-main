## Parent

#1 (PRD: Space Tourism website v1)

## What to build

The per-page wire-up. This is the slice where the end-to-end demo becomes real: the user clicks a Tab, the panel content updates, the URL hash updates, a deep-link lands on the right Tab with focus on the right Tab button, and the new image decodes before the fade.

Specifically:
- `js/page.js` reads the current URL path, dispatches to `js/crew.js` / `js/destination.js` / `js/technology.js` (or `js/home.js` for the root). Each per-page module calls `createTabs()` with its static Tabstrip, its render function from `js/render/`, and an `onActivate(slug)` that calls `history.replaceState` to update the URL.
- `js/render/crew.js`, `js/render/destination.js`, `js/render/technology.js` each export a pure `renderPanel(item, panelEl)` that populates the panel with text + the picture from slice 3's helper.
- On page load: read `location.hash`, slugify each item's name, find the match, and call `tabs.activate(matchedIndex, { focus: true })`. If no match, activate index 0, then write the first item's slug to the hash. If a `hashchange` event fires, re-activate to the new slug (or fall back to index 0 on miss).
- On Tab activation in the page: call `history.replaceState` (not `location.hash =`).
- Image pre-decode: in the Tab's `onActivate`, after `renderPanel` runs, call `img.decode()` on the new image. If it resolves, start the 150ms fade. If it rejects, start the fade anyway and `console.warn` (the panel text is still useful).
- The `focus: true` option to `activate()` (passed only on initial page load) moves focus to the activated Tab. On user clicks, focus is left alone (it follows the click).
- Tests cover: (a) the highest-seam end-to-end test — load a category page, assert the first Tab is active, the panel shows the first item's text and image source, focus is on the first Tab; (b) clicking Tab 3 changes the URL hash to the matching slug; (c) loading the page with `#mark-shuttleworth` activates Mark's Tab and focuses it; (d) firing a `hashchange` event activates the new item.

## Acceptance criteria

- [ ] Loading `crew.html` in a browser activates Douglas Hurley, displays his bio, and focuses his Tab button.
- [ ] Loading `crew.html#mark-shuttleworth` activates Mark, displays his bio, and focuses his Tab button.
- [ ] Clicking another Tab updates the visible content and the URL hash, but does **not** add a new history entry (the back button leaves the page).
- [ ] Loading `crew.html#pluto` activates Douglas (index 0) and rewrites the hash to `#douglas-hurley`.
- [ ] The new image is fully decoded before the 150ms fade starts (visually verified; tested via the seam that the `<img>` element's `complete` is `true` after the fade window).
- [ ] With `prefers-reduced-motion: reduce`, content snaps in with no fade and no `decode()` delay.
- [ ] The error panel slice (slice 6) covers the data-failure case; this slice assumes the data loads successfully.

## Blocked by

#4 (Slice 3: Data loader + picture helper), #5 (Slice 4: Generic Tab component)
