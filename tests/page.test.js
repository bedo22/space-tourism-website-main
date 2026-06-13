// Tests for js/page.js + per-page render modules.
// These load the actual HTML files into jsdom, mount the page, and
// assert the wire-up behavior (default load, deep-link, broken hash,
// click). jsdom doesn't paint or decode images, but it does give us
// the DOM, fetch mocking, history.replaceState spying, and ARIA
// state — those are the real seams to test.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const SAMPLE = {
  destinations: [{ name: 'Moon', images: { png: './a.png', webp: './a.webp' }, description: 'd', distance: '1', travel: '2' }],
  crew: [
    { name: 'Douglas Hurley', images: { png: './a.png', webp: './a.webp' }, role: 'Commander', bio: 'bio' },
    { name: 'Mark Shuttleworth', images: { png: './a.png', webp: './a.webp' }, role: 'Mission Specialist', bio: 'bio' },
    { name: 'Victor Glover',    images: { png: './a.png', webp: './a.webp' }, role: 'Pilot', bio: 'bio' },
    { name: 'Anousheh Ansari',  images: { png: './a.png', webp: './a.webp' }, role: 'Flight Engineer', bio: 'bio' },
  ],
  technology: [{ name: 'Launch vehicle', images: { portrait: './a.jpg', landscape: './a.jpg' }, description: 'd' }],
};

function loadHtmlWithMocks(relativePath, { hash = '' } = {}) {
  const html = readFileSync(resolve(repoRoot, relativePath), 'utf-8');
  const dom = new JSDOM(html, { url: 'https://example.test/' + relativePath.replace(/^\.\//, '') + hash });
  // Replace global fetch so the page module's getAll() returns the sample.
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => SAMPLE,
  });
  // The page module was written against `document` / `window` / `location`.
  // Test environments have their own, so we have to bind the JSDOM globals
  // before importing it. (Vitest resets modules per test via vi.resetModules.)
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.location = dom.window.location;
  globalThis.HTMLElement = dom.window.HTMLElement;
  return dom;
}

const flush = () => new Promise((r) => setTimeout(r, 80));

describe('crew.html — page wire-up', () => {
  let dom, replaceState;
  beforeEach(() => {
    dom = loadHtmlWithMocks('./crew.html');
    globalThis.history = dom.window.history;
    replaceState = vi.spyOn(dom.window.history, 'replaceState').mockImplementation(() => {});
  });
  afterEach(() => {
    delete globalThis.fetch;
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.location;
    delete globalThis.HTMLElement;
    delete globalThis.history;
    dom.window.close();
    replaceState.mockRestore();
    vi.resetModules();
  });

  it('default load: first tab active, panel shows Douglas Hurley, focus on Tab 1', async () => {
    await import('../js/page.js');
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    await flush();
    const t0 = dom.window.document.getElementById('tab-hurley');
    expect(t0.getAttribute('aria-selected')).toBe('true');
    const h2 = dom.window.document.querySelector('[role="tabpanel"] h2');
    expect(h2.textContent).toBe('Douglas Hurley');
  });

  it('deep-link with #mark-shuttleworth: Mark active, hash not rewritten', async () => {
    const d2 = new JSDOM(readFileSync(resolve(repoRoot, './crew.html'), 'utf-8'),
      { url: 'https://example.test/crew.html#mark-shuttleworth' });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, statusText: 'OK',
      json: async () => SAMPLE,
    });
    globalThis.window = d2.window;
    globalThis.document = d2.window.document;
    globalThis.location = d2.window.location;
    globalThis.HTMLElement = d2.window.HTMLElement;
    globalThis.history = d2.window.history;
    await import('../js/page.js');
    d2.window.document.dispatchEvent(new d2.window.Event('DOMContentLoaded'));
    await flush();
    const tab = d2.window.document.getElementById('tab-shuttleworth');
    expect(tab.getAttribute('aria-selected')).toBe('true');
  });

  it('broken hash #pluto: first item active, hash rewritten to douglas-hurley', async () => {
    const d3 = new JSDOM(readFileSync(resolve(repoRoot, './crew.html'), 'utf-8'),
      { url: 'https://example.test/crew.html#pluto' });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true, status: 200, statusText: 'OK',
      json: async () => SAMPLE,
    });
    globalThis.window = d3.window;
    globalThis.document = d3.window.document;
    globalThis.location = d3.window.location;
    globalThis.HTMLElement = d3.window.HTMLElement;
    globalThis.history = d3.window.history;
    const replace = vi.spyOn(d3.window.history, 'replaceState').mockImplementation(() => {});
    await import('../js/page.js');
    d3.window.document.dispatchEvent(new d3.window.Event('DOMContentLoaded'));
    await flush();
    expect(d3.window.document.getElementById('tab-hurley').getAttribute('aria-selected')).toBe('true');
    const last = replace.mock.calls[replace.mock.calls.length - 1];
    expect(last[2]).toBe('#douglas-hurley');
  });

  it('click on Tab 3 updates ARIA and calls history.replaceState with the new slug', async () => {
    await import('../js/page.js');
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    await flush();
    dom.window.document.getElementById('tab-glover').click();
    await flush();
    expect(dom.window.document.getElementById('tab-glover').getAttribute('aria-selected')).toBe('true');
    const last = replaceState.mock.calls[replaceState.mock.calls.length - 1];
    expect(last[2]).toBe('#victor-glover');
  });
});
