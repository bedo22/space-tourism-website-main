## Parent

#1 (PRD: Space Tourism website v1)

## What to build

Static HTML for all four pages. After this slice, the user can open any of the four HTML files in a browser and see real content on Home, and a Tabstrip with an empty panel on the three category pages. No JavaScript behavior yet — just the markup, the design tokens (colors, type scale, spacing), the CUBE layer CSS, the WOFF2 fonts, and the JS-disabled fallback notice.

Specifically:
- `index.html` (Home) with the "SO, YOU WANT TO TRAVEL TO / SPACE" headline, an "Explore" link, and the navy background (`#0B0D17`) painted as a fallback. The hero background image is referenced via a `<link rel="preload" as="image">` for the LCP candidate and applied as a CSS `background-image` so a navy color shows while the image loads.
- `destination.html`, `crew.html`, `technology.html` — each with a Tabstrip as static HTML (the first Tab hard-coded as `aria-selected="true"`, `tabindex="0"`), the kicker ("01 PICK YOUR DESTINATION", "02 MEET YOUR CREW", "03 SPACE LAUNCH 101"), and a Tab panel containing only a static `<p>`: "Enable JavaScript to view this content."
- CUBE CSS organized in the four layer files, with design tokens (colors, type, spacing) defined in `composition.css` as custom properties and used by the other layers. Layout for Home and the Tabstrip visual style per page (text-in-button for Destination, dot for Crew, number for Technology) implemented in `block.css`.
- Self-hosted WOFF2 files (4 weights: Regular, Bold, Light, Bellefair display) in an `assets/fonts/` directory, with `@font-face` rules and `font-display: swap` in `composition.css`.
- The three CUBE breakpoints (mobile `< 768px`, tablet `768–1199px`, desktop `>= 1200px`) honored via media queries in `exception.css`.
- A 404 / "page not found" route is **not** in scope for this slice.

## Acceptance criteria

- [ ] Opening `index.html` shows the hero with headline, "Explore" CTA, and a navy background; the starfield image loads on top of the navy without a white flash.
- [ ] Opening `destination.html`, `crew.html`, `technology.html` shows the kicker, the Tabstrip with the first Tab styled as active, and the static "Enable JavaScript to view this content." notice in the panel.
- [ ] With JavaScript disabled in the browser, all four pages render the above. (No panel content is shown; the notice is the only thing in the panel area.)
- [ ] Heading hierarchy on every page: one `<h1>`, kickers as `<h2>` or `<p class="kicker">`, Tabstrip labels as accessible but not heading-level.
- [ ] All text passes WCAG AA color contrast against its background.
- [ ] All interactive elements (links, buttons) have a visible focus ring.
- [ ] WOFF2 fonts are self-hosted and load with `font-display: swap`.
- [ ] Manual review on phone (≤ 480px wide), tablet (≈ 800px), and laptop (≥ 1280px) confirms the layout matches the design PNGs in `starter-code/Design/` for the *static* parts (kicker position, Tabstrip visual, hero layout). Content image loading is slice 5.

## Blocked by

#3 (Slice 1: Repo skeleton)
