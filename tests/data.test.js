// Tests for js/data.js: slugify and the one-shot cache behavior.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as data from '../js/data.js';

const sampleJson = {
  destinations: [{ name: 'Moon' }, { name: 'Mars' }],
  crew: [{ name: 'Douglas Hurley' }, { name: 'Mark Shuttleworth' }],
  technology: [{ name: 'Launch vehicle' }, { name: 'Space capsule' }],
};

describe('slugify', () => {
  it('lowercases and replaces whitespace with hyphens', () => {
    expect(data.slugify('Douglas Hurley')).toBe('douglas-hurley');
  });

  it('handles a 3-word name (ADR-0005 example)', () => {
    expect(data.slugify('Mark Shuttleworth')).toBe('mark-shuttleworth');
  });
});

describe('getAll cache', () => {
  beforeEach(() => {
    data.__resetForTests();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleJson,
    });
  });
  afterEach(() => {
    delete globalThis.fetch;
  });

  it('hits the network once across multiple getAll() calls', async () => {
    await data.getAll();
    await data.getAll();
    await data.getAll();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns the same parsed object across calls (cache identity)', async () => {
    const a = await data.getAll();
    const b = await data.getAll();
    expect(a).toBe(b);
  });

  it('exposes per-collection getters that read from the same cache', async () => {
    const all = await data.getAll();
    const crew = await data.getCrew();
    expect(crew).toBe(all.crew);
  });
});
