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
      DesignSystemStudioShell.activatePanel("builder");
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const root = document.getElementById('builderPreviewFrame').contentDocument.documentElement;
      const studioRoot = document.documentElement;
      const shellTokens = () => Object.keys(DesignSystemThemeFoundations).map((token) => getComputedStyle(studioRoot).getPropertyValue(token)).join('|');
      const stableShell = shellTokens();
      const session = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root }).themeSession;
      const select = document.getElementById('themeSelect');
      const choose = (id) => { select.value = id; select.dispatchEvent(new Event('change', { bubbles: true })); };
      const check = (condition, message) => { if (!condition) throw new Error(message); };
      const visibleFields = () => [...document.querySelectorAll('#builderGroups .builder-field')].filter((field) => !field.hidden && !field.closest('.builder-group').hidden);
      check(visibleFields().length === 16, 'Quick edit starts with 16 fields');
      check(getComputedStyle(document.getElementById('applyPresetBtn')).display === 'none', 'Auto apply hides the redundant Apply button');
      for (const field of document.querySelectorAll('#builderGroups .builder-field[hidden]')) {
        check(getComputedStyle(field).display === 'none', 'Filtered fields must be visually hidden: ' + field.dataset.token);
      }
      const search = document.getElementById('builderTokenSearch');
      const category = document.querySelector('#builderGroupTabs select');
      category.value = 'Typography'; category.dispatchEvent(new Event('change'));
      search.value = '--ds-chip-accent-text'; search.dispatchEvent(new Event('input'));
      check(visibleFields().length === 1 && visibleFields()[0].dataset.token === search.value, 'Search crosses category filters');
      check(!document.getElementById('builderClearSearch').hidden, 'Search has a clear action');
      document.getElementById('builderClearSearch').click();
      check(search.value === '' && document.activeElement === search && !category.disabled, 'Clear search restores category and focuses search');
      search.value = 'not-a-real-token'; search.dispatchEvent(new Event('input'));
      check(document.getElementById('builderResultCount').textContent === '0 shown' && !document.getElementById('builderEmptyState').hidden, 'Compact count retains a separate empty state');
      document.getElementById('builderClearSearch').click();
      document.getElementById('builderQuickBtn').click();
      const rawEdit = (token, value) => {
        const field = document.querySelector('.builder-field[data-token="' + token + '"]');
        const input = field.querySelector('input[aria-label$="exact CSS value"]');
        input.value = value; input.dispatchEvent(new Event('change'));
        check(input.validationMessage === '', token + ': ' + input.validationMessage);
        return field;
      };
      rawEdit('--ds-dur-fast', '0.25s');
      check(session.tokens['--ds-dur-fast'] === '0.25s', 'Duration accepts seconds: ' + session.tokens['--ds-dur-fast'] + ' overrides=' + JSON.stringify(session.overrides));
      rawEdit('--ds-label-spacing', '-0.02em');
      check(session.tokens['--ds-label-spacing'] === '-0.02em', 'Tracking accepts negative lengths');
      const sizeField = rawEdit('--ds-fs-3', '1.25rem');
      const sizeInput = sizeField.querySelector('input[type="number"]');
      sizeInput.value = '1.5'; sizeInput.dispatchEvent(new Event('input'));
      check(session.tokens['--ds-fs-3'] === '1.5rem', 'Structured edit retains rem units');
      const changed = document.getElementById('builderChangedOnly');
      changed.checked = true; changed.dispatchEvent(new Event('change'));
      check(visibleFields().length === 3, 'Changed only includes non-quick tokens');
      changed.checked = false; changed.dispatchEvent(new Event('change'));
      session.reset();
      session.edit('--ds-accent', 'var(--ds-text)');
      const scheme = document.getElementById('schemePresetSelect');
      const originalScheme = session.recipe.scheme;
      scheme.value = 'eva-wire-alert'; scheme.dispatchEvent(new Event('change'));
      check(session.recipe.scheme === originalScheme && scheme.value === originalScheme, 'Invalid recipe restores selectors');
      check(document.getElementById('themeRecipeError').textContent.includes('preserved'), 'Invalid recipe has actionable feedback');
      session.reset();
      const mismatches = [], invalid = [];
      const canonical = (value) => value.replaceAll(String.fromCharCode(13), '').trim();
      const componentCss = await (await fetch('/css/components.css')).text();
      const directTokens = [...componentCss.matchAll(/([a-z-]+): var\\((--ds-[a-z0-9-]+)\\);/g)].map((m) => [m[2],m[1]]);
      const fixture = document.createElement('iframe');
      fixture.src = '/_package/example.html'; document.body.appendChild(fixture);
      await new Promise((resolve) => fixture.addEventListener('load',resolve,{once:true}));
      const target = fixture.contentDocument;
      // Compare resting paints, not different points along two transition timelines.
      const steadyStyles = [target, root.ownerDocument].map((owner) => {
        const style = owner.createElement('style');
        style.textContent = '*, *::before, *::after { transition: none !important; animation: none !important; }';
        owner.head.appendChild(style);
        return style;
      });
      const chips = target.createElement('div');
      chips.innerHTML = '<span class="ds-chip ds-chip-accent">Accent</span><span class="ds-chip ds-chip-alt">Alternate</span><button class="ds-tab">Inactive tab</button>';
      target.body.appendChild(chips);
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
      const ctx = canvas.getContext('2d', { willReadFrequently:true });
      const rgb = (css) => { ctx.clearRect(0,0,1,1); ctx.fillStyle = css; ctx.fillRect(0,0,1,1); return [...ctx.getImageData(0,0,1,1).data].map((v)=>v/255); };
      for (const theme of DesignSystemThemeRegistry.themes) {
        choose(theme.id);
        check(studioRoot.dataset.theme === 'steel-night' && shellTokens() === stableShell, theme.id + ': stable editor shell');
        check(root.dataset.theme === theme.id, 'Selector targets preview document');
        check(getComputedStyle(document.querySelector('.component-library-flow')).getPropertyValue('--ds-accent').trim() === getComputedStyle(root).getPropertyValue('--ds-accent').trim(), 'Component gallery follows preview');
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
        const previewButton = root.ownerDocument.querySelector('.ds-btn-primary');
        const packageButton = target.querySelector('.ds-btn-primary');
        for (const property of ['color', 'backgroundImage', 'backgroundColor', 'fontFamily', 'borderTopColor']) {
          if (getComputedStyle(previewButton)[property] !== getComputedStyle(packageButton)[property]) invalid.push(theme.id + ':rendered preview/package:' + property);
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
      steadyStyles.forEach((style) => style.remove());
      fixture.remove();
      DesignSystemStudioShell.activatePanel('builder');
      const tabs = root.ownerDocument.querySelectorAll('[role="tab"]');
      tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      check(tabs[1].getAttribute('aria-selected') === 'true' && tabs[1].tabIndex === 0 && !root.ownerDocument.getElementById('previewPanelDetails').hidden, 'Preview tabs support arrow navigation');
      document.getElementById('focusPreviewBtn').click();
      check(document.activeElement.id === 'builderPreviewFrame', 'Focus enters preview');
      root.ownerDocument.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      check(document.activeElement.id === 'focusPreviewBtn', 'Escape returns to editor');
      const sampleInput = root.ownerDocument.getElementById('builderPreviewSearch');
      sampleInput.value = 'Keep sample input';
      const sampleSection = root.ownerDocument.querySelector('details');
      sampleSection.open = false;
      session.edit('--ds-radius-2', '19px');
      check(sampleInput.value === 'Keep sample input' && !sampleSection.open, 'Editing preserves preview state');
      session.undo();
      document.getElementById('inspectorToggleBtn').click();
      const inspected = root.ownerDocument.querySelector('.ds-btn-primary');
      inspected.dispatchEvent(new root.ownerDocument.defaultView.MouseEvent('mousemove', { bubbles: true, clientX: 10, clientY: 10 }));
      check(document.getElementById('inspectorElement').textContent.includes('ds-btn-primary'), 'Inspector reaches isolated preview');
      check(document.getElementById('inspectorText').textContent === getComputedStyle(inspected).color, 'Inspector uses preview computed styles');
      document.getElementById('inspectorToggleBtn').click();
      return { mismatches, invalid, preserved, draftRestored, pendingPreserved, exportedRaw, tabHasBackground, appliedMetadata, gradientRendered, files:files.map((f)=>f.name) };
    })()`);
    assert.deepEqual(result.mismatches, [], 'Preview matches fresh package for every token');
    assert.deepEqual(result.invalid, [], 'Core control paints are valid CSS');
    for (const key of ['preserved','draftRestored','pendingPreserved','exportedRaw','tabHasBackground','appliedMetadata','gradientRendered']) assert.equal(result[key],true,key);
    assert.deepEqual(errors, [], 'No runtime exceptions');
    const expectedDrafts = await evaluate(`(async () => {
      const session = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root: document.documentElement }).themeSession;
      const check = (condition, message) => { if (!condition) throw new Error(message); };
      let downloaded;
      DesignSystemStudioPackaging.downloadBlob = (name, blob) => { downloaded = { name, blob }; };
      document.getElementById('downloadRecipeBtn').click();
      const portable = JSON.parse(await downloaded.blob.text());
      check(portable.generator.presetRevision.length === 16, 'Recipe includes build provenance');
      const fileInput = document.getElementById('importRecipeInput');
      const importText = async (text) => {
        const transfer = new DataTransfer();
        transfer.items.add(new File([text], 'theme.recipe.json', { type: 'application/json' }));
        fileInput.files = transfer.files;
        fileInput.dispatchEvent(new Event('change'));
        for (let i=0; i<100 && fileInput.disabled; i++) await new Promise((resolve) => setTimeout(resolve, 10));
        check(!fileInput.disabled, 'Import completed');
      };
      const before = JSON.stringify(session.snapshot());
      await importText('{broken');
      check(JSON.stringify(session.snapshot()) === before && document.getElementById('themeImportStatus').textContent.includes('not applied'), 'Malformed import preserves draft');
      const invalidCss = { ...portable, overrides: { ...portable.overrides, '--ds-text': 'definitely-not-a-color' } };
      delete invalidCss.tokens;
      await importText(JSON.stringify(invalidCss));
      check(JSON.stringify(session.snapshot()) === before && document.getElementById('themeImportStatus').textContent.includes('Invalid color'), 'Import uses editor CSS validation');
      const compatible = { ...portable, themeName: 'reopened-material', tokens: { ...portable.tokens, '--ds-radius-2': '17px' } };
      await importText(JSON.stringify(compatible));
      check(session.tokens['--ds-radius-2'] === '17px', 'Older appearance restored through compatibility override');
      check(document.getElementById('themeNameInput').value === 'reopened-material', 'Imported name restored');
      check(document.getElementById('themeImportStatus').textContent.includes('compatibility'), 'Migration is explained');
      document.getElementById('undoThemeEditBtn').click();
      check(JSON.stringify(session.snapshot()) === before, 'Import is undoable');
      await importText(JSON.stringify(compatible));
      const steel = JSON.stringify(session.tokens);
      const select = document.getElementById('themeSelect');
      select.value = 'paper-mint'; select.dispatchEvent(new Event('change'));
      session.edit('--ds-card-shadow', '0 0 3px #112233');
      document.getElementById('themeNameInput').value = 'paper-draft';
      document.getElementById('themeNameInput').dispatchEvent(new Event('input'));
      const paper = JSON.stringify(session.tokens);
      select.value = 'steel-night'; select.dispatchEvent(new Event('change'));
      await new Promise((resolve) => setTimeout(resolve, 350));
      check(document.getElementById('themeDraftStatus').textContent.includes('saved'), 'Automatic save reports success');
      return { steel, paper };
    })()`);
    await send('Page.navigate', { url: url + '/index.html?draft-test=1' }, session);
    for (let i=0; i<100; i++) {
      if (await evaluate('location.search === "?draft-test=1" && document.readyState === "complete" && !!window.DesignSystemStudioPageBootstrap')) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const restoredDrafts = await evaluate(`(async () => {
      const session = DesignSystemStudioBuilderBootstrap.initBuilderBootstrap({ root: document.documentElement }).themeSession;
      const steel = JSON.stringify(session.tokens);
      const steelName = document.getElementById('themeNameInput').value;
      const select = document.getElementById('themeSelect');
      select.value = 'paper-mint'; select.dispatchEvent(new Event('change'));
      const paper = JSON.stringify(session.tokens);
      const paperName = document.getElementById('themeNameInput').value;
      select.value = 'steel-night'; select.dispatchEvent(new Event('change'));
      await new Promise((resolve) => setTimeout(resolve, 350));
      const saved = localStorage.getItem('ds-studio-drafts');
      const originalSet = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) { if (key === 'ds-studio-drafts') throw new Error('Simulated quota limit'); return originalSet.call(this, key, value); };
      session.edit('--ds-radius-2', '18px');
      await new Promise((resolve) => setTimeout(resolve, 350));
      const failedSafely = document.getElementById('themeDraftStatus').textContent.includes('not saved') && localStorage.getItem('ds-studio-drafts') === saved;
      Storage.prototype.setItem = originalSet;
      session.undo();
      await new Promise((resolve) => setTimeout(resolve, 350));
      DesignSystemStudioShell.activatePanel('builder');
      return { steel, paper, steelName, paperName, failedSafely };
    })()`);
    assert.equal(restoredDrafts.steel, expectedDrafts.steel, 'Steel draft survives full reload');
    assert.equal(restoredDrafts.paper, expectedDrafts.paper, 'Independent paper draft survives full reload');
    assert.equal(restoredDrafts.steelName, 'reopened-material');
    assert.equal(restoredDrafts.paperName, 'paper-draft');
    assert.equal(restoredDrafts.failedSafely, true, 'Storage failure is visible and preserves saved draft');
    assert.deepEqual(errors, [], 'Persistence/import produce no runtime exceptions');
    await evaluate(`(() => {
      const select = document.getElementById('themeSelect');
      select.value = 'holo-nocturne'; select.dispatchEvent(new Event('change'));
    })()`);
    await send('Page.navigate', { url: url + '/index.html?preview-boot=1' }, session);
    for (let i=0; i<100; i++) {
      if (await evaluate('location.search === "?preview-boot=1" && document.readyState === "complete" && !!window.DesignSystemStudioPageBootstrap')) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(await evaluate(`(() => {
      DesignSystemStudioShell.activatePanel('builder');
      return document.documentElement.dataset.theme === 'steel-night' && document.getElementById('builderPreviewFrame').contentDocument.documentElement.dataset.theme === 'holo-nocturne';
    })()`), true, 'Reload restores non-shell theme only in preview');

    const toolbarDesktop = await evaluate(`(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const bar = document.querySelector('.builder-mode-bar');
      const ids = ['builderQuickBtn','builderTokenSearch','builderCategorySelect','builderChangedOnly','builderResultCount','builderViewSelect'];
      const centers = ids.map((id) => { const r = document.getElementById(id).getBoundingClientRect(); return r.top + r.height / 2; });
      return { height: bar.getBoundingClientRect().height, width: bar.getBoundingClientRect().width, centers, aligned: Math.max(...centers) - Math.min(...centers) < 3 };
    })()`);
    assert.ok(toolbarDesktop.height <= 64 && toolbarDesktop.aligned, 'Wide toolbar occupies one aligned compact row: ' + JSON.stringify(toolbarDesktop));
    const builderScreenshot = await send('Page.captureScreenshot', { format: 'png' }, session);
    fs.writeFileSync(path.join(root,'_docs/data/builder-quick-edit-verification.png'), Buffer.from(builderScreenshot.data,'base64'));
    await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false }, session);
    const mediumToolbar = await evaluate(`(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const bar = document.querySelector('.builder-mode-bar');
      return { height: bar.getBoundingClientRect().height, filtersVisible: !document.getElementById('builderFilters').hidden, noOverflow: document.documentElement.scrollWidth <= innerWidth + 1 };
    })()`);
    assert.ok(mediumToolbar.height <= 112 && mediumToolbar.filtersVisible && mediumToolbar.noOverflow, 'Medium toolbar uses two rows with visible filters');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false }, session);
    const mobile = await evaluate(`(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const filters = document.getElementById('builderFilters');
      const toggle = document.getElementById('builderFiltersToggle');
      if (!filters.hidden || toggle.hidden) throw new Error('Narrow filters start collapsed');
      toggle.click();
      if (filters.hidden || toggle.getAttribute('aria-expanded') !== 'true') throw new Error('Filters disclosure opens');
      const changed = document.getElementById('builderChangedOnly');
      changed.checked = true; changed.dispatchEvent(new Event('change'));
      if (toggle.textContent !== 'Filters (1)') throw new Error('Active filter count is visible');
      toggle.click();
      if (!filters.hidden || !changed.checked) throw new Error('Collapsing retains active filter');
      changed.checked = false; changed.dispatchEvent(new Event('change'));
      const view = document.getElementById('builderViewSelect');
      const editorDefault = view.value === 'editor' && !document.getElementById('builderSettings').open;
      view.value = 'preview'; view.dispatchEvent(new Event('change'));
      const previewVisible = getComputedStyle(document.querySelector('.builder-workspace-main')).display === 'none' && getComputedStyle(document.querySelector('.builder-workspace-side')).display !== 'none';
      document.getElementById('panel-builder').scrollIntoView();
      return { editorDefault, previewVisible, noOverflow: document.documentElement.scrollWidth <= innerWidth + 1 };
    })()`);
    assert.equal(mobile.editorDefault, true, 'Small screens start with editor and collapsed settings');
    assert.equal(mobile.previewVisible, true, 'Small-screen preview mode is reachable');
    assert.equal(mobile.noOverflow, true, 'Small-screen shell has no horizontal overflow');
    const mobileScreenshot = await send('Page.captureScreenshot', { format: 'png' }, session);
    fs.writeFileSync(path.join(root,'_docs/data/builder-mobile-preview-verification.png'), Buffer.from(mobileScreenshot.data,'base64'));
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false }, session);
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
    console.log('Browser passed: 21 defaults and custom export match fresh package; edit preservation, drafts, pending selection, selected-tab paint, recipe import/Undo, two-draft reload, and quota failure.');
  } finally {
    child.kill();
    server.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
