const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { root, readLibrary } = require('./icon-library.cjs');
const { createStudioServer } = require('./serve-studio.cjs');
function createFixture({ failRebuild = false } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-project-test-'));
  for (const name of ['index.html', 'theme.css', 'js', 'css', 'icons']) fs.cpSync(path.join(root, name), path.join(directory, name), { recursive: true });
  let builds = 0;
  const server = createStudioServer({ projectRoot: directory, rebuild: async () => {
    builds++;
    if (failRebuild) throw new Error('Fixture package rebuild failure');
    const manifest = readLibrary(directory);
    const icons = Object.fromEntries(manifest.icons.map(entry => [entry.alias, { ...entry, svg: fs.readFileSync(path.join(directory, 'icons', entry.file), 'utf8') }]));
    fs.writeFileSync(path.join(directory, 'js/icon-approved.js'), 'window.DesignSystemApprovedIcons=' + JSON.stringify({ version: manifest.version, icons }) + ';');
  } });
  return { server, directory, builds: () => builds, dispose() {
    if (path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) || !path.basename(directory).startsWith('ds-project-test-')) throw new Error('Unsafe fixture cleanup path');
    fs.rmSync(directory, { recursive: true, maxRetries: 5, retryDelay: 100 });
  } };
}
module.exports = { createFixture };
