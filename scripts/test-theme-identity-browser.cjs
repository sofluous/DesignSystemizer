const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function testIdentity({ evaluate, send, session, root }) {
  const rendered = await evaluate(`(async () => {
    const data = DesignSystemStudioBuilderThemeData.initBuilderThemeData();
    const presets = DesignSystemStudioBuilderPresets.initBuilderPresets(data);
    const composer = DesignSystemThemeComposer.createComposer(data, DesignSystemThemeFoundations, presets.buildColorBundle);
    const themes = ['candy-spectrum', 'eva-wireframe', 'holo-nocturne', 'oilslick-nacre', 'saturn-alloy', 'type-four-sprint'];
    const host = document.createElement('div');
    host.id = 'identity-evidence';
    host.style.cssText = 'position:absolute;inset:0;z-index:10000;background:#16191e;padding:20px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:20px;align-content:start;';
    for (const child of document.body.children) child.hidden = true;
    document.body.appendChild(host);
    const faces = [];
    for (const id of themes) {
      const tokens = composer.compose(data.baseThemePresetMap[id]).tokens;
      const card = document.createElement('section');
      card.dataset.identity = id;
      for (const [key, value] of Object.entries(tokens)) card.style.setProperty(key, value);
      card.style.cssText += ';padding:20px;background:var(--ds-bg);color:var(--ds-text);font-family:var(--ds-font-sans);font-size:var(--ds-fs-2);line-height:var(--ds-lh-base);min-width:0;';
      card.innerHTML = '<h2 style="font:inherit;font-size:var(--ds-fs-4);margin:0 0 12px">' + id + '</h2><div class="ds-card ds-stack"><p>Inspect layers, adjust properties and save your theme.</p><label>Layer name<input class="ds-input" value="Reference overlay" style="width:100%;box-sizing:border-box"></label><div style="display:flex;flex-wrap:wrap;gap:8px"><button class="ds-btn ds-btn-primary">Save changes</button><button class="ds-btn">Cancel</button></div><div role="tablist"><button class="ds-tab" role="tab" aria-selected="true">Properties</button><button class="ds-tab" role="tab" aria-selected="false">Details</button></div><code style="font-family:var(--ds-font-mono)">Aa I1l 0O 012345</code></div>';
      host.appendChild(card);
      const family = tokens['--ds-font-sans'].split(',')[0].trim().replaceAll('"', '');
      const loaded = await document.fonts.load('400 16px "' + family + '"', 'Reference overlay');
      faces.push({ id, family, loaded: loaded.some(face => face.status === 'loaded' && face.family.replaceAll('"', '') === family) });
    }
    await document.fonts.ready;
    return faces;
  })()`);
  assert.equal(new Set(rendered.map(item => item.family)).size, 6, 'six distinct preferred faces');
  assert.ok(rendered.every(item => item.loaded), JSON.stringify(rendered));
  const directory = path.resolve(process.env.DS_EVIDENCE_DIR || path.join(root, '../_docs/data/theme-identity-2026-11-10'));
  fs.mkdirSync(directory, { recursive: true });
  const geometry = [];
  for (const width of [1440, 900, 390]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1200, deviceScaleFactor: 1, mobile: false }, session);
    await evaluate('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
    const overflow = await evaluate(`Array.from(document.querySelectorAll('[data-identity]')).map(card => ({ id: card.dataset.identity, overflow: card.scrollWidth - card.clientWidth, controls: Array.from(card.querySelectorAll('button,input')).filter(control => control.getBoundingClientRect().right > card.getBoundingClientRect().right + 1).length }))`);
    assert.ok(overflow.every(item => item.overflow <= 1 && item.controls === 0), JSON.stringify({ width, overflow }));
    geometry.push({ width, cards: overflow });
    const metrics = await send('Page.getLayoutMetrics', {}, session);
    const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.ceil(metrics.cssContentSize.height), scale: 1 } }, session);
    fs.writeFileSync(path.join(directory, 'identity-' + width + '.png'), Buffer.from(capture.data, 'base64'));
  }
  fs.writeFileSync(path.join(directory, 'results.json'), JSON.stringify({ faces: rendered, geometry }, null, 2) + '\n');
  console.log('Passed: six distinct supplied faces render controls without card overflow at 1440/900/390px. Evidence: ' + directory);
}
module.exports = { testIdentity };
