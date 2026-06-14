## Parent

#1 (PRD: Space Tourism website v1)

## What to build

The data-loading module and the responsive image source helper. After this slice, code in any later slice can call `getCrew()` / `getDestinations()` / `getTechnologies()` to get the items, and `buildPictureEl(item, { imageKey, basePath })` to produce a `<picture>` element with the right WebP/PNG and density sources.

Specifically:
- `js/data.js` exports `getAll()`, `getCrew()`, `getDestinations()`, `getTechnologies()`. On first call, fetches `data.json` once and caches the parsed result in memory. Subsequent calls return from cache. If the fetch fails or the JSON is malformed, the rejection propagates to the caller (the panel error slice will handle UX).
- A `slugify(name)` helper lives in `js/data.js` (or `js/url.js`, your call). `slugify("Douglas Hurley") === "douglas-hurley"`. ASCII-only for now.
- A `js/render/picture.js` (or inlined in `js/render/index.js`) exports a pure function that takes an Item and a base path and returns a `<picture>` element with sources for desktop / tablet / mobile and 1x / 2x density. Content images (Crew, Destination) use WebP primary + PNG fallback. Technology images use JPG only (no WebP/PNG variants — starter ships JPG only; per Q20 settled decision). The `sizes` attribute uses the layout widths 540/300/100vw (or whatever the per-page grid says — defer the exact numbers to slice 5 if the slice-2 layout numbers turn out to be different).
- Tests in `tests/` cover: (a) data loader caches across multiple `getAll()` calls (the network is hit once), (b) slugify handles the current data, (c) the picture helper produces 12 source entries for content images and 6 for Technology images, (d) the picture helper's `<img>` fallback `src` is the mobile 1x variant.

## Acceptance criteria

- [ ] `getAll()` called twice produces exactly one network request (verifiable in tests with a fetch mock).
- [ ] `slugify("Douglas Hurley")` returns `"douglas-hurley"`.
- [ ] `buildPictureEl(crewItem, "portrait")` returns a `<picture>` with 12 source entries (WebP + PNG × 3 widths × 2 densities).
- [ ] `buildPictureEl(techItem, "landscape")` returns a `<picture>` with 6 source entries (JPG only × 3 widths × 2 densities).
- [ ] On data fetch failure, the rejection carries the original `TypeError` (or equivalent) so the caller can decide what to render.
- [ ] No HTML is touched by this slice; the helper is not yet called from any page.

## Blocked by

#2 (Slice 1: Repo skeleton)
