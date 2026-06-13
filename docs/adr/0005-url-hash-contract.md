# ADR-0005: URL hash contract for tab state

## Status
Accepted

## Context
The three tabbed pages (Destination, Crew, Technology) each have multiple items the user can switch between. We need a URL contract for:

- **Deep-linking.** A user clicks `/crew.html#douglas-hurley` from an external source and lands on Douglas Hurley's tab, not the first one.
- **Refresh resilience.** A user is viewing Mars, hits F5, and expects to still be on Mars.
- **History behavior.** A user clicks Moon → Mars → Europa should not pollute the back button with three intermediate history entries.

The state to encode is: "which item is active, on which page." Since the page is already encoded in the URL path (`/destination.html`), the hash is the right place for the item.

## Decision

**Format.** Hash value is `slugify(name)`, computed in JS at runtime from the `name` field in `data.json`. No pre-computed slug field in the data.

```
name: "Douglas Hurley"   →  hash: "#douglas-hurley"
name: "Launch vehicle"   →  hash: "#launch-vehicle"
name: "Mark Shuttleworth" →  hash: "#mark-shuttleworth"
```

The slugify function is `name.toLowerCase().replace(/\s+/g, '-')` — sufficient for current data, which is plain ASCII. If non-ASCII items appear, extend the slugify to strip non-alphanumeric characters at that time.

The slug is derived in JS at runtime, not stored in `data.json`, to guarantee `name` and `slug` never drift out of sync.

**Defaulting on missing or invalid hash.** If the hash is absent, empty, or doesn't match any item on the current page, the page falls back to the first item (index 0) and **rewrites the hash** to that item's slug. This means:

- `/destination.html`           → load Moon, hash becomes `#moon`.
- `/destination.html#pluto`     → Pluto is not a destination; load Moon, hash becomes `#moon`.
- `/destination.html#douglas-hurley` → a crew member slug on the wrong page; load Moon, hash becomes `#moon`.

Leaving a broken hash in the URL is a footgun for someone copying a link. Rewriting is one line of code.

**History behavior on tab click.** Tab activation uses `history.replaceState` (or its hash-only equivalent) to update the URL, **not** `location.hash =`. The `replaceState` form does not create a new history entry, so the browser back button leaves the page rather than stepping through previously-viewed tabs. This matches the convention used by Wikipedia, Gmail, and most tabbed UIs.

The `hashchange` event is the only thing that triggers a re-activation when the user uses the back/forward button across a *page* boundary (i.e. leaves Destination, comes back). Within a page, tabs are not a history concern.

## Consequences

- **+** Deep-links work: a user can share `/crew.html#douglas-hurley` and the recipient lands on Douglas Hurley.
- **+** Refresh on a non-default tab keeps the user on that tab.
- **+** Back button is not polluted by tab clicks within a page.
- **+** Broken or wrong-page hashes self-heal into the first item.
- **−** Three places must agree on the slugify function: (1) the initial-load code, (2) the tab-click code, (3) the hashchange handler. If they disagree, a round-trip can change the URL.
- **−** Hash-collision is unaddressed. If two items slugify to the same string, the second one is unreachable by URL. Current data has no collisions; flag this for the day it becomes one.

## Alternatives considered

- **No URL state.** Tabs reset to first item on every load. Rejected because deep-linking is the entire reason the project README says "you can pull the data from there" — users will share links.
- **`location.hash =` (creates a history entry per click).** Pollutes the back button. A user clicking through 4 tabs then trying to leave the page has to hit back 4 times. Rejected.
- **`?item=mars` (query string).** Works, but requires a server-side decision about which pages get query-string parsing. On `file://` (which this site does not target, per ADR-0001) it still works. Rejected for consistency with the rest of the static-site ecosystem, which uses hash for client state.
- **Pre-computed `slug` field in `data.json`.** Allows display name and URL key to differ. Rejected because no current item needs that flexibility, and the runtime cost is one line of code; introducing a `slug` field is one more thing that can drift.
- **Numeric index in hash (`#1`, `#2`, `#3`).** Shorter URLs, but ties URL contract to data ordering — reordering the array silently breaks every deep-link. Rejected.

## Addendum: focus management on deep-link load (settled 2026-06-13, Q18)

**Decision.** On initial page load, after the page reads the hash and activates the matching tab, keyboard focus moves to the **active Tab button** (the `<button role="tab" aria-selected="true">`).

**Why focus the tab, not the panel.** Three reasons:

1. Matches the WAI-ARIA APG Tabs example, which is the reference every accessibility auditor compares against.
2. On initial load from a deep link, focus is almost always at the address bar — moving it to a tab is not "stealing" focus from anything the user was working with.
3. The deep link *is* an act of tab selection ("take me to Mark"). Announcing the selection honors that intent; a screen reader user hears `Mark Shuttleworth, tab, 2 of 4 selected` rather than silence.

**Why not focus the panel.** The panel content (name, role, bio) is also visible and readable without focus being on it; sighted users don't need it. A non-sighted user benefits more from a clear "you are on tab 2 of 4" than from a panel read-out they could trigger with one more keypress.

**Why not leave focus alone.** This is the option we actively push back on. It silently swallows the deep-link's intent, which is the one thing the hash contract is supposed to enable.

**Scope of the rule.** This addendum applies to *initial page load* (the moment the page reads the hash and activates the matching tab). It does **not** apply to in-page tab clicks — when the user clicks a different tab, focus follows the click and stays where the browser put it. It also does **not** apply to programmatic `activate(item)` calls within the page; those update the URL and DOM but don't move focus.

**Cost.** `tabs.js` now needs to know whether the current activation is from "page init" or "user click" — a single boolean (`{ focus: true }` option on `activate()`) is enough.
