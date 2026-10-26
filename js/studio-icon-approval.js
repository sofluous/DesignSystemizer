(function (win, doc) {
  'use strict';
  let activeIcon, activeChoice, customSvg = '', busy = false, uploadVersion = 0;
  let preparedSvg = '', preparedKey = '';
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
    activeIcon = icon; activeChoice = { ...choice }; customSvg = ''; preparedSvg = ''; preparedKey = ''; uploadVersion++;
    field('Title').textContent = 'Save to sheet: ' + icon.alias;
    resetSource(); field('Submit').disabled = false;
    field('Revision').value = '';
    field('LicenseText').value = ''; field('Modifications').value = 'None'; field('Exception').value = '';
    field('File').value = ''; field('Status').textContent = 'Load the exact asset, review it, then export its approval file.';
    field('Reviewed').checked = false;
    field('Reviewed').disabled = true; field('Reviewed').required = false;
    field('Submit').textContent = 'Load preview';
    win.DesignSystemStudioIconAssets.render(field('Preview'), choice);
    field('Dialog').showModal(); field('Revision').focus();
  }
  function init() {
    field('Cancel').addEventListener('click', () => field('Dialog').close());
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
        field('Submit').textContent = 'Export approval';
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
      busy = true; field('Submit').disabled = true; field('File').disabled = true; field('Cancel').disabled = true;
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
          preparedSvg = await win.DesignSystemStudioIconAssets.svgFor(choice, activeIcon.name);
          preparedKey = key;
          field('Preview').innerHTML = preparedSvg;
          field('Preview').dataset.previewState = 'ready';
          field('Reviewed').checked = false; field('Reviewed').disabled = false; field('Reviewed').required = true;
          field('Submit').textContent = 'Export approval';
          field('Status').textContent = 'Preview ready. Confirm the review to export.';
          return;
        }
        if (!field('Reviewed').checked) throw new Error('Review and confirm the exact asset before downloading.');
        const svg = customSvg || preparedSvg;
        const proposal = { schemaVersion: 1, alias,
          source: { library, name: metadata.name, revision, url: library === 'local' ? '' : sourceUrl,
            license: metadata.license, licenseText: metadata.licenseText },
          modifications: metadata.modifications, exceptionReason: metadata.exceptionReason, svg };
        win.DesignSystemStudioPackaging.downloadBlob(alias + '.icon-approval.json', new Blob([JSON.stringify(proposal, null, 2)], { type: 'application/json' }));
        field('Status').textContent = 'Approval file prepared. From the project directory run: node scripts/import-icon.cjs <downloaded-file> then node scripts/build-package.cjs. Reload Studio after import. The shared standard is unchanged until import succeeds.';
      } catch (error) { field('Status').textContent = 'Approval file was not prepared. ' + error.message; }
      finally { busy = false; field('Submit').disabled = false; field('File').disabled = false; field('Cancel').disabled = false; }
    });
    field('Dialog').addEventListener('cancel', (event) => { if (busy) event.preventDefault(); });
    for (const name of ['Revision', 'Url', 'Library']) field(name).addEventListener('input', () => {
      if (customSvg) return;
      preparedKey = ''; preparedSvg = '';
      field('Reviewed').checked = false; field('Reviewed').disabled = true; field('Reviewed').required = false;
      field('Submit').textContent = 'Load preview';
    });
  }
  win.DesignSystemStudioIconApproval = { open };
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})(window, document);
