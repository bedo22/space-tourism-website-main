## Parent

#1 (PRD: Space Tourism website v1)

## What to build

The generic Tab component (`js/tabs.js`) as a factory function. After this slice, any code can call `createTabs({ stripEl, panelEl, items, renderPanel, onActivate })` against a static Tabstrip and get a working, accessible, keyboard-navigable Tabstrip wired to a render function. The component manages its own active-index state, roving `tabindex`, ARIA attributes, keyboard map, and 150ms content fade (with reduced-motion snap).

Specifically:
- Factory exports `createTabs(opts)` returning an object with `activate(index | slug)`, `destroy()`, and an `onActivate(slug)` callback. Activation re-renders the panel via the caller's `renderPanel(item, panelEl)`, updates the `aria-selected` and `tabindex` on all Tabs, and calls `onActivate` so the page module can update the URL hash.
- Active state source of truth is internal. The DOM `aria-selected` and `tabindex` are *renders* of that state.
- Roving `tabindex`: the active Tab has `tabindex="0"`, all others `tabindex="-1"`. Tab moves into the Tabstrip, then arrow keys move within it.
- Manual activation: arrow keys move focus and *activate* in the same call (small-tablist pattern). Enter/Space fall through to the browser's native `<button>` click.
- Keyboard map: `ArrowRight` → next (wrap), `ArrowLeft` → previous (wrap), `Home` → first, `End` → last.
- The 150ms fade uses `ease-out`; `prefers-reduced-motion: reduce` removes the fade and the content snaps in.
- The component does **not** read or write `location.hash` or `history`; that's the caller's job (slice 5).
- The component does **not** do `img.decode()`; that's slice 5. This slice uses the picture helper from slice 3 but treats image loading as fire-and-forget.
- Tests cover: (a) factory returns an instance with the documented methods, (b) clicking Tab 3 sets `aria-selected="true"` on it and `aria-selected="false"` on the rest, (c) clicking Tab 3 calls `renderPanel(items[2], panelEl)`, (d) `ArrowRight` from Tab 1 focuses Tab 2, (e) `Home`/`End` jump correctly, (f) `activate("douglas-hurley")` activates the matching item, (g) `prefers-reduced-motion: reduce` makes the panel transition snap.

## Acceptance criteria

- [ ] `createTabs()` returns `{ activate, destroy }` and accepts `{ stripEl, panelEl, items, renderPanel, onActivate }`.
- [ ] Clicking a Tab updates `aria-selected`, `tabindex`, calls `renderPanel`, and calls `onActivate(slug)`.
- [ ] Arrow / Home / End keyboard navigation works as specified.
- [ ] With `prefers-reduced-motion: reduce`, no transition is applied to the panel.
- [ ] The component does not call `location.hash =` or `history.replaceState` (verified by tests spying on history).
- [ ] The component does not call `img.decode()` (verified by tests spying on the image element).

## Blocked by

#2 (Slice 1: Repo skeleton), #3 (Slice 2: Static HTML for all pages — the static Tabstrip is the test fixture), #4 (Slice 3: Data loader + picture helper)
