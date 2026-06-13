// Generic Tab component (factory). ADR-0006.
//
// Contract:
//   const tabs = createTabs({
//     stripEl,           // <ul role="tablist">
//     panelEl,           // <section role="tabpanel"> container
//     items,             // [{ name }, ...] -- used to look up by slug
//     renderPanel,       // (item, panelEl) => void
//     onActivate,        // (slug, item) => void
//   });
//   tabs.activate(0)                // programmatic
//   tabs.activate('douglas-hurley') // by slug
//   tabs.activate(0, { focus: true }) // moves focus to the tab
//   tabs.destroy()                  // removes listeners
//
// Out of scope (by design):
//   - reading or writing location.hash / history
//   - img.decode() or any image-loading coordination
//   Those are the caller's job (slice 5).

const FADE_MS = 150;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function createTabs({ stripEl, panelEl, items, renderPanel, onActivate }) {
  let activeIndex = 0;
  const tabEls = [...stripEl.querySelectorAll('[role="tab"]')];

  function tabEl(i) { return tabEls[i]; }
  function item(i) { return items[i]; }
  function slugOf(i) { return slugify(item(i).name); }

  function paint() {
    tabEls.forEach((el, i) => {
      const isActive = i === activeIndex;
      el.setAttribute('aria-selected', String(isActive));
      el.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  }

  function activate(indexOrSlug, opts = {}) {
    const next =
      typeof indexOrSlug === 'number'
        ? indexOrSlug
        : tabEls.findIndex((_, i) => slugOf(i) === indexOrSlug);
    if (next < 0 || next >= tabEls.length) return;

    activeIndex = next;
    paint();

    if (opts.focus) tabEl(next).focus();

    // 150ms fade unless reduced-motion. The panel is repainted by the
    // caller via renderPanel; the fade is applied to the panel element.
    if (prefersReducedMotion()) {
      renderPanel(item(next), panelEl);
      if (onActivate) onActivate(slugOf(next), item(next));
      return;
    }

    panelEl.style.transition = `opacity ${FADE_MS}ms ease-out`;
    panelEl.style.opacity = '0';
    // Wait one frame so the opacity transition has a starting point.
    requestAnimationFrame(() => {
      renderPanel(item(next), panelEl);
      requestAnimationFrame(() => {
        panelEl.style.opacity = '1';
        if (onActivate) onActivate(slugOf(next), item(next));
      });
    });
  }

  function onClick(e) {
    const i = tabEls.indexOf(e.currentTarget);
    if (i >= 0) activate(i);
  }

  function onKeydown(e) {
    const i = tabEls.indexOf(document.activeElement);
    if (i < 0) return;
    let next = i;
    switch (e.key) {
      case 'ArrowRight': next = (i + 1) % tabEls.length; break;
      case 'ArrowLeft':  next = (i - 1 + tabEls.length) % tabEls.length; break;
      case 'Home':       next = 0; break;
      case 'End':        next = tabEls.length - 1; break;
      default: return;
    }
    e.preventDefault();
    activate(next, { focus: true });
  }

  tabEls.forEach((el) => {
    el.addEventListener('click', onClick);
    el.addEventListener('keydown', onKeydown);
  });

  // Paint the initial state without firing onActivate.
  paint();

  return {
    activate,
    destroy() {
      tabEls.forEach((el) => {
        el.removeEventListener('click', onClick);
        el.removeEventListener('keydown', onKeydown);
      });
    },
  };
}

// Local slugify keeps tabs.js independent of data.js. The behavior
// matches ADR-0005 and the public data.slugify.
function slugify(name) {
  return String(name).toLowerCase().replace(/\s+/g, '-');
}
