const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { root, validateSvg, validateProposal, readLibrary, importProposal } = require('./icon-library.cjs');
const { artifacts } = require('./build-icons.cjs');

const original = readLibrary();
assert.equal(original.icons.length >= 4, true);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-icon-library-'));
fs.mkdirSync(path.join(temporary, 'icons/approved'), { recursive: true });
fs.copyFileSync(path.join(root, 'icons/approved.json'), path.join(temporary, 'icons/approved.json'));
for (const item of original.icons) fs.copyFileSync(path.join(root, 'icons', item.file), path.join(temporary, 'icons', item.file));
const proposal = { schemaVersion: 1, alias: 'action.search', source: { library: 'lucide', name: 'search', revision: 'v1.2.3',
  url: 'https://raw.githubusercontent.com/lucide-icons/lucide/v1.2.3/icons/search.svg', license: 'ISC', licenseText: 'Test fixture notice; not a redistributed vendor license.' },
  modifications: 'None', exceptionReason: '', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 3L19 20" stroke="currentColor"/></svg>' };
for (const svg of [
  '<svg viewBox="0 0 24 24"><script>alert(1)</script><path d="M0 0"/></svg>',
  '<svg viewBox="0 0 24 24"><path onload="alert(1)" d="M0 0"/></svg>',
  '<svg viewBox="0 0 24 24"><use href="https://example.test/icon.svg"/></svg>',
  '<svg viewBox="0 0 24 24"><path fill="url(https://example.test/x)" d="M0 0"/></svg>',
  '<!DOCTYPE svg><svg viewBox="0 0 24 24"><path d="M0 0"/></svg>',
  '<svg viewBox="0 0 24 24"><path d="M0 0"></svg>',
  '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg><svg viewBox="0 0 24 24"/>',
]) assert.throws(() => validateSvg(svg), 'Unsafe or malformed SVG rejected');
assert.throws(() => validateProposal({ ...proposal, alias: '../../escape' }), /Unknown/);
assert.throws(() => validateProposal({ ...proposal, source: { ...proposal.source, revision: 'main' } }), /fixed/);
assert.throws(() => validateProposal({ ...proposal, source: { ...proposal.source, licenseText: '' } }), /license/);
assert.throws(() => validateProposal({ ...proposal, source: { ...proposal.source, library: 'tabler', url: 'https://raw.githubusercontent.com/tabler/tabler-icons/v1.2.3/icons/search.svg' } }), /secondary/);
const before = fs.readFileSync(path.join(temporary, 'icons/approved.json'), 'utf8');
assert.throws(() => importProposal({ ...proposal, svg: '<script/>' }, temporary));
assert.equal(fs.readFileSync(path.join(temporary, 'icons/approved.json'), 'utf8'), before, 'Failed validation preserves approved collection');
fs.writeFileSync(path.join(temporary, 'icons/approved.lock'), 'fixture');
assert.throws(() => importProposal(proposal, temporary), /import may be active/);
fs.unlinkSync(path.join(temporary, 'icons/approved.lock'));
const updated = importProposal(proposal, temporary);
assert.notEqual(updated.version, original.version, 'Successful import bumps collection version');
assert.equal(readLibrary(temporary).icons.find((item) => item.alias === proposal.alias).source.revision, 'v1.2.3');
assert.deepEqual(importProposal(proposal, temporary), updated, 'Repeated import is idempotent');
const changed = updated.icons.find((item) => item.alias === proposal.alias);
fs.appendFileSync(path.join(temporary, 'icons', changed.file), ' ');
assert.throws(() => readLibrary(temporary), /checksum/);

const outputs = artifacts();
const context = vm.createContext({ window: {}, document: {} });
for (const file of ['js/theme-package-assets.js', 'js/studio-packaging.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
vm.runInContext(outputs['js/icon-package-assets.js'], context);
const files = context.window.DesignSystemStudioPackaging.buildThemePackageFiles({ themeName: 'test', themeBlock: '', recipe: {} });
const names = files.map((file) => file.name);
assert.equal(new Set(names).size, names.length, 'Package paths are unique');
for (const item of original.icons) {
  assert.ok(names.includes('design-system/icons/' + item.file));
  assert.ok(names.includes('design-system/icons/licenses/' + item.alias + '.txt'));
}
assert.ok(names.includes('design-system/js/icon-runtime.js'));
const manifest = JSON.parse(files.find((file) => file.name.endsWith('/icons/manifest.json')).content);
assert.equal(manifest.situations.length, 64);
assert.ok(manifest.situations.some((item) => item.status === 'needs-icon'));
assert.equal(names.some((name) => name.includes('candidate') || name.includes('approval.json')), false, 'Only approved assets ship');
const generated = path.join(temporary, 'design-system/icons/approved');
fs.mkdirSync(generated, { recursive: true });
const obsolete = path.join(generated, 'action.search-0000000000000000.svg');
fs.writeFileSync(obsolete, 'old generated fixture');
fs.writeFileSync(path.join(generated, 'handwritten.svg'), 'unmanaged fixture');
require('./build-icons.cjs').reconcilePackage(temporary, files);
assert.equal(fs.existsSync(obsolete), false, 'Obsolete generated revisions are excluded from the package directory');
assert.equal(fs.existsSync(path.join(generated, 'handwritten.svg')), true, 'Unmanaged files are untouched');
// Only remove the temporary fixture directory created by this test, never project assets.
assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
assert.ok(path.basename(temporary).startsWith('ds-icon-library-'));
fs.rmSync(temporary, { recursive: true });
console.log('PASS icon approval validation, atomic import, locking, idempotence, integrity, versioning and approved-only packaging');
