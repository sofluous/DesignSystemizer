const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
function createFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-portable-browser-'));
  fs.cpSync(path.join(__dirname, '../_package'), path.join(directory, 'nested/app'), { recursive: true });
  const server = http.createServer((req, res) => {
    let file;
    try { file = path.resolve(directory, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
    catch (_) { res.writeHead(400); res.end(); return; }
    if (!file.startsWith(directory + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; require-trusted-types-for 'script'; trusted-types 'none'");
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' })[path.extname(file)] || 'text/plain');
    res.end(fs.readFileSync(file));
  });
  return { server, dispose() {
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(directory).startsWith('ds-portable-browser-'));
    fs.rmSync(directory, { recursive: true, force: true });
  } };
}
async function testPortable({ evaluate, send, session, url }) {
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Fixture storage denial', 'SecurityError'); } });` }, session);
  await send('Page.navigate', { url: url + '/nested/app/example.html' }, session);
  for (let i = 0; i < 100; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.DesignSystemIcons')) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  const result = await evaluate(`(async () => {
    let enforced = false;
    try { document.createElement('div').innerHTML = '<span>blocked</span>'; } catch (error) { enforced = error instanceof TypeError; }
    const select = document.querySelector('[data-ds-theme-select]');
    const themes = DesignSystemThemeRegistry.themes;
    const paints = [];
    for (const theme of themes) {
      select.value = theme.id; select.dispatchEvent(new Event('change', { bubbles: true }));
      if (document.documentElement.dataset.theme !== theme.id) throw Error('Theme switch failed: ' + theme.id);
      paints.push(getComputedStyle(document.body).backgroundColor);
    }
    DesignSystemThemeSelector.autoInitThemeSelectors();
    if (select.options.length !== themes.length) throw Error('Selector duplicated options');
    for (const alias of Object.keys(DesignSystemApprovedIcons.icons)) {
      const host = document.createElement('span'); host.dataset.dsIcon = alias; document.body.appendChild(host);
      DesignSystemIcons.render(host); DesignSystemIcons.render(host);
      if (host.children.length !== 1 || host.firstElementChild.namespaceURI !== 'http://www.w3.org/2000/svg') throw Error('Icon SVG missing');
      if (!host.querySelector('path,line,polyline,rect,circle,ellipse,polygon')) throw Error('Icon geometry missing');
      if (host.getAttribute('aria-hidden') !== 'true') throw Error('Icon is not decorative');
    }
    const missing = document.createElement('span'); missing.dataset.dsIcon = 'unknown'; DesignSystemIcons.render(missing);
    const manifest = await (await fetch('./design-system/fonts/manifest.json')).json();
    for (const face of manifest.faces) {
      const loaded = await document.fonts.load(face.weight.split(' ')[0] + ' 16px "' + face.family + '"');
      if (!loaded.some(font => font.status === 'loaded')) throw Error('Font missing: ' + face.family);
    }
    const resources = performance.getEntriesByType('resource').map(entry => entry.name);
    return { enforced, themes: themes.length, icons: Object.keys(DesignSystemApprovedIcons.icons).length,
      fonts: manifest.faces.length, missing: missing.dataset.dsIconState, paints: new Set(paints).size,
      external: resources.filter(name => new URL(name).origin !== location.origin),
      studioLoaded: resources.some(name => /studio-|theme-font-assets|theme-package-assets/.test(name)) };
  })()`);
  assert.equal(result.enforced, true, 'Trusted Types enforcement is active, with no default policy');
  assert.equal(result.themes, 21);
  assert.equal(result.icons, 4);
  assert.ok(result.fonts >= 8);
  assert.equal(result.missing, 'missing');
  assert.ok(result.paints > 1, 'real CSS changes across themes');
  assert.deepEqual(result.external, []);
  assert.equal(result.studioLoaded, false);
  console.log('PASS isolated nested consumer: strict Trusted Types, denied storage, 21 theme switches, all approved icons, local fonts and no Studio/external resources');
}
module.exports = { createFixture, testPortable };
