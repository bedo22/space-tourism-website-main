# ADR-0002: No build step — native ES modules and plain CSS, no bundler, no transpiler

## Status
Accepted

## Context
Modern web projects often start with a build pipeline: Vite, Webpack, esbuild, Parcel, etc. They offer JS minification, CSS preprocessing, tree-shaking, automatic vendor prefixing, and (sometimes) TypeScript.

Our project is a 4-page static site. The total source is small: ~3KB of JSON, ~300 lines of JS, ~500 lines of CSS. There are no npm dependencies.

## Decision
We use **no build step**. The browser executes the source directly:

- **JavaScript** — `<script type="module" src="js/main.js">` with `import`/`export` between files. Native ES modules, no transpilation, no bundling.
- **CSS** — one `<link rel="stylesheet">` per CUBE layer (`reset.css`, `global.css`, `compositions.css`, `utilities.css`, `blocks.css`, `exceptions.css`). No Sass, no PostCSS, no autoprefixer — modern browser baseline (last 2 versions of evergreen browsers) handles what we need.
- **HTML** — written by hand, one file per route.
- **Assets** — served as-is from `assets/`, no optimisation pipeline.

## Consequences

- **+** Zero `node_modules`, zero install step, zero config to maintain. Cloning the repo and running `npx serve` (or `python -m http.server`) is the entire setup.
- **+** The source the browser runs is the source the developer wrote. No "is this from a transpiled file?" debugging.
- **+** Easy to read and learn from — useful for a portfolio piece.
- **−** No JS minification. The ~300 lines of JS ship uncompressed in source form.
- **−** No CSS preprocessing. We can't use Sass variables or `@extend`. We use native CSS custom properties (variables) and native CSS nesting (which modern browsers support, see browser baseline).
- **−** No automatic vendor prefixing. Anything we use that needs prefixes must be written with manual fallbacks. (In practice, our plan uses no properties that need prefixes.)
- **−** No npm packages without bundling. We can only use what the browser provides.
- **−** `file://` doesn't work for testing — the `data.json` `fetch` requires `http://`. We need a local dev server.

## Alternatives considered

- **Vite (zero-config dev server with HMR).** Tempting for HMR, but adds `package.json`, a `node_modules` tree, and framework concepts. Not worth it for a 300-line JS project.
- **Astro / 11ty for SSG.** Would let us write components in `.astro` files, but introduces a build step, framework concepts, and template syntax. Overkill.
- **esbuild as a one-shot minifier.** Could keep the no-bundler principle while still minifying. Possible future refinement if file size becomes a concern.
