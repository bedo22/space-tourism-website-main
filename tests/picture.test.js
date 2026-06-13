// Tests for js/render/picture.js. These run in jsdom so document.createElement
// is the real one.
import { describe, it, expect } from 'vitest';
import { buildPictureEl } from '../js/render/picture.js';

const crewItem = {
  name: 'Mark Shuttleworth',
  images: {
    png:  './assets/crew/image-mark-shuttleworth.png',
    webp: './assets/crew/image-mark-shuttleworth.webp',
  },
};

const techItem = {
  name: 'Launch vehicle',
  images: {
    portrait:  './assets/technology/image-launch-vehicle-portrait.jpg',
    landscape: './assets/technology/image-launch-vehicle-landscape.jpg',
  },
};

describe('buildPictureEl — content (WebP + PNG)', () => {
  const picture = buildPictureEl(crewItem, { imageKey: 'webp', format: 'png' });

  it('emits a <picture> element', () => {
    expect(picture.tagName).toBe('PICTURE');
  });

  it('emits 6 <source> entries (3 WebP + 3 PNG, single density)', () => {
    const sources = picture.querySelectorAll('source');
    expect(sources.length).toBe(6);
  });

  it('the <img> fallback src is the mobile-1x WebP variant', () => {
    const img = picture.querySelector('img');
    expect(img.getAttribute('src')).toBe(crewItem.images.webp);
  });

  it('the <img> alt is the item name', () => {
    const img = picture.querySelector('img');
    expect(img.getAttribute('alt')).toBe('Mark Shuttleworth');
  });
});

describe('buildPictureEl — technology (JPG only)', () => {
  const picture = buildPictureEl(techItem, { imageKey: 'landscape' });

  it('emits 6 <source> entries (3 JPG, single density)', () => {
    const sources = picture.querySelectorAll('source');
    expect(sources.length).toBe(6);
  });

  it('all sources reference the landscape variant', () => {
    const srcsets = [...picture.querySelectorAll('source')].map((s) => s.getAttribute('srcset'));
    for (const ss of srcsets) {
      expect(ss).toMatch(/image-launch-vehicle-landscape\.jpg/);
    }
  });

  it('the <img> fallback src is the landscape file', () => {
    const img = picture.querySelector('img');
    expect(img.getAttribute('src')).toBe(techItem.images.landscape);
  });
});
