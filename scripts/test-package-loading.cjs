const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
async function main() {
  let pendingScript, timeout, loads = 0;
  const win = { setTimeout: fn => { timeout = fn; return 1; }, clearTimeout() {} };
  const doc = { currentScript: { src: 'http://localhost/nested/js/studio-packaging.js' },
    createElement: () => ({ remove() {} }), head: { appendChild: script => { pendingScript = script; loads++; } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/studio-packaging.js'), 'utf8'), { window: win, document: doc, URL });
  const api = win.DesignSystemStudioPackaging;
  let request = api.ensureFontAssets();
  assert.equal(request, api.ensureFontAssets(), 'concurrent downloads share one load');
  assert.equal(pendingScript.src, 'http://localhost/nested/js/theme-font-assets.js');
  pendingScript.onerror();
  await assert.rejects(request, /Could not load/);
  request = api.ensureFontAssets();
  pendingScript.onload();
  await assert.rejects(request, /incomplete/);
  request = api.ensureFontAssets();
  timeout();
  await assert.rejects(request, /timed out/);
  request = api.ensureFontAssets();
  win.DesignSystemThemeFontAssets = [];
  pendingScript.onload();
  await request;
  await api.ensureFontAssets();
  assert.equal(loads, 4, 'failure retries and successful load is cached');
  console.log('PASS on-demand font export loading, nested paths, concurrent requests, failure/timeout retries and cache');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
