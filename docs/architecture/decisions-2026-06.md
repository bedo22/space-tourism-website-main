---
name: Grilling decisions log (June 2026)
description: All settled questions and ADRs from the 2026-06-12/13 grill-with-docs session
type: project
---

# Grilling decisions — June 2026

**Status:** Grill session closed 2026-06-13. All 20 questions resolved. Implementation may begin.

## ADRs (7)

| # | Title | Settled | Covers |
|---|---|---|---|
| 0001 | Data layer: `data.json` + JS-driven | 2026-06-12 (+ image-loading addendum) | Q2, Q10, Q12-revised |
| 0002 | Stack: HTML / CUBE CSS / vanilla JS, no build step | pre-session | settled list |
| 0003 | ES modules with dynamic import | pre-session | settled list |
| 0004 | ARIA Tabs pattern with manual activation | 2026-06-12 | Q3 |
| 0005 | URL hash contract (with Q18 focus addendum) | 2026-06-12 + 2026-06-13 | Q4, Q18 |
| 0006 | ARIA Tabs keyboard contract | 2026-06-13 | Q19 |
| 0007 | Responsive image sources and densities | 2026-06-13 | Q20 |

## Settled questions (20)

### Q1 — Tab accessible name
Use the human name (`Mark Shuttleworth`, not `crew-2`) as the `aria-label` on each Tab. Screen readers announce "Mark Shuttleworth, tab."

### Q2 — Image loading under JS-driven model
Single `<picture>` per panel. Only the active panel's image is in the DOM. On tab activation, re-render the panel (new `<picture>`), pre-decode via `img.decode()` *before* the 150ms fade starts. The first item of the first page uses `<link rel="preload" as="image" imagesrcset imagesizes>` to warm the LCP candidate. See ADR-0001 addendum.

### Q3 — ARIA Tabs pattern
`<div role="tablist">` with `aria-orientation="horizontal"`, `<button role="tab" aria-selected aria-controls>`, `<div role="tabpanel" aria-labelledby tabindex="-1">`. **Manual activation**: arrow keys move focus only; Enter/Space activate. Roving `tabindex` (0 on active, -1 on rest). See ADR-0004.

### Q4 — URL hash contract
`slugify(name)` computed at runtime, no pre-computed slug in `data.json`. Invalid/wrong-page hash falls back to first item and **rewrites the hash** (don't leave a broken hash in the URL). Tab clicks use `history.replaceState`, not `location.hash =`, so the back button doesn't get polluted. See ADR-0005.

### Q5 — Glossary terms
`CONTEXT.md` updated: split `Tab` into `Tabstrip` / `Tab` / `Tab panel`; added `Item`. No other term changes from the grill.

### Q6 — Source of truth
**Design Y**: a JS variable holds the active item index. DOM and URL hash are *renders* of that state, not the source. Hash change → JS variable updates → DOM re-renders. Tab click → JS variable updates → DOM + hash re-render.

### Q7 — Tab panel shape
Single `<div role="tabpanel">` in the DOM. Content is re-rendered on every activation. Inactive panels are not in the DOM. Tab text (e.g. destination name) snaps instantly with no transition (the 150ms fade is on the content block, not the tab button text).

### Q8 — Tab button visual style per page
Confirmed from `starter-code/Design/`:
- **Destination**: text in button (`MOON`, `MARS`, `EUROPA`, `TITAN`)
- **Crew**: dot only (round buttons, no text)
- **Technology**: number in button (`1`, `2`, `3`)

In all three cases, the panel heading is the item `name` (`Moon`, `Mark Shuttleworth`, `Launch vehicle`).

### Q9 — "NN ITEM" kicker
- **Home**: no kicker. Just "SO, YOU WANT TO TRAVEL TO" / "SPACE"
- **Destination, Crew, Technology**: static `NN ITEM` in HTML (e.g. `02 CREW`, `03 TECHNOLOGY`). Not in `data.json`. Changes only if the page list changes.

### Q10 — LCP image strategy
First item of the first page uses `<link rel="preload" as="image" imagesrcset imagesizes>` for the LCP candidate. CSS provides a navy (`#0B0D17`) background fallback while the image loads, so there's no white flash. See ADR-0001 addendum.

### Q11 — JS module architecture
3-layer split:
- `js/page.js` — page-level orchestrator
- `js/{crew,destination,technology}.js` — per-page Tab instance + render entry
- `js/tabs.js` — generic Tab component (factory `createTabs`)

Per-page `render{crew,destination,technology}Panel(item, panel)` function is called on every activation. Factory function pattern (not class) for `createTabs`.

### Q12 — Pre-JS HTML (revised)
**Originally recommended** rendering panel content in static HTML for no-JS users. **User pushed back** ("is it really necessary the pre-js HTML") — agreed it was overdoing for a practice project. **Revised**: no pre-JS panel content; static HTML holds only the Tabstrip. JS-disabled users see no panel content (Q15).

### Q13 — Mobile nav
Single hamburger button with `aria-expanded` and `aria-controls`. Open state: full-height overlay at 70%/24rem width with `backdrop-filter: blur`. Body scroll locked while open. No second close button — clicking the same hamburger (now an X icon) or pressing Escape closes it.

### Q14 — Easing
`ease-out` for both nav slide-in and tab content fade. Snappy entrance, no bounce.

### Q15 — JS-disabled behavior
- **Home**: no notice. Hero text and Explore button are static HTML.
- **Destination, Crew, Technology**: static `<p>` inside the panel: "Enable JavaScript to view this content." Tabstrip is still rendered (static HTML per Q12-revised).

### Q16 — Active tab in HTML
The first tab of each page is hard-coded as active in HTML (`aria-selected="true"`, `tabindex="0"`). JS reads this on init and confirms against the hash, falling back to it if the hash is missing or invalid. Avoids a flash of "all tabs inactive" before JS runs.

### Q17 — Page-init error handling
If `data.json` fetch fails or is malformed: render a generic error message ("Something went wrong loading this page. Please try again.") in the panel area, plus `console.error(actualError)` for debugging. **No retry mechanism, no error UI for individual tab failures** (those are JS bugs, not user-facing).

### Q18 — Deep-link focus
On initial page load, after the hash is read and the matching tab is activated, **move keyboard focus to the active Tab button**. Sighted users see the new content; screen reader users hear "Mark Shuttleworth, tab, 2 of 4 selected." Not applied to in-page tab clicks. See ADR-0005 addendum.

### Q19 — ARIA Tabs keyboard contract
Tab component handles: `ArrowRight` (next), `ArrowLeft` (prev), `Home` (first), `End` (last). `Enter` and `Space` are left to the browser's native `<button>` click behavior. Roving `tabindex` is the standard companion. See ADR-0006.

### Q20 — Responsive images
- **Content (Crew, Destination)**: WebP primary + PNG fallback. 3 widths × 2 densities (1x, 2x) × 2 formats = 12 source entries per image. `sizes`: 540/300/100vw.
- **Technology**: JPG only (no re-export from Figma — practice project, "things have gotten too long"). 3 widths × 2 densities = 6 source entries per image.
- **Backgrounds**: JPG, CSS `background-image` with media queries, 1x only.

See ADR-0007.

## Open questions (Q21–Q26) — deferred, not blocking

These were on the original candidate list but the grill was closed per user request. They're each answerable from the design alone or at first implementation encounter:

- **Q21** — CUBE layer file layout (one file per layer, prefix naming). Settle at first CSS commit.
- **Q22** — WOFF2 weights to ship, which weight to preload. Settle at first typography commit.
- **Q23** — Cross-module state ownership (active item is property of Tab instance, page module, or global). Settle at first `tabs.js` commit.
- **Q24** — Error boundaries between modules. Mostly settled by Q17.
- **Q25** — Reduced-motion scope for mobile nav (150ms? snap? disabled?). Settle at first nav commit.
- **Q26** — Focus trap inside open mobile nav. Settle at first nav commit.

None of these are blockers for starting implementation. They become urgent only if the implementation surfaces a real decision point.

## Glossary (`CONTEXT.md`)

Updated during the grill:
- `Tab` split into `Tabstrip` / `Tab` / `Tab panel`
- Added: `Item`

No other changes.

## Architecture reference

- `docs/architecture/runtime-flow.md` — page load sequence (English)
- `docs/architecture/runtime-flow.ar.md` — paired Arabic translation

Both were updated mid-grill to reflect Q12-revised (no pre-JS panel content).
