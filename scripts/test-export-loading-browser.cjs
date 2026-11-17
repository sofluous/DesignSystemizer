const assert = require('node:assert/strict');
async function testExportLoading({ evaluate }) {
  const result = await evaluate(`(async () => {
    const button = document.getElementById('downloadPackageBtn');
    const status = document.getElementById('themePackageStatus');
    let files, downloaded = false;
    const makeZip = DesignSystemStudioPackaging.makeZip;
    DesignSystemStudioPackaging.makeZip = items => { files = items; return makeZip(items); };
    DesignSystemStudioPackaging.downloadBlob = () => { downloaded = true; };
    const wait = async () => {
      for (let i = 0; i < 200 && button.disabled; i++) await new Promise(resolve => setTimeout(resolve, 50));
      if (button.disabled) throw Error('Download stayed disabled');
    };
    if (window.DesignSystemThemeFontAssets) throw Error('Font binaries loaded at startup');
    button.click(); await wait();
    const retryable = !downloaded && !files && status.textContent.includes('Package not downloaded:');
    document.getElementById('themeNameInput').value = 'loading-snapshot';
    button.click();
    document.getElementById('themeNameInput').value = 'edited-during-loading';
    await wait();
    const complete = downloaded && files.some(file => file.name.endsWith('/package.manifest.json')) && files.filter(file => file.name.endsWith('.ttf')).length === 11;
    const snapshot = JSON.parse(files.find(file => file.name === 'theme.recipe.json').content).themeName === 'loading-snapshot';
    const cached = performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('/theme-font-assets.js')).length;
    button.click(); await wait();
    return { retryable, complete, snapshot, cached, finalLoads: performance.getEntriesByType('resource').filter(entry => entry.name.endsWith('/theme-font-assets.js')).length };
  })()`);
  assert.equal(result.retryable, true, 'failed asset request leaves a retryable status and no partial ZIP');
  assert.equal(result.complete, true, 'retry exports complete fonts and inventory');
  assert.equal(result.snapshot, true, 'edits during asset loading do not change the requested snapshot');
  assert.equal(result.finalLoads, result.cached, 'later exports reuse loaded binaries');
  console.log('PASS real ZIP asset failure, user-visible retry, complete export and subsequent cached downloads');
}
module.exports = { testExportLoading };
