// Slice 2: static HTML structure & ARIA, loaded from disk into jsdom.
// We don't run CSS in jsdom (no layout engine), so CSS classes and
// visible layout are covered by manual review against the design PNGs.

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

function loadPage(relativePath) {
  const html = readFileSync(resolve(repoRoot, relativePath), 'utf-8');
  const dom = new JSDOM(html);
  return { document: dom.window.document };
}

describe('index.html (Home)', () => {
  let doc;
  beforeEach(() => { ({ document: doc } = loadPage('index.html')); });

  it('has exactly one h1', () => {
    expect(doc.querySelectorAll('h1').length).toBe(1);
  });

  it('kicker reads "So, you want to travel to"', () => {
    const kicker = doc.querySelector('.kicker');
    expect(kicker.textContent.trim()).toBe('So, you want to travel to');
  });

  it('hero CTA links to destination.html and is labelled "Explore"', () => {
    const cta = doc.querySelector('.home__cta');
    expect(cta.getAttribute('href')).toBe('destination.html');
    expect(cta.textContent.trim()).toBe('Explore');
  });

  it('preloads the hero background image for at least one breakpoint', () => {
    const preloads = doc.querySelectorAll('link[rel="preload"][as="image"]');
    expect(preloads.length).toBeGreaterThanOrEqual(1);
  });

  it('imports CUBE CSS in composition -> block -> utility -> exception order', () => {
    const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')]
      .map((l) => l.getAttribute('href'));
    expect(styles).toEqual([
      'css/composition.css',
      'css/block.css',
      'css/utility.css',
      'css/exception.css',
    ]);
  });
});

describe('destination.html', () => {
  let doc;
  beforeEach(() => { ({ document: doc } = loadPage('destination.html')); });

  it('kicker reads "01 Pick your destination"', () => {
    const kicker = doc.querySelector('.kicker');
    expect(kicker.textContent.replace(/\s+/g, ' ').trim()).toBe('01 Pick your destination');
  });

  it('Tabstrip is role=tablist with 4 tabs; first is aria-selected and tabindex=0', () => {
    const list = doc.querySelector('[role="tablist"]');
    expect(list).not.toBeNull();
    const tabs = list.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(4);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('tabindex')).toBe('0');
    for (let i = 1; i < tabs.length; i++) {
      expect(tabs[i].getAttribute('tabindex')).toBe('-1');
    }
  });

  it('each tab controls a panel with the JS-disabled notice', () => {
    const tabs = doc.querySelectorAll('[role="tab"]');
    for (const tab of tabs) {
      const id = tab.getAttribute('aria-controls');
      const panel = doc.getElementById(id);
      expect(panel).not.toBeNull();
      expect(panel.getAttribute('role')).toBe('tabpanel');
      expect(panel.textContent.trim()).toBe('Enable JavaScript to view this content.');
    }
  });

  it('only the first panel is visible by default (others hidden)', () => {
    const panels = doc.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].hasAttribute('hidden')).toBe(false);
    for (let i = 1; i < panels.length; i++) {
      expect(panels[i].hasAttribute('hidden')).toBe(true);
    }
  });
});

describe('crew.html', () => {
  let doc;
  beforeEach(() => { ({ document: doc } = loadPage('crew.html')); });

  it('kicker reads "02 Meet your crew"', () => {
    const kicker = doc.querySelector('.kicker');
    expect(kicker.textContent.replace(/\s+/g, ' ').trim()).toBe('02 Meet your crew');
  });

  it('has 4 crew tabs (dot variant); first is selected', () => {
    const list = doc.querySelector('[role="tablist"]');
    expect(list.classList.contains('tabstrip--dots')).toBe(true);
    const tabs = list.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(4);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });
});

describe('technology.html', () => {
  let doc;
  beforeEach(() => { ({ document: doc } = loadPage('technology.html')); });

  it('kicker reads "03 Space launch 101"', () => {
    const kicker = doc.querySelector('.kicker');
    expect(kicker.textContent.replace(/\s+/g, ' ').trim()).toBe('03 Space launch 101');
  });

  it('has 3 numbered tabs (number variant); first is selected', () => {
    const list = doc.querySelector('[role="tablist"]');
    expect(list.classList.contains('tabstrip--numbers')).toBe(true);
    const tabs = list.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
    expect(tabs[0].textContent.trim()).toBe('1');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
  });
});

describe('all pages', () => {
  for (const path of ['index.html', 'destination.html', 'crew.html', 'technology.html']) {
    it(`${path} imports CUBE CSS in the right order`, () => {
      const { document: doc } = loadPage(path);
      const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')]
        .map((l) => l.getAttribute('href'));
      expect(styles).toEqual([
        'css/composition.css',
        'css/block.css',
        'css/utility.css',
        'css/exception.css',
      ]);
    });

    it(`${path} has a skip-to-content link and a labelled <main>`, () => {
      const { document: doc } = loadPage(path);
      const skip = doc.querySelector('a[href="#main"]');
      expect(skip).not.toBeNull();
      const main = doc.querySelector('main#main');
      expect(main).not.toBeNull();
    });
  }
});
