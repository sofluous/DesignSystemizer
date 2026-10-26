const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

exports.testIcons = async ({ evaluate, send, session, root, url }) => {
  await evaluate(`(async () => {
    const check = (condition, message) => { if (!condition) throw new Error(message); };
    const el = (id) => document.getElementById(id);
    const card = () => document.querySelector('.icon-card[data-icon-id="search"]');
    const choose = () => { card().click(); el('iconInspectorBrowseBtn').click(); };
    DesignSystemStudioShell.activatePanel('icons');
    check(document.querySelectorAll('.icon-card').length === 64, 'All semantic aliases render');
    card().focus(); card().click();
    check(document.activeElement === card(), 'Selecting a card preserves focus');
    check(card().querySelector('svg circle'), 'Local search glyph renders');
    el('iconSearch').value = 'no-matching-alias'; el('iconSearch').dispatchEvent(new Event('input'));
    check(el('iconInspectorAlias').textContent === 'action.search', 'Filtering preserves inspected alias');
    check(!el('iconSelectedHidden').hidden, 'Hidden selection is explained');
    el('iconShowSelectedBtn').click();
    check(document.activeElement === card(), 'Reveal restores focus to selected alias');
    choose();
    check(el('iconCandidateApplyBtn').disabled, 'Applied choice cannot be redundantly applied');
    check(!el('iconCandidateSetDefaultBtn') && !el('iconInspectorSetDefaultBtn'), 'Preference actions are removed');
    check(el('iconInspectorStatus').textContent === 'Saved', 'Project-approved icon is the initial selection');
    check(el('iconPrepareApprovalBtn').disabled, 'Already saved selection needs no save');
    check(document.querySelectorAll('#iconInspectorBody .icon-preview').length === 1, 'Inspector has one preview');
    el('iconCandidateUploadBtn').click();
    check(el('iconApprovalDialog').open && el('iconInspectorStatus').textContent === 'Saved', 'Saved icon can receive custom artwork without inventing a draft');
    el('iconApprovalCancel').click(); choose();
    document.querySelector('[data-candidate-id="lucide-search"]').click();
    check(document.querySelector('[data-candidate-id="lucide-search"]').getAttribute('aria-pressed') === 'true', 'Candidate selection announced');
    check(card().querySelector('svg circle'), 'Draft preview does not change applied choice');
    el('closeIconCandidateBtn').click();
    check(card().querySelector('svg circle'), 'Cancel preserves applied choice');
    choose(); document.querySelector('[data-candidate-id="lucide-search"]').click();
    el('iconCandidateApplyBtn').click();
    check(card().querySelector('img').src.endsWith('/icons/search.svg'), 'Gallery uses selected external asset');
    check(el('iconInspectorPreview').querySelector('img').src === card().querySelector('img').src, 'Inspector and gallery agree');
    card().scrollIntoView();
    for (let i=0; i<100 && card().querySelector('.icon-preview').dataset.previewState === 'loading'; i++) await new Promise(r => setTimeout(r, 20));
    check(card().querySelector('.icon-preview').dataset.previewState === 'ready', 'Visible lazy gallery images finish loading');
    const saved = JSON.parse(localStorage.getItem('ds-icon-state'));
    check(saved.version === 2 && saved.selection.search.candidateId === 'lucide-search' && !saved.defaults, 'Draft saved without preference state');
    check(el('iconInspectorStatus').textContent === 'Draft' && card().querySelector('.icon-status').textContent === 'Draft', 'Card and inspector agree on draft state');
    check(!el('iconPrepareApprovalBtn').disabled, 'Draft can be saved to sheet');
    window.iconDownloads = [];
    DesignSystemStudioPackaging.downloadBlob = (name, blob) => window.iconDownloads.push({ name, blob });
    el('exportIconManifestBtn').click();
    const manifest = JSON.parse(await window.iconDownloads.pop().blob.text());
    check(manifest.icons.find(i => i.id === 'search').status === 'Draft' && manifest.purpose === 'icon-workspace', 'Workspace export separates draft status from saved standards');
    el('iconInspectorExportBtn').click();
    for (let i=0; i<100 && !window.iconDownloads.length; i++) await new Promise(r => setTimeout(r, 20));
    check(window.iconDownloads.length === 1, 'Selected remote SVG downloaded');
    const svg = await window.iconDownloads.pop().blob.text();
    check(svg.includes('id="fixture"') && !/script|onload|foreignObject/.test(svg), 'Actual selected geometry exported with unsafe content removed');
    choose();
    el('iconCandidateManualInput').value = 'https://icons.example.test/custom.svg'; el('iconCandidateManualBtn').click();
    el('iconCandidateApplyBtn').click();
    check(card().querySelector('img').src === 'https://icons.example.test/custom.svg', 'Custom URL renders directly');
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key === 'ds-icon-state') throw new Error('Quota fixture'); return original.call(this, key, value); };
    el('iconRevertBtn').click();
    check(el('iconInspectorStatus').textContent === 'Saved', 'Revert restores saved standard');
    check(el('iconActionStatus').textContent.includes('session'), 'Storage failure visibly explains session-only changes');
    Storage.prototype.setItem = original;
  })()`);
  const approval = await evaluate(`(async () => {
    const el = id => document.getElementById(id);
    el('iconPrepareApprovalBtn').click();
    if (el('iconApprovedPreview') || el('iconInspectorChoicePreview')) throw new Error('Duplicate previews must be removed');
    el('iconApprovalLibrary').value = 'lucide';
    el('iconApprovalName').value = 'search';
    // Use a catalog choice so approval fetches the pinned revision, not a moving URL.
    el('iconApprovalCancel').click();
    DesignSystemStudioIconApproval.open(DesignSystemIconRegistry.find(i => i.id === 'search'),
      DesignSystemIconRegistry.find(i => i.id === 'search').candidates.find(c => c.id === 'lucide-search'));
    el('iconApprovalRevision').value = 'v1.2.3'; el('iconApprovalLicenseText').value = 'Test fixture notice';
    el('iconApprovalReviewed').checked = true;
    const previous = localStorage.getItem('ds-icon-state');
    window.iconDownloads = [];
    el('iconApprovalForm').requestSubmit();
    for (let i=0; i<100 && el('iconApprovalSubmit').disabled; i++) await new Promise(r => setTimeout(r, 20));
    if (window.iconDownloads.length) throw new Error('Approval must wait for review of the exact pinned asset');
    if (!el('iconApprovalPreview').querySelector('path[id="fixture"]')) throw new Error('Pinned asset must be shown before approval');
    el('iconApprovalReviewed').checked = true;
    el('iconApprovalForm').requestSubmit();
    for (let i=0; i<100 && !window.iconDownloads.length; i++) await new Promise(r => setTimeout(r, 20));
    if (!window.iconDownloads.length) throw new Error('Approval file not generated: ' + el('iconApprovalStatus').textContent);
    const proposal = JSON.parse(await window.iconDownloads.pop().blob.text());
    if (!proposal.source.url.includes('/v1.2.3/')) throw new Error('Approval must fetch exact revision');
    if (localStorage.getItem('ds-icon-state') !== previous) throw new Error('Preparing approval changed browser choices');
    if (!el('iconApprovalStatus').textContent.includes('import-icon.cjs')) throw new Error('Import instructions missing');
    el('iconApprovalCancel').click();
    return proposal;
  })()`);
  require('./icon-library.cjs').validateProposal(approval);
  const customApproval = await evaluate(`(async () => {
    const el = id => document.getElementById(id);
    DesignSystemStudioIconApproval.open(DesignSystemIconRegistry.find(i => i.id === 'search'), DesignSystemStudioIconAssets.parseReference('https://icons.example.test/custom.svg'));
    const transfer = new DataTransfer();
    transfer.items.add(new File(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 2L3 4" stroke="currentColor"/></svg>'], 'original.svg', { type: 'image/svg+xml' }));
    el('iconApprovalFile').files = transfer.files; el('iconApprovalFile').dispatchEvent(new Event('change'));
    for (let i=0; i<100 && el('iconApprovalSubmit').disabled; i++) await new Promise(r => setTimeout(r, 20));
    if (!el('iconApprovalPreview').querySelector('svg path')) throw new Error('Uploaded custom artwork must be previewed');
    el('iconApprovalRevision').value = 'custom-1'; el('iconApprovalLicense').value = 'Project-owned';
    el('iconApprovalLicenseText').value = 'Project test fixture ownership notice';
    el('iconApprovalReviewed').checked = true; window.iconDownloads = [];
    el('iconApprovalForm').requestSubmit();
    for (let i=0; i<100 && !window.iconDownloads.length; i++) await new Promise(r => setTimeout(r, 20));
    if (!window.iconDownloads.length) throw new Error('Custom approval did not download');
    const proposal = JSON.parse(await window.iconDownloads.pop().blob.text());
    el('iconApprovalCancel').click();
    if (Object.keys(DesignSystemApprovedIcons.icons).length !== 4) throw new Error('Proposal must not silently approve artwork');
    return proposal;
  })()`);
  require('./icon-library.cjs').validateProposal(customApproval);
  await send('Page.navigate', { url: url + '/index.html' }, session);
  for (let i=0; i<100; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.DesignSystemStudioPageBootstrap')) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await evaluate(`(async () => {
    DesignSystemStudioShell.activatePanel('icons');
    document.querySelector('[data-icon-id="search"]').click();
    const host = document.getElementById('iconInspectorPreview');
    if (host.querySelector('img').src !== 'https://icons.example.test/custom.svg') throw new Error('Custom URL survives reload');
    const assets = DesignSystemStudioIconAssets;
    assets.render(host, assets.parseReference('https://icons.example.test/missing.svg'));
    for (let i=0; i<100 && host.dataset.previewState === 'loading'; i++) await new Promise(r => setTimeout(r, 20));
    if (host.dataset.previewState !== 'unavailable' || host.querySelector('img')) throw new Error('Broken preview must show an explicit failure');
    let failed = false;
    try { await assets.svgFor(assets.parseReference('https://icons.example.test/missing.svg')); } catch (_) { failed = true; }
    if (!failed) throw new Error('Broken export must fail instead of exporting a placeholder');
    let invalid = false; try { assets.parseReference('javascript:alert(1)'); } catch (_) { invalid = true; }
    if (!invalid) throw new Error('Unsafe reference accepted');
    document.querySelector('[data-icon-id="close"]').click();
  })()`);
  fs.writeFileSync(path.join(root, '_docs/data/icon-gallery-desktop.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' }, session)).data, 'base64'));
  await evaluate(`document.querySelector('[data-icon-id="search"]').click(); document.getElementById('iconInspectorBrowseBtn').click()`);
  fs.writeFileSync(path.join(root, '_docs/data/icon-picker-desktop.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' }, session)).data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false }, session);
  const fits = await evaluate(`(() => { const panel = document.querySelector('#iconCandidateDialog .ds-modal-panel'); return panel.scrollWidth <= panel.clientWidth + 1; })()`);
  assert.equal(fits, true, 'Picker fits narrow screens');
  fs.writeFileSync(path.join(root, '_docs/data/icon-picker-mobile.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' }, session)).data, 'base64'));
  await evaluate(`document.getElementById('iconCandidateDialog').close(); document.getElementById('iconPrepareApprovalBtn').click();`);
  assert.equal(await evaluate(`(() => { const panel = document.querySelector('#iconApprovalDialog .ds-modal-panel'); return panel.scrollWidth <= panel.clientWidth + 1; })()`), true, 'Approval form fits narrow screens');
  fs.writeFileSync(path.join(root, '_docs/data/icon-approval-mobile.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' }, session)).data, 'base64'));
  await evaluate(`(() => {
    document.getElementById('iconApprovalDialog').close();
    localStorage.setItem('ds-icon-state', JSON.stringify({ version: 1,
      defaults: { search: { mode: 'candidate', candidateId: 'lucide-search' }, close: { mode: 'candidate', candidateId: 'lucide-x' } },
      selection: { close: { mode: 'candidate', candidateId: 'iconoir-cancel' } } }));
  })()`);
  await send('Page.navigate', { url: url + '/index.html' }, session);
  for (let i=0; i<100; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.DesignSystemStudioPageBootstrap')) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await evaluate(`(() => {
    const el = id => document.getElementById(id);
    const card = id => document.querySelector('[data-icon-id="' + id + '"]');
    const check = (value, message) => { if (!value) throw new Error(message); };
    DesignSystemStudioShell.activatePanel('icons');
    card('search').click();
    check(el('iconInspectorSource').textContent === 'Lucide / search' && el('iconInspectorStatus').textContent === 'Draft', 'Legacy saved preference becomes a draft');
    card('close').click();
    check(el('iconInspectorSource').textContent === 'Iconoir / cancel', 'Explicit legacy selection takes precedence over its preference');
    el('iconRevertBtn').click();
    check(el('iconInspectorStatus').textContent === 'Saved', 'Revert returns to project standard, not legacy preference');
    const state = JSON.parse(localStorage.getItem('ds-icon-state'));
    check(state.version === 2 && state.selection.search.candidateId === 'lucide-search' && !state.selection.close, 'Migration retains other drafts when saving');
    const recommended = DesignSystemIconRegistry.find(icon => !DesignSystemApprovedIcons.icons[icon.alias]);
    card(recommended.id).click();
    check(el('iconInspectorStatus').textContent === 'Recommended', 'Unreviewed source is recommended');
    el('iconInspectorBrowseBtn').click();
    const alternative = document.querySelector('#iconCandidateList button[aria-pressed="false"]');
    alternative.click(); el('iconCandidateApplyBtn').click();
    check(el('iconInspectorStatus').textContent === 'Draft', 'Changing a recommendation creates a draft');
    el('iconStatusFilter').value = 'draft'; el('iconStatusFilter').dispatchEvent(new Event('input'));
    check([...document.querySelectorAll('.icon-card .icon-status')].every(status => status.textContent === 'Draft'), 'State filtering matches badges');
    el('iconRevertBtn').click();
    check(el('iconInspectorStatus').textContent === 'Recommended' && !el('iconSelectedHidden').hidden, 'Revert preserves inspected token when filtered out');
  })()`);
  await send('Page.enable', {}, session);
  const injection = await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__missingIconFixture = true; Object.defineProperty(window, 'DesignSystemIconRegistry', {
    configurable: true, set(value) { const icon = value.find(item => item.id === 'add-plus'); icon.candidates = []; icon.defaultCandidateId = null;
      Object.defineProperty(window, 'DesignSystemIconRegistry', { value, writable: true, configurable: true }); }
  });` }, session);
  await send('Page.navigate', { url: url + '/index.html' }, session);
  for (let i=0; i<100; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.DesignSystemStudioPageBootstrap && window.__missingIconFixture')) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await evaluate(`(() => {
    DesignSystemStudioShell.activatePanel('icons');
    const el = id => document.getElementById(id);
    document.querySelector('[data-icon-id="add-plus"]').click();
    if (el('iconInspectorStatus').textContent !== 'Missing' || el('iconInspectorSource').textContent !== 'No source') throw new Error('Empty situation state: ' + JSON.stringify({ status: el('iconInspectorStatus').textContent, source: el('iconInspectorSource').textContent, registry: DesignSystemIconRegistry.find(icon => icon.id === 'add-plus') }));
    if (!el('iconInspectorExportBtn').disabled) throw new Error('Missing asset cannot be downloaded');
    el('iconPrepareApprovalBtn').click();
    if (!el('iconApprovalDialog').open) throw new Error('Missing situation can receive custom artwork');
    el('iconApprovalCancel').click();
    el('iconStatusFilter').value = 'missing'; el('iconStatusFilter').dispatchEvent(new Event('input'));
    if (document.querySelectorAll('.icon-card').length !== 1) throw new Error('Missing filter must match no-source situations');
  })()`);
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: injection.identifier }, session);
  await send('Page.navigate', { url: url + '/_package/example.html' }, session);
  for (let i=0; i<100; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.DesignSystemIcons')) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  await evaluate(`(() => {
    const icon = document.querySelector('[data-ds-icon="action.search"]');
    if (!icon.querySelector('svg circle') || icon.dataset.dsIconState !== 'ready') throw new Error('Packaged semantic icon did not render');
    if (icon.getAttribute('aria-hidden') !== 'true') throw new Error('Decorative icon accessibility missing');
    const unknown = document.createElement('span'); unknown.dataset.dsIcon = 'unknown.alias';
    document.body.append(unknown); DesignSystemIcons.render(unknown);
    if (unknown.dataset.dsIconState !== 'missing' || unknown.children.length) throw new Error('Unknown alias must not substitute another meaning');
  })()`);
  console.log('PASS icon selection, cancellation, filtering, state migration, manifest, safe SVG export, persistence, failure states and narrow picker');
};
