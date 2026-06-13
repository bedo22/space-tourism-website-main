# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root — the glossary of domain terms (Crew, Destination, Technology, Tabstrip, Tab, Tab panel, Item, etc.).
- **`docs/adr/`** — read ADRs that touch the area you're about to work in. Currently 0001–0007.

This is a **single-context** repo. There is no `CONTEXT-MAP.md` and no per-area `CONTEXT.md`. All terms live in the root `CONTEXT.md`.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The producer skill (`/grill-with-docs`) creates them lazily when terms or decisions actually get resolved.

## File structure

```
/
├── CONTEXT.md                     ← glossary (domain terms only)
├── CLAUDE.md                      ← agent skill config
├── docs/
│   ├── adr/                       ← architectural decision records
│   │   ├── 0001-data-json-js-driven.md
│   │   ├── 0002-no-build-step.md
│   │   ├── 0003-self-host-fonts.md
│   │   ├── 0004-two-breakpoint-responsive.md
│   │   ├── 0005-url-hash-contract.md
│   │   ├── 0006-tabs-keyboard-contract.md
│   │   └── 0007-responsive-images.md
│   ├── agents/                    ← skill config (issue tracker, labels, domain)
│   ├── architecture/              ← runtime-flow.md + decisions-2026-06.md
│   └── prd/                       ← PRDs (e.g. space-tourism-v1.md)
└── starter-code/                  ← Frontend Mentor starter (assets, data)
```

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/grill-with-docs`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
