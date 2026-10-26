(function (win, doc) {
  'use strict';
  let activeIcon, activeChoice, customSvg = '', busy = false, uploadVersion = 0;
  let preparedSvg = '', preparedKey = '';
  let projectToken = '';
  let projectVersion = '';
  const drafts = new Map();
  const emit = (name, detail) => doc.dispatchEvent(new CustomEvent(name, { detail }));
  const finalAction = () => projectToken ? 'Save changes' : 'Export changes';
  const field = (name) => doc.getElementById('iconApproval' + name);
  function resetSource() {
    const source = (win.DesignSystemIconSources || []).find((item) => item.id === activeChoice.sourceId);
    field('Library').value = activeChoice.sourceId === 'manual-url' ? 'custom' : activeChoice.sourceId;
    field('Name').value = activeChoice.iconName;
    field('Library').readOnly = true; field('Name').readOnly = true;
    field('Url').value = activeChoice.sourceId === 'local' ? '' : win.DesignSystemStudioIconAssets.urlFor(activeChoice);
    field('License').value = source?.license || '';
  }
  function open(icon, choice) {
    choice = choice || { sourceId: "local", iconName: icon.id, label: "Custom SVG" };
    remember();
    activeIcon = icon; activeChoice = { ...choice }; customSvg = ''; preparedSvg = ''; preparedKey = ''; uploadVersion++;
    field('Title').textContent = 'Review changes: ' + icon.alias;
    resetSource(); field('Submit').disabled = false;
    field('Revision').value = '';
    field('LicenseText').value = ''; field('Modifications').value = 'None'; field('Exception').value = '';
    field('File').value = ''; field('Status').textContent = 'Load the exact asset for review.';
    field('Help').textContent = projectToken ? 'Review the exact artwork, then save it to the shared project.' : 'Review the artwork, then export changes for project import.';
    field('Reviewed').checked = false;
    field('Reviewed').disabled = true; field('Reviewed').required = false;
    field('Submit').textContent = 'Load preview';
    win.DesignSystemStudioIconAssets.render(field('Preview'), choice);
    restore(); emit('icon:review'); field('Revision').focus();
  }
  function init() {
    connect();
    field('Cancel').addEventListener('click', () => { if (!busy) { remember(); emit('icon:reviewclose'); } });
    field('File').addEventListener('change', async () => {
      const version = ++uploadVersion;
      customSvg = ''; preparedSvg = ''; preparedKey = ''; resetSource();
      field('Reviewed').checked = false; field('Reviewed').disabled = true; field('Reviewed').required = false;
      field('Submit').textContent = 'Load preview';
      win.DesignSystemStudioIconAssets.render(field('Preview'), activeChoice);
      const file = field('File').files[0];
      if (!file) return;
      field('Submit').disabled = true;
      try {
        if (file.size > 2 * 1024 * 1024) throw new Error('SVG exceeds 2 MB');
        const text = await file.text();
        if (version !== uploadVersion) return;
        customSvg = win.DesignSystemStudioIconAssets.sanitizeSvg(text, activeIcon.name);
        field('Library').value = 'local'; field('Name').value = file.name;
        field('Library').readOnly = false; field('Name').readOnly = false; field('Url').value = '';
        field('Preview').innerHTML = customSvg;
        field('Preview').dataset.previewState = 'ready';
        field('Reviewed').checked = false;
        field('Reviewed').disabled = false; field('Reviewed').required = true;
        field('Submit').textContent = finalAction();
        field('License').value = ''; field('LicenseText').value = '';
        field('Status').textContent = 'Custom SVG loaded and sanitized. Declare its revision, rights and any modifications before approval.';
      } catch (error) { customSvg = ''; field('Status').textContent = error.message; field('File').value = ''; }
      finally { if (version === uploadVersion) field('Submit').disabled = false; }
    });
    field('Form').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (busy) return;
      const revision = field('Revision').value.trim(), library = field('Library').value.trim();
      const metadata = { name: field('Name').value.trim(), license: field('License').value.trim(), licenseText: field('LicenseText').value.trim(),
        modifications: field('Modifications').value.trim(), exceptionReason: field('Exception').value.trim() };
      if (![revision, library, metadata.name, metadata.license, metadata.licenseText, metadata.modifications].every(Boolean)) { field('Status').textContent = 'Complete the source, revision, license notice and modification fields.'; return; }
      if (/^(main|master|latest|head)$/i.test(revision)) { field('Status').textContent = 'Use a fixed release, commit, or custom asset revision.'; return; }
      if (!['lucide', 'local'].includes(library) && !field('Exception').value.trim()) { field('Status').textContent = 'Explain why this secondary source is needed.'; field('Exception').focus(); return; }
      busy = true; emit('icon:busy', { busy: true }); field('Submit').disabled = true; field('File').disabled = true; field('Cancel').disabled = true;
      const alias = activeIcon.alias;
      try {
        let choice = { ...activeChoice }, sourceUrl = field('Url').value.trim();
        if (!customSvg && library !== 'local' && !sourceUrl) throw new Error('An external candidate needs its source URL.');
        if (library !== 'local' && sourceUrl && !/^https:\/\/[^\s]+$/i.test(sourceUrl)) throw new Error('Approval source URLs must use HTTPS.');
        if (!customSvg && ['lucide', 'iconoir', 'tabler'].includes(library)) {
          if (!/^(?:[a-f0-9]{40}|v?\d[\w.-]*)$/i.test(revision)) throw new Error('For library icons, enter a release tag or full 40-character commit.');
          sourceUrl = sourceUrl.replace(/\/(main|master)\//, '/' + revision + '/');
          choice = { ...choice, previewUrl: sourceUrl };
        }
        if (!customSvg && library !== 'local') choice = { ...choice, previewUrl: sourceUrl };
        const key = JSON.stringify([library, revision, sourceUrl]);
        if (!customSvg && key !== preparedKey) {
          field('Status').textContent = 'Loading exact source revision...';
          preparedSvg = await win.DesignSystemStudioIconAssets.svgFor(choice, activeIcon.name);
          preparedKey = key;
          field('Preview').innerHTML = preparedSvg;
          field('Preview').dataset.previewState = 'ready';
          field('Reviewed').checked = false; field('Reviewed').disabled = false; field('Reviewed').required = true;
          field('Submit').textContent = finalAction();
          field('Status').textContent = projectToken ? 'Preview ready. Confirm the review to save.' : 'Preview ready. Confirm the review to export.';
          return;
        }
        if (!field('Reviewed').checked) throw new Error('Review and confirm the exact asset before downloading.');
        const svg = customSvg || preparedSvg;
        const proposal = { schemaVersion: 1, alias,
          source: { library, name: metadata.name, revision, url: library === 'local' ? '' : sourceUrl,
            license: metadata.license, licenseText: metadata.licenseText },
          modifications: metadata.modifications, exceptionReason: metadata.exceptionReason, svg };
        if (projectToken) {
          field('Status').textContent = 'Saving project and rebuilding packages...';
          const response = await win.fetch('/api/icon-approval', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DS-Project-Token': projectToken }, body: JSON.stringify({ ...proposal, expectedVersion: projectVersion }) });
          const result = await response.json();
          if (result.packageAssets) win.DesignSystemIconPackageAssets = result.packageAssets;
          if (result.manifest) { projectVersion = result.manifest.version; emit('icon:saved', { alias, manifest: result.manifest }); drafts.delete(alias); }
          if (!response.ok) {
            const message = (result.committed ? 'Source saved; package rebuild failed. Run node scripts/build-package.cjs. ' : '') + result.error;
            if (result.committed) emit('icon:projecterror', { message });
            throw new Error(message);
          }
          field('Status').textContent = 'Saved to shared project.';
          return;
        }
        win.DesignSystemStudioPackaging.downloadBlob(alias + '.icon-approval.json', new Blob([JSON.stringify(proposal, null, 2)], { type: 'application/json' }));
        field('Status').textContent = 'Approval file prepared. From the project directory run: node scripts/import-icon.cjs <downloaded-file> then node scripts/build-package.cjs. Reload Studio after import. The shared standard is unchanged until import succeeds.';
      } catch (error) { field('Status').textContent = 'Changes could not be completed. ' + error.message; }
      finally { busy = false; emit('icon:busy', { busy: false }); field('Submit').disabled = false; field('File').disabled = false; field('Cancel').disabled = false; }
    });

    for (const name of ['Revision', 'Url', 'Library']) field(name).addEventListener('input', () => {
      if (customSvg) return;
      preparedKey = ''; preparedSvg = '';
      field('Reviewed').checked = false; field('Reviewed').disabled = true; field('Reviewed').required = false;
      field('Submit').textContent = 'Load preview';
    });
  }
  function remember() {
    if (!activeIcon || busy) return;
    drafts.set(activeIcon.alias, { choiceKey: JSON.stringify(activeChoice), customSvg, preparedSvg, preparedKey,
      values: Object.fromEntries(['Library', 'Name', 'Url', 'Revision', 'License', 'LicenseText', 'Modifications', 'Exception'].map(name => [name, field(name).value])),
      reviewed: field('Reviewed').checked, ready: !field('Reviewed').disabled });
  }
  function restore() {
    const draft = drafts.get(activeIcon.alias);
    if (!draft || draft.choiceKey !== JSON.stringify(activeChoice)) return;
    ({ customSvg, preparedSvg, preparedKey } = draft);
    for (const [name, value] of Object.entries(draft.values)) field(name).value = value;
    field('Reviewed').checked = draft.reviewed; field('Reviewed').disabled = !draft.ready; field('Reviewed').required = draft.ready;
    field('Library').readOnly = field('Name').readOnly = !customSvg;
    if (customSvg || preparedSvg) { field('Preview').innerHTML = customSvg || preparedSvg; field('Submit').textContent = finalAction(); }
  }
  async function connect() {
    try {
      const response = await win.fetch('/api/icon-project');
      if (!response.ok) return;
      const data = await response.json();
      if (typeof data.token !== 'string' || data.token.length !== 64) return;
      projectToken = data.token;
      projectVersion = win.DesignSystemApprovedIcons?.version || data.version;
      doc.getElementById('iconProjectStatus').textContent = 'Project connected';
      emit('icon:project');
    } catch (_) { /* Static/offline Studio retains explicit export mode. */ }
  }
  win.DesignSystemStudioIconApproval = { open, remember, isBusy: () => busy, connected: () => !!projectToken };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(window, document);
