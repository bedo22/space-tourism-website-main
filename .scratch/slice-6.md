## Parent

#1 (PRD: Space Tourism website v1)

## What to build

The mobile nav overlay and the data-load error panel. After this slice, the chrome around the Tab component is complete.

Specifically:
- `js/mobile-nav.js` exports `mountMobileNav()` which finds the hamburger button (assumed to be a `<button aria-controls="primary-nav-overlay">` in the header) and wires it to a full-height overlay covering 70% of viewport width (capped at 24rem). The overlay contains the same nav links as the desktop header. Behind the overlay, a fixed-position backdrop with `backdrop-filter: blur` covers the rest of the page.
- The hamburger has `aria-expanded="true" | "false"` and `aria-controls="primary-nav-overlay"`. Clicking the same button toggles open/close; the inline SVG swaps between the menu icon and the X icon.
- Body scroll is locked (`overflow: hidden` on `<body>`) while the overlay is open.
- Focus is trapped inside the overlay when open (Tab cycles within the overlay's focusable elements; Shift-Tab cycles backward). Escape closes the overlay and returns focus to the hamburger button.
- The slide-in animation uses `ease-out`; `prefers-reduced-motion: reduce` removes the slide and the overlay snaps in.
- A single function `renderErrorInPanel(panelEl, message)` is added (likely in `js/page.js` or `js/render/error.js`) that puts a generic error message in a Tab panel area and `console.error`s the underlying error. `js/page.js` catches the rejection from `data.js` and calls it.
- Tests cover: (a) clicking the hamburger sets `aria-expanded="true"`, body has `overflow: hidden`, focus is inside the overlay; (b) Escape closes the overlay, returns focus to the hamburger, body scroll is restored; (c) Tab cycles within the overlay (focus trap); (d) `prefers-reduced-motion: reduce` makes the overlay snap in; (e) when `data.json` fails to load, the panel area shows the friendly message and the actual error is in the console (verified by spying on `console.error`).

## Acceptance criteria

- [ ] On a phone-width viewport, tapping the hamburger opens a full-height overlay; the page behind is blurred and does not scroll.
- [ ] Tapping the same hamburger (now an X) or pressing Escape closes the overlay and returns focus to the hamburger.
- [ ] Tab inside the open overlay cycles through overlay links only; it does not escape to the hidden page.
- [ ] With `prefers-reduced-motion: reduce`, the overlay opens and closes with no slide animation.
- [ ] When `data.json` is missing or malformed (verified by pointing `data.js` at a broken URL in a test), the panel area shows "Something went wrong loading this page. Please try again." and the actual error is in `console.error`.
- [ ] The error message is the only content in the panel; the Tabstrip is still visible and clickable, but clicking any Tab still shows the error (data is still missing).

## Blocked by

#3 (Slice 2: Static HTML for all pages — the hamburger lives in the header), #5 (Slice 4: Generic Tab component — the error panel replaces the panel render)
