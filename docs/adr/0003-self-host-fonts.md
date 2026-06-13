# ADR-0003: Self-host web fonts — no Google Fonts CDN

## Status
Accepted

## Context
The design uses three Google Fonts:

- **Bellefair** (serif) — 400 regular, for headings and the big numbers
- **Barlow Condensed** (sans condensed) — 400 + 700, for the numbered titles, nav links, button text
- **Barlow** (sans) — 400 + 700, for the body paragraphs and bios

The default, easy choice is to load these from Google's CDN via a `<link>` to `fonts.googleapis.com`. Most Frontend Mentor solutions do this.

## Decision
We **self-host** the WOFF2 files in `assets/fonts/`, declared with `@font-face` in `css/global.css`. The fonts are subset to **Latin only** to minimise bytes.

The five files we ship:

```
assets/fonts/
├── bellefair-400.woff2
├── barlow-condensed-400.woff2
├── barlow-condensed-700.woff2
├── barlow-400.woff2
└── barlow-700.woff2
```

(Approximate total: 50–100KB across all five files after subsetting.)

`global.css` declares each via `@font-face` with `font-display: swap` so text appears immediately in a fallback font and re-renders when the WOFF2 finishes loading.

The LCP font (Bellefair, used for the big "Space" heading on Home and the destination/crew/technology names on the tabbed pages) gets `<link rel="preload" href="assets/fonts/bellefair-400.woff2" as="font" type="font/woff2" crossorigin>` in the HTML `<head>` so the browser starts the fetch in parallel with the CSS.

## Consequences

- **+** No third-party requests. No DNS lookup, no TLS handshake, no third-party waterfall.
- **+** No Google tracking on font load (privacy / GDPR win).
- **+** Works on corporate networks and in countries that block `fonts.googleapis.com` / `fonts.gstatic.com`.
- **+** Full control over `font-display`, subsetting, caching headers.
- **+** The site is self-contained — can be archived, mirrored, served from any static host with no external dependencies.
- **−** ~50–100KB of font files committed to the repo. A small one-time cost.
- **−** We don't auto-get font updates from Google. For a portfolio piece this is a feature (design stability).
- **−** Subsetting is a one-time manual step. We do it once with `glyphhanger` or `fonttools` and commit the result.
- **−** If we ever localise the content to a language whose characters we removed from the Latin subset (e.g. French accents, German umlauts), we have to rebuild the subset and ship a new WOFF2. Acceptable for an English-only portfolio piece.

## Alternatives considered

- **Google Fonts CDN via `<link>`.** The default, but it leaks user IP to Google on every page load, adds two third-party requests to the critical path, and breaks behind some firewalls. Trade-off not worth it.
- **Bunny Fonts / Fontsource / jsDelivr.** Same third-party problem in a different wrapper. No win.
- **System font stack (`'Times New Roman', serif` etc.).** Zero load time, but the design depends on Bellefair's distinctive look. Rejected.
