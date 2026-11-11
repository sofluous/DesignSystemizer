const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function testBuilderFonts({ evaluate, send, session, root }) {
  await send('DOM.enable', {}, session);
  await send('CSS.enable', {}, session);
  await send('DOM.getDocument', { depth: -1, pierce: true }, session);
  async function fonts(expression) {
    const result = await send('Runtime.evaluate', { expression }, session);
    if (!result.result.objectId) return [];
    const { nodeId } = await send('DOM.requestNode', { objectId: result.result.objectId }, session);
    const resultFonts = await send('CSS.getPlatformFontsForNode', { nodeId }, session);
    await send('Runtime.releaseObject', { objectId: result.result.objectId }, session);
    return resultFonts.fonts.map(({ familyName, isCustomFont, glyphCount }) => ({ familyName, isCustomFont, glyphCount }));
  }
  const canonical = value => value.replace(/["']/g, '').replace(/\s+/g, '').toLowerCase();
  const bundled = new Set(require('./font-assets.cjs').fontAssets().manifest.faces.map(face => face.family));
  const ids = await evaluate(`DesignSystemThemeRegistry.themes.map(theme => theme.id)`);
  const report = [];
  for (const id of ids) {
    const selected = await evaluate(`(async () => {
      DesignSystemStudioShell.activatePanel('builder');
      const select = document.getElementById('themeSelect');
      select.value = ${JSON.stringify(id)}; select.dispatchEvent(new Event('change', { bubbles: true }));
      const d = document.getElementById('builderPreviewFrame').contentDocument;
      void d.body.offsetWidth;
      await d.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const selectors = ['h2', 'p', '.ds-btn-primary', '.ds-tab', '.ds-input', '.ds-chip', '.ds-code'];
      return { expected: getComputedStyle(d.body).getPropertyValue('--ds-font-sans').trim(), code: getComputedStyle(d.body).getPropertyValue('--ds-font-mono').trim(), note: document.getElementById('builderPreviewFonts').textContent, samples: selectors.map(selector => ({ selector, css: d.defaultView.getComputedStyle(d.querySelector(selector)).fontFamily })) };
    })()`);
    for (const sample of selected.samples) sample.rendered = await fonts(`document.getElementById('builderPreviewFrame').contentDocument.querySelector(${JSON.stringify(sample.selector)})`);
    await evaluate(`(async () => { DesignSystemStudioShell.activatePanel('components'); void document.body.offsetWidth; await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(resolve)); })()`);
    const gallery = await evaluate(`getComputedStyle(document.querySelector('.component-library-flow .ds-btn')).fontFamily`);
    const galleryFonts = await fonts(`document.querySelector('.component-library-flow .ds-btn')`);
    for (const sample of [...selected.samples, { selector: 'gallery button', css: gallery, rendered: galleryFonts }]) {
      const expected = sample.selector === '.ds-code' ? selected.code : selected.expected;
      assert.equal(canonical(sample.css), canonical(expected), id + ': ' + sample.selector + ' inherits its active font stack');
      const preferred = expected.split(',')[0].trim().replace(/["']/g, '');
      assert.ok(sample.rendered.length > 0, id + ': text has rendered glyphs');
      if (bundled.has(preferred)) assert.ok(sample.rendered.every(face => face.isCustomFont && face.familyName.startsWith(preferred)), JSON.stringify({ id, sample, preferred }));
    }
    assert.ok(selected.note.includes(selected.expected.split(',')[0].trim().replace(/["']/g, '')), id + ': preview discloses active preferred face');
    report.push({ id, ...selected, gallery: { css: gallery, rendered: galleryFonts } });
  }
  const edited = await evaluate(`(async () => {
    DesignSystemStudioShell.activatePanel('builder');
    const d = document.getElementById('builderPreviewFrame').contentDocument;
    const state = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root: d.documentElement }).themeSession;
    state.edit('--ds-font-sans', '"Space Mono", monospace');
    state.edit('--ds-font-mono', '"Share Tech Mono", monospace');
    void d.body.offsetWidth; await d.fonts.ready;
    const note = document.getElementById('builderPreviewFonts');
    return { body: d.defaultView.getComputedStyle(d.querySelector('p')).fontFamily, code: d.defaultView.getComputedStyle(d.querySelector('.ds-code')).fontFamily, edited: note.dataset.fontOverrides, note: note.textContent, shell: getComputedStyle(document.body).fontFamily };
  })()`);
  assert.equal(canonical(edited.body), canonical('"Space Mono", monospace'));
  assert.equal(canonical(edited.code), canonical('"Share Tech Mono", monospace'));
  assert.equal(edited.edited, 'true');
  assert.ok(edited.note.includes('Font edits applied'));
  assert.ok(edited.shell.includes('Inter'), 'editor keeps its fixed shell typography');
  const editedBody = await fonts(`document.getElementById('builderPreviewFrame').contentDocument.querySelector('p')`);
  assert.ok(editedBody.every(face => face.isCustomFont && face.familyName === 'Space Mono'));
  await evaluate(`(() => { const d = document.getElementById('builderPreviewFrame').contentDocument; const s = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root: d.documentElement }).themeSession; s.undo(); s.undo(); })()`);
  assert.equal(await evaluate(`document.getElementById('builderPreviewFonts').dataset.fontOverrides`), 'false', 'Undo clears font edit indicator');
  // Force a real local font failure in a fresh document, rather than relying on CSS strings.
  await send('Network.setCacheDisabled', { cacheDisabled: true }, session);
  await send('Network.setBlockedURLs', { urls: ['https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*', '*fonts/sora/*'] }, session);
  await send('Page.reload', {}, session);
  for (let i = 0; i < 100; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.DesignSystemStudioBuilderBootstrap')) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const failure = await evaluate(`(async () => {
    DesignSystemStudioShell.activatePanel('builder');
    const select = document.getElementById('themeSelect');
    select.value = 'holo-nocturne'; select.dispatchEvent(new Event('change', { bubbles: true }));
    const d = document.getElementById('builderPreviewFrame').contentDocument;
    void d.body.offsetWidth; await d.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return { note: document.getElementById('builderPreviewFonts').textContent, failures: Array.from(d.fonts).filter(face => face.family.includes('Sora')).map(face => face.status) };
  })()`);
  assert.ok(failure.note.includes('Sora (load issue)'), JSON.stringify(failure));
  await send('DOM.getDocument', { depth: -1, pierce: true }, session);
  const fallback = await fonts(`document.getElementById('builderPreviewFrame').contentDocument.querySelector('p')`);
  assert.ok(fallback.length && fallback.every(face => !face.familyName.startsWith('Sora')), 'failed Sora request actually falls back');
  const directory = path.resolve(process.env.DS_EVIDENCE_DIR || path.join(root, '../_docs/data/builder-fonts-2026-11-10'));
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'rendered-fonts.json'), JSON.stringify({ themes: report, edits: edited, failure: { ...failure, rendered: fallback } }, null, 2) + '\n');
  console.log('Passed: actual rendered fonts and inherited body/code stacks across 21 live builder previews and gallery buttons; manual font edits, Undo, shell isolation and real blocked-font fallback disclosure. Evidence: ' + directory);
}
module.exports = { testBuilderFonts };
