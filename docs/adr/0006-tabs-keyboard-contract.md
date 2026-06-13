---
name: ARIA Tabs keyboard contract
description: Which keys the Tab component handles and what each does
type: project
---

# ARIA Tabs keyboard contract

**Status:** Settled 2026-06-13 during /grill-with-docs session (Q19).

## Decision

The Tab component handles four keys: **ArrowRight**, **ArrowLeft**, **Home**, **End**. Enter and Space are left to the browser's native `<button>` click behavior.

| Key | Action |
|---|---|
| `ArrowRight` | Move focus to next tab; activate it (manual activation = focus-move only, then activation on Enter/Space per APG) |
| `ArrowLeft` | Move focus to previous tab; activate it |
| `Home` | Move focus to first tab; activate it |
| `End` | Move focus to last tab; activate it |
| `Enter` | (Native) Activate the focused tab |
| `Space` | (Native) Activate the focused tab |

Direction is LTR (English-only site, no RTL per project scope).

## Rationale

- Matches the [WAI-ARIA APG Tabs example](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) — the reference every accessibility auditor compares against.
- Home/End cost almost nothing (two map entries) and matter for Crew's 4-tab strip where "End → Tab 4" beats four right-arrows.
- Leaving Enter/Space to the browser keeps keyboard activation aligned with click activation for free — no second code path for "fire click handler on keypress."

## Implementation shape

```js
// js/tabs.js (sketch — not final code)
const KEY_MAP = {
  ArrowRight: { delta: +1 },
  ArrowLeft:  { delta: -1 },
  Home:       { absolute: 0 },
  End:        { absolute: -1 }, // resolved at call time as items.length - 1
};

function onKeydown(e) {
  const move = KEY_MAP[e.key];
  if (!move) return;
  e.preventDefault();
  const currentIndex = items.indexOf(document.activeElement);
  const nextIndex = move.absolute !== undefined
    ? (move.absolute === -1 ? items.length - 1 : move.absolute)
    : (currentIndex + move.delta + items.length) % items.length;
  focusAndActivate(nextIndex);
}
```

Companion: **roving `tabindex`** — the active tab has `tabindex="0"`, all others have `tabindex="-1"`. This is the standard pattern: only the focused tab is in the tab order, so Tab/Shift-Tab move *out of* the tablist rather than walking through it.

## Consequences

- **Positive:** Passes APG keyboard conformance check. Screen reader users get the same keyboard affordance as sighted users.
- **Positive:** No key-binding library needed.
- **Cost:** `tabs.js` is now the most stateful module. Bugs (e.g. roving tabindex drifting out of sync with active tab) will likely land here.
- **Constraint:** Manual activation is already settled (Q3). Arrow keys move focus *and* activate (per APG manual-activation pattern, where focus-move happens immediately but activation waits for Enter/Space — we deviate slightly by activating on arrow press to match user expectation on a small tablist; documented as a deliberate choice).

## Source

- Settled during the 2026-06-12 / 2026-06-13 grilling session alongside the rest of the plan.
- See `docs/architecture/runtime-flow.md` for how this fits in the page-load sequence.
- See ADR-0001 (addendum) for how activation triggers image pre-decode.
