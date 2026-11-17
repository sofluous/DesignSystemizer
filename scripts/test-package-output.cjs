const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const { createHash, webcrypto } = require('node:crypto');
const { publishPackage } = require('./package-output.cjs');
async function main() {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-package-output-'));
  const destination = path.join(temporary, 'package');
  try {
    publishPackage(destination, [{ name: 'stale.txt', content: 'old' }]);
    assert.throws(() => publishPackage(destination, [{ name: '../escape', content: 'bad' }]), /Invalid/);
    assert.equal(fs.readFileSync(path.join(destination, 'stale.txt'), 'utf8'), 'old');
    assert.throws(() => publishPackage(destination, [{ name: 'a', content: 'file' }, { name: 'a/b', content: 'conflict' }]));
    assert.equal(fs.readFileSync(path.join(destination, 'stale.txt'), 'utf8'), 'old', 'staging write failure preserves old output');
    assert.throws(() => publishPackage(destination, [{ name: 'next.txt', content: 'new' }], {
      rename: (from, to) => { if (to === destination) throw Error('Injected replacement failure'); fs.renameSync(from, to); }
    }), /Injected/);
    assert.equal(fs.readFileSync(path.join(destination, 'stale.txt'), 'utf8'), 'old', 'swap failure rolls back');
    fs.writeFileSync(destination + '.lock', 'fixture');
    assert.throws(() => publishPackage(destination, []), /EEXIST/);
    fs.unlinkSync(destination + '.lock');
    publishPackage(destination, [{ name: 'next.txt', content: 'new' }]);
    assert.equal(fs.existsSync(path.join(destination, 'stale.txt')), false, 'whole output replacement removes stale files');
    assert.deepEqual(fs.readdirSync(temporary), ['package'], 'no staging debris after success/failure');

    const context = vm.createContext({ window: { crypto: webcrypto, atob, DesignSystemThemePackageAssets: { presetRevision: 'fixture' } }, document: {}, TextEncoder });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/studio-packaging.js'), 'utf8'), context);
    const api = context.window.DesignSystemStudioPackaging;
    const files = [{ name: 'design-system/font.ttf', content: Buffer.from([0, 128, 255]).toString('base64'), encoding: 'base64' }, { name: 'design-system/theme.css', content: 'body{}' }];
    const manifest = async items => JSON.parse((await api.withManifest(items)).at(-1).content);
    assert.deepEqual(await manifest(files), await manifest([...files].reverse()), 'inventory/revision independent of input order');
    assert.notEqual((await manifest(files)).sourceRevision, (await manifest([{ ...files[0], content: 'AA==' }, files[1]])).sourceRevision, 'revision changes with bytes');
    const native = await manifest(files);
    context.window.crypto = undefined;
    assert.deepEqual(await manifest(files), native, 'HTTP fallback produces identical inventory/revision');
    for (const length of [0, 1, 55, 56, 63, 64, 65, 1000000]) {
      const bytes = Buffer.alloc(length, 0xa3);
      const result = await manifest([{ name: 'design-system/binary', content: bytes.toString('base64'), encoding: 'base64' }]);
      assert.equal(result.files[0].sha256, createHash('sha256').update(bytes).digest('hex'), 'SHA-256 fallback boundary ' + length);
    }
    const built = path.join(__dirname, '../_package/design-system');
    const inventory = JSON.parse(fs.readFileSync(path.join(built, 'package.manifest.json')));
    const listed = new Set(inventory.files.map(file => file.path));
    for (const entry of inventory.files) {
      const bytes = fs.readFileSync(path.join(built, entry.path));
      assert.equal(bytes.length, entry.bytes);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    }
    for (const name of fs.readdirSync(built, { recursive: true })) {
      if (fs.statSync(path.join(built, name)).isFile() && name !== 'package.manifest.json') assert.ok(listed.has(name.replaceAll(path.sep, '/')), name);
    }
    assert.equal(createHash('sha256').update(JSON.stringify(inventory.files)).digest('hex'), inventory.sourceRevision);
    console.log('PASS package staging, removed files, pre-publish validation, lock exclusion, rollback and deterministic binary inventory');
  } finally {
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(temporary).startsWith('ds-package-output-'));
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
