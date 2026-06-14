# Space Tourism website

A 4-page static site built from the [Frontend Mentor Space Tourism challenge](https://www.frontendmentor.io/challenges/space-tourism-multipage-website-gRWj1URZ3) starter, but implemented as a single application rather than 13 separate HTML files.

The project is the result of a deliberate architecture decision: instead of one HTML file per destination, crew member, and technology, the site ships **four pages** (`index.html`, `destination.html`, `crew.html`, `technology.html`) that all read the same `data.json` and use a shared Tab component to switch between items in a category. See `docs/adr/0001-data-json-js-driven.md` for the rationale and `docs/architecture/decisions-2026-06.md` for the full grilling log that produced the current shape.

## Stack

- **HTML** — 4 pages, semantic markup, ARIA tablist/tab/tabpanel roles on the category pages.
- **CSS** — [CUBE CSS](https://cube.fyi/) layout: `css/composition.css` → `css/block.css` → `css/utility.css` → `css/exception.css`. Two breakpoints (48rem, 64rem), mobile-first.
- **JS** — vanilla ES modules, no build step. Each page's entry is `js/page.js`; per-page renderers live in `js/render/`.
- **Fonts** — self-hosted WOFF2 (4 weights: Regular, Bold, Light, Bellefair). No Google Fonts CDN.
- **Tests** — `vitest` + `jsdom`. `npm test` runs them.

There is no bundler, transpiler, or framework. The site opens by double-clicking any HTML file or by serving the directory with any static server.

## Pages

| Page                  | Route                 | What it does                                                                 |
|-----------------------|-----------------------|------------------------------------------------------------------------------|
| `index.html`          | `/`                   | Hero + "Explore" CTA. Renders without JS.                                    |
| `destination.html`    | `/destination.html`   | Tabbed view over 4 destinations (Moon, Mars, Europa, Titan).                  |
| `crew.html`           | `/crew.html`          | Tabbed view over 4 crew members.                                              |
| `technology.html`     | `/technology.html`    | Tabbed view over 3 technologies (launch vehicle, spaceport, capsule).         |

The active item on the category pages is encoded in the URL hash so deep-links survive a refresh — see `docs/adr/0005-url-hash-contract.md`.

## Project structure

```
.
├── index.html              Home (JS-optional)
├── destination.html        Tabbed: destinations
├── crew.html               Tabbed: crew
├── technology.html         Tabbed: technology
├── data.json               Single source of truth for items
│
├── css/                    CUBE CSS layers (composition, block, utility, exception)
├── js/
│   ├── page.js             Route table + global fetch-failure handler
│   ├── data.js             Cached fetch('./data.json') + per-collection getters
│   ├── tabs.js             Generic Tab factory (ADR-0006)
│   ├── picture.js          <picture> builder with WebP/PNG + density variants
│   ├── hash.js             URL hash contract: read, slugify, write
│   ├── focus-trap.js       Focus trap for the mobile-nav overlay
│   ├── mobile-nav.js       Mobile menu overlay
│   └── render/
│       ├── home.js
│       ├── destination.js
│       ├── crew.js
│       ├── technology.js
│       ├── error.js        data.json failure panel
│       └── index.js        re-export hub
│
├── tests/                  vitest + jsdom unit tests
├── assets/                 (empty in this repo — see "Starter assets" below)
└── docs/
    ├── CONTEXT.md          → see ../CONTEXT.md
    ├── adr/                7 ADRs
    ├── architecture/       Dec 2026-06 wrap, runtime-flow notes
    ├── prd/                PRD: Space Tourism website v1
    ├── plan/               Slice tracker
    ├── agents/             Workflow guides for AI agents
    └── handoff/            Session handoffs
```

## Getting started

```bash
# No install needed for the site itself.
# Open index.html in a browser, or:
npx serve .          # any static server works

# For tests:
npm install
npm test
```

There is no build step. The site is the source.

## Starter assets

The Figma-exported images, fonts, and per-page PNG references live under `starter-code/`. The HTML pages reference them at their original paths (e.g. `starter-code/assets/home/background-home-desktop.jpg`). The font files (4 WOFF2 weights) must be dropped into `assets/fonts/` separately before the `@font-face` rules in `css/composition.css` can resolve — see the comment at the top of that file.

The `starter-code/` directory is **visual reference only**. The site does not copy it into `assets/`; it references the originals directly. If you want a self-contained distribution, copy `starter-code/assets/` into `assets/` and update the `href` attributes in the HTML files.

## Architecture, in one sentence

**Read `data.json` once at boot; on each page, the renderer takes the relevant collection, builds a Tabstrip, and lets the user switch items via keyboard or click — the URL hash tracks the active item so deep-links and back/forward buttons work.**

For the long version, see `docs/architecture/decisions-2026-06.md` and the runtime-flow note in `docs/architecture/runtime-flow.md`.

## Decisions of record

The current shape is the result of 20 settled design questions and 7 ADRs from a grill session on 2026-06-12/13. The ADRs (in `docs/adr/`) cover:

- **0001** — Use `data.json` + JS-driven 4-page architecture (not the 13 starter HTMLs)
- **0002** — No build step; native ES modules + plain CSS
- **0003** — Self-host web fonts (no Google Fonts CDN)
- **0004** — Two-breakpoint responsive (48rem, 64rem), mobile-first
- **0005** — URL hash contract for tab state (slug of the active item)
- **0006** — Tabs component keyboard contract (Arrow / Home / End / Enter / Space)
- **0007** — Responsive image sources and densities (WebP first, PNG fallback, 1×/2×)

The Tabs component, the hash contract, the picture helper, and the mobile-nav overlay are the architectural primitives. Everything else hangs off them.

## Glossary

Domain terms (Crew, Crew Role, Destination, Distance, Travel time, Technology, Tab, Tabstrip, Tab panel, Item) are defined in `CONTEXT.md` at the repo root. Use those terms in code, comments, and PR descriptions — not synonyms.

## Testing

```bash
npm test
```

Tests live next to the code (`tests/*.test.js`) and run under vitest with jsdom for DOM-heavy cases. The pacing model after the first two slices is "tests alongside, not before" — the contract for visual/ARIA work is the design PNG in `starter-code/Design/`, and the tests assert the structural and behavioural contract.

## Working with this repo

- **Plans** — multi-step work goes in `docs/plan/<name>.md` as a checkbox list; update status in the same commit that closes each step.
- **ADRs** — hard-to-reverse, surprising, or trade-off-laden decisions get a numbered file in `docs/adr/`.
- **Handoffs** — end-of-session state is captured in `docs/handoff/<date>.md` so the next session (human or agent) can pick up without re-deriving context.
- **Issue tracking** — see `docs/agents/issue-tracker.md` for conventions; the `gh` CLI is the tool of record.
- **Triage labels** — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

## License

Frontend Mentor challenge assets are for personal/portfolio use per the Frontend Mentor license. The implementation code in this repo is MIT.
