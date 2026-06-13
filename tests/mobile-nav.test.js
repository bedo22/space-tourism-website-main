// Tests for js/mobile-nav.js: open/close, body scroll lock, focus trap,
// Escape, and reduced-motion handling.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mountMobileNav } from '../js/mobile-nav.js';

function makeDom() {
  document.body.innerHTML = `
    <button class="nav__hamburger" type="button" aria-label="Open menu"
            aria-expanded="false" aria-controls="mobile-nav-overlay"
            data-icon-open="open.svg" data-icon-close="close.svg">
      <img src="open.svg" alt="" />
    </button>
    <div class="mobile-nav__backdrop" hidden></div>
    <nav id="mobile-nav-overlay" class="mobile-nav" aria-label="Mobile navigation" hidden>
      <ul>
        <li><a href="#a" class="mobile-nav__link">Alpha</a></li>
        <li><a href="#b" class="mobile-nav__link">Bravo</a></li>
        <li><a href="#c" class="mobile-nav__link">Charlie</a></li>
      </ul>
    </nav>
  `;
  return {
    trigger: document.querySelector('.nav__hamburger'),
    overlay: document.getElementById('mobile-nav-overlay'),
  };
}

const flush = () => new Promise((r) => setTimeout(r, 20));

describe('mountMobileNav', () => {
  let trigger, overlay;

  beforeEach(() => {
    document.body.style.overflow = '';
    ({ trigger, overlay } = makeDom());
  });

  it('returns a no-op when the trigger or overlay is missing', () => {
    document.body.innerHTML = '';
    const unmount = mountMobileNav();
    expect(typeof unmount).toBe('function');
  });

  it('clicking the hamburger opens the overlay and locks body scroll', async () => {
    mountMobileNav();
    trigger.click();
    await flush();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(overlay.hasAttribute('hidden')).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('Escape closes the overlay, restores body scroll, returns focus to the trigger', async () => {
    mountMobileNav();
    trigger.click();
    await flush();
    const firstLink = overlay.querySelector('a');
    firstLink.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flush();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(overlay.hasAttribute('hidden')).toBe(true);
    expect(document.body.style.overflow).toBe('');
    expect(document.activeElement).toBe(trigger);
  });

  it('Tab from the last link wraps to the first (focus trap)', async () => {
    mountMobileNav();
    trigger.click();
    await flush();
    const links = overlay.querySelectorAll('a');
    const last = links[links.length - 1];
    last.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(links[0]);
  });

  it('Shift+Tab from the first link wraps to the last', async () => {
    mountMobileNav();
    trigger.click();
    await flush();
    const links = overlay.querySelectorAll('a');
    links[0].focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, shiftKey: true }));
    expect(document.activeElement).toBe(links[links.length - 1]);
  });

  it('prefers-reduced-motion: reduce adds the no-motion marker class', () => {
    const original = window.matchMedia;
    window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} });
    mountMobileNav();
    expect(overlay.classList.contains('mobile-nav--no-motion')).toBe(true);
    window.matchMedia = original;
  });
});
