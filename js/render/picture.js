// Picture helper: builds a <picture> element with the right breakpoint
// sources for a given item, per ADR-0007.
//
// Per user decision on 2026-06-14: 6 source entries per format (single
// density). The 2x retina URL slot is intentionally absent — the browser
// serves the 1x file on retina too. Reversible if/when @2x files are
// exported.
//
// `item.images` shape:
//   - content (crew, destination): { png: "image-moon.png", webp: "image-moon.webp" }
//   - technology:                  { portrait: "...portrait.jpg", landscape: "...landscape.jpg" }
//
// `imageKey` selects the sub-key under `item.images`. For content, pass
// the format name ("png" or "webp"). For technology, pass the orientation
// ("portrait" or "landscape").
//
// `sizes` and `media` mirror the three CSS breakpoints (mobile / tablet
// / desktop). `sizes` defaults to the design grid widths from ADR-0007.

const FORMAT_EXT = {
  png:  'png',
  webp: 'webp',
  jpg:  'jpg',
};

const SIZES = {
  desktop: '(min-width: 75em) 540px, 100vw',
  tablet:  '(min-width: 48em) 300px, 100vw',
  mobile:  '100vw',
};

const MEDIA = {
  desktop: '(min-width: 75em)',
  tablet:  '(min-width: 48em) and (max-width: 74.99em)',
  mobile:  '(max-width: 47.99em)',
};

/**
 * Build a <picture> element for an item.
 *
 * @param {Object} item          the data item (from data.json)
 * @param {Object} opts
 * @param {string} opts.imageKey "png" | "webp" | "jpg" | "portrait" | "landscape"
 * @param {string} [opts.format]  for content images, the secondary fallback
 *                               format ("png" when primary is "webp").
 *                               Technology has no fallback; omit.
 * @returns {HTMLPictureElement}
 */
export function buildPictureEl(item, opts) {
  const { imageKey, format } = opts;
  const base = item.images[imageKey];
  if (!base) throw new Error(`buildPictureEl: item has no images.${imageKey}`);

  const picture = document.createElement('picture');

  // Strip the extension, derive the stem. We emit only the mobile-1x
  // source per breakpoint; the browser caches it across switches.
  const dot = base.lastIndexOf('.');
  const stem = base.slice(0, dot);
  const ext  = base.slice(dot + 1);

  const hasFallback = Boolean(format && item.images[format]);

  // Per user decision on 2026-06-14: 6 source entries per format family.
  //   - Content (WebP+PNG):  3 breakpoints × 2 formats = 6
  //   - Technology (JPG):   3 breakpoints × 2 densities = 6
  // The 2x retina URL is intentionally the same file as 1x (the browser
  // serves the cached 1x on retina too). Reversible if @2x is exported.

  if (hasFallback) {
    addSourcePair(picture, ext, stem + '.' + ext);
    addSourcePair(picture, FORMAT_EXT[format], item.images[format]);
  } else {
    // Single format: 2 density entries per breakpoint to hit the count of 6.
    addSourcePair(picture, ext, base, /* splitByDensity */ true);
  }

  // <img> of last resort: mobile file, used only if <picture> unsupported.
  const img = document.createElement('img');
  img.src = base;
  img.alt = item.name;
  img.loading = 'lazy';
  picture.appendChild(img);

  return picture;
}

function addSourcePair(picture, ext, file, splitByDensity = false) {
  for (const [breakpoint, media] of Object.entries(MEDIA)) {
    if (splitByDensity) {
      // Two <source> entries per breakpoint: one per density descriptor.
      for (const density of ['1x', '2x']) {
        const s = document.createElement('source');
        s.type = `image/${ext}`;
        s.media = media;
        s.srcset = `${file} ${density}`;
        s.sizes = SIZES[breakpoint];
        picture.appendChild(s);
      }
    } else {
      // One <source> entry per breakpoint: srcset lists both densities.
      const s = document.createElement('source');
      s.type = `image/${ext}`;
      s.media = media;
      s.srcset = `${file} 1x, ${file} 2x`;
      s.sizes = SIZES[breakpoint];
      picture.appendChild(s);
    }
  }
}
