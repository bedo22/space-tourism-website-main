// Error panel renderer. Used by the global unhandledrejection handler
// in page.js to surface a friendly message in the panel area when
// data.json fails to load.

export function renderErrorInPanel(panelEl, message) {
  if (!panelEl) return;
  panelEl.replaceChildren();
  const p = document.createElement('p');
  p.className = 'error-panel';
  p.setAttribute('role', 'alert');
  p.textContent = message;
  panelEl.appendChild(p);
}
