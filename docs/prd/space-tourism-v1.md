# PRD: Space Tourism website — v1 (settled 2026-06-13)

## Problem Statement

A user visiting the Space Tourism website wants to browse three categories of content — Destinations (places to travel to), Crew (people who operate the spacecraft), and Technology (the vehicles and facilities) — without waiting for page reloads between items. The user expects:

- A consistent way to switch between items in a category (tabs).
- The current selection to survive a page refresh and to be shareable as a URL.
- The site to feel fast (the active item's image should appear smoothly, not flash in).
- The site to work with keyboard only and with a screen reader.
- The site to be readable on a phone, a tablet, and a laptop.

The current code state is a Frontend Mentor starter repo with the design assets shipped but no implementation. The grill session of 2026-06-12/13 settled 20 design questions and 7 ADRs covering data shape, image loading, the Tab component, the URL contract, the keyboard contract, the responsive image sources, and the JS-disabled fallback. The implementation that follows this PRD must honor all of those decisions.

## Solution

A four-page static site (Home, Destination, Crew, Technology) that uses vanilla HTML, CUBE CSS, and vanilla JS with ES modules. The three category pages share a single Tabstrip / Tab / Tab panel component; only the panel content differs. Data is loaded once from `data.json` and rendered into the DOM by JS. The active item is encoded in the URL hash so deep-links and refresh work. A single mobile-nav overlay handles the small-screen case. The site works without JS for Home and shows a "enable JavaScript" notice on the category pages.

## User Stories

### Home page

1. As a first-time visitor, I want to see a hero with a clear "Travel to space" headline, so that I understand what the site is about within 2 seconds.
2. As a first-time visitor, I want a single "Explore" call-to-action, so that I have an obvious next step.
3. As a returning visitor, I want the homepage to render even with JavaScript disabled, so that the headline and CTA are always visible.
4. As a visitor on a slow connection, I want the hero background to appear as a navy color before the starfield image loads, so that I do not see a white flash.
5. As a visitor on a 4K monitor, I want the hero background to be sharp, so that the image does not look blurry.

### Tabstrip / Tab component (shared across all three category pages)

6. As a user, I want a row of tabs (Tabstrip) above the content, so that I can see all items in the category at a glance.
7. As a user, I want to click a Tab to switch to that item, so that the content updates without a page reload.
8. As a user, I want only one Tab to look active at a time, so that I can tell which item I am currently viewing.
9. As a keyboard user, I want the Tab key to move me into and out of the Tabstrip, so that I do not have to tab through every Tab in turn.
10. As a keyboard user, I want arrow keys to move focus between Tabs, so that I can navigate without using the mouse.
11. As a keyboard user, I want Home and End keys to jump to the first and last Tab, so that I can reach the ends quickly.
12. As a keyboard user, I want Enter or Space on a focused Tab to activate it, so that activating a Tab is consistent with activating any other button.
13. As a screen reader user, I want each Tab to announce its human name (e.g. "Mark Shuttleworth, tab"), so that I can tell the Tabs apart.
14. As a screen reader user, I want the active Tab to be announced as selected, so that I know which item I am on.
15. As a screen reader user, I want the Tab panel to be associated with its active Tab, so that navigating to the panel tells me which Tab it belongs to.

### URL state and deep-linking

16. As a user, I want to refresh the page and stay on the item I was viewing, so that a refresh does not throw me back to the first item.
17. As a user, I want to share a URL like `/crew.html#mark-shuttleworth` and have the recipient land on Mark Shuttleworth, so that deep-links work.
18. As a user, I want the browser back button to leave the page rather than step backwards through every Tab I clicked, so that my back-button history is not polluted.
19. As a user, I want an invalid or wrong-page hash (e.g. `/crew.html#pluto`) to fall back to the first item, so that I never see a broken page.
20. As a user, I want a self-healed URL (`/crew.html#pluto` becomes `/crew.html#douglas-hurley`), so that copying the URL gives a working link.
21. As a screen reader user arriving from a deep link, I want focus to land on the active Tab, so that I hear "Mark Shuttleworth, tab, 2 of 4 selected" rather than silence.

### Tab panel content

22. As a user, I want the panel content to fade in over 150ms when I switch items, so that the change feels smooth.
23. As a user with `prefers-reduced-motion: reduce`, I want the content to snap instantly with no fade, so that the transition does not trigger motion sickness.
24. As a user, I want the new item's image to be fully decoded before the fade starts, so that I never see a partial image during the transition.
25. As a user on a slow connection, I want the new item's image to start loading as soon as I click its Tab, so that the wait feels shorter.
26. As a user, I want the active item's image to be marked as a high-priority fetch, so that it loads faster than other images on the page.

### Destination page

27. As a user, I want four Destinations (Moon, Mars, Europa, Titan) selectable via Tabs that show the destination name in plain text (e.g. "MOON"), so that I can read the Tabstrip at a glance.
28. As a user, I want the active Destination's name, description, distance from Earth, and travel time to appear in the panel, so that I have all the trip facts in one place.
29. As a user, I want a "01 PICK YOUR DESTINATION" kicker above the page content, so that the page is identifiable in screenshots and the design grid.

### Crew page

30. As a user, I want four Crew members selectable via dot-shaped Tabs, so that the page is visually distinct from Destination and Technology.
31. As a user, I want the active Crew member's name, role, and bio to appear in the panel, so that I can read about who they are.
32. As a user, I want a "02 MEET YOUR CREW" kicker above the page content.
33. As a user, I want the crew portrait image to be sharp on a retina laptop, so that faces do not look soft.

### Technology page

34. As a user, I want three Technologies (Launch vehicle, Spaceport, Space capsule) selectable via numbered Tabs (1, 2, 3), so that the Tabstrip is visually distinct.
35. As a user, I want the active Technology's name and description to appear in the panel.
36. As a user, I want the Technology image to be landscape-oriented on mobile/tablet and portrait-oriented on desktop, so that it fits the design grid per breakpoint.
37. As a user, I want a "03 SPACE LAUNCH 101" kicker above the page content.

### Mobile navigation

38. As a mobile user, I want a hamburger button in the top-right corner, so that the navigation is reachable but does not crowd the header.
39. As a mobile user, I want tapping the hamburger to open a full-height overlay covering 70% of the screen width (with a 24rem cap), so that the navigation is comfortably tappable.
40. As a mobile user, I want the page content behind the overlay to be blurred, so that the overlay feels layered.
41. As a mobile user, I want body scrolling to be locked while the overlay is open, so that scrolling the page does not fight the overlay.
42. As a mobile user, I want to close the overlay by tapping the same hamburger (now an X) or pressing Escape, so that there is always an obvious way out.
43. As a mobile user, I want the hamburger to announce its expanded/collapsed state to screen readers, so that I know whether the menu is open.
44. As a keyboard user, I want focus to be trapped inside the open overlay, so that Tab does not escape into the hidden page.
45. As a user with `prefers-reduced-motion: reduce`, I want the overlay to open and close without a slide animation.

### Responsive images

46. As a user on a phone, I want a mobile-sized image to be served, so that I do not download a 1080-wide file I will never see.
47. As a user on a tablet, I want a tablet-sized image, so that the image fits the design grid without being stretched or shrunk.
48. As a user on a laptop, I want a desktop-sized image, so that the image fits the design grid.
49. As a user on a retina laptop, I want a 2x-density image, so that the image is sharp.
50. As a user on a WebP-capable browser, I want the WebP variant of the image, so that the file is ~30% smaller.
51. As a user on an ancient browser that does not support WebP, I want the PNG fallback, so that the image still renders.

### Accessibility and progressive enhancement

52. As a screen reader user, I want every page to have a logical heading hierarchy (h1 once, h2 for sections, h3 for sub-items), so that I can skim with headings.
53. As a user, I want all interactive elements to have a visible focus ring, so that I can see where keyboard focus is.
54. As a user, I want sufficient color contrast on all text against its background, so that I can read the site.
55. As a user with JavaScript disabled, I want the Home page to be fully usable.
56. As a user with JavaScript disabled, I want the category pages to show a "Enable JavaScript to view this content" notice inside the panel, so that I know why the panel is empty.
57. As a user, I want fonts to load with `font-display: swap` so that text appears in the fallback font first and then reflows, so that I never see invisible text.

### Error handling

58. As a user, I want a clear, friendly error message in the panel area if the data fails to load, so that I know something went wrong.
59. As a developer, I want the actual error logged to the browser console, so that I can debug from devtools.

## Implementation Decisions

### Data layer (ADR-0001)

- A single `data.json` file at the project root is fetched once on first category-page load and cached in memory for the rest of the session.
- A typed-accessor module exposes `getCrew()`, `getDestinations()`, `getTechnologies()` (or a single `getAll()`). The cache is per-fetch, not per-page, so the same network request serves all three pages.
- The data shape matches the Frontend Mentor `starter-code/data.json` (already inspected) — `destinations`, `crew`, `technology` arrays with `name`, `images`, and category-specific fields (`description`, `distance`, `travel` for destinations; `role`, `bio` for crew; `description` only for technology).
- **Slug derivation is runtime, not stored.** `slugify(name)` produces the URL hash. The slug field is not in `data.json` (ADR-0005). A `slugify(name) = name.toLowerCase().replace(/\s+/g, '-')` is sufficient for the current plain-ASCII data.

### Module structure

- `js/page.js` — page-level orchestrator. Reads the URL path, dispatches to the right per-page entry. Mounts the mobile nav.
- `js/tabs.js` — generic Tab component. Exposes `createTabs({ stripEl, panelEl, items, renderPanel, onActivate })` as a factory function. Owns the active-index state, the roving `tabindex`, and the keyboard handler.
- `js/{crew,destination,technology}.js` — per-page modules. Each exports a `mount()` function that wires its static Tabstrip HTML to the generic Tab component, passes a `renderPanel(item, panelEl)` that knows its own data shape, and reads/writes the URL hash.
- `js/data.js` — typed accessors over `data.json`, with the in-memory cache.
- `js/mobile-nav.js` — mobile-nav overlay open/close, body scroll lock, focus trap, Escape handling.
- `js/render/{crew,destination,technology}.js` — pure render functions. Take an Item and a Tab panel element, populate the panel (text, image, meta). Called on every activation. This is the seam where rendering is testable independently of the Tab component.

The active item is held in **one place**: the Tab instance's internal state. The URL hash and the DOM are *renders* of that state, not parallel sources. A `hashchange` event causes the Tab instance to re-activate; a Tab click causes the Tab instance to call `history.replaceState` and re-render the panel. The hash is the only external read of the active index (for deep-link init).

### Image loading (ADR-0001 addendum + ADR-0007)

- The Tabstrip is static HTML. The Tab panel is empty in HTML; the active item is rendered into it on first paint after `data.json` loads.
- Each Item's image is rendered as a `<picture>` element with sources for desktop / tablet / mobile and 1x / 2x density. Content images (Crew, Destination) use WebP primary + PNG fallback. Technology uses JPG only (the assets ship that way; no re-export).
- The LCP candidate (the first Item of the first page the user lands on) is preloaded via `<link rel="preload" as="image" imagesrcset imagesizes>` in the page's `<head>`, with a `fetchpriority="high"` hint on the inner `<img>`.
- CSS paints a navy (`#0B0D17`) background behind the LCP image as a fallback while the image loads, so there is no white flash.
- On Tab activation, the panel is re-rendered (new `<picture>` element). Before the 150ms fade-in starts, the code calls `img.decode()` on the new image so the swap is glitch-free. If the decode rejects, the panel still renders (the error is swallowed, the image area shows a broken-image state — the panel text is still useful).
- The previous image is removed from the DOM by the re-render. The browser cache still holds the file, so re-activating the same item is near-instant.

### URL hash contract (ADR-0005)

- Format: `#{slugify(item.name)}`. Lowercase, hyphens for spaces, no other transforms for current data.
- On page load: read the hash, find the matching item in the data, activate that Tab. If no hash or the hash does not match any item, activate index 0 and write the first item's slug to the hash. If the hash matches an item on a *different* page (e.g. `#moon` on `/crew.html`), fall back to the first item on the current page.
- On Tab click: update the URL with `history.replaceState` (or its hash-only equivalent). Do not use `location.hash =`, which creates a new history entry per click.
- `hashchange` events are listened for and trigger a re-activation, so back/forward across page boundaries works.

### Tab pattern (ADR-0004 + ADR-0006)

- HTML: `<div role="tablist" aria-orientation="horizontal">` with `<button role="tab" aria-selected aria-controls>` children, and a sibling `<div role="tabpanel" aria-labelledby tabindex="-1">`.
- The first Tab in HTML is hard-coded as active (`aria-selected="true"`, `tabindex="0"`); the rest are `aria-selected="false"`, `tabindex="-1"`. This avoids a flash of "all inactive" before JS runs.
- The Tab component manages:
  - **Active state** — the source of truth is internal. The DOM `aria-selected` and the URL hash are renders.
  - **Roving `tabindex`** — moves with focus, not with activation. The active Tab has `tabindex="0"`; all others have `tabindex="-1"`.
  - **Manual activation** — arrow keys move focus and *activate* in the same call (the user expects a small Tabstrip to behave that way; APG is explicit that manual activation applies to Enter/Space but in practice small tabstrips activate on arrow). Enter/Space fall through to the browser's native `<button>` click handling.
  - **Keyboard map** — `ArrowRight` → next, `ArrowLeft` → previous (wrapping), `Home` → first, `End` → last.
  - **Focus** — on initial load, after the hash activates a Tab, focus moves to that Tab. In-page clicks do not move focus (it follows the click).
- The 150ms content fade uses `ease-out`. When `prefers-reduced-motion: reduce` is set, the fade is removed and content snaps in.

### Mobile nav

- One hamburger button, top-right of the header. `aria-expanded` mirrors open/closed state; `aria-controls` points to the overlay's id.
- The overlay is a full-height block covering 70% of the viewport width, capped at 24rem. Behind it, a fixed-position backdrop with `backdrop-filter: blur` covers the rest of the page.
- Body scroll is locked (`overflow: hidden` on `<body>`) while the overlay is open.
- Focus is trapped inside the overlay when open (Tab cycles within the overlay's links). Escape closes the overlay and returns focus to the hamburger.
- The same hamburger button toggles open/close; an inline SVG swaps between the menu and the X icon.
- Animation: `ease-out` slide-in. `prefers-reduced-motion: reduce` removes the slide.

### Responsive design (ADR-0004 + ADR-0007)

- Breakpoints: mobile `< 768px`, tablet `768–1199px`, desktop `>= 1200px`.
- CUBE CSS layer organization: one file per layer (`_composition.css`, `_block.css`, `_utility.css`, `_exception.css`) — defer the exact file-naming convention to first CSS commit.
- Typography ships four WOFF2 weights (Regular, Bold, Light, Bellefair display), self-hosted, `font-display: swap`. The preloaded weight is the most-used Regular. Defer the exact subset to first typography commit.

### JS-disabled fallback

- **Home**: no notice. The headline, kicker (none, per the design), and "Explore" link are static HTML.
- **Category pages**: the Tabstrip is static HTML (per Q12-revised). The Tab panel is empty. Inside the empty panel, a static `<p>` reads "Enable JavaScript to view this content."

### Error handling (Q17)

- If `data.json` fetch fails or is malformed: render a generic error in the panel area ("Something went wrong loading this page. Please try again.") and `console.error` the actual error.
- No retry mechanism. No UI for individual Tab failures (a Tab failure is a JS bug, not a user-facing problem).

## Testing Decisions

### What makes a good test for this project

- **Test behavior, not implementation.** The Tab component's external contract is "click this Tab → panel shows this item's content → URL hash is updated → arrow keys move focus correctly." Test those outcomes from a real DOM, not the internal state.
- **Use the real DOM.** This is a small static site; there is no reason to mock `document` or `window`. Use jsdom (or vitest with `environment: 'jsdom'`) and render into a real `<div>`.
- **Prefer high-level integration tests over unit tests.** A test that mounts the page, simulates `data.json`, and asserts the first Tab is active is more valuable than a test that calls `slugify("Douglas Hurley")` and asserts `"douglas-hurley"`. The slugify is one line; the wiring is everything.
- **Accessibility is a feature, not an audit.** ARIA attributes are part of the contract: a test should assert `role="tablist"`, `aria-selected`, `aria-controls`, `tabindex` after activation.

### Proposed seams (highest first)

1. **End-to-end page load** — `data.json` exists, page mounts, first Tab is active, panel shows the first item's text and image source. This is the *highest* seam: it tests the entire stack. **This is the primary test.**
2. **Tab activation** — click Tab 3, assert panel shows item 3, URL hash is `#{slug3}`, `aria-selected="true"` on Tab 3, `tabindex="0"` on Tab 3.
3. **Keyboard navigation** — focus Tab 1, press `ArrowRight` twice, assert focus is on Tab 3. Press `End`, assert focus is on the last Tab. Press `Home`, assert focus is on the first Tab.
4. **Deep-link init** — load page with `?hash=mark-shuttleworth` (or whatever the harness allows), assert Mark's panel is shown and focus is on Mark's Tab.
5. **Hash change** — start on Tab 1, manually fire `hashchange` to `#douglas-hurley`, assert panel updates and focus moves to Douglas's Tab.
6. **Image swap** — activate an item with a different image, assert the new `<img>` `src` is in the DOM and `complete` is `true` after the 150ms fade window.
7. **Mobile nav open/close** — click the hamburger, assert `aria-expanded="true"`, body has `overflow: hidden`, focus is inside the overlay. Press Escape, assert closed and focus returns to the hamburger.
8. **Reduced-motion** — set `prefers-reduced-motion: reduce` in the test environment, activate a Tab, assert the content snaps in with no transition (no `transition` CSS property is set on the panel).
9. **JS-disabled** — load the page with JS execution disabled, assert the Tabstrip is visible and the panel shows the "Enable JavaScript" notice. (This is best tested with a real browser via Playwright; jsdom is not enough.)

### What is **not** worth testing

- `slugify` in isolation — it is a one-liner; the deep-link tests cover it.
- The render functions in isolation — the end-to-end test covers them; a unit test would just re-assert what the function does.
- `data.js` cache behavior — a one-time assertion that the same fetch is not made twice is enough; the rest is implementation detail.

### Prior art

There is no prior test infrastructure in this repo (it is a fresh Frontend Mentor starter). The first commit should add a minimal `package.json` with `vitest` + `jsdom` and one smoke test. No prior-art to mirror.

## Out of Scope

- **A real HTTP server.** The site opens from `file://` or any static host. No build step, no dev server.
- **Routing for the four pages.** Each page is its own HTML file; the URL path is what the user typed. There is no client-side router.
- **Search, filter, sort.** The user picks items via the Tabstrip; there is no other navigation.
- **Internationalization.** The site is English only. Slugify assumes ASCII; non-ASCII names will need an extended slugify at that time.
- **A CMS or admin UI.** Data is read from `data.json`; updating it is a file edit.
- **Analytics, error reporting, or telemetry.** Out of scope for a portfolio site.
- **Service worker / offline mode.** Out of scope.
- **AVIF or WebP for Technology images.** The starter ships JPG only; we keep JPG. (Re-exporting was considered and rejected per Q20.)
- **3x-density images.** 2x is the ceiling. (Q20.)
- **Build-step tooling** — no Vite, no PostCSS, no bundler. (ADR-0002.)
- **Server-side rendering** — pages are static HTML; JS fills in the panel.
- **Focus-trap library** — the focus trap is hand-rolled in `js/mobile-nav.js` (~10 lines); no library.

## Further Notes

### Reference material

- `docs/architecture/decisions-2026-06.md` — the full grill-session log (Q1–Q20, Q21–Q26 deferred).
- `docs/architecture/runtime-flow.md` — page load walkthrough (English); `.ar.md` is a paired Arabic translation for the user's bilingual learning.
- `docs/adr/0001-data-json-js-driven.md` (with image-loading addendum)
- `docs/adr/0002-no-build-step.md`
- `docs/adr/0003-self-host-fonts.md`
- `docs/adr/0004-two-breakpoint-responsive.md`
- `docs/adr/0005-url-hash-contract.md` (with focus addendum for Q18)
- `docs/adr/0006-tabs-keyboard-contract.md`
- `docs/adr/0007-responsive-images.md`
- `CONTEXT.md` — domain glossary (Crew, Crew Role, Destination, Distance, Travel time, Technology, Tabstrip, Tab, Tab panel, Item).
- `starter-code/data.json` — the data file to be read.
- `starter-code/Design/*.png` — the design reference per page per breakpoint per item.

### Glossary used in this PRD

The terms **Item**, **Tabstrip**, **Tab**, and **Tab panel** are the canonical domain terms from `CONTEXT.md` and are used throughout. "Tab" without qualifier refers to the `<button role="tab">`; "Tabstrip" refers to the `<div role="tablist">` container; "Tab panel" refers to the `<div role="tabpanel">`.

### Deferred questions (Q21–Q26) — non-blocking

The grill was closed before these were settled. They are not blockers for starting implementation; each is answerable at first commit in the relevant area:

- Q21: CUBE layer file-naming convention (settle at first CSS commit).
- Q22: WOFF2 weights to ship and which to preload (settle at first typography commit).
- Q23: Cross-module state ownership — the active-item index is held in the Tab instance (settled implicitly by Q11 and ADR-0005; revisit if a second caller needs it).
- Q24: Error boundaries between modules — Q17 covers the user-facing case.
- Q25: Reduced-motion for mobile nav — settle at first nav commit (recommendation: same 150ms-ease-out, snap with reduced motion, matching Q14).
- Q26: Focus trap in mobile nav — hand-rolled, ~10 lines; settle at first nav commit.
