# ADR-0004: Two-breakpoint responsive system at 48rem and 64rem, mobile-first

## Status
Accepted

## Context
The starter assets ship in three sizes per route (mobile, tablet, desktop), and the design has three distinct layouts — same count. The nav also flips from a hamburger to a horizontal bar at a single width.

The native CSS widths of the shipped JPGs, measured from `starter-code/assets/**/background-*.jpg`:

| Asset | mobile | tablet | desktop |
|---|---|---|---|
| `home/background-home-*.jpg` | 375px (750px @2×) | 768px (1536px @2×) | 1440px |
| `crew/background-crew-*.jpg` | 375px | 768px | 1440px |
| `destination/background-destination-*.jpg` | 375px | 768px | 1440px |
| `technology/background-technology-*.jpg` | 375px | 768px | 1440px |
| `technology/image-*-landscape.jpg` | — | 768×310 | — |
| `technology/image-*-portrait.jpg` | 515×527 | — | 515×527 |

Two facts shape the breakpoint choice:

1. **The tablet assets are 768px wide.** That's exactly 48rem at a 16px root — they were authored for an iPad-portrait CSS width.
2. **The desktop assets are 1440px wide.** That's 90rem. There is *no* asset authored for 1024px (64rem). The desktop JPG is designed to be displayed at 1440px CSS, not 1024px.

The nav, per the Frontend Mentor design, swaps from hamburger to horizontal at 768px (48rem). This matches the tablet asset width exactly.

## Decision
We use **two breakpoints**, mobile-first, exposed as custom properties in `global.css`:

```css
:root {
  --bp-tablet:  48rem; /* 768px  — iPad portrait, matches tablet asset width */
  --bp-desktop: 64rem; /* 1024px — iPad landscape, layout flips to side-by-side */
}
```

With `@media (min-width: 48rem)` and `@media (min-width: 64rem)`. The mobile styles are the base styles in each block; the media queries only add tablet- and desktop-specific overrides.

**Three layout buckets** fall out of the two breakpoints: mobile (< 48rem), tablet (≥ 48rem), desktop (≥ 64rem). The asset folder has three sizes, so we have one bucket per asset — no wasted breakpoints, no missing breakpoints.

**`--bp-desktop` is a *layout* breakpoint, not an *asset* breakpoint.** Between 64rem and 90rem, the desktop JPGs are scaled up (JPGs scale up gracefully with negligible quality loss). We accept this because:

- 64rem is the iPad-landscape CSS width — the canonical snap point for "content can sit side-by-side."
- 90rem would mean phones-in-landscape (≤ 64rem) see the side-by-side desktop layout, which doesn't fit.
- The asset-vs-layout gap is invisible: JPG scaling by 1.4× is imperceptible.

The nav swap, the tablet-asset swap, and the first layout-side-by-side flip **all** happen at 48rem. They stay synchronised — moving the nav breakpoint independently of the layout breakpoint is rejected.

The Technology page landscape→portrait image swap happens at 64rem (not 48rem): on tablet, we keep the 768px-wide landscape JPGs, which is the size they were authored for. The portrait JPGs (515×527) only take over on desktop, where the layout is wide enough to need a square image.

## Consequences

- **+** One bucket per asset size. No "wasted" breakpoints that don't match an asset variant.
- **+** Standard Frontend Mentor breakpoint pair. The reference solutions and community examples use the same values, which makes the codebase easy to compare against.
- **+** Custom-property names (`--bp-tablet`, `--bp-desktop`) document intent, not just width. A future reader sees "tablet" and "desktop", not raw `768px` / `1024px`.
- **+** Two media queries per block is easy to reason about. Three (mobile, tablet, desktop, ultra-wide) tends to grow to four, then five.
- **−** The desktop JPGs scale up between 64rem and 90rem. Visually fine, but it means the file's "designed for" size doesn't match its display size on iPad-landscape and small-laptop viewports.
- **−** A 90rem (1440px) viewport is the only place the desktop JPG displays at native resolution. Above 90rem, the layout will need a max-width container (e.g. `max-inline-size: 90rem; margin-inline: auto;`) to prevent line-length drift and background-position drift. (Tracked as a separate layout decision — not in scope for this ADR.)
- **−** At 48rem, the horizontal nav with logo + 4 items is tight on iPad portrait. If browser-testing shows cramping, the fix is to push the nav swap to 56rem *while keeping the layout breakpoint at 48rem* — the design asset doesn't change, only the nav. Rejected the alternative of decoupling the breakpoints by default to avoid a one-time decision in code.

## Alternatives considered

- **3 breakpoints (e.g. 35rem / 48rem / 64rem) — a "large phone" bucket.** There is no 4th asset size. Adding a breakpoint would mean either (a) reusing a smaller asset at a wider viewport (worse), or (b) reusing a larger asset at a narrower viewport (just a scaled-down desktop JPG on a small phone — also worse). Rejected.
- **2 breakpoints aligned to the assets: 48rem and 90rem.** Eliminates the JPG scale-up. Rejected because 90rem is too wide for the side-by-side layout to kick in on common laptops (most laptops are 1280–1440px wide, where 90rem = 1440px would be the *only* viewport that gets side-by-side — a 1280px laptop would still see stacked content). 64rem is the iPad-landscape standard snap point and is the right trade-off.
- **4 breakpoints (e.g. 35rem / 48rem / 64rem / 90rem).** Would add a 90rem breakpoint purely to swap to a *non-existent* larger asset, plus a 35rem bucket with no asset. Pure overhead. Rejected.
- **Desktop-first with `max-width` queries.** Out of fashion, harder to reason about, and the design is mobile-first. Rejected.
- **JS-driven responsive (matchMedia + class toggles).** Loses CSS cascade benefits, adds hydration cost on a static site, and the only thing we need JS for is *which image* to load (handled by `<picture>`/CSS background `image-set`). Rejected.
