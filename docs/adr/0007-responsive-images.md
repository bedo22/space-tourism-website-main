---
name: Responsive image sources and densities
description: How content images map to breakpoint, density, and format
type: project
---

# ADR-0007: Responsive image sources and densities

**Status:** Settled 2026-06-13 (Q20).

## Decision

Content images (Crew portraits, Destination planets) use `<picture>` with WebP sources first and PNG fallbacks, with **3 breakpoint × 2 density = 6 source entries per format = 12 source entries total** in the markup. The browser loads exactly one.

| Image class | Format | Source files | Total files |
|---|---|---|---|
| Crew, Destination | WebP + PNG | 3 widths × 2 densities × 2 formats | 12 source entries (1 served) |
| Technology | JPG only | 3 widths × 2 densities | 6 source entries (1 served) |
| Backgrounds (CSS `background-image`) | JPG | 1 per breakpoint | 3 (no `<picture>`) |

**Breakpoints** (mirror Frontend Mentor starter):
- Mobile: `< 768px`
- Tablet: `768px – 1199px`
- Desktop: `>= 1200px`

**Densities:**
- 1x for standard displays
- 2x for retina / hi-DPI (laptops after ~2017, most tablets and phones)
- No 3x — the visual difference is invisible and costs double the bytes of 2x

**`sizes` values** for the content `<picture>` (CSS layout widths, taken from the design grids):
- Desktop source: `sizes="(min-width: 1200px) 540px, 100vw"`
- Tablet source: `sizes="(min-width: 768px) 300px, 100vw"`
- Mobile source: `sizes="100vw"`

**Technology `sizes`:** uses the same 540/300/100vw layout widths. JPG only — we did not re-export to WebP from Figma. Per Q20 user feedback: "this is a practice project, re-exporting would be too much."

**Single active `<img>`:** only the matching source renders; the rest are not requested. (This is standard `<picture>` behavior, restated because ADR-0001's image-loading addendum already established that the `<img>` is the LCP candidate.)

## Rationale

**Why 6 source entries per image (3 widths × 2 densities):** the cost is paid once at Figma export; the bytes saved are paid on every page load forever. A 540-wide 1x JPG is roughly 1/4 the bytes of an uncondensed 1080-wide image. On a 1x laptop we serve ~50KB; on a 2x retina we serve ~180KB. The same HTML tag, browser chooses.

**Why 2x is the density ceiling:** industry standard. 3x would mean doubling the bytes again for an invisible-to-the-eye improvement on a 540-wide image.

**Why WebP + PNG fallback (not WebP only):** the Frontend Mentor starter ships both formats, so the cost of including the PNG fallback is zero. The fallback covers the Frontend Mentor screenshot bot and the ~0.1% of ancient-browser visitors. We get the smaller format for everyone who matters.

**Why JPG-only for Technology:** the starter ships JPG only. Re-exporting to WebP would require access to the Figma source and a manual export step. The user explicitly opted out: "this is a practice project and i feel things have gotten too long already." JPG is acceptable for now; this is a known and reversible cost.

**Why backgrounds are JPG-only and not in `<picture>`:** backgrounds are decorative, not content. They use CSS `background-image` with a media-query swap (`@media (min-width: 768px)`, `@media (min-width: 1200px)`). 1x density is fine because backgrounds are stretched to fill — slight softness is invisible on a starfield. 3 source files total (one per breakpoint).

## Implementation shape

```html
<picture>
  <!-- WebP primary -->
  <source type="image/webp"
          media="(min-width: 1200px)"
          srcset="images/desktop/crew/mark-shuttleworth.webp 1x,
                  images/desktop/crew/mark-shuttleworth@2x.webp 2x"
          sizes="(min-width: 1200px) 540px, 100vw">
  <source type="image/webp"
          media="(min-width: 768px)"
          srcset="images/tablet/crew/mark-shuttleworth.webp 1x,
                  images/tablet/crew/mark-shuttleworth@2x.webp 2x"
          sizes="(min-width: 768px) 300px, 100vw">
  <source type="image/webp"
          srcset="images/mobile/crew/mark-shuttleworth.webp 1x,
                  images/mobile/crew/mark-shuttleworth@2x.webp 2x"
          sizes="100vw">
  <!-- PNG fallback -->
  <source media="(min-width: 1200px)"
          srcset="images/desktop/crew/mark-shuttleworth.png 1x,
                  images/desktop/crew/mark-shuttleworth@2x.png 2x"
          sizes="(min-width: 1200px) 540px, 100vw">
  <source media="(min-width: 768px)"
          srcset="images/tablet/crew/mark-shuttleworth.png 1x,
                  images/tablet/crew/mark-shuttleworth@2x.png 2x"
          sizes="(min-width: 768px) 300px, 100vw">
  <img src="images/mobile/crew/mark-shuttleworth.png"
       alt="Mark Shuttleworth" />
</picture>
```

The `<img>` tag at the end is the **fallback of last resort** — it loads only if the browser doesn't support `<picture>` (effectively zero modern browsers). It also serves as the LCP candidate (see ADR-0001 addendum on image loading).

## Consequences

- **+** Best-format-per-browser without a build step. WebP everywhere it matters; PNG where the bot might look.
- **+** Retina sharpness on ~50% of devices that visit the site.
- **+** Asset layout mirrors the Frontend Mentor starter (no new export work for WebP/PNG; only re-organization into 1x/2x).
- **−** 12 source entries per content image is a lot of markup. The cost is one-time HTML authoring; the runtime cost is one HTTP request.
- **−** Technology is JPG-only — the known cost. Reversible if a future project re-exports from Figma.
- **−** Two image-format ecosystems to maintain (WebP/PNG for content, JPG for tech and backgrounds). A small build step would unify this; we are explicitly *not* adding a build step (ADR-0002).

## Source

- Settled during the 2026-06-12/13 grilling session.
- See ADR-0001 addendum for the LCP and pre-decode interaction.
- See `docs/architecture/runtime-flow.md` for how the `<picture>` is re-rendered on tab activation.
