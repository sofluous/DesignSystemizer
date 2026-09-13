const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const browser = process.env.DS_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

async function main() {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
    res.setHeader('Content-Type', mime[path.extname(file)] || 'text/plain');
    res.end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = 'http://127.0.0.1:' + server.address().port;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-browser-test-'));
  const child = spawn(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-pipe', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'] });
  let nextId = 0, buffer = '';
  const pending = new Map(), errors = [];
  child.stdio[4].on('data', (data) => {
    buffer += data.toString();
    let end;
    while ((end = buffer.indexOf('\0')) >= 0) {
      const message = JSON.parse(buffer.slice(0,end)); buffer = buffer.slice(end+1);
      if (message.id && pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
      if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text + ': ' + JSON.stringify(message.params.exceptionDetails.exception));
    }
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error('Browser timeout: ' + method)); }, 20000);
      pending.set(id, (message) => { clearTimeout(timeout); message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result); });
      child.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
    });
  }
  let session;
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, session);
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  try {
    const target = await send('Target.createTarget', { url: 'about:blank' });
    session = (await send('Target.attachToTarget', { targetId: target.targetId, flatten: true })).sessionId;
    await send('Runtime.enable', {}, session);
    await send('Network.enable', {}, session);
    await send('Network.setBlockedURLs', { urls: ['https://fonts.googleapis.com/*', 'https://fonts.gstatic.com/*'] }, session);
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }, session);
    await send('Page.navigate', { url: url + '/index.html' }, session);
    for (let i=0;i<100;i++) {
      if (await evaluate('!!window.DesignSystemStudioPageBootstrap && document.readyState === "complete"')) break;
      await new Promise((resolve) => setTimeout(resolve,100));
    }
    assert.deepEqual(errors, [], 'No runtime exceptions on boot');
    const result = await evaluate(`(async () => {
      const root = document.documentElement;
      const session = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root }).themeSession;
      const select = document.getElementById('themeSelect');
      const choose = (id) => { select.value = id; select.dispatchEvent(new Event('change', { bubbles: true })); };
      const mismatches = [], invalid = [];
      const canonical = (value) => value.replaceAll(String.fromCharCode(13), '').trim();
      const componentCss = await (await fetch('/css/components.css')).text();
      const directTokens = [...componentCss.matchAll(/([a-z-]+): var\\((--ds-[a-z0-9-]+)\\);/g)].map((m) => [m[2],m[1]]);
      const fixture = document.createElement('iframe');
      fixture.src = '/_package/example.html'; document.body.appendChild(fixture);
      await new Promise((resolve) => fixture.addEventListener('load',resolve,{once:true}));
      const target = fixture.contentDocument;
      const chips = target.createElement('div');
      chips.innerHTML = '<span class="ds-chip ds-chip-accent">Accent</span><span class="ds-chip ds-chip-alt">Alternate</span><button class="ds-tab">Inactive tab</button>';
      target.body.appendChild(chips);
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently:true });
      const rgb = (css) => { ctx.clearRect(0,0,1,1); ctx.fillStyle = css; ctx.fillRect(0,0,1,1); return [...ctx.getImageData(0,0,1,1).data].map((v)=>v/255); };
      for (const theme of DesignSystemThemeRegistry.themes) {
        choose(theme.id);
        target.documentElement.setAttribute('data-theme', theme.id);
        const preview = getComputedStyle(root), exported = getComputedStyle(target.documentElement);
        for (const token of Object.keys(session.tokens)) {
          if (canonical(preview.getPropertyValue(token)) !== canonical(exported.getPropertyValue(token))) mismatches.push(theme.id + ':' + token);
        }
        for (const [token,property] of directTokens) if (session.tokens[token] && !CSS.supports(property,preview.getPropertyValue(token))) invalid.push(theme.id + ':' + property + ':' + token);
        for (const [selector,token] of [['.ds-btn-primary','--ds-btn-primary-bg'],['.ds-input','--ds-input-bg']]) {
          const element = target.querySelector(selector);
          if (exported.getPropertyValue(token).includes('gradient(') && !getComputedStyle(element).backgroundImage.includes('gradient(')) invalid.push(theme.id + ':missing rendered gradient:' + token);
        }
        for (const chip of target.querySelectorAll('.ds-chip-accent, .ds-chip-alt')) {
          const css = getComputedStyle(chip);
          if (DesignSystemThemeContrast.ratio(rgb(css.color),rgb(css.backgroundColor)) < 4.5) invalid.push(theme.id + ':rendered chip contrast');
        }
        for (const pair of DesignSystemThemeContrast.audit(session.tokens)) {
          for (const [token,property] of [[pair.fg,'color'],[pair.bg,'background']]) {
            if (!CSS.supports(property, preview.getPropertyValue(token))) invalid.push(theme.id + ':' + token);
          }
        }
      }
      choose('steel-night');
      const exact = '0 2px 4px rgba(0,0,0,0.25), inset 0 0 0 1px #ffffff80';
      const shadowInput = document.querySelector('[aria-label="card shadow exact CSS value"]');
      shadowInput.value = exact; shadowInput.dispatchEvent(new Event('change'));
      const typography = document.getElementById('typographyPresetSelect');
      typography.value = 'poster-grotesk'; typography.dispatchEvent(new Event('change'));
      const preserved = session.tokens['--ds-card-shadow'] === exact;
      choose('paper-mint'); choose('steel-night');
      const draftRestored = session.tokens['--ds-card-shadow'] === exact && session.recipe.typography === 'poster-grotesk';
      document.getElementById('autoApplyPresetToggle').checked = false;
      typography.value = 'neutral-ui'; typography.dispatchEvent(new Event('change'));
      document.getElementById('themeNameInput').value = 'browser-custom';
      document.getElementById('exportThemeBtn').click();
      const block = document.getElementById('themeExportOutput').value;
      let files;
      const zip = DesignSystemStudioPackaging.makeZip;
      DesignSystemStudioPackaging.makeZip = (items) => { files = items; return zip(items); };
      DesignSystemStudioPackaging.downloadBlob = () => {};
      document.getElementById('downloadPackageBtn').click();
      const metadata = JSON.parse(files.find((f) => f.name === 'theme.recipe.json').content);
      const appliedMetadata = metadata.layers.typography === 'poster-grotesk' && metadata.tokens['--ds-card-shadow'] === exact;
      const style = target.createElement('style'); style.textContent = files.find((f) => f.name === 'design-system/theme.css').content; target.head.appendChild(style);
      target.documentElement.setAttribute('data-theme', 'browser-custom');
      for (const token of Object.keys(session.tokens)) if (canonical(getComputedStyle(root).getPropertyValue(token)) !== canonical(getComputedStyle(target.documentElement).getPropertyValue(token))) mismatches.push({ token, preview:getComputedStyle(root).getPropertyValue(token), exported:getComputedStyle(target.documentElement).getPropertyValue(token) });
      const pendingPreserved = session.recipe.typography === 'poster-grotesk';
      const exportedRaw = block.includes(exact);
      const selectedTab = document.querySelector('.studio-tab[aria-selected="true"]');
      const tab = getComputedStyle(selectedTab);
      const tabHasBackground = tab.backgroundColor !== 'rgba(0, 0, 0, 0)' || tab.backgroundImage !== 'none';
      const inputPaint = getComputedStyle(target.querySelector('.ds-input')).backgroundImage;
      const gradientRendered = inputPaint.includes('linear-gradient');
      fixture.remove();
      DesignSystemStudioShell.activatePanel('builder');
      return { mismatches, invalid, preserved, draftRestored, pendingPreserved, exportedRaw, tabHasBackground, appliedMetadata, gradientRendered, files:files.map((f)=>f.name) };
    })()`);
    assert.deepEqual(result.mismatches, [], 'Preview matches fresh package for every token');
    assert.deepEqual(result.invalid, [], 'Core control paints are valid CSS');
    for (const key of ['preserved','draftRestored','pendingPreserved','exportedRaw','tabHasBackground','appliedMetadata','gradientRendered']) assert.equal(result[key],true,key);
    assert.deepEqual(errors, [], 'No runtime exceptions');
    await evaluate(`(async () => {
      document.body.innerHTML = '';
      document.body.style.cssText = 'display:flex;gap:12px;padding:12px;margin:0;background:#17191d;overflow:hidden';
      for (const id of ['type-four-sprint','holo-nocturne','oilslick-nacre']) {
        const frame = document.createElement('iframe');
        frame.style.cssText='width:32%;height:940px;border:1px solid #555;border-radius:12px';
        frame.src='/_package/example.html'; document.body.appendChild(frame);
        await new Promise((resolve)=>frame.addEventListener('load',resolve,{once:true}));
        const d=frame.contentDocument;
        d.documentElement.setAttribute('data-theme',id);
        d.body.style.cssText='padding:20px';
        d.body.innerHTML='<h2>'+id+'</h2><article class="ds-card ds-stack"><h2>Material & controls</h2><p>Readable text over a distinct surface.</p><div class="ds-tablist"><button class="ds-tab" aria-selected="true">Selected</button><button class="ds-tab">Inactive</button></div><div><span class="ds-chip ds-chip-accent">Accent chip</span> <span class="ds-chip ds-chip-alt">Alternate</span></div><button class="ds-btn ds-btn-primary">Primary action</button><button class="ds-btn">Material button</button><label>Input<input class="ds-input" value="Example text"></label><p style="color:var(--ds-success)">Valid: saved successfully</p><p style="color:var(--ds-danger)">Invalid: check this value</p><article class="ds-card-secondary ds-stack"><h3>Inset surface</h3><div class="ds-tablist"><button class="ds-tab" aria-selected="true">Selected</button><button class="ds-tab">Inactive</button></div><span class="ds-chip ds-chip-accent">Accent chip</span></article></article>';
      }
    })()`);
    const screenshot = await send('Page.captureScreenshot', { format: 'png' }, session);
    fs.writeFileSync(path.join(root,'_docs/data/theme-palette-verification.png'), Buffer.from(screenshot.data,'base64'));
    console.log(JSON.stringify(result,null,2));
    console.log('Browser passed: 21 defaults and custom export match fresh package; edit preservation, drafts, pending selection, selected-tab paint.');
  } finally {
    child.kill();
    server.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
