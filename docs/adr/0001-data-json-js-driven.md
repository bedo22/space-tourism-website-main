# ADR-0001: Use `data.json` and a JS-driven 4-page architecture, not the 13 HTML files from the starter

## Status
Accepted

## Context
The Frontend Mentor starter ships two parallel paths to the same content:

1. **Static / no-JS** — `index.html` plus 12 separate HTML files: `destination-{moon,mars,europa,titan}.html`, `crew-{commander,pilot,specialist,engineer}.html`, `technology-{capsule,spaceport,vehicle}.html`. Each tab is a full page navigation.
2. **JS-driven** — `index.html` plus 3 HTML files (`destination.html`, `crew.html`, `technology.html`) and a `data.json` file. The JavaScript fetches `data.json` once and swaps the tab panel content in place.

The design treats each tabbed page (Destination, Crew, Technology) as a single view with internal state (which item is selected), not as a set of distinct pages. The starter's 13 HTML files are a structural reference, not the "right" answer — see the project README line 19:

> *If you choose to use a JS-heavy approach, we provide a local `data.json` file… so you'll be able to pull the data from there instead of using the separate `.html` files.*

## Decision
We follow path 2: the JS-driven 4-page architecture.

The 13 starter HTML files are kept as read-only references for content text and markup patterns but are not shipped to production.

The 4 production HTML files are:

- `index.html` — Home
- `destination.html`
- `crew.html`
- `technology.html`

## Consequences

- **+** Tab clicks don't trigger a full page reload — instant feedback, no flash of unstyled content.
- **+** Header and navigation markup is written once, not 13 times.
- **+** The user can deep-link to a specific tab via URL hash (e.g. `destination.html#mars`).
- **+** The total bytes shipped to the client is lower (~3KB JSON vs. ~30KB of repeated HTML chrome).
- **−** JavaScript is required to view any content beyond the Home page.
- **−** The site is no longer a pure static site that works on `file://` — the `data.json` fetch requires `http://`.
- **−** No `data.json` = broken Destination, Crew, and Technology pages. We'll add a `<noscript>` notice on those pages.

## Alternatives considered

- **13 HTML files + View Transitions API.** Would have given SPA-like cross-page transitions, but fights the design's "in-place tab" pattern and duplicates the header 13 times. Rejected.
- **True SPA with hash-based routing for the routes themselves (`/#/destination`).** Overkill for 4 routes, would have lost the ability to deep-link to `/destination.html` directly. Rejected.

## Addendum: image loading under the JS-driven model

The Destination page has 4 candidate images, Crew has 4, Technology has 3. Two ways to render them in the JS-driven model:

- **(a) Pre-create a `<picture>` per item** in the DOM on load, toggle visibility on tab activation.
- **(b) One `<picture>` in the DOM**; on tab activation, swap its `<source srcset>` and `<img src>` to the activated item's URLs.

We chose **(b)**, with three refinements:

1. **HTTP cache carries the load.** The image URLs in `data.json` are stable strings. Once the user has seen an image, the browser's disk cache serves it on subsequent tab switches with no network. Pre-creating `<picture>` elements would not be faster after the first switch.
2. **`fetchpriority="high"` is set only on the *active* image's `<img>`.** Marking all candidate images high-priority would spread the browser's priority budget and *hurt* LCP instead of helping it. The LCP element per page is the currently-active item's image.
3. **The first item per page is preloaded** via `<link rel="preload" as="image" imagesrcset="…" imagesizes="…">` in the `<head>` of `destination.html`, `crew.html`, and `technology.html`. The other items are not preloaded — the data.json fetch is small, the user may never see them, and mobile bandwidth is finite.

On tab activation, the JS awaits `img.decode()` before swapping opacity from 0 → 1 over 150ms (or instant under `prefers-reduced-motion: reduce`). This puts the decode work inside the fade window, so the new image is fully painted by the time the fade completes.
- **Static files + a small per-page JS that fetches and inlines.** Hybrid approach: deeper-linkable HTML, dynamic tabs. Could work, but means each of the 12 sub-pages is its own document with a JS payload — more files, more requests, more cache entries. Path 2 wins on simplicity.
