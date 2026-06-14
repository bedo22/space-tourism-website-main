## Parent

#1 (PRD: Space Tourism website v1)

## What to build

The repository skeleton: tooling for tests, the CUBE CSS layer file tree, the `js/` module directory, and one smoke test that proves the test harness runs. Nothing user-visible. After this slice lands, every later slice has a place to put code and a test command that works.

Specifically:
- A `package.json` with `vitest` + `jsdom` as dev dependencies and a `test` script.
- CUBE CSS files at the repo root or under a chosen `css/` directory, named exactly `composition.css`, `block.css`, `utility.css`, `exception.css` (one file per CUBE layer; per user's HITL decision on Q21). Empty or near-empty — the design tokens land in slice 2.
- A `js/` directory with placeholder `page.js`, `tabs.js`, `data.js`, `mobile-nav.js`, and `render/` subdirectory.
- A `tests/` directory with one smoke test that imports `data.js` (or any module) and asserts `typeof window !== 'undefined'` (proving jsdom is wired correctly).
- A short note in `README.md` (or the equivalent) that says `npm install && npm test` is the developer entry point.

## Acceptance criteria

- [ ] `npm install` succeeds on a fresh clone.
- [ ] `npm test` runs and the smoke test passes.
- [ ] `composition.css`, `block.css`, `utility.css`, `exception.css` exist and are imported in the right order in any sample HTML page (or a `tests/fixtures/index.html`).
- [ ] `js/{page,tabs,data,mobile-nav}.js` and `js/render/` exist as placeholders (each file may export nothing yet).
- [ ] `CONTEXT.md` and `docs/adr/` are not modified by this slice.

## Blocked by

None — can start immediately.
