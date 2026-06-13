// Tests for js/tabs.js: factory shape, click, keyboard, slug-activate,
// reduced-motion, and the "this slice does not touch history or decode"
// guard.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTabs } from '../js/tabs.js';

// jsdom's requestAnimationFrame doesn't auto-flush, so after a click that
// triggers an RAF chain, we yield to the event loop before asserting.
const flushFrames = () => new Promise((r) => setTimeout(r, 50));

const items = [
  { name: 'Douglas Hurley' },
  { name: 'Mark Shuttleworth' },
  { name: 'Victor Glover' },
  { name: 'Anousheh Ansari' },
];

function makeDom() {
  document.body.innerHTML = `
    <ul role="tablist">
      <li><button role="tab" id="t0" aria-selected="true"  tabindex="0"  aria-controls="p0">H</button></li>
      <li><button role="tab" id="t1" aria-selected="false" tabindex="-1" aria-controls="p1">S</button></li>
      <li><button role="tab" id="t2" aria-selected="false" tabindex="-1" aria-controls="p2">G</button></li>
      <li><button role="tab" id="t3" aria-selected="false" tabindex="-1" aria-controls="p3">A</button></li>
    </ul>
    <section id="p0" role="tabpanel" aria-labelledby="t0"></section>
  `;
  const strip = document.querySelector('[role="tablist"]');
  const panel = document.querySelector('[role="tabpanel"]');
  return { strip, panel };
}

describe('createTabs', () => {
  let strip, panel, renderPanel, onActivate;

  beforeEach(() => {
    ({ strip, panel } = makeDom());
    renderPanel = vi.fn();
    onActivate = vi.fn();
  });

  it('returns { activate, destroy }', () => {
    const t = createTabs({ stripEl: strip, panelEl: panel, items, renderPanel, onActivate });
    expect(typeof t.activate).toBe('function');
    expect(typeof t.destroy).toBe('function');
  });

  it('on click of tab 3, aria-selected updates and renderPanel + onActivate are called', async () => {
    const t = createTabs({ stripEl: strip, panelEl: panel, items, renderPanel, onActivate });
    document.getElementById('t2').click();
    await flushFrames();
    expect(renderPanel).toHaveBeenCalledTimes(1);
    expect(renderPanel).toHaveBeenCalledWith(items[2], panel);
    expect(onActivate).toHaveBeenCalledWith('victor-glover', items[2]);
    expect(document.getElementById('t2').getAttribute('aria-selected')).toBe('true');
    for (let i = 0; i < 4; i++) {
      const tab = document.getElementById('t' + i);
      const expected = i === 2 ? '0' : '-1';
      expect(tab.getAttribute('tabindex')).toBe(expected);
    }
  });

  it('ArrowRight from tab 0 moves focus and activates tab 1', async () => {
    const t = createTabs({ stripEl: strip, panelEl: panel, items, renderPanel, onActivate });
    document.getElementById('t0').focus();
    const ev = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true });
    document.getElementById('t0').dispatchEvent(ev);
    await flushFrames();
    expect(document.activeElement).toBe(document.getElementById('t1'));
    expect(renderPanel).toHaveBeenCalledWith(items[1], panel);
  });

  it('Home and End jump', async () => {
    const t = createTabs({ stripEl: strip, panelEl: panel, items, renderPanel, onActivate });
    document.getElementById('t2').focus();
    document.getElementById('t2').dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    document.getElementById('t3').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await flushFrames();
    expect(document.activeElement).toBe(document.getElementById('t0'));
  });

  it('ArrowRight from last tab wraps to first', async () => {
    const t = createTabs({ stripEl: strip, panelEl: panel, items, renderPanel, onActivate });
    document.getElementById('t3').focus();
    document.getElementById('t3').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await flushFrames();
    expect(document.activeElement).toBe(document.getElementById('t0'));
  });

  it('activate("douglas-hurley") matches by slug', async () => {
    const t = createTabs({ stripEl: strip, panelEl: panel, items, renderPanel, onActivate });
    t.activate('douglas-hurley');
    await flushFrames();
    expect(renderPanel).toHaveBeenCalledWith(items[0], panel);
    expect(document.getElementById('t0').getAttribute('aria-selected')).toBe('true');
  });

  it('does not call history.replaceState or img.decode (those are slice 5)', async () => {
    const replaceState = vi.spyOn(history, 'replaceState').mockImplementation(() => {});
    // jsdom's HTMLImageElement does not have a `decode` method. Add a
    // mock one so we can spy on it; tabs.js must not call it.
    const img = document.createElement('img');
    img.decode = vi.fn(() => Promise.resolve());
    panel.appendChild(img);
    const t = createTabs({ stripEl: strip, panelEl: panel, items, renderPanel, onActivate });
    document.getElementById('t1').click();
    await flushFrames();
    expect(replaceState).not.toHaveBeenCalled();
    expect(img.decode).not.toHaveBeenCalled();
    replaceState.mockRestore();
  });
});

describe('createTabs under prefers-reduced-motion', () => {
  it('renderPanel is called synchronously and no transition style is set', () => {
    // jsdom matchMedia returns false by default; set up a fake matchMedia.
    const original = window.matchMedia;
    window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addListener() {}, removeListener() {} });
    document.body.innerHTML = `
      <ul role="tablist">
        <li><button role="tab" id="t0" aria-selected="true"  tabindex="0"  aria-controls="p0">H</button></li>
        <li><button role="tab" id="t1" aria-selected="false" tabindex="-1" aria-controls="p1">S</button></li>
      </ul>
      <section id="p0" role="tabpanel" aria-labelledby="t0"></section>
    `;
    const strip = document.querySelector('[role="tablist"]');
    const panel = document.querySelector('[role="tabpanel"]');
    const renderPanel = vi.fn();
    const onActivate = vi.fn();
    const t = createTabs({ stripEl: strip, panelEl: panel, items: items.slice(0, 2), renderPanel, onActivate });
    document.getElementById('t1').click();
    expect(renderPanel).toHaveBeenCalled();
    expect(panel.style.transition).toBe('');
    window.matchMedia = original;
  });
});
