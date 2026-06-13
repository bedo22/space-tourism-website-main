// Data loader: fetches data.json once, caches the parsed result, and
// exposes per-collection getters. Pure data layer; no DOM, no rendering.
//
// The data.json shape (see starter-code/data.json):
//   {
//     destinations: [...],
//     crew:         [...],
//     technology:   [...]
//   }
//
// Each item has a `name` (string) and other page-specific fields.

let cache = null;
let inflight = null;

async function load() {
  if (cache) return cache;
  if (inflight) return inflight;

  inflight = fetch('./data.json')
    .then((res) => {
      if (!res.ok) throw new TypeError(`data.json: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then((parsed) => {
      cache = parsed;
      return cache;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/** Return the full parsed data.json object. */
export async function getAll() {
  return load();
}

/** Return the destinations array (Moon, Mars, Europa, Titan). */
export async function getDestinations() {
  const data = await load();
  return data.destinations;
}

/** Return the crew array (Douglas Hurley, Mark Shuttleworth, Victor Glover, Anousheh Ansari). */
export async function getCrew() {
  const data = await load();
  return data.crew;
}

/** Return the technology array (Launch vehicle, Spaceport, Space capsule). */
export async function getTechnologies() {
  const data = await load();
  return data.technology;
}

/**
 * Convert a display name to a URL-safe slug.
 * ADR-0005: "name" -> "name" lowercased, whitespace -> "-".
 * ASCII-only for now; extend when non-ASCII items appear.
 */
export function slugify(name) {
  return String(name).toLowerCase().replace(/\s+/g, '-');
}

// Test seam: lets tests reset the module-level cache between cases
// (otherwise a mock fetch set up in test A would leak into test B).
export function __resetForTests() {
  cache = null;
  inflight = null;
}
