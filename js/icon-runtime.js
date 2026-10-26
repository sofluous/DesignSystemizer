(function (win, doc) {
  'use strict';
  function render(root = doc) {
    const library = win.DesignSystemApprovedIcons;
    if (!library) throw new Error('Load icon-approved.js before icon-runtime.js');
    const targets = [...(root.matches?.('[data-ds-icon]') ? [root] : []), ...root.querySelectorAll('[data-ds-icon]')];
    for (const host of targets) {
      const alias = host.getAttribute('data-ds-icon');
      const icon = library.icons[alias];
      host.replaceChildren();
      host.setAttribute('aria-hidden', 'true');
      if (!icon) { host.dataset.dsIconState = 'missing'; continue; }
      // Only the build-validated, local approved collection enters the runtime bundle.
      host.innerHTML = icon.svg;
      const svg = host.firstElementChild;
      svg.setAttribute('width', '1em'); svg.setAttribute('height', '1em');
      svg.setAttribute('focusable', 'false'); svg.setAttribute('aria-hidden', 'true');
      host.dataset.dsIconState = 'ready';
      host.dataset.dsIconVersion = library.version;
    }
  }
  win.DesignSystemIcons = { render };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => render(), { once: true });
  else render();
})(window, document);
