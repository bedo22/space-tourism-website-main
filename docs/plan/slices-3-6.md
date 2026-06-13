# Plan: WOFF2 fetch + slices 3-6 (faster pace)

> Tracking plan for the rest of slice 1 (the static site) work. Slices 1 and 2 are landed in `6d3e89f` and `870feba`.

## Status

- [x] Slice 1: Repo skeleton + test harness + CUBE files — `6d3e89f`, issue #2 closed
- [x] Slice 2: Static HTML + CUBE tokens — `870feba`, issue #3 closed
- [x] **Step 0: Drop the four WOFF2 files into `assets/fonts/`** — `74e096e`
- [x] Slice 3: data.json loader + picture helper — `f8ce02b`, issue #4 closed
- [x] Slice 4: Generic Tab component — `1a8df1a`, issue #5 closed
- [ ] Slice 5: Per-page wire-up + hash contract + decode — issue #6
- [ ] Slice 6: Mobile nav overlay + error panel — issue #7

## Constraints (user-picked)

1. **Faster pace.** TDD red-first is out. Tests are written alongside code, only where the seam is real and the test would catch a regression. CSS layout, hero copy, visual fade timing are eyeballed.
2. **One commit per slice.** Same review/revert grain as slices 1-2. Each slice pushes and closes its issue.
3. **Picture helper emits 6 source entries per format (single density),** not the 12 the slice 3 spec literally says. The 2x retina URL slot is intentionally a 404; the browser still serves the 1x. Known cost, flagged in the slice 3 commit.

## Step 0: Drop the WOFF2 files

**Source:** Google Fonts CDN. Bellefair and Barlow are OFL/Apache 2.0, redistributable.

**Files (case-sensitive, matching the `@font-face` rules in `css/composition.css`):**
- `assets/fonts/Bellefair-Regular.woff2`
- `assets/fonts/Barlow-Regular.woff2`
- `assets/fonts/Barlow-Bold.woff2`
- `assets/fonts/Barlow-Light.woff2`

**Method:** `curl` from `fonts.gstatic.com`. No tooling added to `package.json`.

## Slice 3: data loader + picture helper (issue #4)

**New files:**
- `js/data.js` — `getAll()`, `getCrew()`, `getDestinations()`, `getTechnologies()`, `slugify(name)`. Single-shot fetch on first call, cached thereafter, rejection propagates raw.
- `js/render/picture.js` — `buildPictureEl(item, { imageKey, basePath })`. **6 source entries per format, single density.**

**Tests (the only ones worth writing):**
- `tests/data.test.js` — `slugify("Douglas Hurley") === "douglas-hurley"`, `slugify("Launch vehicle") === "launch-vehicle"`. Cache: two `getAll()` calls → one network hit (mock `globalThis.fetch`).
- `tests/picture.test.js` — content image emits 6 source entries (3 WebP + 3 PNG). Technology image emits 6 source entries (3 JPG). `<img>` fallback `src` is the mobile file.

**Skip:** ARIA on the picture element (static markup), per-item data shape (data.json schema, not our code).

**Commit + push + close #4.**

## Slice 4: generic Tab component (issue #5)

**New file:**
- `js/tabs.js` — `createTabs({ stripEl, panelEl, items, renderPanel, onActivate })` returns `{ activate(indexOrSlug, opts), destroy() }`. Roving `tabindex`. Arrow/Home/End with wrap. 150ms ease-out fade, snap under `prefers-reduced-motion: reduce`. Does **not** touch `location.hash`, `history`, or `img.decode()`.

**New test:**
- `tests/tabs.test.js` — factory shape, click updates ARIA + calls `renderPanel` + `onActivate`, Arrow / Home / End, `activate("douglas-hurley")` matches by slug, reduced-motion disables transition, spies on `history.replaceState` and `img.decode` (neither called by tabs.js).

**Commit + push + close #5.**

## Slice 5: per-page wire-up + hash contract + decode (issue #6)

**New files:**
- `js/page.js` — entry. Dispatches by `location.pathname`. Reads `location.hash`, slug-matches, `tabs.activate(matchedIndex, { focus: true })`, `history.replaceState` to canonicalize. Listens for `hashchange`.
- `js/render/{home,destination,crew,technology}.js` — each exports `renderPanel(item, panelEl)`. Home is a no-op page module.
- `js/render/index.js` (already exists) becomes a re-export hub.

**Click flow:**
1. `tabs.js` updates ARIA + calls `renderPanel`.
2. `onActivate(slug)` → `history.replaceState(null, '', '#' + slug)`. No new history entry.
3. `page.js` calls `img.decode()` on the new `<img>`. On resolve → start 150ms fade. On reject → `console.warn` and fade anyway.

**New test:**
- `tests/page.test.js` — load `crew.html`, assert first Tab active, panel shows Douglas Hurley's bio, focus on Tab 1. Load with `#mark-shuttleworth` → Mark active + focused, hash not rewritten. Load with `#pluto` → first item active, hash rewritten to `#douglas-hurley`. Click Tab 3 → `aria-selected` updates, `renderPanel` called, `history.replaceState` called with the new slug.

**Skip:** visual fade timing, image-decode end-to-end (we spy on `decode`).

**Commit + push + close #6.**

## Slice 6: mobile nav overlay + error panel (issue #7)

**New files:**
- `js/mobile-nav.js` — `mountMobileNav()`. Body scroll lock. Focus trap. Escape closes + returns focus to hamburger. 70% width, capped at 24rem, `backdrop-filter: blur`. Snap under `prefers-reduced-motion: reduce`.
- `js/render/error.js` — `renderErrorInPanel(panelEl, message)`. `js/page.js` catches the rejection from `data.js` and calls it; underlying error → `console.error`.

**Modified files:**
- `css/block.css` — `.mobile-nav`, `.mobile-nav__backdrop`, slide-in animation.
- `css/exception.css` — overlay show/hide breakpoint.
- All 4 HTML pages — add `<div id="mobile-nav-overlay">` static markup.

**New tests:**
- `tests/mobile-nav.test.js` — click hamburger → `aria-expanded="true"`, `body.style.overflow === "hidden"`, focus inside overlay. Escape closes, focus back to hamburger, body scroll restored. Tab from last overlay link wraps to first. Reduced-motion → no transition.
- `tests/error-panel.test.js` — mock fetch to reject, dispatch `DOMContentLoaded` on `crew.html` → panel shows the friendly message, `console.error` called with the underlying error.

**Commit + push + close #7.**

## Test count target

| Slice | File | Tests |
|---|---|---|
| 3 | data.test.js | 3 (slugify 2, cache 1) |
| 3 | picture.test.js | 3 (content 1, tech 1, img fallback 1) |
| 4 | tabs.test.js | ~7 (factory, click, keyboard, slug-activate, reduced-motion) |
| 5 | page.test.js | 4 (default, deep-link, broken-hash, click) |
| 6 | mobile-nav.test.js | 4 (open, close, focus trap, reduced-motion) |
| 6 | error-panel.test.js | 1 (data fail) |
| **Total** | | **~22** |

## End state

- All 4 issues closed (#4, #5, #6, #7).
- Site works end-to-end: deep-linkable URLs, accessible Tabs, mobile nav with focus trap, graceful data-failure handling.
- `npm test` is green.
- Repo is clean except `.scratch/` and `docs/handoff/` (intentionally untouched from session start).
