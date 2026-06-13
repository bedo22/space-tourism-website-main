// Mobile nav overlay. Mounts a focus-trapped, scroll-locking slide-in
// panel for the hamburger button. The static <div id="mobile-nav-overlay">
// must exist in the HTML; this script wires the toggle, the focus trap,
// Escape, and the body scroll lock.

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function mountMobileNav() {
  const trigger = document.querySelector('.nav__hamburger');
  const overlay = document.getElementById('mobile-nav-overlay');
  if (!trigger || !overlay) return () => {};

  let isOpen = false;
  let prevFocus = null;
  let prevBodyOverflow = '';

  const closeIcon = trigger.dataset.iconClose || '';
  const openIcon  = trigger.dataset.iconOpen  || '';

  function open() {
    if (isOpen) return;
    isOpen = true;
    // Save the trigger as the focus return point. The trigger is what
    // the user clicked to open, so it's the right thing to restore to
    // on close. (Saving `document.activeElement` at this moment would
    // give us body, since the click is still propagating.)
    prevFocus = trigger;
    prevBodyOverflow = document.body.style.overflow;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Close menu');
    overlay.removeAttribute('hidden');
    if (openIcon)  trigger.querySelector('img').src = closeIcon;
    document.body.style.overflow = 'hidden';
    // Move focus to the first focusable element inside the overlay.
    const first = overlay.querySelector(FOCUSABLE);
    if (first) first.focus();
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Open menu');
    overlay.setAttribute('hidden', '');
    if (closeIcon) trigger.querySelector('img').src = openIcon;
    document.body.style.overflow = prevBodyOverflow;
    if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
  }

  function onTriggerClick() {
    isOpen ? close() : open();
  }

  function onKeydown(e) {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab' || !isOpen) return;
    // Focus trap: cycle within overlay focusable elements.
    const focusables = [...overlay.querySelectorAll(FOCUSABLE)];
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last  = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function onReducedMotion() {
    // Just keep the slide in or out via CSS -- nothing JS-side to do
    // beyond a marker class that the stylesheet can target.
    overlay.classList.toggle('mobile-nav--no-motion', prefersReducedMotion());
  }

  trigger.addEventListener('click', onTriggerClick);
  document.addEventListener('keydown', onKeydown);
  onReducedMotion();
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener?.('change', onReducedMotion);
  }

  return function unmount() {
    trigger.removeEventListener('click', onTriggerClick);
    document.removeEventListener('keydown', onKeydown);
  };
}
