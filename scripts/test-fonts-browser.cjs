const assert = require('node:assert/strict');
async function testFonts({ evaluate, send, session, url }) {
  const check = `(async () => {
    const manifest = await (await fetch(location.pathname.includes('/_package/') ? './design-system/fonts/manifest.json' : '/fonts/manifest.json')).json();
    const results = [];
    for (const face of manifest.faces) {
      const weight = face.weight.split(' ')[0];
      const loaded = await document.fonts.load(weight + ' 16px "' + face.family + '"', 'Readable Aa 0123');
      results.push({ family: face.family, loaded: loaded.some(f => f.family.replaceAll('"', '') === face.family && f.status === 'loaded') });
    }
    return results;
  })()`;
  const studio = await evaluate(check);
  assert.equal(studio.length, require('./font-assets.cjs').fontAssets().manifest.faces.length);
  assert.ok(studio.every(face => face.loaded), JSON.stringify(studio));
  const preview = await evaluate(`(async () => {
    DesignSystemStudioShell.activatePanel('builder');
    const d = document.getElementById('builderPreviewFrame').contentDocument;
    await new Promise(resolve => setTimeout(resolve, 150));
    const loaded = await d.fonts.load('400 16px "Outfit"');
    return loaded.some(f => f.status === 'loaded' && f.family.includes('Outfit'));
  })()`);
  assert.equal(preview, true, 'isolated preview loads its local fonts');
  await send('Page.navigate', { url: url + '/_package/example.html' }, session);
  for (let i = 0; i < 100; i++) {
    if (await evaluate('document.readyState === "complete" && !!document.querySelector("main")')) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  const exported = await evaluate(check);
  assert.ok(exported.every(face => face.loaded), 'fresh exported consumer loads all bundled faces');
  console.log('Passed: all local font faces load in Studio and exported consumer; isolated preview loads Outfit with external font services blocked.');
}
module.exports = { testFonts };
