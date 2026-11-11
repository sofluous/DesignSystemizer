const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { fontAssets } = require('./font-assets.cjs');
const root = path.resolve(__dirname, '..');
async function test() {
  const assets = fontAssets();
  const { context, data } = require('./build-themes.cjs').loadModel();
  for (const preset of Object.values(data.typographyPresets)) {
    const preferred = preset['--ds-font-sans'].split(',')[0].trim().replace(/^"|"$/g, '');
    assert.ok(assets.manifest.faces.some(face => face.family === preferred) || assets.manifest.systemFamilies.includes(preferred), preferred);
  }
  context.TextEncoder = TextEncoder; context.Blob = Blob; context.window.atob = atob;
  context.window.DesignSystemThemePackageAssets = { fontManifest: assets.manifest, css: '', fonts: assets.css, fontFiles: assets.files, registry: { themes: [] } };
  vm.runInContext(fs.readFileSync(path.join(root, 'js/studio-packaging.js'), 'utf8'), context);
  const pack = context.window.DesignSystemStudioPackaging;
  const files = pack.buildThemePackageFiles({ themeName: 'test', themeBlock: '', recipe: {} });
  const bytes = Buffer.from(await pack.makeZip(files).arrayBuffer());
  const entries = new Map();
  let offset = 0;
  while (bytes.readUInt32LE(offset) === 0x04034b50) {
    const size = bytes.readUInt32LE(offset + 18), length = bytes.readUInt16LE(offset + 26), extra = bytes.readUInt16LE(offset + 28);
    const name = bytes.toString('utf8', offset + 30, offset + 30 + length);
    const start = offset + 30 + length + extra;
    entries.set(name, bytes.subarray(start, start + size)); offset = start + size;
  }
  for (const face of assets.manifest.faces) {
    assert.deepEqual(entries.get('design-system/' + face.file), fs.readFileSync(path.join(root, face.file)), 'ZIP preserves font binary');
    assert.deepEqual(fs.readFileSync(path.join(root, '_package/design-system', face.file)), fs.readFileSync(path.join(root, face.file)), 'built package preserves font binary');
    assert.ok(entries.has('design-system/' + face.licenseFile), 'ZIP retains license');
  }
  assert.ok(!assets.css.includes('https:'), 'no remote font dependency');
  console.log('Passed: Type delivery coverage, font/license integrity, binary ZIP and built-package equality.');
}
test().catch(error => { console.error(error); process.exitCode = 1; });
