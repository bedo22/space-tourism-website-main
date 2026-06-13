// Smoke test — proves the test harness is wired (jsdom provides `window`)
// and that ES-module imports from `js/` resolve. Written first, per TDD.
import { describe, it, expect } from 'vitest';
import * as data from '../js/data.js';

describe('test harness smoke', () => {
  it('runs under jsdom (window is defined)', () => {
    expect(typeof window).not.toBe('undefined');
  });

  it('imports js/data.js as an ES module', () => {
    expect(data).toBeDefined();
  });
});
